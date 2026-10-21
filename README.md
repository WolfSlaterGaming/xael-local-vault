# Xael Local Vault v0.2 — Optional local AI compatibility test

**Sandbox only.** No changes to any real Xael campaign files, no server-side database and no paid AI API.

## Changes from v0.1
- Original IndexedDB database name, version, stores and backup format are UNCHANGED. Restored and pending turns should remain intact.
- Adds an optional "Experimental local AI" tool in **Turns**, only when a player action is pending.
- WebGPU model downloads run in your own browser; generation occurs on the device. It is NOT the Ministral model you downloaded in PocketPal.
- A generated response fills a draft box; **nothing is committed until you review and tap Append response to journal.**
- Manual PocketPal copy/paste still works if the browser model fails.

## Before uploading
1. In your existing Home Screen Xael app, go to **Vault → Download backup**. Save the backup JSON to Files and ideally duplicate it to another folder. **Do not upload any backup to GitHub.**
2. Upload/replace **index.html, app.js, styles.css and sw.js** in the GitHub Pages public repository, **AND ADD local-ai.js**. Keep the existing icons and manifest unchanged.
3. Use GitHub's commit upload, wait for Pages deployment, then completely close and reopen the Home Screen app. Its service worker may show a cached v0.1 once before updating; reload/reopen after deployment.
4. Verify your existing turn(s) and NPC records are intact **before testing AI**.

## Local AI test
1. Do a NEW SANDBOX action only once the previous action is resolved.
2. In **Turns**, choose **SmolLM2 360M** as the lightest feasibility test. This tiny model is NOT suitable to narrate the full Xael campaign.
3. Press **Check WebGPU and load local model** and approve first download, preferably on Wi-Fi. Loading takes time. For better quality later choose Llama 3.2 1B; it needs more memory.
4. Press **Generate draft locally**. If a response appears, read it before tapping **Append response to journal**.
5. Tap **Unload AI** to free resources after the test.
6. If you see WebGPU unavailable, load failure, or Safari kills the page: your journal is still valid. Use the original manual PocketPal bridge; report the exact error.

## Important limitations
- The first module/model download requires the internet. The AI runtime imports a pinned WebLLM package from esm.run and model files from public repositories (Hugging Face/GitHub CDN). This is **not** a paid AI API. Your roleplay text is fed to the on-device inference engine and is not intentionally uploaded; downloading code/models still contacts those hosts.
- The web app's offline shell is cached; whether the AI *library and weights* work offline after downloading has NOT yet been verified on iOS.
- The earlier PocketPal Ministral 3 3B weights are NOT reused here.
- Using WebGPU in an iPhone Home Screen app is browser/version-dependent. This is an **experimental trial**, not a guaranteed feature.
- Never put real campaign secrets in the public GitHub repository. Keep the vault and all sealed materials local; make backups regularly.
- No multiplayer, no advanced D&D rules automation, no current-campaign import, no autonomous NPC simulation, no reliable safety guarantee or hidden progress engine exists in v0.2.

## Backup compatibility
v0.2 reads the same IndexedDB storage and v0.1 JSON backup format without a schema migration. Do not erase the Home Screen app or clear website data while updating. If the upgrade fails, your downloaded backup can be restored into a clean v0.1 install.
