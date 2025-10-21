# 🗺️ INTEGRACIÓN DE MAPA REAL - DANKI

## 📋 Opciones de Mapas

Hay 3 opciones principales para integrar un mapa real:

| Opción | Ventajas | Desventajas | Costo |
|--------|----------|-------------|-------|
| **Mapbox** ⭐ | Mejor UI, económico, fácil | Requiere tarjeta | 50k requests gratis |
| **Google Maps** | Familiar, geocoding incluido | Más caro | 28k requests gratis |
| **Leaflet + OSM** | 100% gratis | UI básica, sin geocoding | Gratis ilimitado |

**Recomendación: Mapbox** (mejor balance precio/calidad)

---

## 🚀 OPCIÓN 1: MAPBOX (RECOMENDADA)

### **Paso 1: Obtener API Key** (5 minutos)

1. Ve a [https://www.mapbox.com/](https://www.mapbox.com/)
2. Crea una cuenta (gratis, no requiere tarjeta inicialmente)
3. Ve a [Account → Tokens](https://account.mapbox.com/)
4. Copia tu **Access Token** (empieza con `pk.`)

### **Paso 2: Configurar Variables de Entorno**

Agrega a tu `.env.local`:

```env
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1Ijoib... (tu token aquí)
```

### **Paso 3: Instalar Dependencias**

```bash
npm install mapbox-gl react-map-gl
npm install --save-dev @types/mapbox-gl
```

### **Paso 4: Reemplazar TrackingMap.tsx**

```typescript
// src/components/TrackingMap.tsx
'use client'

import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { MapPin, Navigation } from 'lucide-react'
import type { Coordenadas } from '@/types/tracking'

// Configurar token de Mapbox
if (typeof window !== 'undefined') {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''
}

interface TrackingMapProps {
  ubicacionRepartidor?: Coordenadas | null
  ubicacionDestino?: Coordenadas | null
  distanciaKm?: number | null
  tiempoEstimadoMin?: number | null
}

export function TrackingMap({
  ubicacionRepartidor,
  ubicacionDestino,
  distanciaKm,
  tiempoEstimadoMin,
}: TrackingMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const markerRepartidor = useRef<mapboxgl.Marker | null>(null)
  const markerDestino = useRef<mapboxgl.Marker | null>(null)

  // Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    // Coordenadas iniciales (Santo Domingo)
    const initialCoords: [number, number] = [-69.9312, 18.4861]

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/streets-v12', // Estilo del mapa
      center: initialCoords,
      zoom: 12,
    })

    // Agregar controles de navegación
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right')

    map.current.on('load', () => {
      setMapLoaded(true)
    })

    return () => {
      map.current?.remove()
    }
  }, [])

  // Actualizar marcador del repartidor
  useEffect(() => {
    if (!map.current || !mapLoaded || !ubicacionRepartidor) return

    if (markerRepartidor.current) {
      markerRepartidor.current.setLngLat([
        ubicacionRepartidor.lng,
        ubicacionRepartidor.lat,
      ])
    } else {
      // Crear elemento personalizado para el marcador
      const el = document.createElement('div')
      el.className = 'repartidor-marker'
      el.style.width = '40px'
      el.style.height = '40px'
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iI2Y5NzMxNiIvPjxwYXRoIGQ9Ik0yMCAxMkwyNCAxOEgxNkwyMCAxMloiIGZpbGw9IndoaXRlIi8+PC9zdmc+)'
      el.style.backgroundSize = 'cover'
      el.style.cursor = 'pointer'

      markerRepartidor.current = new mapboxgl.Marker(el)
        .setLngLat([ubicacionRepartidor.lng, ubicacionRepartidor.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            '<h3 style="margin:0; padding:4px 0;">📍 Repartidor</h3><p style="margin:0; font-size:12px;">En camino a tu ubicación</p>'
          )
        )
        .addTo(map.current)
    }

    // Centrar el mapa en el repartidor
    map.current.flyTo({
      center: [ubicacionRepartidor.lng, ubicacionRepartidor.lat],
      zoom: 14,
      essential: true,
    })
  }, [ubicacionRepartidor, mapLoaded])

  // Actualizar marcador del destino
  useEffect(() => {
    if (!map.current || !mapLoaded || !ubicacionDestino) return

    if (markerDestino.current) {
      markerDestino.current.setLngLat([
        ubicacionDestino.lng,
        ubicacionDestino.lat,
      ])
    } else {
      // Crear elemento personalizado para el marcador
      const el = document.createElement('div')
      el.className = 'destino-marker'
      el.style.width = '40px'
      el.style.height = '40px'
      el.style.backgroundImage = 'url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMjAgNUMxMy4zNzMgNSA4IDE0LjA3MyA4IDIwQzggMjYuNjI3IDE0LjM3MyAzNSAyMCAzNUMyNS42MjcgMzUgMzIgMjYuNjI3IDMyIDIwQzMyIDE0LjA3MyAyNi42MjcgNSAyMCA1WiIgZmlsbD0iIzEwYjk4MSIvPjxjaXJjbGUgY3g9IjIwIiBjeT0iMjAiIHI9IjYiIGZpbGw9IndoaXRlIi8+PC9zdmc+)'
      el.style.backgroundSize = 'cover'
      el.style.cursor = 'pointer'

      markerDestino.current = new mapboxgl.Marker(el)
        .setLngLat([ubicacionDestino.lng, ubicacionDestino.lat])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            '<h3 style="margin:0; padding:4px 0;">🏠 Tu ubicación</h3><p style="margin:0; font-size:12px;">Destino de entrega</p>'
          )
        )
        .addTo(map.current)
    }

    // Si hay ambos marcadores, ajustar el mapa para mostrar ambos
    if (ubicacionRepartidor && ubicacionDestino && map.current) {
      const bounds = new mapboxgl.LngLatBounds()
      bounds.extend([ubicacionRepartidor.lng, ubicacionRepartidor.lat])
      bounds.extend([ubicacionDestino.lng, ubicacionDestino.lat])

      map.current.fitBounds(bounds, {
        padding: 100,
        maxZoom: 15,
      })
    }
  }, [ubicacionDestino, ubicacionRepartidor, mapLoaded])

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header con estadísticas */}
      {(distanciaKm || tiempoEstimadoMin) && (
        <div className="flex items-center justify-around border-b border-gray-200 bg-gray-50 p-4">
          {distanciaKm !== undefined && distanciaKm !== null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {distanciaKm.toFixed(1)} km
              </p>
              <p className="text-sm text-gray-600">Distancia</p>
            </div>
          )}
          {tiempoEstimadoMin !== undefined && tiempoEstimadoMin !== null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {tiempoEstimadoMin} min
              </p>
              <p className="text-sm text-gray-600">Tiempo estimado</p>
            </div>
          )}
        </div>
      )}

      {/* Contenedor del mapa */}
      <div 
        ref={mapContainer} 
        className="h-96 w-full"
        style={{ minHeight: '400px' }}
      />

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <p className="text-center text-xs text-gray-600">
          📍 Mapa en tiempo real • Powered by Mapbox
        </p>
      </div>
    </div>
  )
}
```

### **Paso 5: Agregar Estilos CSS**

Agrega al final de `globals.css`:

```css
/* Estilos para marcadores de Mapbox */
.repartidor-marker {
  cursor: pointer;
  animation: bounce 1s infinite;
}

.destino-marker {
  cursor: pointer;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* Estilos para popups de Mapbox */
.mapboxgl-popup-content {
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

---

## 🚀 OPCIÓN 2: GOOGLE MAPS

### **Paso 1: Obtener API Key**

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto
3. Habilita "Maps JavaScript API"
4. Crea credenciales (API Key)
5. Restringe el key a tu dominio

### **Paso 2: Configurar Variables**

```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSy... (tu key aquí)
```

### **Paso 3: Instalar Dependencias**

```bash
npm install @googlemaps/react-wrapper
npm install --save-dev @types/google.maps
```

### **Paso 4: Componente de Google Maps**

```typescript
// src/components/TrackingMap.tsx (Google Maps version)
'use client'

import { useEffect, useRef } from 'react'
import { Wrapper } from '@googlemaps/react-wrapper'
import type { Coordenadas } from '@/types/tracking'

interface TrackingMapProps {
  ubicacionRepartidor?: Coordenadas | null
  ubicacionDestino?: Coordenadas | null
  distanciaKm?: number | null
  tiempoEstimadoMin?: number | null
}

function MapComponent({
  ubicacionRepartidor,
  ubicacionDestino,
}: Omit<TrackingMapProps, 'distanciaKm' | 'tiempoEstimadoMin'>) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRepartidor = useRef<google.maps.Marker | null>(null)
  const markerDestino = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    if (!mapRef.current || googleMapRef.current) return

    googleMapRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: 18.4861, lng: -69.9312 },
      zoom: 13,
    })
  }, [])

  useEffect(() => {
    if (!googleMapRef.current || !ubicacionRepartidor) return

    if (markerRepartidor.current) {
      markerRepartidor.current.setPosition(ubicacionRepartidor)
    } else {
      markerRepartidor.current = new google.maps.Marker({
        position: ubicacionRepartidor,
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#f97316',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Repartidor',
      })
    }
  }, [ubicacionRepartidor])

  useEffect(() => {
    if (!googleMapRef.current || !ubicacionDestino) return

    if (markerDestino.current) {
      markerDestino.current.setPosition(ubicacionDestino)
    } else {
      markerDestino.current = new google.maps.Marker({
        position: ubicacionDestino,
        map: googleMapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: '#10b981',
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
        title: 'Destino',
      })
    }

    // Ajustar bounds
    if (ubicacionRepartidor && googleMapRef.current) {
      const bounds = new google.maps.LatLngBounds()
      bounds.extend(ubicacionRepartidor)
      bounds.extend(ubicacionDestino)
      googleMapRef.current.fitBounds(bounds)
    }
  }, [ubicacionDestino, ubicacionRepartidor])

  return <div ref={mapRef} className="h-96 w-full" />
}

