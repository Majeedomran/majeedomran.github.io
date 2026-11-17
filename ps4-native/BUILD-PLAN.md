# M4 HUB Native PS4 App — Build Plan

## Goal
Create a standalone PS4 homebrew companion for the M4 HUB website. The browser library remains the primary working version while the native client is developed independently.

## Toolchain
Use the open-source OpenOrbis PS4 Toolchain (not Sony's proprietary SDK), with its matching LLVM/Clang, linker, package tools, and sample project conventions:
- https://github.com/OpenOrbis/OpenOrbis-PS4-Toolchain
- https://github.com/OpenOrbis/LibOrbisPkg

The toolchain documentation requires a correctly configured `OO_PS4_TOOLCHAIN`, Clang/LLD, and the package metadata plus `eboot.bin` and `sce_sys` files for a valid PKG. A successful compile alone is not proof that the package installs or runs on a user's firmware.

## Version 0.1 scope
1. Native home screen with M4 HUB branding and controller navigation.
2. Sections for homebrew apps, payload references, themes, firmware notes, and game metadata.
3. Fetch `https://majeedomran.github.io/catalog.json` over HTTPS.
4. Validate the JSON structure before displaying it.
5. Cache the last valid catalogue locally and show an offline/stale-data notice when refresh fails.
6. Keep commercial game entries informational unless an authorized download URL is explicitly present.
7. Show download controls only for verified, authorized direct URLs. Never fabricate a PKG URL or route a download through an unrelated page.
8. Separate catalogue refresh from native-app updates; catalogue changes must not require reinstalling the PKG.

## Download manager scope
- Queue and display only downloads supported by the native networking/filesystem implementation.
- Show real byte-based progress only when the transfer API provides reliable byte counts.
- Do not claim pause/resume until the selected transfer implementation supports it.
- Verify file size and SHA-256 when the catalogue supplies trusted values.

## Release gates
A PKG may be called ready only after all of these pass:
- Build completes with a pinned, documented OpenOrbis toolchain version.
- Package metadata, title ID, content ID, and version are validated.
- The produced PKG is attached to a release with SHA-256 and build provenance.
- Installation and launch are tested on real PS4 hardware.
- The tested firmware range and any jailbreak/HEN requirements are documented.
- Network fetch, controller navigation, catalogue parsing, offline cache, and authorized file download are tested.

## Current status
Planning only. No native executable or PKG is included yet. The web library at `/ultimate/` remains the usable release. Do not describe this project as an installable app until the release gates above are complete.

## Important compatibility note
A PKG built with a homebrew toolchain generally requires a PS4 environment that permits homebrew installation and execution. Firmware compatibility is not inferred from the fact that the PKG compiled successfully.
