// Xael v0.3.1 — Free AI Horde speed controls. No gameplay or database writes.
'use strict';
(() => {
  const API = 'https://aihorde.net/api/v2';
  const ANON = '0000000000';
  const MODELS = {
    stheno: 'koboldcpp/L3-8B-Stheno-v3.2',
    rocinante: 'koboldcpp/Rocinante-X-12B',
    skyfall: 'aphrodite/TheDrummer/Skyfall-31B-v4.2'
  };
  const $ = id => document.getElementById(id);
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  let active = null;
  let busy = false;
  let message = 'Check model availability first. AI Horde volunteer wait times vary.';
  function sync() {
    const status = $('hordeStatus'); if (status) status.textContent = message;
    const submit = $('hordeSubmit'); if (submit) submit.disabled = busy;
    const cancel = $('hordeCancel'); if (cancel) cancel.disabled = !active;
    for (const id of ['hordeKey', 'hordeModel', 'hordeFastOnly', 'hordeWaitLimit', 'hordeMaxTokens', 'hordeCheck']) {
      const el = $(id); if (el) el.disabled = busy;
    }
  }
  const inform = text => { message = text; sync(); };
  async function request(path, opts = {}) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(API + path, { ...opts, mode:'cors', cache:'no-store', signal:ctrl.signal });
      const raw = await res.text();
      let data; try { data = JSON.parse(raw); } catch { data = {message:raw.slice(0, 300)}; }
      if (!res.ok) throw new Error('AI Horde HTTP ' + res.status + ': ' + String(data.message || data.error || data.detail || 'Request failed').slice(0,180));
      return data;
    } catch (err) {
      if (err.name === 'AbortError') throw new Error('Network check timed out. Request state may be uncertain; do not rapidly resubmit.');
      if (err instanceof TypeError) throw new Error('Cannot reach AI Horde from the Home Screen app (network or CORS). No game record changed.');
      throw err;
    } finally { clearTimeout(timer); }
  }
  function selectedModel() { return MODELS[$('hordeModel')?.value] || MODELS.stheno; }
  function secs(ms) { return Math.floor(ms/1000); }
  async function checkAvailability() {
    if (busy) return;
    const model = selectedModel();
    inform('Checking volunteer availability (no story sent)…');
    try {
      const raw = await request('/status/models?type=text');
      const models = Array.isArray(raw) ? raw : (Array.isArray(raw.models) ? raw.models : []);
      const matches = [MODELS.stheno, MODELS.rocinante, MODELS.skyfall].map(name => {
        const s = models.find(x => x.name === name);
        if (!s || Number(s.count||0) <= 0) return `${name.split('/').pop()}: unavailable`;
        const eta = Number.isFinite(s.eta) ? `${Math.round(s.eta)}s estimated` : 'ETA unknown';
        const workers = `${s.count} worker${Number(s.count)===1?'':'s'}`;
        return `${name.split('/').pop()}: ${eta}, ${workers}`;
      });
      const chosen = models.find(x => x.name === model);
      const headline = !chosen || Number(chosen.count||0) <= 0
        ? 'Selected model currently has no volunteers. Pick another or try later.'
        : `Selected ${model.split('/').pop()}: approx. ${Number.isFinite(chosen.eta)?Math.round(chosen.eta)+'s':'unknown wait'}; ${chosen.count} worker(s).`;
      inform(headline + '\nOther choices: ' + matches.join(' | ') + '. Estimates change; these are not promises.');
    } catch(err) { inform('Availability check failed: '+ String(err.message||err).slice(0,200)); }
  }
  async function cancelRemote(id) {
    if (!id) return;
    try { await request('/generate/text/status/'+encodeURIComponent(id), {method:'DELETE'}); return true; }
    catch(err) { console.warn('AI Horde cancellation unconfirmed:',err.message); return false; }
  }
  async function cancel() {
    if (!active) return;
    const job = active;
    active = null;
    inform('Cancelling on the volunteer network. Your saved action is unchanged.');
    const ok = await cancelRemote(job.id);
    busy = false;
    inform(ok ? 'Cancelled. No DM response was saved.' : 'Stopped locally; remote cancellation unconfirmed. Do not immediately submit duplicates.');
  }
  async function start(turnId, prompt) {
    if (busy || active) return;
    if (!$('hordeConsent')?.checked) { inform('Confirm fictional sandbox data before sending text to volunteer workers.');return; }
    if (!navigator.onLine) { inform('AI Horde needs an internet connection.');return; }
    if (prompt.length > 10500) { inform('Brief is too long. Nothing sent.');return; }
    const key = $('hordeKey')?.value.trim() || ANON;
    const model = selectedModel();
    const fastOnly = !!$('hordeFastOnly')?.checked;
    const maxWait = Number($('hordeWaitLimit')?.value || 90) * 1000;
    const maxTokens = Number($('hordeMaxTokens')?.value || 160);
    const editor = $('dmOutcome');
    if (editor?.value.trim() && !confirm('Existing unsaved draft will need replacement after generation. Continue?')) return;
    if (!confirm(`Send this fictional sandbox brief to AI Horde volunteers using ${model.split('/').pop()}? Your game records stay on your phone.`)) return;
    busy = true; sync();
    let job = null;
    const startTime = Date.now();
    try {
      inform('Submitting to '+model.split('/').pop()+'…');
      const created = await request('/generate/text/async', {
        method:'POST',
        headers:{'Content-Type':'application/json','apikey':key,'Client-Agent':'xael-local-vault:0.3.1:github-pages'},
        body:JSON.stringify({
          prompt, models:[model],
          params:{max_length:maxTokens,max_context_length:3072,temperature:0.8,top_p:0.9,n:1},
          trusted_workers:false,
          slow_workers:!fastOnly
        })
      });
      if (!created?.id) throw new Error('The volunteer API did not return a job ID. Nothing saved.');
      job = {id:created.id,turnId,model};
      active = job;
      const queueStart = Date.now();
      let beganProcessing = null;
      inform(`Queued on AI Horde (${secs(Date.now()-startTime)}s elapsed). Fast workers only: ${fastOnly?'yes':'no'}.`);
      while (active === job) {
        if (Date.now()-queueStart >= maxWait) throw new Error(`Wait exceeded ${maxWait/1000}s limit. Request cancelled; nothing saved. Try another model or later.`);
        await wait(2500);
        if (active !== job) return;
        const result = await request('/generate/text/status/'+encodeURIComponent(job.id));
        if (active !== job) return;
        if (result.faulted) throw new Error('Volunteer job failed. Try later.');
        if (result.is_possible === false) throw new Error('No eligible worker accepts these settings. Try allowing slower workers or changing the model.');
        if (result.done) {
          const draft = String(result.generations?.[0]?.text||'').trim();
          if (!draft) throw new Error('The volunteer returned an empty draft.');
          if (draft.length > 30000) throw new Error('Draft too long. No result saved.');
          const panel = $('pendingPanel');const area=$('dmOutcome');
          if (!panel?.textContent?.includes(turnId) || !area) throw new Error('Pending turn changed. Draft discarded.');
          if (area.value.trim() && !confirm('Replace existing unsaved draft with this response?')) {
            inform('Generation finished; you kept your original draft. No journal change.');return;
          }
          area.value = draft;
          inform(`Draft ready in ${secs(Date.now()-startTime)}s via ${result.generations?.[0]?.model||model}. Read it and approve separately. Nothing automatically saved.`);
          return;
        }
        const elapsed = secs(Date.now()-startTime);
        const n = Number(result.processing || 0);
        if (n > 0 && beganProcessing == null) beganProcessing=Date.now();
        const phase = n > 0 ? 'Generating' : 'Queued';
        const queuePos = Number.isFinite(result.queue_position) ? ` · queue #${result.queue_position}` : '';
        const eta = Number.isFinite(result.wait_time) ? ` · estimated ${result.wait_time}s remaining` : '';
        const alert = result.might_stall ? ' · Queue may stall' : '';
        inform(`${phase}: ${elapsed}s elapsed${queuePos}${eta}${alert}. Limit ${maxWait/1000}s; saved action remains pending.`);
      }
    } catch(err) {
      if (job && active === job) {
        const cancelled = await cancelRemote(job.id);
        inform('Horde request stopped: '+String(err.message||err).slice(0,220)+(cancelled?'':' Remote cancellation not confirmed.')+' Pending action is safe.');
      } else {
        inform('Horde request failed: '+String(err.message||err).slice(0,220)+' Pending action is safe.');
      }
    } finally {
      if (active === job) active = null;
      busy = false;
      sync();
    }
  }
  window.XaelHorde = {start,cancel,checkAvailability,sync};
})();
