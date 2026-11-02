# Wall Hop: notes for Claude

Read README.md first for the build commands.

- `src/game.html` is the only source of game code. It is an artifact-style fragment (no doctype). `tools/build.py` wraps it into full pages. Never edit `docs/index.html` or the Android asset copy by hand.
- `__BUNGEE__` in the source is replaced with the base64 Bungee font at build time so the game works offline.
- `window.__wh()` exposes game state for the headless tests and screenshot script. `window.wallhopBack()` is called by the Android Back button; returning false closes the app.
- Save data is localStorage key `wallhop.v1`. Changing its shape needs a migration, or players lose coins and skins.
- Difficulty knobs: `spd()` (speed curve), `diff()` (0 to 1 over 14000 px), and the `gap` math in `spawn()`. Rerun `tools/fair_run.js` after touching any of them.
- Android wrapper: plain `Activity` + `WebView`, no AndroidX. Package `com.worthytoast.wallhop`. Target SDK 36. The package name can never change after the first Play upload.

## Status (Nov 2, 2026)

- Version 1.0 (versionCode 1) built and signed. Not yet uploaded to Play; the user needs a Play Console developer account first.
- Store graphics, screenshots, privacy policy, and listing text are done.

## Ideas not built yet

- Daily challenge seed, more hazard types (lasers, crumbling walls), revive-for-coins, Play Games leaderboards.
