// Service worker: permite instalar la app y abrirla sin conexión.
// Las páginas se piden primero a la red (para tener siempre la última versión);
// los archivos con huella (assets/) se sirven desde la caché.
const CACHE = 'oposicion-__BUILD__';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icons/icon-192.png'];

// Guarda la página, y los archivos que enlaza, para poder abrirla sin conexión.
// La compilación sustituye esta lista por todos los archivos generados (vite.config.ts).
const ASSETS = self.__ASSETS__ || [];

async function precache() {
  const c = await caches.open(CACHE);
  await c.addAll([...SHELL, ...ASSETS.map((a) => './' + a)]);
}

self.addEventListener('install', (e) => {
  e.waitUntil(precache().then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return; // Firebase y otros: directo a la red

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(CACHE).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html', { ignoreVary: true })),
    );
    return;
  }

  e.respondWith(
    caches.match(req, { ignoreVary: true }).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok && url.pathname.includes('/assets/')) {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
      }
      return res;
    })),
  );
});
