# M4 HUB — native PS4 client source

This folder now contains the first native application source scaffold.

## Current implementation
- `src/main.cpp`: SDL2 software-rendered 1080p home screen.
- Controller navigation: D-pad, L1/R1, Cross, Circle and Options; keyboard arrows/Enter/Escape are also supported for host-side testing where SDL input is available.
- Eight initial sections: Homebrew Apps, Payloads, Game Library, Localized Games, Themes, Firmware Guide, Tools, Favorites.
- A tiny built-in bitmap font avoids external font assets for this first UI prototype.
- `src/catalog_client.cpp` / `.h`: first native HTTPS catalog-fetch module, based on the official OpenOrbis `net_http` sample. It downloads `catalog.json` to `/data/m4hub_catalog.json` with an 8 MB safety cap and deliberately keeps TLS certificate verification enabled.
- `Makefile`: links OpenOrbis SceNet/SceSsl/SceHttp libraries and compiles all C++ source files.

## Build prerequisites
- Linux or macOS host with the OpenOrbis toolchain installed.
- `OO_PS4_TOOLCHAIN` set to the toolchain root.
- Matching Clang/LLD and the SDL2 library shipped for that toolchain.
- The toolchain's SDL2 sample package assets must be present at `samples/SDL2/sce_sys/`.

Build from this directory:
```sh
make check-env
make
```

The output is intended to be `IV0000-M4HB00001_00-M4HUBNATIVE00001.pkg`.

## Honest status
This is source code and a build recipe, **not a compiled or tested PKG**. This environment has not run the OpenOrbis compiler or installed the result on a PS4. The first screen is still a navigation prototype. The HTTPS fetch module is added but is not yet wired to a controller action or the UI; JSON parsing, validation, cache fallback, localized metadata rendering, and verified direct downloads are not implemented yet. The catalog file is saved as `/data/m4hub_catalog.json` only after a successful HTTP 200 transfer. The interface currently uses English bitmap labels; Arabic shaping/right-to-left layout is a later UI task.

Do not distribute the package as firmware-compatible until it has been built and tested on actual PS4 hardware with the exact HEN/firmware combination documented.
