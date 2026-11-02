# Wall Hop

A one-thumb neon arcade climber for phones. Tap to leap between the two walls of an endless tower, dodge spikes and saws, collect coins, and unlock skins.

- **Play in a browser:** https://worthytoast.github.io/wall-hop/
- **Android app:** the `android/` folder builds a signed Play Store bundle (`.aab`) that runs the same game offline.

## How it is built

The whole game is one HTML file, `src/game.html`: a canvas game plus HTML menus, with no libraries. Everything else is generated from it.

| Command | What it makes |
|---|---|
| `python tools/build.py` | `docs/index.html` (web version), `android/app/src/main/assets/index.html` (app copy), `dist/artifact.html` (claude.ai copy). Run this after every change to `src/game.html`. |
| `bash tools/build_android.sh` | Signed `wall-hop-<version>.aab` and `.apk` in `release/`. |
| `python tools/make_icons.py` | Launcher icons, the 512 px store icon, and the feature graphic. |
| `node tools/sim.js docs/index.html` | Headless smoke test: runs the real game code, checks death, saving, and coins. |
| `node tools/fair_run.js docs/index.html` | Fairness test: a planning bot plays 12 runs and reports any layout it could not survive. |
| `node tools/shots/shoot.js` | Retakes the 1080 x 1920 store screenshots in headless Chrome (needs a local server on port 8799 serving `docs/`). |

The Android toolchain lives outside the repo in `C:\Users\liamb\tools\android` (JDK 17, Android SDK 36, Gradle 8.11.1).

## Signing key

The upload key is **not** in this repo. It lives in `C:\Users\liamb\Liams_projects\wall-hop-signing\` with its passwords in `keystore.properties`. Back that folder up somewhere safe. Google Play App Signing holds the real app key, so a lost upload key can be reset through Play Console support, but it is slow.

## Publishing an update

1. Edit `src/game.html` and run `python tools/build.py`.
2. Raise `versionCode` (and `versionName`) in `android/app/build.gradle`. Play rejects a bundle whose versionCode it has seen.
3. Run `bash tools/build_android.sh` and upload the new `.aab` in Play Console.

See `store/listing.md` for the listing text and the answers to Play Console's forms.
