const CACHE='arpimc-zone-info-v10';
const CORE=['/','/index.html','/style.css','/script.js','/fallback-data.js','/manifest.json','/icon.svg','/icons/icon.svg','/icons/icon-96.png','/icons/icon-192.png','/icons/icon-512.png','/skins.json','/addons.json','/games.json','/data.json'];
self.addEventListener('install',event=>event.waitUntil((async()=>{const cache=await caches.open(CACHE);await Promise.all(CORE.map(async path=>{try{const response=await fetch(path,{cache:'reload'});if(response.ok)await cache.put(path,response)}catch(error){console.warn('Precache dilewati:',path)}}));await self.skipWaiting()})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{for(const key of await caches.keys())if(key.startsWith('arpimc-zone-')&&key!==CACHE)await caches.delete(key);await self.clients.claim()})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;
 const url=new URL(event.request.url),isJson=/\.json$/i.test(url.pathname),isCode=/\.(?:js|html)$/i.test(url.pathname);
 if(isJson){event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const fresh=await fetch(event.request,{cache:'no-store'});if(fresh.ok)await cache.put(event.request,fresh.clone());return fresh}catch(error){const cached=await cache.match(event.request);if(cached)return cached;throw error}})());return}
 event.respondWith((async()=>{const cache=await caches.open(CACHE);try{const fresh=await fetch(event.request,{cache:isCode?'no-store':'default'});if(fresh.ok)await cache.put(event.request,fresh.clone());return fresh}catch(error){const cached=await cache.match(event.request);if(cached)return cached;throw error}})());
});
