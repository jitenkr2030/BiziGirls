const CACHE_NAME = "girlspreneur-v1";
const urlsToCache = [
  "/",
  "/dashboard",
  "/courses",
  "/mentorship",
  "/networking",
  "/funding",
  "/analytics",
  "/profile",
  "/static/js/bundle.js",
  "/static/css/main.css",
  "/logo.svg",
  "/manifest.json"
];

// Install event - cache assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve cached content when offline
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== "basic") {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-forms") {
    event.waitUntil(syncForms());
  }
});

// Push notification event
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: "/logo.svg",
      badge: "/badge-icon.png",
      data: {
        url: data.url || "/"
      },
      actions: [
        {
          action: "open",
          title: "Open App"
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  
  if (event.action === "open") {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Sync forms when online
async function syncForms() {
  try {
    const offlineForms = await getOfflineForms();
    
    for (const form of offlineForms) {
      try {
        await fetch(form.url, {
          method: form.method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form.data)
        });
        
        await removeOfflineForm(form.id);
      } catch (error) {
        console.error("Failed to sync form:", error);
      }
    }
  } catch (error) {
    console.error("Failed to sync forms:", error);
  }
}

// Helper functions for offline storage
async function getOfflineForms() {
  return new Promise((resolve) => {
    const request = indexedDB.open("GirlsPreneurDB", 1);
    
    request.onerror = () => resolve([]);
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["offlineForms"], "readonly");
      const store = transaction.objectStore("offlineForms");
      const getAll = store.getAll();
      
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = () => resolve([]);
    };
  });
}

async function removeOfflineForm(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open("GirlsPreneurDB", 1);
    
    request.onerror = () => resolve();
    
    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(["offlineForms"], "readwrite");
      const store = transaction.objectStore("offlineForms");
      const deleteRequest = store.delete(id);
      
      deleteRequest.onsuccess = () => resolve();
      deleteRequest.onerror = () => resolve();
    };
  });
}