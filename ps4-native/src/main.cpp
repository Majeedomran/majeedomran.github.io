#include <SDL2/SDL.h>
#include "catalog_client.h"
#include <cstdio>
#include <cstring>
#include <cstdlib>
#include <cctype>

static const int SCREEN_W = 1920;
static const int SCREEN_H = 1080;
static SDL_Window* gWindow = nullptr;
static SDL_Renderer* gRenderer = nullptr;
static SDL_Joystick* gPad = nullptr;
static int selected = 0;
static int page = 0;
static char networkStatus[128] = "PRESS TRIANGLE TO REFRESH CATALOG";

struct GameItem { char name[112]; char cusa[24]; double sizeGB; bool hasSize; };
static GameItem gameItems[80];
static int gameCount = 0;
static int listOffset = 0;
static bool detailOpen = false;
struct LocalizedItem { char name[112]; char type[80]; };
static LocalizedItem localizedItems[120];
static int localizedCount = 0;

static const char* skipSpace(const char* p) { while (*p && std::isspace((unsigned char)*p)) ++p; return p; }
static const char* findJsonValue(const char* obj, const char* key) {
    char pattern[64]; std::snprintf(pattern,sizeof(pattern),"\"%s\"",key);
    const char* p=obj;
    while ((p=std::strstr(p,pattern))) {
        p=skipSpace(p+std::strlen(pattern));
        if (*p++!=':') continue;
        p=skipSpace(p);
        return p;
    }
    return nullptr;
}
static void readJsonText(const char* obj,const char* key,char* out,std::size_t cap) {
    if (!cap) return; out[0]=0;
    const char* p=findJsonValue(obj,key); if(!p || *p!='"') return; ++p;
    std::size_t n=0;
    while(*p && *p!='"' && n+1<cap) {
        if(*p=='\\' && p[1]) { ++p; if(*p=='n') out[n++]=' '; else out[n++]=*p++; }
        else out[n++]=*p++;
    }
    out[n]=0;
}
static void loadLocalizedFromCache(const char* json) {
    const char* p=std::strstr(json, "\"localizedGames\"");
    if(!p) return;
    p=std::strchr(p,'['); if(!p) return; ++p;
    localizedCount=0;
    while(*p && localizedCount<120) {
        p=skipSpace(p); if(*p==']') break;
        if(*p==','){++p;continue;} if(*p!='{'){++p;continue;}
        const char* start=p; int depth=0; bool quoted=false,escape=false;
        do {
            char ch=*p++;
            if(quoted) { if(escape) escape=false; else if(ch=='\\') escape=true; else if(ch=='"') quoted=false; }
            else { if(ch=='"') quoted=true; else if(ch=='{') ++depth; else if(ch=='}') --depth; }
        } while(*p && depth>0);
        if(depth!=0) break;
        std::size_t n=(std::size_t)(p-start);
        char* obj=(char*)std::malloc(n+1); if(!obj) break;
        std::memcpy(obj,start,n); obj[n]=0;
        LocalizedItem& item=localizedItems[localizedCount]; std::memset(&item,0,sizeof(item));
        readJsonText(obj,"name_en",item.name,sizeof(item.name));
        if(!item.name[0]) readJsonText(obj,"name",item.name,sizeof(item.name));
        readJsonText(obj,"translationType_en",item.type,sizeof(item.type));
        if(!item.type[0]) readJsonText(obj,"translationType",item.type,sizeof(item.type));
        if(item.name[0]) ++localizedCount;
        std::free(obj);
    }
}
static void loadGamesFromCache() {
    FILE* f=std::fopen("/data/m4hub_catalog.json","rb"); if(!f) return;
    std::fseek(f,0,SEEK_END); long len=std::ftell(f); std::rewind(f);
    if(len<=0 || len>8*1024*1024) { std::fclose(f); return; }
    char* json=(char*)std::malloc((std::size_t)len+1); if(!json){std::fclose(f);return;}
    std::size_t got=std::fread(json,1,(std::size_t)len,f); std::fclose(f); json[got]=0;
    loadLocalizedFromCache(json);
    const char* p=std::strstr(json,"\"games\""); if(!p){std::free(json);return;}
    p=std::strchr(p,'['); if(!p){std::free(json);return;} ++p;
    gameCount=0;
    while(*p && gameCount<80) {
        p=skipSpace(p); if(*p==']') break;
        if(*p==','){++p;continue;} if(*p!='{'){++p;continue;}
        const char* start=p; int depth=0; bool quoted=false,escape=false;
        do {
            char ch=*p++;
            if(quoted) { if(escape) escape=false; else if(ch=='\\') escape=true; else if(ch=='"') quoted=false; }
            else { if(ch=='"') quoted=true; else if(ch=='{') ++depth; else if(ch=='}') --depth; }
        } while(*p && depth>0);
        if(depth!=0) break;
        std::size_t n=(std::size_t)(p-start);
        char* obj=(char*)std::malloc(n+1); if(!obj) break;
        std::memcpy(obj,start,n); obj[n]=0;
        GameItem& g=gameItems[gameCount]; std::memset(&g,0,sizeof(g));
        readJsonText(obj,"name_en",g.name,sizeof(g.name));
        if(!g.name[0]) readJsonText(obj,"name",g.name,sizeof(g.name));
        readJsonText(obj,"cusa",g.cusa,sizeof(g.cusa));
        const char* size=findJsonValue(obj,"sizeGB");
        if(size) { char* end=nullptr; double v=std::strtod(size,&end); if(end!=size && v>0 && v<2000){g.sizeGB=v;g.hasSize=true;} }
        if(g.name[0]) ++gameCount;
        std::free(obj);
    }
    std::free(json);
}

