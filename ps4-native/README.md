# M4 HUB — native PS4 client source

This folder now contains the first native application source scaffold.

## Current implementation
- `src/main.cpp`: SDL2 software-rendered 1080p home screen.
- Controller navigation: D-pad, L1/R1, Cross, Circle and Options; keyboard arrows/Enter/Escape are also supported for host-side testing where SDL input is available.
- Eight initial sections: Homebrew Apps, Payloads, Game Library, Localized Games, Themes, Firmware Guide, Tools, Favorites.
- A tiny built-in bitmap font avoids external font assets for this first UI prototype.
- `src/catalog_client.cpp` / `.h`: native HTTPS catalog-fetch module, based on the official OpenOrbis `net_http` sample. Press Triangle from the home screen to download `catalog.json` to `/data/m4hub_catalog.json`; it uses an 8 MB safety cap, writes to a temporary file first, and replaces the last complete cache only after the transfer succeeds. TLS certificate verification is left enabled.
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
This is source code and a build recipe, **not a compiled or tested PKG**. This environment has not run the OpenOrbis compiler or installed the result on a PS4. The first screen is still a navigation prototype. The HTTPS fetch module is wired to Triangle on the home screen and stores the downloaded catalog in `/data/m4hub_catalog.json`. The game-library screen reads the cached `games` array and displays English names plus approximate sizes, with D-pad/arrow navigation and an eight-row scrolling window. Cross opens a details panel showing the approximate size, any catalog CUSA field, and a clear informational-only/no-PKG notice. The Localized Games screen reads `localizedGames` and displays available English names and translation-type metadata with the same navigation; Cross opens a reminder to verify region/CUSA compatibility before installing. Circle/Escape closes the details panel. Both lists load from the last saved catalog on startup. The parser is intentionally minimal and does not validate the complete JSON schema, fetch covers, or provide verified direct downloads. Commercial game entries remain informational only. The interface currently uses English bitmap labels; Arabic shaping/right-to-left layout is a later UI task.

Do not distribute the package as firmware-compatible until it has been built and tested on actual PS4 hardware with the exact HEN/firmware combination documented.
