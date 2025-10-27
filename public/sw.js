// =============================================
// SERVICE WORKER PARA NOTIFICACIONES PUSH
// =============================================

const CACHE_NAME = 'danki-app-v1'
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
]

// Configuración de notificaciones push
const NOTIFICATION_TAG = 'danki-notification'

// Instalar service worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Service Worker: Cache abierto')
        return cache.addAll(urlsToCache)
      })
      .catch((error) => {
        console.error('Service Worker: Error al cachear archivos', error)
      })
  )
})

// Activar service worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Eliminando cache antiguo', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
})

// Interceptar requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Devolver desde cache si está disponible
        if (response) {
          return response
        }
        
        // Si no está en cache, hacer fetch
        return fetch(event.request)
          .then((response) => {
            // Verificar si es una respuesta válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Clonar la respuesta
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          })
      })
      .catch(() => {
        // Fallback para requests que fallan
        if (event.request.destination === 'document') {
          return caches.match('/')
        }
      })
  )
})

// =============================================
// NOTIFICACIONES PUSH
// =============================================

// Manejar suscripción a notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación push recibida', event)

  let notificationData = {
    title: 'Danki App',
    body: 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'danki-notification',
    data: {
      url: '/'
    }
  }

  // Si hay datos en el evento push
  if (event.data) {
    try {
      const pushData = event.data.json()
      notificationData = {
        ...notificationData,
        ...pushData
      }
    } catch (error) {
      console.error('Service Worker: Error al parsear datos push', error)
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    tag: notificationData.tag,
    data: notificationData.data,
    actions: [
      {
        action: 'view',
        title: 'Ver',
        icon: '/icons/view-icon.png'
      },
      {
        action: 'dismiss',
        title: 'Descartar',
        icon: '/icons/dismiss-icon.png'
      }
    ],
    requireInteraction: true,
    silent: false,
    vibrate: [200, 100, 200],
    timestamp: Date.now()
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  )
})

// Manejar clics en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Click en notificación', event)

  event.notification.close()

  if (event.action === 'dismiss') {
    // Solo cerrar la notificación
    return
  }

  // Determinar URL a abrir
  let urlToOpen = '/'
  
  if (event.notification.data && event.notification.data.url) {
    urlToOpen = event.notification.data.url
  }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Manejar cierre de notificaciones
self.addEventListener('notificationclose', (event) => {
  console.log('Service Worker: Notificación cerrada', event)
  
  // Opcional: Enviar analytics sobre notificaciones cerradas
  if (event.notification.data && event.notification.data.trackingId) {
    // Enviar evento de analytics
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        trackingId: event.notification.data.trackingId,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Service Worker: Error al enviar analytics', error)
    })
  }
})

// =============================================
// SINCRONIZACIÓN EN SEGUNDO PLANO
// =============================================

// Manejar sincronización en segundo plano
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Sincronización en segundo plano', event.tag)

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync())
  }
})

async function doBackgroundSync() {
  try {
    // Sincronizar datos pendientes
    console.log('Service Worker: Ejecutando sincronización en segundo plano')
    
    // Aquí puedes agregar lógica para sincronizar datos offline
    // Por ejemplo, enviar pedidos pendientes, actualizar ubicación, etc.
    
  } catch (error) {
    console.error('Service Worker: Error en sincronización en segundo plano', error)
  }
}

// =============================================
// MANEJO DE MENSAJES
// =============================================

// Manejar mensajes del cliente
self.addEventListener('message', (event) => {
  console.log('Service Worker: Mensaje recibido', event.data)

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }

  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// =============================================
// UTILIDADES
// =============================================

// Función para limpiar cache antiguo
async function cleanupOldCaches() {
  const cacheNames = await caches.keys()
  const currentCaches = cacheNames.filter(name => name.startsWith('danki-app-'))
  
  if (currentCaches.length > 3) {
    const oldCaches = currentCaches.slice(0, -3)
    await Promise.all(
      oldCaches.map(cacheName => caches.delete(cacheName))
    )
    console.log('Service Worker: Cache antiguo limpiado')
  }
}

// Función para verificar conectividad
async function checkConnectivity() {
  try {
    const response = await fetch('/api/health', { 
      method: 'HEAD',
      cache: 'no-cache'
    })
    return response.ok
  } catch (error) {
    return false
  }
}

// =============================================
// NOTIFICACIONES PUSH
// =============================================

// Manejar notificaciones push
self.addEventListener('push', (event) => {
  console.log('Service Worker: Notificación push recibida')
  
  let notificationData = {
    title: 'Danki App',
    body: 'Tienes una nueva notificación',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    tag: NOTIFICATION_TAG,
    requireInteraction: true,
    data: {}
  }

  if (event.data) {
    try {
      const pushData = event.data.json()
      notificationData = {
        ...notificationData,
        ...pushData,
        tag: NOTIFICATION_TAG
      }
    } catch (error) {
      console.error('Error al parsear datos de notificación:', error)
    }
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationData)
  )
})

// Manejar clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Click en notificación')
  
  event.notification.close()

  const notificationData = event.notification.data || {}
  const urlToOpen = notificationData.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Si ya hay una ventana abierta, enfocarla
        for (const client of clientList) {
          if (client.url.includes(urlToOpen) && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Si no hay ventana abierta, abrir una nueva
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Manejar acciones de notificación
self.addEventListener('notificationaction', (event) => {
  console.log('Service Worker: Acción de notificación:', event.action)
  
  const notificationData = event.notification.data || {}
  
  switch (event.action) {
    case 'view':
      // Abrir la aplicación en la URL específica
      event.waitUntil(
        clients.openWindow(notificationData.url || '/')
      )
      break
      
    case 'dismiss':
      // Solo cerrar la notificación
      event.notification.close()
      break
      
    default:
      console.log('Acción desconocida:', event.action)
  }
})

// =============================================
// CONFIGURACIÓN INICIAL
// =============================================

console.log('Service Worker: Iniciado correctamente')

// Configurar limpieza periódica
setInterval(cleanupOldCaches, 24 * 60 * 60 * 1000) // Cada 24 horas
