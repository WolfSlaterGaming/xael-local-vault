# Xael Local Vault v0.2.1 — local AI runtime fix (sandbox)

This is a **small patch** to an already installed v0.2 app. It does **not** change or reset the existing database, backups, journal, or game state. Upload only these three files to the ROOT of the **existing** GitHub `xael-local-vault` repository: `local-ai.js`, `sw.js`, `README.md`. GitHub may show them as updated/replaced; do not upload the ZIP.

## Why
The existing WebLLM v0.2.85 runtime has a possible `Object has already been disposed` generation bug. This patch pins `@mlc-ai/web-llm` to **0.2.82** (documented working with some affected GPU setups), handles a disposed runtime without reusing it, and bumps the app-shell cache from `xael-vault-v0.2.0` to `xael-vault-v0.2.1`.

The match is **not proof** of the cause on iOS. We still need a device retest. The older WebLLM runtime may download different supporting libraries on first use. This patch does not modify the Llama 3.2 1B model selection or prompt.

## Before uploading
1. In your existing Xael Home Screen app, choose **Vault → Download backup** and save to Files. Keep your current T00002 pending action; **do not erase the vault**.
2. Upload `local-ai.js`, `sw.js`, `README.md` into the existing repository root, commit to `main`, and wait for Pages deployment.
3. Fully close and reopen the Home Screen app. It may take a second reopen for the new service worker to replace its old cached copy.
4. Confirm **T00001 resolved** and **T00002 pending**.
5. In Turns, choose Llama 3.2 1B, load once, and check the status text includes **WebLLM 0.2.82**. Generate a test draft, **but do not append it** until it is reviewed.
6. If generation fails again, capture the exact error. Do not retry repeatedly, clear site data, or delete the app.

## Scope and limitations
- The AI response is only an unsaved draft until manually appended.
- This change does **not** import or modify MG23 canon.
- No paid cloud API or database is added. Model/library downloads contact public hosts; inference remains local.
- On-device Safari/WebGPU stability is not guaranteed; the manual PocketPal workflow is still available.
- Keep JSON backups in Files, especially since iOS storage isn't a substitute for independent backup.
