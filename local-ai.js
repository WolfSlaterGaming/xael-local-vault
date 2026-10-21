// Xael Local Vault v0.2.1 experimental local-inference patch.
// No data is submitted to an AI provider. Module/weights download from public hosts when loading.
// On-device browser inference is EXPERIMENTAL on iOS; all journal writes remain in app.js.
'use strict';
(() => {
  // 0.2.85 has a reported disposed-object generation regression on some GPUs.
  // Conservative pin to the documented working release; verify on this iPhone.
  const LIB = 'https://esm.run/@mlc-ai/web-llm@0.2.82';
  let engine = null;
  let busy = false;
  let loadedModel = '';
  let message = 'AI not loaded. Manual PocketPal bridge remains available.';
  let progress = 0;
  const $ = id => document.getElementById(id);
  const setMessage = (m, p) => { message = m; if(Number.isFinite(p))progress=Math.min(100,Math.max(0,p));sync(); };
  const sync = () => {
    if($('aiStatus'))$('aiStatus').textContent=message;
    if($('aiProgress'))$('aiProgress').value=progress;
    if($('aiGenerateBtn'))$('aiGenerateBtn').disabled=!engine||busy;
    const model=$('aiModel');
    if(model)model.disabled=busy||!!engine;
  };
  async function load() {
    if(busy||engine)return;
    const modelId=$('aiModel')?.value;
    if(!modelId)return;
    if(!('gpu' in navigator)) {setMessage('This web app has no WebGPU access. Your vault still works; use PocketPal for now.');return;}
    busy=true; sync();
    try {
      setMessage('Checking WebGPU support…',0);
      const adapter=await navigator.gpu.requestAdapter();
      if(!adapter)throw new Error('WebGPU is unavailable in this iOS app. No model was loaded.');
      if(!confirm('Download a new browser AI model to this iPhone? The first download uses internet and hundreds of MB. The model runs on-device afterward; it is NOT PocketPal’s Ministral file. Continue?')){setMessage('Model download canceled.');return;}
      if(!navigator.onLine)setMessage('Offline: cached library and weights are required. Otherwise reconnect to download.',0);
      setMessage('Loading browser AI library. This may require internet…',0);
      const webllm=await import(LIB);
      if(!webllm.prebuiltAppConfig?.model_list?.some(m=>m.model_id===modelId))throw new Error('Selected model ID is not in the installed WebLLM model registry.');
      setMessage('Downloading/loading model. Keep Xael open; your saved turns are safe.',0);
      engine=await webllm.CreateMLCEngine(modelId,{initProgressCallback:status=>{
        const pct=Number.isFinite(status?.progress)?Math.round(status.progress*100):undefined;
        const text=(status?.text||'Loading browser AI model…').slice(0,180);
        setMessage(text,pct);
      }});
      loadedModel=modelId;
      setMessage('READY — '+modelId+' (WebLLM 0.2.82). Generate a draft; review it before committing.',100);
    }catch(err){console.error('Local AI load failed:',err);engine=null;loadedModel='';setMessage('AI unavailable: '+String(err?.message||err).slice(0,240)+' Your saved turn is unchanged.',0);}
    finally{busy=false;sync();}
  }
  async function generate(turnId,brief){
    if(busy||!engine)return;
    if(!document.getElementById('dmOutcome'))return;
    busy=true;sync();const started=performance.now();
    try{
      setMessage('Generating a local draft. This may take a while…',100);
      const reply=await engine.chat.completions.create({
        messages:[{role:'system',content:'You are a concise fictional tabletop RPG narrator. Do not decide player actions. Keep NPCs knowledge separate. Answer with only new scene narration. Do not assume unrecorded history. Keep it to 80–120 words.'},{role:'user',content:brief.slice(0,9500)}],
        max_tokens:180,temperature:0.7,top_p:0.9
      });
      const draft=String(reply?.choices?.[0]?.message?.content||'').trim();
      if(!draft)throw new Error('The model returned no usable narration.');
      const panel=$('pendingPanel');
      if(!panel?.textContent?.includes(turnId))throw new Error('Pending turn changed while generating. Draft was not applied.');
      const area=$('dmOutcome');
      if(!area)throw new Error('Pending turn editor disappeared.');
      if(area.value.trim()&&!confirm('Replace your existing unsaved narration draft with this generated one?')){setMessage('Draft kept out of the editor. Your saved records are unchanged.');return;}
      area.value=draft;
      const sec=((performance.now()-started)/1000).toFixed(1);
      setMessage('Draft ready in '+sec+' seconds. REVIEW below and tap “Append response to journal” only if acceptable.',100);
    }catch(err){
      console.error('Local AI generation failed:',err);
      const detail=String(err?.message||err);
      // A disposed GPU/runtime object must never remain marked READY or reused.
      if(/already been disposed|module has been disposed|device lost|device removed|GPUDevice|out of memory/i.test(detail)) {
        engine=null;
        loadedModel='';
        setMessage('AI runtime became unavailable: '+detail.slice(0,100)+'. Close and reopen Xael before reloading. Your pending action is safe; do not erase your vault.',0);
      } else {
        setMessage('Generation failed: '+detail.slice(0,230)+'. Your pending player action is safe.',100);
      }
    }
    finally{busy=false;sync();}
  }
  async function unload(){
    if(busy)return;
    if(!engine){setMessage('No model currently loaded.');return;}
    busy=true;sync();
    const retiring=engine;
    // Clear the app reference before awaiting the GPU teardown. A failed teardown
    // should not leave a disposed engine exposed for the next generation request.
    engine=null;
    loadedModel='';
    try{setMessage('Releasing AI GPU memory…');await retiring.unload();setMessage('AI unloaded. Saved turns remain available. Cached model files may remain.',0);}
    catch(err){setMessage('AI teardown reported an error. Close and reopen Xael before loading again: '+String(err?.message||err).slice(0,120),0);}
    finally{busy=false;sync();}
  }
  window.XaelAI={load,generate,unload,sync};
})();
