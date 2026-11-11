import { createHash } from 'node:crypto';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const dir = 'dist';
const files = (await readdir(dir, { recursive:true, withFileTypes:true }))
  .filter(file=>file.isFile() && file.name!=='sw.js')
  .map(file=>join(file.parentPath,file.name).slice(dir.length+1).replaceAll('\\','/'))
  .sort();
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(join(dir,file)));

const worker = `
const namespace = 'alphabridge:' + self.registration.scope;
const cacheName = namespace + ':${hash.digest('hex').slice(0,16)}';
const assets = ${JSON.stringify(files.map(file=>'./'+file))};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(assets)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(key => key.startsWith(namespace + ':') && key !== cacheName).map(key => caches.delete(key))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.registration.scope) || request.headers.has('range')) return;
  event.respondWith(caches.open(cacheName).then(async cache => {
    if (request.mode === 'navigate') {
      try { return await fetch(request); }
      catch { return (await cache.match(request)) ?? cache.match('./index.html'); }
    }
    return (await cache.match(request)) ?? fetch(request);
  }));
});
`;
await writeFile(join(dir,'sw.js'),worker);
