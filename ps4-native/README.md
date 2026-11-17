# M4 HUB — native PS4 client source

This folder now contains the first native application source scaffold.

## Current implementation
- `src/main.cpp`: SDL2 software-rendered 1080p home screen.
- Controller navigation: D-pad, L1/R1, Cross, Circle and Options; keyboard arrows/Enter/Escape are also supported for host-side testing where SDL input is available.
- Eight initial sections: Homebrew Apps, Payloads, Game Library, Localized Games, Themes, Firmware Guide, Tools, Favorites.
- A tiny built-in bitmap font avoids external font assets for this first UI prototype.
- `Makefile`: OpenOrbis build/package recipe based on the upstream SDL2 sample layout. It copies sample package metadata assets from the selected toolchain.

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
This is source code and a build recipe, **not a compiled or tested PKG**. This environment has not run the OpenOrbis compiler or installed the result on a PS4. The first screen is a navigation prototype; catalogue HTTPS fetching, JSON parsing, cache, localized metadata, and verified direct downloads are not implemented yet. The interface currently uses English bitmap labels; Arabic shaping/right-to-left layout is a later UI task.

Do not distribute the package as firmware-compatible until it has been built and tested on actual PS4 hardware with the exact HEN/firmware combination documented.
