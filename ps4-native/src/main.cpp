#include <SDL2/SDL.h>
#include <cstdio>
#include <cstring>
#include <cstdlib>

static const int SCREEN_W = 1920;
static const int SCREEN_H = 1080;
static SDL_Window* gWindow = nullptr;
static SDL_Renderer* gRenderer = nullptr;
static SDL_Joystick* gPad = nullptr;
static int selected = 0;
static int page = 0;

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
    text(90,1010,"NO GAME FILES ARE INCLUDED IN THIS PREVIEW",2,121,143,166);
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
        case 0: page=selected+1; break; // CROSS
        case 1: page=0; break;         // CIRCLE
        case 12: moveSelection(0,-1); break;
        case 13: moveSelection(0,1); break;
        case 14: moveSelection(-1,0); break;
        case 15: moveSelection(1,0); break;
        case 4: moveSelection(-1,0); break;
        case 5: moveSelection(1,0); break;
        case 9: page=0; break;
    }
}
int main(int, char**) {
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
    bool running=true;
    while (running) {
        SDL_Event event;
        while (SDL_PollEvent(&event)) {
            if (event.type==SDL_QUIT) running=false;
            if (event.type==SDL_JOYBUTTONDOWN) handleButton(event.jbutton.button);
            if (event.type==SDL_KEYDOWN) {
                switch(event.key.keysym.sym) {
                    case SDLK_UP: moveSelection(0,-1); break;
                    case SDLK_DOWN: moveSelection(0,1); break;
                    case SDLK_LEFT: moveSelection(-1,0); break;
                    case SDLK_RIGHT: moveSelection(1,0); break;
                    case SDLK_RETURN: page=selected+1; break;
                    case SDLK_ESCAPE: page=0; break;
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
