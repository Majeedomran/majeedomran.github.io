# MAJEED PS4 HOST

A public, responsive PS4 community catalogue for homebrew applications, payloads, firmware references, emulators, utilities, mods, development resources and Arabic game-translation directories.

**Live site:** https://majeedomran.github.io  
**Admin panel:** https://majeedomran.github.io/admin.html

## Project structure

- `index.html`, `style.css`, `app.js`: public interface, responsive layout, bilingual UI and catalogue rendering.
- `catalog.json`: catalogue data for firmware, payloads and applications.
- `admin.html`, `admin.js`: protected catalogue administration interface.
- `worker.js`: Cloudflare Worker API for admin authentication, GitHub catalogue updates, health checks and source-link checks.

## Languages and navigation

- English is the default language for first-time visitors.
- Arabic/English switching is available; the selected language is saved in the browser.
- Library categories are presented as a compact tile grid rather than a horizontal scrolling menu.
- Search, category filters, firmware lookup, catalogue assistant, link checker and service status are available in the interface.

## Administration

The admin panel authenticates through the Cloudflare Worker. The Worker reads and writes `catalog.json` in this repository using the GitHub API.

Required Cloudflare Worker secrets (configure in Cloudflare, never commit them):
- `ADMIN_PASSWORD`
- `GH_TOKEN`
- `SESSION_SECRET`

The Worker health endpoint is `/health`. The link checker only checks HTTP response reachability for an allowlist of source domains; it does **not** scan file contents, prove download integrity, or guarantee firmware compatibility.

## Current catalogue\n\nThe catalogue currently contains 23 firmware entries, 15 payloads and 36 applications/resources. Firmware notes distinguish exploit entry points, kernel exploit availability and HEN/payload compatibility; they are not blanket guarantees.\n\n## Catalogue standards

- Prefer original developer repositories and release pages.
- Mark uncertain or experimental compatibility clearly.
- Distinguish PS4-native software from PC software and community indexes.
- Do not describe a source-page HTTP 200 response as proof that a download is safe or compatible.
- Firmware exploit chains, kernel access, HEN and individual payload support are separate compatibility stages. Always check the exact firmware, release notes and source.
- Community translation directories are indexes, not official Sony repositories. Verify game CUSA ID, game version and translation source independently.

## Local preview

Open `index.html` in a modern browser. The public catalogue loads from `catalog.json`; the admin API requires the deployed Cloudflare Worker and configured secrets.

## Deployment

GitHub Pages serves the repository root from the default branch. Frontend changes publish through GitHub Pages automatically. Changes to `worker.js` require a separate deployment to Cloudflare Workers.

## Disclaimer

MAJEED PS4 HOST is an independent community project and is not affiliated with or endorsed by Sony Interactive Entertainment. Use homebrew, payloads, plugins and third-party files at your own risk. Back up important data and review each project's original documentation before use.
