# Xael Local Vault v0.3.1 — AI Horde speed/queue update

**Sandbox only.** The live Xael campaign, gameplay ledger and Project docs remain untouched. No paid AI API, server, or backend database is added.

## Changes

- Adds **Check volunteer availability** before you send a prompt. It reads public AI Horde model-status data (without your story) and reports current approximate ETA and volunteer counts for Stheno, Rocinante and Skyfall. These estimates are not guarantees.
- Adds optional model selection (Stheno 8B default; Rocinante X 12B and Skyfall 31B as alternatives). Different models may change storytelling style.
- **Prefer faster workers** is on by default (`slow_workers:false`). It can reduce eligible volunteers and may worsen queue delays or leave no worker available. Turn it off if needed.
- Wait limits: 60, 90 (default), or 150 seconds. A timed-out request is cancelled when possible. Cancel may fail if the network is down; the app reports uncertainty. A wait limit cannot accelerate an already-busy volunteer machine.
- Maximum reply lengths: 128, 160 (default), 240 tokens. Shorter responses can reduce generation time, at the cost of richness.
- Reports elapsed waiting time, estimated remaining time and queue position when provided by AI Horde.
- Keeps all output **draft-only**; only the existing explicit Append button can commit a response.
- Keeps IndexedDB schema, original turn IDs, local backups, and the standalone offline journal exactly as in v0.3.

## Installation (iPhone only)

1. Xael app → Vault → Download backup and keep the JSON locally. NEVER upload it to a public GitHub repo.
2. Upload the **five files** in the `xael-v0.3.1-github-update.zip` archive to your existing repo `WolfSlaterGaming/xael-local-vault`, replacing same-name files at repository root: `app.js`, `horde-ai.js`, `index.html`, `sw.js`, `README.md`.
3. Commit, wait for GitHub Pages deploy, close and reopen the Home Screen app. If you see the old version, reopen once more. Never delete the app or erase Safari website data to force an update.
4. Confirm `PROTOTYPE 03.1` appears and T00001/T00002 still have the same saved status.
5. Open pending T00002. Choose Stheno → **Check volunteer availability** (no story sent). With fictional sandbox content only, opt in and try generation. Compare elapsed times. Never auto-append an unreviewed draft.

## Limits / safety

AI Horde is a volunteer service. Some requests will be slow or unavailable; this patch does not guarantee 15–20-second replies or consistent availability. A registered free AI Horde key can sometimes improve priority compared with the anonymous key, but is not a speed guarantee. Never store keys in your GitHub code or upload private/sealed campaign data. Story text transmitted to volunteers may be visible to worker operators. Private NPC notes are omitted from this v0.3 outgoing prompt, but the app is NOT yet ready to import or share the real campaign.

## Verification

Checked JavaScript syntax; mocked the AI Horde model-list and asynchronous-generation API. Verified Stheno selection, `slow_workers:false`, bounded output, completed-draft path, and no-eligible-worker error path. **Not yet live-tested on your iPhone**. Database and backup remain untouched by these new network functions.
