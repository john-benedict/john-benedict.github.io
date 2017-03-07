self.addEventListener('install', function(event) {
	event.waitUntil(
		caches.open('concord-offline').then(function(cache) {
			return cache.addAll([
				'/css/bootstrap.min.css',
				'/css/concord.css',
				'/img/concord_logo.jpg',
				'/js/jquery-3.1.1.min.js',
				'/js/bootstrap.min.js',
				'/js/concord.js',
				'/index.html',
				'/'
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request)
		.then(function(response) {
			// Cache hit - return the response from the cached version
			if (response) {
				return response;
			}			
			// Not in cache - return the result from the live server
			// `fetch` is essentially a "fallback"
			return fetch(event.request);
			}
		)
	);
});

self.addEventListener('activate', function(event) {
	// Calling claim() to force a "controllerchange" event on navigator.serviceWorker
	event.waitUntil(self.clients.claim());
});