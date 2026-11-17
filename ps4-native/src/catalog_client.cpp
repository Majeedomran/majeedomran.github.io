#include "catalog_client.h"

#include <cstdio>
#include <cstring>
#include <cstdint>

#include <orbis/Http.h>
#include <orbis/Ssl.h>
#include <orbis/Net.h>
#include <orbis/Sysmodule.h>

namespace {
constexpr const char* CATALOG_URL = "https://majeedomran.github.io/catalog.json";
constexpr const char* CATALOG_PATH = "/data/m4hub_catalog.json";
constexpr const char* CATALOG_TEMP_PATH = "/data/m4hub_catalog.tmp";
constexpr std::size_t MAX_CATALOG_BYTES = 8u * 1024u * 1024u;
constexpr std::size_t NET_POOL_BYTES = 256u * 1024u;
constexpr const char* USER_AGENT = "M4-HUB-PS4/0.1";

void set_status(char* out, std::size_t cap, const char* value) {
    if (out && cap) std::snprintf(out, cap, "%s", value ? value : "");
}
}

int m4hub_refresh_catalog(char* status, std::size_t status_size) {
    int net_pool = -1, ssl_ctx = -1, http_ctx = -1;
    int tpl = -1, conn = -1, req = -1;
    FILE* file = nullptr;
    bool ok = false;
    int32_t http_code = 0;
    std::size_t total = 0;
    char buffer[64 * 1024];

    set_status(status, status_size, "Starting HTTPS connection");

    if (sceSysmoduleLoadModuleInternal(ORBIS_SYSMODULE_INTERNAL_NET) < 0 ||
        sceSysmoduleLoadModuleInternal(ORBIS_SYSMODULE_INTERNAL_HTTP) < 0 ||
        sceSysmoduleLoadModuleInternal(ORBIS_SYSMODULE_INTERNAL_SSL) < 0) {
        set_status(status, status_size, "Could not load PS4 network modules");
        goto cleanup;
    }

    if (sceNetInit() < 0) {
        set_status(status, status_size, "Network initialization failed");
        goto cleanup;
    }
    net_pool = sceNetPoolCreate("m4hubNet", NET_POOL_BYTES, 0);
    if (net_pool < 0) {
        set_status(status, status_size, "Could not create network pool");
        goto cleanup;
    }

    ssl_ctx = sceSslInit(SSL_POOLSIZE);
    if (ssl_ctx < 0) {
        set_status(status, status_size, "SSL initialization failed");
        goto cleanup;
    }
    http_ctx = sceHttpInit(net_pool, ssl_ctx, LIBHTTP_POOLSIZE);
    if (http_ctx < 0) {
        set_status(status, status_size, "HTTP initialization failed");
        goto cleanup;
    }

    tpl = sceHttpCreateTemplate(http_ctx, USER_AGENT, ORBIS_HTTP_VERSION_1_1, 1);
    if (tpl < 0) {
        set_status(status, status_size, "Could not create HTTPS template");
        goto cleanup;
    }
    // Intentionally do not install an SSL callback that ignores certificate errors.
    conn = sceHttpCreateConnectionWithURL(tpl, CATALOG_URL, 1);
    if (conn < 0) {
        set_status(status, status_size, "Could not connect to catalog host");
        goto cleanup;
    }
    req = sceHttpCreateRequestWithURL(conn, ORBIS_METHOD_GET, CATALOG_URL, 0);
    if (req < 0 || sceHttpSendRequest(req, nullptr, 0) < 0) {
        set_status(status, status_size, "Catalog request failed");
        goto cleanup;
    }

    if (sceHttpGetStatusCode(req, &http_code) < 0 || http_code != 200) {
        char message[80];
        std::snprintf(message, sizeof(message), "Catalog server returned HTTP %d", (int)http_code);
        set_status(status, status_size, message);
        goto cleanup;
    }

    file = std::fopen(CATALOG_TEMP_PATH, "wb");
    if (!file) {
        set_status(status, status_size, "Cannot write /data/m4hub_catalog.json");
        goto cleanup;
    }

    for (;;) {
        int got = sceHttpReadData(req, buffer, sizeof(buffer));
        if (got < 0) {
            set_status(status, status_size, "Catalog download interrupted");
            goto cleanup;
        }
        if (got == 0) break;
        total += (std::size_t)got;
        if (total > MAX_CATALOG_BYTES) {
            set_status(status, status_size, "Catalog exceeds 8 MB safety limit");
            goto cleanup;
        }
        if (std::fwrite(buffer, 1, (std::size_t)got, file) != (std::size_t)got) {
            set_status(status, status_size, "Could not save catalog data");
            goto cleanup;
        }
    }
    if (total == 0) {
        set_status(status, status_size, "Catalog response was empty");
        goto cleanup;
    }
    if (std::fflush(file) != 0) {
        set_status(status, status_size, "Could not flush catalog file");
        goto cleanup;
    }
    if (std::fclose(file) != 0) {
        file = nullptr;
        set_status(status, status_size, "Could not close catalog file");
        goto cleanup;
    }
    file = nullptr;
    if (std::rename(CATALOG_TEMP_PATH, CATALOG_PATH) != 0) {
        set_status(status, status_size, "Could not activate downloaded catalog");
        goto cleanup;
    }
    ok = true;
    {
        char message[96];
        std::snprintf(message, sizeof(message), "Catalog downloaded: %lu bytes", (unsigned long)total);
        set_status(status, status_size, message);
    }

cleanup:
    if (file) std::fclose(file);
    if (!ok) std::remove(CATALOG_TEMP_PATH);
    if (req >= 0) sceHttpDeleteRequest(req);
    if (conn >= 0) sceHttpDeleteConnection(conn);
    if (tpl >= 0) sceHttpDeleteTemplate(tpl);
    if (http_ctx >= 0) sceHttpTerm(http_ctx);
    if (ssl_ctx >= 0) sceSslTerm();
    if (net_pool >= 0) sceNetPoolDestroy(net_pool);
    return ok ? 1 : 0;
}

