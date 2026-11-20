// Network-first for the page (always fresh when online), cache as offline fallback.
const C = "sq-v9",
  F = [
    "./",
    "index.html",
    "manifest.webmanifest",
    "icon-192.png",
    "icon-512.png",
    "css/fonts.css",
    "css/styles.css",
    "js/icons.js",
    "js/sound.js",
    "js/app.js",
    "js/effects.js",
    "fonts/pricedown.otf",
    "fonts/barlow-400.woff2",
    "fonts/barlow-500.woff2",
    "fonts/barlow-condensed-700.woff2",
  ];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(C).then((c) => c.addAll(F)));
  self.skipWaiting();
});
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((k) =>
        Promise.all(k.filter((x) => x !== C).map((x) => caches.delete(x))),
      )
      .then(() => self.clients.claim()),
  ),
);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    fetch(e.request, { cache: "no-store" })
      .then((res) => {
        const u = new URL(e.request.url);
        if (
          res.ok &&
          (u.origin === location.origin ||
            /fonts.(googleapis|gstatic).com$/.test(u.hostname))
        ) {
          const cp = res.clone();
          caches.open(C).then((c) => c.put(e.request, cp));
        }
        return res;
      })
      .catch(() =>
        caches.match(e.request).then((r) => r || caches.match("index.html")),
      ),
  );
});
