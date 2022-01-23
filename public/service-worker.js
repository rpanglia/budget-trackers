const CACHE_NAME = 'budget-tracker-v1';
const DATA_CACHE_NAME = 'budget-cache-v1';

const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/js/index.js',
  '/css/styles.css',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png'
];


//Install service worker
// self.addEventListener('install', function(evt) {
//     evt.waitUntil(
//         caches
//         .open(CACHE_NAME)
//         .then((cache) => cache.addAll(FILES_TO_CACHE))
//         .then(self.skipWaiting())
//     );
// });
self.addEventListener('install', function(evt) {
  evt.waitUntil(
      caches.open(CACHE_NAME).then(cache => {
          console.log('Your files were pre-cached successfully!');
          return cache.addAll(FILES_TO_CACHE);
      })
  );
  self.skipWaiting();
});


//Activate service worker and remove old data from cache
// self.addEventListener('activate', function(evt) {
//     evt.waitUntil(
//         caches
//         .keys()
//         .then(keyList => {
//           return Promise.all(
//             keyList.map(key => {
//               if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
//                 console.log("Removing old cache data", key);
//                 return caches.delete(key);
//               }
//             })
//           );
//         })
//     );
//     self.clients.claim();
// });

// self.addEventListener('activate', function(evt) {
//   evt.waitUntil(
//     caches.keys().then(function(keyList) {
//       let cacheKeeplist = keyList.filter(function(key) {
//         return key.indexOf(APP_PREFIX);
//       });
//       cacheKeeplist.push(CACHE_NAME);

//       return Promise.all(
//         keyList.map(function(key, i) {
//           if (cacheKeeplist.indexOf(key) === -1) {
//             console.log('deleting cache : ' + keyList[i]);
//             return caches.delete(keyList[i]);
//           }
//         })
//       );
//     })
//   );
// });

self.addEventListener('activate', function(event) {

  var cacheAllowlist = ['budget-tracker-v1', 'budget-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});


//Fetch request interception
self.addEventListener('fetch', function(evt) {
    if (evt.request.url.includes('/api/')) {
      evt.respondWith(
        caches
        .open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(evt.request)
            .then(response => {
              // If the response was good, clone it and store it in the cache
            if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
            }
  
            return response;
            })
            .catch(err => {
              // Network request failed, try to get it from the cache
              return cache.match(evt.request);
            });
        })
        .catch(err => console.log(err))
        );
  
    return;
    }
  
    evt.respondWith(
      caches
      .open(CACHE_NAME)
      .then(cache => {
        return cache.match(evt.request).then(response => {
          return response || fetch(evt.request);
        });
      })
    );

    // evt.respondWith(
    //   fetch(evt.request).catch(function() {
    //     return caches.match(evt.request).then(function(response) {
    //       if (response) {
    //         return response;
    //       } else if (evt.request.headers.get('accept').includes('text/html')) {
    //         return caches.match('/');
    //       }
    //     });
    //   })
    // );
}); 


