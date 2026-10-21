// Xael Local Vault v0.3 — OPTIONAL AI Horde volunteer-cloud draft provider.
// Direct browser API. No paid API, no proxy, no submitted text saved by this module.
// This module NEVER modifies IndexedDB or resolves a turn. app.js owns commits.
'use strict';
(() => {
  const API = 'https://aihorde.net/api/v2';
  const MODEL = 'koboldcpp/L3-8B-Stheno-v3.2';
  const ANON = '0000000000';
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  let active = null, busy = false;
  let message = 'Ready to connect when you choose Generate via AI Horde.';
  const sync = () => {
    const status = $('hordeStatus'); if (status) status.textContent = message;
    const submit = $('hordeSubmit'); if (submit) submit.disabled = busy;
    const cancel = $('hordeCancel'); if (cancel) cancel.disabled = !active;
    const key = $('hordeKey'); if (key) key.disabled = busy;
  };
  const inform = text => { message = text; sync(); };
  async function request(path, opts = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(API + path, { ...opts, mode:'cors', cache:'no-store', signal:ctrl.signal });
      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = {message:raw.slice(0, 300)}; }
      if (!res.ok) throw new Error('AI Horde HTTP ' + res.status + ': ' + String(data.message || data.error || data.detail || 'Request failed').slice(0, 180));
      return data;
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Network request timed out; the queue may still have received the request. Avoid repeated submissions.');
      if (err instanceof TypeError) throw new Error('Cannot reach AI Horde from this Home Screen app (network or CORS). Your turn is untouched.');
      throw err;
    } finally { clearTimeout(timer); }
  }
  async function cancelRemote(jobId) {
    if (!jobId) return;
    try { await request('/generate/text/status/' + encodeURIComponent(jobId), {method:'DELETE'}); }
    catch (err) { console.warn('AI Horde cancellation unconfirmed:', err.message); }
  }
  async function cancel() {
    if (!active) return;
    const job = active;
    active = null;
    inform('Stopping request. The current player action remains pending; the remote cancel may take a moment.');
    await cancelRemote(job.id);
    busy = false;
    inform('Cancelled locally. No DM response was saved.');
  }
  async function start(turnId, prompt) {
    if (busy || active) return;
    const consent = $('hordeConsent');
    if (!consent?.checked) { inform('Check the sandbox-only consent box before sending any text to volunteer-run machines.'); return; }
    if (!navigator.onLine) { inform('You appear offline. AI Horde needs an internet connection.'); return; }
    if (prompt.length > 10500) { inform('Sandbox brief is too long for this trial. Nothing was sent.'); return; }
    const key = $('hordeKey')?.value.trim() || ANON;
    const area = $('dmOutcome');
    if (area?.value.trim() && !confirm('There is an unsaved draft. Generate another draft? You will review before replacing it.')) return;
    if (!confirm('Send this fictional sandbox brief to volunteer AI Horde workers? Never include real campaign secrets, private details, or sealed records.')) return;
    busy = true; sync();
    let job = null;
    try {
      inform('Submitting sandbox request for Stheno 8B…');
      // Only public NPC facts and a short recent fictional sandbox history appear in prompt.
      // Never put real personal API keys or private records in the public repository.
      const created = await request('/generate/text/async', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'apikey':key, 'Client-Agent':'xael-local-vault:0.3:github-pages' },
        body:JSON.stringify({
          prompt, models:[MODEL],
          params:{max_length:180,max_context_length:4096,temperature:0.8,top_p:0.9,n:1},
          trusted_workers:false, slow_workers:true
        })
      });
      if (!created?.id) throw new Error('No request ID returned by AI Horde. No generation has been accepted as canon.');
      job = { id:created.id, turnId, cancelled:false };
      active = job;
      const started = Date.now(), maxMs = 240000;
      inform('Queued on AI Horde. Waiting for a volunteer worker…');
      while (active === job) {
        if (Date.now() - started > maxMs) throw new Error('Still waiting after 4 minutes. Use Cancel or try a different time.');
        await wait(3500);
        if (active !== job) return;
        const result = await request('/generate/text/status/' + encodeURIComponent(job.id));
        if (active !== job) return;
        if (result.faulted) throw new Error('Volunteer request faulted before finishing.');
        if (result.is_possible === false) throw new Error('Selected model is currently unavailable. Try again later.');
        if (result.done) {
          const draft = String(result.generations?.[0]?.text || '').trim();
          if (!draft) throw new Error('Request finished without narrative text.');
          if (draft.length > 30000) throw new Error('Draft exceeded the editor limit. Nothing was committed.');
          const panel = $('pendingPanel'); const editor = $('dmOutcome');
          if (!panel?.textContent?.includes(turnId) || !editor) throw new Error('The pending turn changed. Response was not applied.');
          if (editor.value.trim() && !confirm('Replace the old unsaved draft with the new AI Horde draft?')) { inform('Generated successfully; existing unsaved draft kept. Nothing committed.'); return; }
          editor.value = draft;
          inform('Draft returned by Stheno via AI Horde. Review the text and approve it separately to save.');
          return;
        }
        const q = Number.isFinite(result.queue_position) ? `Queue position ${result.queue_position}. ` : '';
        const waitTime = Number.isFinite(result.wait_time) ? `Estimated wait ${result.wait_time}s. ` : '';
        const working = result.processing ? 'Worker generating. ' : 'Queued. ';
        inform(`${working}${q}${waitTime}Your action remains pending.`);
      }
    } catch (err) {
      // A queued request is cleaned up when its status request fails or times out.
      // If the initial submission timed out before returning an ID, cleanup cannot be guaranteed.
      if (job && active === job) await cancelRemote(job.id);
      console.warn('AI Horde sandbox request failed:', err.message);
      inform('Horde request failed: ' + String(err.message || err).slice(0, 250) + ' The pending action remains safe.');
    } finally {
      if (active === job) active = null;
      busy = false;
      sync();
    }
  }
  // When a draft is being generated, closing the app may abandon the remote job.
  // Keeping that failure outside the journal guarantees it cannot corrupt saved turns.
  window.XaelHorde = { start, cancel, sync };
})();