struct Glyph { char c; const char* rows[7]; };
static const Glyph FONT[] = {
{'A',{"01110","10001","10001","11111","10001","10001","10001"}},
{'B',{"11110","10001","10001","11110","10001","10001","11110"}},
{'C',{"01111","10000","10000","10000","10000","10000","01111"}},
{'D',{"11110","10001","10001","10001","10001","10001","11110"}},
{'E',{"11111","10000","10000","11110","10000","10000","11111"}},
{'F',{"11111","10000","10000","11110","10000","10000","10000"}},
{'G',{"01111","10000","10000","10111","10001","10001","01111"}},
{'H',{"10001","10001","10001","11111","10001","10001","10001"}},
{'I',{"11111","00100","00100","00100","00100","00100","11111"}},
{'J',{"00111","00010","00010","00010","10010","10010","01100"}},
{'K',{"10001","10010","10100","11000","10100","10010","10001"}},
{'L',{"10000","10000","10000","10000","10000","10000","11111"}},
{'M',{"10001","11011","10101","10101","10001","10001","10001"}},
{'N',{"10001","11001","10101","10011","10001","10001","10001"}},
{'O',{"01110","10001","10001","10001","10001","10001","01110"}},
{'P',{"11110","10001","10001","11110","10000","10000","10000"}},
{'Q',{"01110","10001","10001","10001","10101","10010","01101"}},
{'R',{"11110","10001","10001","11110","10100","10010","10001"}},
{'S',{"01111","10000","10000","01110","00001","00001","11110"}},
{'T',{"11111","00100","00100","00100","00100","00100","00100"}},
{'U',{"10001","10001","10001","10001","10001","10001","01110"}},
{'V',{"10001","10001","10001","10001","10001","01010","00100"}},
{'W',{"10001","10001","10001","10101","10101","10101","01010"}},
{'X',{"10001","10001","01010","00100","01010","10001","10001"}},
{'Y',{"10001","10001","01010","00100","00100","00100","00100"}},
{'Z',{"11111","00001","00010","00100","01000","10000","11111"}},
{'0',{"01110","10001","10011","10101","11001","10001","01110"}},
{'1',{"00100","01100","00100","00100","00100","00100","01110"}},
{'2',{"01110","10001","00001","00010","00100","01000","11111"}},
{'3',{"11110","00001","00001","01110","00001","00001","11110"}},
{'4',{"00010","00110","01010","10010","11111","00010","00010"}},
{'5',{"11111","10000","10000","11110","00001","00001","11110"}},
{'6',{"01110","10000","10000","11110","10001","10001","01110"}},
{'7',{"11111","00001","00010","00100","01000","01000","01000"}},
{'8',{"01110","10001","10001","01110","10001","10001","01110"}},
{'9',{"01110","10001","10001","01111","00001","00001","01110"}},
{'-',{"00000","00000","00000","11111","00000","00000","00000"}},
{':',{"00000","00100","00100","00000","00100","00100","00000"}},
{'.',{"00000","00000","00000","00000","00000","00110","00110"}},
{'/',{"00001","00010","00010","00100","01000","01000","10000"}}
};

