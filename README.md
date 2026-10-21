# Xael · Local Vault (prototype 0.1)

This is a **standalone test vault**, not a playable AI game yet. It has no connection to the live Xael campaign or Google Drive. No canon has been migrated.

## What works
- Scene name, location, and time stored locally in IndexedDB.
- Player actions saved first as pending. Resolutions are appended as separate records; neither is silently replaced.
- NPC records with public facts and private knowledge in separate fields.
- Manual offline AI bridge: copy a scoped test prompt into PocketPal, then paste its response into the vault after reviewing it.
- Export full SHA-256-checked JSON backups; verify checksum, preview and confirm before restore.
- Offline app shell via a service worker when deployed over HTTPS.
- No analytics, no backend, no usage-based APIs, no model download or network request made by the app.

## How to host with GitHub Pages for $0, using iPhone Safari
1. Create a GitHub account if necessary, then a new **public** repository, e.g., `xael-local-vault`.
2. In Safari on github.com, use the repository's **Add file → Upload files** interface and upload `index.html`, `app.js`, `styles.css`, `sw.js`, `manifest.webmanifest`, `icon.svg`, `icon-192.png`, and `icon-512.png` from this package **to the repository root**. Mobile layout may require **Request Desktop Website**. The README is optional.
3. Open repository **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, choose branch **main**, folder **/(root)**, and Save.
4. Wait for GitHub Pages to give you an HTTPS URL like `https://YOURNAME.github.io/xael-local-vault/` (that URL is an example, not a working link).
5. Open the HTTPS address in Safari. Use Share → Add to Home Screen → Open as Web App.
6. Open once while online so the app shell can cache, then test in Airplane Mode. A successful offline test requires service-worker installation.
7. In the vault, test a pending turn, three sample NPCs, save the response, export to Files, and restore from backup.

**Critical:** Everything in a public GitHub repo is public! Upload only these generic app code files. NEVER upload your real Xael campaign files, ledger, NPC secrets, private documents, or backup JSON. These should be imported only into the app's local database using its restore feature *after* a suitable migration format is developed.

## Costs and limitations
- GitHub Pages on a public repository is currently available on GitHub Free, subject to its terms and use limits.
- This app requires no paid cloud inference, database or hosting plan.
- Web apps on iOS can lose IndexedDB data if browser site data is cleared, storage pressure causes eviction, or the web app is uninstalled. Export backups to Files frequently, ideally after each important session, and maintain a separate copy.
- Private notes are only **hidden in the UI** behind a disclosure. They are **not encrypted**. The holder of the device can inspect the local data. Don't import sealed gameplay files yet.
- PocketPal and this web app are **not automatically integrated**. The manual copy/paste bridge is temporary. WebGPU in-browser AI integration remains a future, device-specific experiment.
- The app does not resolve D&D dice, resources, finances, long-running calendar, game canon, or role-play content beyond storing test records.

## To test on a developer machine (optional, not necessary on iPhone)
Serve these files over localhost: `python -m http.server 8765`. Open `http://localhost:8765` in Chromium.

## Build verification
This package passed JavaScript syntax checks, static HTML/JS element checks and local-asset verification. Live browser testing was unavailable in the build environment, so data persistence, iOS installation, and offline behavior must still be tested on your iPhone. PocketPal bridging is manual only.
