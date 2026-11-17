# Native PKG update flow

The native PS4 client should request `/updates/ps4-app-update.json` on launch and periodically while online.

1. Parse the manifest and compare semantic versions.
2. If a newer release exists, display release notes and offer download.
3. Download the PKG to a safe staging location and verify SHA-256 before offering installation.
4. Ask the user to confirm installation. Do not claim silent/self-install capability.
5. After installation, re-read the manifest and record the running version.

Catalogue data updates are independent: the client fetches `/catalog.json` and refreshes its cached catalogue without requiring a new PKG. Publishing a catalogue edit must never imply that the native binary has changed.

A release is publishable only after the PKG is built using a compatible PS4 homebrew toolchain, tested on the declared firmware range, uploaded, and its URL/hash/version populated in the update manifest. The current manifest intentionally has no PKG URL because no tested native binary has been built yet.
