const CACHE='xael-vault-v0.3.1';
const FILES=['./','./index.html','./styles.css','./app.js','./local-ai.js','./horde-ai.js','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('xael-vault-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]));});
// Cache only Xael's same-origin shell. Model weights are cached separately by WebLLM.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;if(new URL(e.request.url).origin!==self.location.origin)return;
e.respondWith(caches.match(e.request).then(cached=>cached||fetch(e.request).then(response=>{if(response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));}return response;})));});