static void color(Uint8 r, Uint8 g, Uint8 b) { SDL_SetRenderDrawColor(gRenderer, r, g, b, 255); }
static void rect(int x,int y,int w,int h,Uint8 r,Uint8 g,Uint8 b) {
    color(r,g,b); SDL_Rect q={x,y,w,h}; SDL_RenderFillRect(gRenderer,&q);
}
static void outline(int x,int y,int w,int h,Uint8 r,Uint8 g,Uint8 b) {
    color(r,g,b); SDL_Rect q={x,y,w,h}; SDL_RenderDrawRect(gRenderer,&q);
}
static const Glyph* findGlyph(char c) {
    if (c >= 'a' && c <= 'z') c = (char)(c - 32);
    for (unsigned int i=0;i<sizeof(FONT)/sizeof(FONT[0]);++i) if (FONT[i].c==c) return &FONT[i];
    return nullptr;
}
static void text(int x,int y,const char* value,int scale,Uint8 r,Uint8 g,Uint8 b) {
    int cursor=x; color(r,g,b);
    for (const char* p=value; *p; ++p) {
        if (*p==' ') { cursor += 6*scale; continue; }
        const Glyph* glyph=findGlyph(*p);
        if (glyph) for (int row=0;row<7;++row) for (int col=0;col<5;++col)
            if (glyph->rows[row][col]=='1') {
                SDL_Rect px={cursor+col*scale,y+row*scale,scale,scale};
                SDL_RenderFillRect(gRenderer,&px);
            }
        cursor += 6*scale;
    }
}
static const char* cards[] = {"HOMEBREW APPS","PAYLOADS","GAME LIBRARY","LOCALIZED GAMES","THEMES","FIRMWARE GUIDE","TOOLS","FAVORITES"};
static const char* descriptions[] = {
    "BROWSE HOMEbrew RELEASES", "PAYLOADS AND HOST REFERENCES",
    "GAME INFO AND COMPATIBILITY", "ARABIC LOCALIZATION CATALOG",
    "CUSTOMIZE YOUR HUB", "CHECK FIRMWARE NOTES",
    "USEFUL PS4 UTILITIES", "YOUR SAVED ITEMS"
};
static void draw() {
    color(9,13,24); SDL_RenderClear(gRenderer);
    rect(0,0,SCREEN_W,10,36,190,170);
    text(86,58,"M4 HUB",9,245,248,255);
    if (page==0) {
        text(90,145,"YOUR PS4 LIBRARY - NATIVE PREVIEW",3,143,164,190);
        rect(80,220,1760,3,38,57,78);
        text(90,260,"SELECT A SECTION",3,36,205,186);
        const int left=90, top=330, cw=405, ch=205, gap=34;
        for (int i=0;i<8;++i) {
            int col=i%4, row=i/4;
            int x=left+col*(cw+gap), y=top+row*(ch+36);
            bool active=(i==selected);
            rect(x,y,cw,ch,active?24:17,active?54:27,active?66:42);
            outline(x,y,cw,ch,active?45:43,active?220:63,active?195:82);
            rect(x+24,y+24,8,ch-48,active?36:27,active?210:110,active?185:135);
            char number[4]; std::snprintf(number,sizeof(number),"%02d",i+1);
            text(x+55,y+42,number,4,active?90:83,active?230:151,active?205:174);
            text(x+55,y+105,cards[i],3,245,248,255);
            text(x+55,y+151,descriptions[i],1,active?175:128,active?221:151,active?210:174);
        }
        rect(80,850,1760,2,38,57,78);
        text(90,885,"D PAD - MOVE",2,167,185,203);
        text(470,885,"CROSS - OPEN",2,167,185,203);
        text(850,885,"CIRCLE - BACK",2,167,185,203);
        text(1230,885,"M4 HUB V0.1 - PREVIEW",2,36,205,186);
        text(90,960,"CATALOG SYNC AND DOWNLOADS ARE THE NEXT DEVELOPMENT STAGE",2,121,143,166);
        text(90,990,"NO GAME FILES ARE INCLUDED IN THIS PREVIEW",2,121,143,166);
        text(90,1030,networkStatus,2,36,205,186);
    } else if (page==3) {
        text(90,150,"GAME LIBRARY",5,36,205,186);
        rect(80,240,1760,3,38,57,78);
        if(detailOpen && gameCount>0 && selected<gameCount) {
            rect(95,300,1720,440,17,27,42); outline(95,300,1720,440,43,63,82);
            text(140,350,gameItems[selected].name,4,245,248,255);
            char detailMeta[100];
            if(gameItems[selected].hasSize) std::snprintf(detailMeta,sizeof(detailMeta),"SIZE %.2f GB APPROX",gameItems[selected].sizeGB);
            else std::snprintf(detailMeta,sizeof(detailMeta),"SIZE NOT LISTED");
            text(140,455,detailMeta,2,143,190,205);
            text(140,520,gameItems[selected].cusa[0]?gameItems[selected].cusa:"CUSA NOT VERIFIED",2,143,190,205);
            text(140,600,"INFO ONLY - NO GAME PKG DOWNLOAD PROVIDED",2,36,205,186);
            text(90,900,"CIRCLE - BACK TO GAME LIST",2,167,185,203);
        } else if(gameCount==0) {
            text(145,365,"NO CACHED CATALOG - PRESS TRIANGLE ON HOME",3,245,248,255);
        } else {
            char countLabel[80]; std::snprintf(countLabel,sizeof(countLabel),"GAMES IN CATALOG: %d",gameCount);
            text(100,270,countLabel,2,143,164,190);
            int visible=8;
            if(selected>=gameCount) selected=gameCount-1;
            if(selected<0) selected=0;
            if(selected<listOffset) listOffset=selected;
            if(selected>=listOffset+visible) listOffset=selected-visible+1;
            for(int i=0;i<visible && listOffset+i<gameCount;++i) {
                int idx=listOffset+i, y=325+i*66; bool active=(idx==selected);
                rect(95,y,1720,54,active?24:17,active?54:27,active?66:42);
                text(125,y+16,gameItems[idx].name,2,245,248,255);
                char meta[80];
                if(gameItems[idx].hasSize) std::snprintf(meta,sizeof(meta),"SIZE %.2f GB APPROX",gameItems[idx].sizeGB);
                else std::snprintf(meta,sizeof(meta),"SIZE NOT LISTED");
                text(1200,y+18,meta,1,active?90:143,active?230:164,active?205:190);
            }
        }
        text(90,900,"UP DOWN - SELECT GAME",2,167,185,203);
        text(650,900,"CROSS - OFFICIAL SOURCE",2,167,185,203);
        text(90,960,networkStatus,2,36,205,186);
    } else if (page==4) {
        text(90,150,"LOCALIZED GAMES",5,36,205,186);
        rect(80,240,1760,3,38,57,78);
        if(detailOpen && localizedCount>0 && selected<localizedCount) {
            rect(95,300,1720,440,17,27,42); outline(95,300,1720,440,43,63,82);
            text(140,350,localizedItems[selected].name,4,245,248,255);
            text(140,455,localizedItems[selected].type[0]?localizedItems[selected].type:"TYPE NOT LISTED",2,143,190,205);
            text(140,545,"CHECK GAME REGION AND CUSA BEFORE INSTALL",2,36,205,186);
            text(140,610,"SOURCE DETAILS MUST BE VERIFIED BEFORE USE",2,143,190,205);
            text(90,900,"CIRCLE - BACK TO LOCALIZED LIST",2,167,185,203);
        } else if(localizedCount==0) {
            text(145,365,"NO LOCALIZATION METADATA IN CACHED CATALOG",3,245,248,255);
        } else {
            char countLabel[80]; std::snprintf(countLabel,sizeof(countLabel),"LOCALIZED ENTRIES: %d",localizedCount);
            text(100,270,countLabel,2,143,164,190);
            int visible=8;
            if(selected>=localizedCount) selected=localizedCount-1;
            if(selected<0) selected=0;
            if(selected<listOffset) listOffset=selected;
            if(selected>=listOffset+visible) listOffset=selected-visible+1;
            for(int i=0;i<visible && listOffset+i<localizedCount;++i) {
                int idx=listOffset+i, y=325+i*66; bool active=(idx==selected);
                rect(95,y,1720,54,active?24:17,active?54:27,active?66:42);
                text(125,y+16,localizedItems[idx].name,2,245,248,255);
                text(1200,y+18,localizedItems[idx].type[0]?localizedItems[idx].type:"TYPE NOT LISTED",1,active?90:143,active?230:164,active?205:190);
            }
        }
        text(90,900,"UP DOWN - SELECT ENTRY",2,167,185,203);
        text(90,960,networkStatus,2,36,205,186);
    } else {
        int index=page-1;
        text(90,150,cards[index],5,36,205,186);
        rect(80,240,1760,3,38,57,78);
        rect(90,300,1740,420,17,27,42);
        outline(90,300,1740,420,43,63,82);
        text(145,365,descriptions[index],3,245,248,255);
        text(145,455,"THIS SECTION WILL LOAD FROM THE LIVE M4 HUB CATALOG",2,165,190,205);
        text(145,515,"NO PLACEHOLDER DOWNLOAD BUTTONS OR FAKE FILE LINKS",2,165,190,205);
        text(145,575,"CATALOG AND NETWORK SUPPORT ARE UNDER DEVELOPMENT",2,165,190,205);
        text(90,820,"CIRCLE - BACK TO HOME",3,36,205,186);
        text(90,900,"M4 HUB NATIVE CLIENT - VERSION 0.1.0",2,121,143,166);
        text(90,960,networkStatus,2,36,205,186);
    }
    SDL_RenderPresent(gRenderer);
    SDL_UpdateWindowSurface(gWindow);
}
static void moveSelection(int dx,int dy) {
    int col=selected%4, row=selected/4;
    col=(col+dx+4)%4; row=(row+dy+2)%2;
    selected=row*4+col;
}
static void handleButton(int b) {
    switch(b) {
        case 0: if((page==3 && gameCount>0 && selected<gameCount) || (page==4 && localizedCount>0 && selected<localizedCount)) detailOpen=true; else page=selected+1; break;
        case 1: if(detailOpen) detailOpen=false; else page=0; break;
        case 3: m4hub_refresh_catalog(networkStatus, sizeof(networkStatus)); loadGamesFromCache(); break;
        case 12: if((page==3 && gameCount>0) || (page==4 && localizedCount>0)) { if(selected>0)--selected; } else moveSelection(0,-1); break;
        case 13: if(page==3 && gameCount>0) { if(selected<gameCount-1)++selected; } else if(page==4 && localizedCount>0) { if(selected<localizedCount-1)++selected; } else moveSelection(0,1); break;
        case 14: if(page==3 && gameCount>0) { selected-=8; if(selected<0)selected=0; } else if(page==4 && localizedCount>0) { selected-=8; if(selected<0)selected=0; } else moveSelection(-1,0); break;
        case 15: if(page==3 && gameCount>0) { selected+=8; if(selected>=gameCount)selected=gameCount-1; } else if(page==4 && localizedCount>0) { selected+=8; if(selected>=localizedCount)selected=localizedCount-1; } else moveSelection(1,0); break;
        case 4: moveSelection(-1,0); break;
        case 5: moveSelection(1,0); break;
        case 9: page=0; break;
    }
}
extern "C" int main(int, char**) {
    setvbuf(stdout,nullptr,_IONBF,0);
    if (SDL_Init(SDL_INIT_VIDEO|SDL_INIT_JOYSTICK)!=0) {
        std::printf("M4 HUB: SDL init failed: %s\n",SDL_GetError()); return 1;
    }
    gWindow=SDL_CreateWindow("M4 HUB",SDL_WINDOWPOS_UNDEFINED,SDL_WINDOWPOS_UNDEFINED,SCREEN_W,SCREEN_H,0);
    if (!gWindow) { std::printf("M4 HUB: window failed: %s\n",SDL_GetError()); return 1; }
    SDL_Surface* surface=SDL_GetWindowSurface(gWindow);
    gRenderer=SDL_CreateSoftwareRenderer(surface);
    if (!gRenderer) { std::printf("M4 HUB: renderer failed: %s\n",SDL_GetError()); return 1; }
    if (SDL_NumJoysticks()>0) gPad=SDL_JoystickOpen(0);
    loadGamesFromCache();
    bool running=true;
    while (running) {
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type==SDL_QUIT) running=false;
            if (event.type==SDL_JOYBUTTONDOWN) handleButton(event.jbutton.button);
            if (event.type==SDL_KEYDOWN) {
                switch(event.key.keysym.sym) {
                    case SDLK_UP: if(page==3 && gameCount>0) { if(selected>0)--selected; } else if(page==4 && localizedCount>0) { if(selected>0)--selected; } else moveSelection(0,-1); break;
                    case SDLK_DOWN: if(page==3 && gameCount>0) { if(selected<gameCount-1)++selected; } else if(page==4 && localizedCount>0) { if(selected<localizedCount-1)++selected; } else moveSelection(0,1); break;
                    case SDLK_LEFT: if(page==3 && gameCount>0) { selected-=8; if(selected<0)selected=0; } else if(page==4 && localizedCount>0) { selected-=8; if(selected<0)selected=0; } else moveSelection(-1,0); break;
                    case SDLK_RIGHT: if(page==3 && gameCount>0) { selected+=8; if(selected>=gameCount)selected=gameCount-1; } else if(page==4 && localizedCount>0) { selected+=8; if(selected>=localizedCount)selected=localizedCount-1; } else moveSelection(1,0); break;
                    case SDLK_RETURN: if(page==0) page=selected+1; else if(page==3 || page==4) detailOpen=true; break;
                    case SDLK_ESCAPE: if(detailOpen) detailOpen=false; else page=0; break;
                    default: break;
                }
            }
        }
        draw();
        SDL_Delay(16);
    }
    if (gPad) SDL_JoystickClose(gPad);
    SDL_DestroyRenderer(gRenderer); SDL_DestroyWindow(gWindow); SDL_Quit();
    return 0;
}
