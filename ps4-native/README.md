# M4 HUB — native application roadmap

This folder is the planning and source boundary for the future installable PS4 PKG companion.

## Current status
- The browser-based Ultimate library lives in `/ultimate/`.
- The website reads the shared `/catalog.json` at page load and refreshes it periodically without requiring a site-code update.
- A compiled PS4 PKG is **not** included yet. A valid installable package must be built and tested with a compatible PS4 homebrew toolchain and on hardware/firmware combinations the developer can verify.

## Planned native modules
1. Catalog client: fetch versioned JSON over HTTPS, validate schema, and cache the last successful catalogue.
2. Library UI: apps, payload references, themes, firmware notes, and user-owned game metadata.
3. Download manager: queue, progress, pause/resume where supported by the chosen network API, and safe file handling.
4. Firmware capability display: show only explicitly documented compatibility; never infer support.
5. Theme settings: local appearance preferences.
6. Update manifest: check app releases separately from catalogue updates.

## Safety and distribution
- Only use official project releases or sources with clear redistribution permission.
- Do not bundle copyrighted commercial game packages or provide unauthorized game-download links.
- Do not expose GitHub tokens, admin passwords, or Worker secrets in the client.
- PKG builds must be labelled with their tested firmware range and release hash.

## Build status
No PKG binary is claimed by this repository until the native application is implemented, compiled, and tested.
