'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { MapPin, Navigation, Loader2, RefreshCw, AlertCircle } from 'lucide-react'
import { trafficService } from '@/lib/services/trafficService'
import { useETA } from '@/lib/services/trafficService'
import type { Coordenadas } from '@/types/tracking'

interface TrackingMapProps {
  ubicacionRepartidor?: Coordenadas | null
  ubicacionDestino?: Coordenadas | null
  distanciaKm?: number | null
  tiempoEstimadoMin?: number | null
  pedidoId?: string
  autoUpdate?: boolean
  updateInterval?: number
}

interface RouteInfo {
  distance: number
  duration: number
  trafficLevel: 'low' | 'medium' | 'high'
  route: {
    summary: string
    warnings: string[]
    waypoints: Coordenadas[]
  }
}

// Componente interno del mapa
function MapComponent({
  ubicacionRepartidor,
  ubicacionDestino,
  pedidoId,
  autoUpdate = true,
  updateInterval = 30000,
}: Omit<TrackingMapProps, 'distanciaKm' | 'tiempoEstimadoMin'>) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRepartidor = useRef<google.maps.Marker | null>(null)
  const markerDestino = useRef<google.maps.Marker | null>(null)
  const polylineRef = useRef<google.maps.Polyline | null>(null)
  const [mapReady, setMapReady] = useState(false)
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  // Hook para ETA en tiempo real
  const { eta, loading: etaLoading, recalculate: recalculateETA } = useETA(
    ubicacionRepartidor || null,
    ubicacionDestino || null,
    'auto',
    updateInterval
  )

  // Función para obtener ruta entre dos puntos
  const getRoute = useCallback(async (origin: Coordenadas, destination: Coordenadas) => {
    if (!googleMapRef.current) return

    try {
      setIsUpdating(true)
      const trafficData = await trafficService.getGoogleMapsETA(origin, destination, 'driving')
      
      if (trafficData) {
        setRouteInfo(trafficData)
        setLastUpdate(new Date())
        
        // Dibujar ruta en el mapa
        drawRoute(trafficData.route.waypoints)
        
        // Actualizar ETA en base de datos si hay pedidoId
        if (pedidoId && eta) {
          await trafficService.updatePedidoETA(pedidoId, eta)
        }
      }
    } catch (error) {
      console.error('Error al obtener ruta:', error)
    } finally {
      setIsUpdating(false)
    }
  }, [pedidoId, eta])

  // Función para dibujar ruta en el mapa
  const drawRoute = useCallback((waypoints: Coordenadas[]) => {
    if (!googleMapRef.current || waypoints.length < 2) return

    // Limpiar ruta anterior
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
    }

    // Crear nueva ruta
    const path = waypoints.map(point => ({
      lat: point.lat,
      lng: point.lng,
    }))

    polylineRef.current = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#f97316',
      strokeOpacity: 0.8,
      strokeWeight: 4,
      map: googleMapRef.current,
    })
  }, [])

  // Inicializar el mapa
  useEffect(() => {
    if (!mapRef.current || googleMapRef.current) return

    try {
      // Crear el mapa centrado en Santo Domingo, RD
      googleMapRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: 18.4861, lng: -69.9312 },
        zoom: 13,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }],
          },
        ],
      })

      setMapReady(true)
    } catch (error) {
      console.error('Error al inicializar el mapa:', error)
    }
  }, [])

  // Actualizar marcador del repartidor
  useEffect(() => {
    if (!googleMapRef.current || !mapReady || !ubicacionRepartidor) return

    try {
      const position = {
        lat: ubicacionRepartidor.lat,
        lng: ubicacionRepartidor.lng,
      }

      if (markerRepartidor.current) {
        // Actualizar posición del marcador existente con animación
        markerRepartidor.current.setPosition(position)
        
        // Agregar animación de movimiento
        markerRepartidor.current.setAnimation(google.maps.Animation.BOUNCE)
        setTimeout(() => {
          if (markerRepartidor.current) {
            markerRepartidor.current.setAnimation(null)
          }
        }, 2000)
      } else {
        // Crear nuevo marcador para el repartidor
        markerRepartidor.current = new google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: 'Repartidor',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#f97316',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
          animation: google.maps.Animation.BOUNCE,
        })

        // Agregar info window con información en tiempo real
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #f97316;">
                🚚 Repartidor
              </h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                En camino a tu ubicación
              </p>
              ${eta ? `
                <p style="margin: 4px 0 0 0; font-size: 11px; color: #f97316; font-weight: 600;">
                  ⏱️ ETA: ${eta.totalTime} min
                </p>
              ` : ''}
            </div>
          `,
        })

        markerRepartidor.current.addListener('click', () => {
          infoWindow.open(googleMapRef.current!, markerRepartidor.current!)
        })
      }

      // Centrar el mapa en el repartidor con animación suave
      googleMapRef.current.panTo(position)
      
      // Obtener ruta si hay destino
      if (ubicacionDestino && autoUpdate) {
        getRoute(ubicacionRepartidor, ubicacionDestino)
      }
    } catch (error) {
      console.error('Error al actualizar marcador del repartidor:', error)
    }
  }, [ubicacionRepartidor, mapReady, ubicacionDestino, autoUpdate, getRoute, eta])

  // Actualizar marcador del destino
  useEffect(() => {
    if (!googleMapRef.current || !mapReady || !ubicacionDestino) return

    try {
      const position = {
        lat: ubicacionDestino.lat,
        lng: ubicacionDestino.lng,
      }

      if (markerDestino.current) {
        // Actualizar posición del marcador existente
        markerDestino.current.setPosition(position)
      } else {
        // Crear nuevo marcador para el destino
        markerDestino.current = new google.maps.Marker({
          position,
          map: googleMapRef.current,
          title: 'Tu ubicación',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#10b981',
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 3,
          },
        })

        // Agregar info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #10b981;">
                🏠 Tu ubicación
              </h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                Destino de entrega
              </p>
            </div>
          `,
        })

        markerDestino.current.addListener('click', () => {
          infoWindow.open(googleMapRef.current!, markerDestino.current!)
        })
      }

      // Si hay ambos marcadores, ajustar el mapa para mostrar ambos
      if (ubicacionRepartidor && googleMapRef.current) {
        const bounds = new google.maps.LatLngBounds()
        bounds.extend({ lat: ubicacionRepartidor.lat, lng: ubicacionRepartidor.lng })
        bounds.extend(position)
        googleMapRef.current.fitBounds(bounds, 100)
      }
    } catch (error) {
      console.error('Error al actualizar marcador del destino:', error)
    }
  }, [ubicacionDestino, ubicacionRepartidor, mapReady])

  // Actualización automática de ruta
  useEffect(() => {
    if (!autoUpdate || !ubicacionRepartidor || !ubicacionDestino) return

    const interval = setInterval(() => {
      getRoute(ubicacionRepartidor, ubicacionDestino)
    }, updateInterval)

    return () => clearInterval(interval)
  }, [autoUpdate, ubicacionRepartidor, ubicacionDestino, updateInterval, getRoute])

  // Función para actualizar manualmente
  const handleManualUpdate = () => {
    if (ubicacionRepartidor && ubicacionDestino) {
      getRoute(ubicacionRepartidor, ubicacionDestino)
    }
  }

  return (
    <div className="relative">
      <div
        ref={mapRef}
        className="h-96 w-full"
        style={{ minHeight: '400px' }}
      />
      
      {/* Botón de actualización manual */}
      {ubicacionRepartidor && ubicacionDestino && (
        <button
          onClick={handleManualUpdate}
          disabled={isUpdating}
          className="absolute top-4 right-4 rounded-full bg-white p-2 shadow-lg hover:bg-gray-50 disabled:opacity-50"
          title="Actualizar ruta"
        >
          <RefreshCw 
            size={20} 
            className={`text-orange-600 ${isUpdating ? 'animate-spin' : ''}`} 
          />
        </button>
      )}

      {/* Indicador de estado */}
      {lastUpdate && (
        <div className="absolute bottom-4 left-4 rounded-lg bg-white px-3 py-2 shadow-lg">
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <div className={`h-2 w-2 rounded-full ${
              isUpdating ? 'bg-yellow-500 animate-pulse' : 'bg-green-500'
            }`} />
            <span>
              {isUpdating ? 'Actualizando...' : `Actualizado ${lastUpdate.toLocaleTimeString()}`}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente de render condicional según el estado de carga
function Render(status: Status): React.ReactElement {
  if (status === Status.LOADING) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-600" />
          <p className="mt-2 text-sm text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    )
  }

  if (status === Status.FAILURE) {
    return (
      <div className="flex h-96 items-center justify-center bg-gray-50">
        <div className="text-center">
          <MapPin className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-2 text-sm text-gray-600">
            Error al cargar el mapa
          </p>
          <p className="mt-1 text-xs text-gray-500">
            Verifica tu conexión a internet
          </p>
        </div>
      </div>
    )
  }

  return <div className="h-96" />
}

// Componente principal exportado
export function TrackingMap({
  ubicacionRepartidor,
  ubicacionDestino,
  distanciaKm,
  tiempoEstimadoMin,
  pedidoId,
  autoUpdate = true,
  updateInterval = 30000,
}: TrackingMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  if (!apiKey) {
    return (
      <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
          <p className="mt-2 font-medium text-red-900">
            ⚠️ API Key de Google Maps no configurada
          </p>
          <p className="mt-2 text-sm text-red-700">
            Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a tu archivo .env.local
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* Header con estadísticas mejoradas */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-6">
          {(distanciaKm !== undefined && distanciaKm !== null) && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {distanciaKm.toFixed(1)} km
              </p>
              <p className="text-sm text-gray-600">Distancia</p>
            </div>
          )}
          {(tiempoEstimadoMin !== undefined && tiempoEstimadoMin !== null) && (
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">
                {tiempoEstimadoMin} min
              </p>
              <p className="text-sm text-gray-600">Tiempo estimado</p>
            </div>
          )}
        </div>

        {/* Indicador de estado del mapa */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          <span>Mapa en tiempo real</span>
        </div>
      </div>

      {/* Contenedor del mapa con Google Maps Wrapper */}
      <Wrapper apiKey={apiKey} render={Render} libraries={['marker']}>
        <MapComponent
          ubicacionRepartidor={ubicacionRepartidor}
          ubicacionDestino={ubicacionDestino}
          pedidoId={pedidoId}
          autoUpdate={autoUpdate}
          updateInterval={updateInterval}
        />
      </Wrapper>

      {/* Footer mejorado */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <p>
            📍 {ubicacionRepartidor || ubicacionDestino
              ? 'Mapa en tiempo real'
              : 'Esperando ubicación del repartidor'}
          </p>
          <p>Powered by Google Maps</p>
        </div>
      </div>
    </div>
  )
}
