const CACHE = 'pasta-v1';

const ASSETS = [
  'assets/Logo.png',
  'assets/chef.png',
  'assets/chat.png',
  'assets/time_box.png',
  'assets/path.png',
  'assets/fork_fill_0.png',
  'assets/fork_fill_1.png',
  'assets/fork_fill_2.png',
  'assets/fork_fill_3.png',
  'assets/fork_fill_4.png',
  'assets/fork_fill_5.png',
  'assets/fork_fill_6.png',
  'assets/arrow_direction.png',
  'assets/Leaderboard.png',
  'assets/bg.png',
  'assets/13.png',
  'assets/hand.png',
  'assets/Smiling face.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.destination === 'image' || request.url.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)(\?.*)?$/)) {
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
    return;
  }
});
