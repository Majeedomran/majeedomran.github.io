# Arabic-localized PS4 games catalogue

Add verified entries to the top-level `catalog.json` under `localizedGames`.

Recommended fields:
- `name`, `name_en`: game title.
- `description`, `description_en`: what is translated.
- `region`: CUSA/region or disc region when confirmed.
- `baseGameVersion`: exact game update/build required.
- `translationType`: e.g. menus, subtitles, full text.
- `version`: translation release/version.
- `status`: use `verified` only after checking the source and package.
- `sourceUrl`: original creator/project page.
- `downloadUrl`: direct authorized translation file only when redistribution is permitted.
- `firmware`: only if the item itself has a meaningful firmware requirement.

Do not add commercial game PKGs, copyrighted game dumps, or mirrors of unauthorized copies. Prefer creator releases, patches, and legal documentation. Keep unverified entries labelled unverified.


## Automatic catalogue updates

GitHub Actions runs `scripts/sync_localizations.py` every Monday at 06:00 UTC and can also be started manually from the Actions tab. It reads the PS4-filtered public listing on Ta3reb and imports metadata (title, PS4 platform, CUSA when listed, update version when listed, translation category, and the original source page). Existing entries are refreshed by normalized title; new entries are added automatically.

The sync does **not** download or mirror translation archives, PKGs, commercial game files, or password-protected member downloads. It records source pages only. A listing is not a guarantee that a patch will work with every region or firmware; check the source page and exact CUSA/build before use.