export function TrackingMap(props: TrackingMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header igual que Mapbox */}
      {(props.distanciaKm || props.tiempoEstimadoMin) && (
        <div className="flex items-center justify-around border-b border-gray-200 bg-gray-50 p-4">
          {props.distanciaKm !== undefined && props.distanciaKm !== null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {props.distanciaKm.toFixed(1)} km
              </p>
              <p className="text-sm text-gray-600">Distancia</p>
            </div>
          )}
          {props.tiempoEstimadoMin !== undefined && props.tiempoEstimadoMin !== null && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {props.tiempoEstimadoMin} min
              </p>
              <p className="text-sm text-gray-600">Tiempo estimado</p>
            </div>
          )}
        </div>
      )}

      <Wrapper apiKey={apiKey}>
        <MapComponent
          ubicacionRepartidor={props.ubicacionRepartidor}
          ubicacionDestino={props.ubicacionDestino}
        />
      </Wrapper>

      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <p className="text-center text-xs text-gray-600">
          📍 Mapa en tiempo real • Powered by Google Maps
        </p>
      </div>
    </div>
  )
}
```

---

## 📊 COMPARACIÓN DETALLADA

### **Costos:**

| Característica | Mapbox | Google Maps |
|----------------|--------|-------------|
| **Cargas de mapa** | 50,000/mes gratis | 28,000/mes gratis |
| **Después del free tier** | $0.25/1000 | $7/1000 |
| **Geocoding** | 100,000/mes gratis | 28,000/mes gratis |
| **Directions API** | 100,000/mes gratis | 28,000/mes gratis |

### **Facilidad de Uso:**

| Aspecto | Mapbox | Google Maps |
|---------|--------|-------------|
| Setup inicial | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Documentación | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Personalización | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| Performance | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## ✅ RECOMENDACIÓN FINAL

**Para Danki, recomiendo Mapbox por:**

1. ✅ **Más económico** a largo plazo
2. ✅ **Mejor UI** y personalización
3. ✅ **Fácil integración** con Next.js
4. ✅ **50k requests gratis** vs 28k de Google
5. ✅ **Mejor performance** en móviles

---

## 🚀 PRÓXIMOS PASOS

1. **Decide qué mapa usar** (Mapbox recomendado)
2. **Obtén tu API key**
3. **Agrega la key a `.env.local`**
4. **Instala las dependencias**
5. **Reemplaza `TrackingMap.tsx`**
6. **Prueba en local**
7. **Agrega la variable de entorno en Vercel**
8. **Deploy a producción**

**Tiempo estimado total: 30-45 minutos**

---

¿Quieres que te ayude con algún paso específico? 🗺️