int m4hub_refresh_weather(char* output, std::size_t output_size) {
    int net_pool=-1, ssl_ctx=-1, http_ctx=-1, tpl=-1, conn=-1, req=-1;
    int32_t http_code=0;
    char buffer[4096]={0};
    std::size_t used=0;
    const char* url="https://api.open-meteo.com/v1/forecast?latitude=31.9539&longitude=35.9106&current=temperature_2m&timezone=Asia%2FAmman";
    if(!output || output_size==0) return 0;
    std::snprintf(output,output_size,"TEMP -- C AMMAN");
    if(sceSysmoduleLoadModuleInternal(ORBIS_SYSMODULE_INTERNAL_NET)<0 ||
       sceSysmoduleLoadModuleInternal(ORBIS_SYSMODULE_INTERNAL_HTTP)<0 ||
       sceSysmoduleLoadModuleInternal(ORBIS_SYSMODULE_INTERNAL_SSL)<0) return 0;
    if(sceNetInit()<0) goto weather_cleanup;
    net_pool=sceNetPoolCreate("m4weather",128*1024,0);
    if(net_pool<0) goto weather_cleanup;
    ssl_ctx=sceSslInit(SSL_POOLSIZE);
    if(ssl_ctx<0) goto weather_cleanup;
    http_ctx=sceHttpInit(net_pool,ssl_ctx,LIBHTTP_POOLSIZE);
    if(http_ctx<0) goto weather_cleanup;
    tpl=sceHttpCreateTemplate(http_ctx,"M4-HUB-PS4/0.1.7",ORBIS_HTTP_VERSION_1_1,1);
    if(tpl<0) goto weather_cleanup;
    conn=sceHttpCreateConnectionWithURL(tpl,url,1);
    if(conn<0) goto weather_cleanup;
    req=sceHttpCreateRequestWithURL(conn,ORBIS_METHOD_GET,url,0);
    if(req<0 || sceHttpSendRequest(req,nullptr,0)<0) goto weather_cleanup;
    if(sceHttpGetStatusCode(req,&http_code)<0 || http_code!=200) goto weather_cleanup;
    for(;;) {
        int got=sceHttpReadData(req,buffer+used,sizeof(buffer)-used-1);
        if(got<0) goto weather_cleanup;
        if(got==0) break;
        used+=(std::size_t)got;
        if(used>=sizeof(buffer)-1) goto weather_cleanup;
    }
    buffer[used]=0;
    {
        const char* key=std::strstr(buffer,"\\"temperature_2m\\"");
        if(key) {
            key=std::strchr(key,':');
            if(key) {
                char* end=nullptr;
                double value=std::strtod(key+1,&end);
                if(end!=key+1 && value>-100.0 && value<70.0)
                    std::snprintf(output,output_size,"TEMP %.1f C AMMAN",value);
            }
        }
    }
weather_cleanup:
    if(req>=0) sceHttpDeleteRequest(req);
    if(conn>=0) sceHttpDeleteConnection(conn);
    if(tpl>=0) sceHttpDeleteTemplate(tpl);
    if(http_ctx>=0) sceHttpTerm(http_ctx);
    if(ssl_ctx>=0) sceSslTerm();
    if(net_pool>=0) sceNetPoolDestroy(net_pool);
    return std::strstr(output,"TEMP --")?0:1;
}
