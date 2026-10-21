# Xael Local Vault v0.3 — AI Horde sandbox integration

**A functional prototype, not the live Xael campaign.** No live gameplay, no MG23 changes, no import of Docs 00–13 or sealed information. This update changes only static application files. It retains the **existing IndexedDB database name, version, object stores, and v0.1 backup JSON schema**. The pre-existing completed T00001 and pending T00002 should remain on the Home Screen installation.

## What is new

- Optional **Generate with Stheno via AI Horde** inside Turns while an action is pending. No paid API, no paid proxy, no model running hot on the iPhone.
- Preset exact model ID: `koboldcpp/L3-8B-Stheno-v3.2`. Availability depends on volunteer workers.
- **Direct browser-to-Horde request** using `POST https://aihorde.net/api/v2/generate/text/async`, followed by `GET /generate/text/status/{id}`. Cancel uses `DELETE` for that same endpoint.
- Submit only after an explicit sandbox privacy confirmation. The app includes a **preview of the entire outgoing text**.
- The sandbox brief contains location, in-world time, player input, at most two previous test turns, and NPC **public** notes. The `privateNotes` / DM-only NPC field is **not sent**. However, recent journal text itself may contain sensitive information, so always inspect the preview.
- An optional **AI Horde key field** is in memory for this screen only; it is not placed in GitHub source, localStorage, IndexedDB, or backups. Leave it blank for the official anonymous key `0000000000` (lower-priority queue). An API key provided directly to the Horde endpoint is visible to Horde; that is required for authorization.
- The worker's output populates the existing **unsaved draft** box. A player action **remains pending** until the user reviews and clicks **Append response to journal**. No automatic save of AI text.
- Existing experimental on-device WebLLM panel and PocketPal manual bridge remain available; you can leave them unused.
- v0.3 service worker adds `horde-ai.js` to the offline app shell. The cloud generator itself **requires internet**.

## Installation on iPhone — no PC needed

1. Inside the **existing Home Screen Xael app**, use `Vault → Download backup`. Confirm the backup JSON is saved to Files. Make a second copy if possible.
2. Unzip the `xael-v0.3-github-update.zip` download in Files.
3. Open the existing public GitHub repository `WolfSlaterGaming/xael-local-vault`. Upload the **seven individual files** from the ZIP to the repository ROOT on the `main` branch (not the ZIP; not a folder): `README.md`, `index.html`, `app.js`, `styles.css`, `sw.js`, `local-ai.js`, and the new `horde-ai.js`.
4. Tap **Commit changes**. Wait for GitHub Pages deployment. Fully close and reopen the Home Screen app. If it still says *Prototype 02*, reopen a second time for the new service worker; do **not** clear website data or uninstall.
5. Check the counters and Turns: **T00001 Resolved**, **T00002 Pending**. If these don't match, stop and do not submit an AI request; restore your backup only with guidance.
6. In **Turns → Pending: T00002**, locate **AI Horde · free volunteer cloud test**. Check the outgoing preview. Enter a personal Horde key into the local field only if desired; leave it blank to use the anonymous service.
7. Read and check the sandbox-only consent. Tap **Generate with Stheno via AI Horde**. After an additional confirmation, wait for the status (queue/worker/draft). If it fails, the action is still pending; report the full status message.
8. When the draft appears, **review it first**. Do **not** automatically append it; it may fabricate people, history, or NPC knowledge. You can revise or discard it.

## Technical scope and important limitations

- AI Horde uses volunteer-run machines; **workers may see the submitted text**. DO NOT send the real Xael transcript, campaign notes, personal details, Doc 07/12/13 sealed mysteries, or other protected/private information. Never upload backups or API keys to public GitHub.
- AI Horde has provider/community rules; mature content handling and specific model access are **not guaranteed** to be unrestricted. Service requests may be refused, queued, unavailable, delayed, or time out.
- A browser CORS or request failure is possible. The integration uses official API routes, but direct iPhone Safari/Home Screen compatibility **cannot be verified in this build environment**. No paid gateway is included. A failed cloud call never modifies the local game ledger.
- The model may invent background characters, conversations, and NPC knowledge. There is no automatic canon validator, no trustworthy sealed-history integration, no full D&D engine, no live MG23 migration, and no background scheduling.
- Closing the app during a cloud job may abandon its response. The original pending player action stays local. Avoid repeatedly resubmitting if an acknowledgement is lost, since the remote request may still run.
- Cache/offline shell and existing backups remain independent of the AI Horde connection. Browser persistent storage is not an absolute data guarantee; keep exported backups.

## Verification performed

- Source JS syntax checks; HTML asset references and cache contents checked.
- Mocked Horde request flow tests for asynchronous submission and poll, staged draft, cancellation/no-commit and API-error handling; no real external generation submitted.
- Direct Safari and live AI Horde API functionality must be tested on the user's iPhone. All tests are sandbox-only.
