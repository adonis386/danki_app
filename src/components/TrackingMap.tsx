'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Wrapper, Status } from '@googlemaps/react-wrapper'
import { MapPin, Navigation, Loader2 } from 'lucide-react'
import type { Coordenadas } from '@/types/tracking'

interface TrackingMapProps {
  ubicacionRepartidor?: Coordenadas | null
  ubicacionDestino?: Coordenadas | null
  distanciaKm?: number | null
  tiempoEstimadoMin?: number | null
}

// Componente interno del mapa
function MapComponent({
  ubicacionRepartidor,
  ubicacionDestino,
}: Omit<TrackingMapProps, 'distanciaKm' | 'tiempoEstimadoMin'>) {
  const mapRef = useRef<HTMLDivElement>(null)
  const googleMapRef = useRef<google.maps.Map | null>(null)
  const markerRepartidor = useRef<google.maps.Marker | null>(null)
  const markerDestino = useRef<google.maps.Marker | null>(null)
  const [mapReady, setMapReady] = useState(false)

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
        // Actualizar posición del marcador existente
        markerRepartidor.current.setPosition(position)
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

        // Agregar info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: 600; color: #f97316;">
                📍 Repartidor
              </h3>
              <p style="margin: 0; font-size: 12px; color: #666;">
                En camino a tu ubicación
              </p>
            </div>
          `,
        })

        markerRepartidor.current.addListener('click', () => {
          infoWindow.open(googleMapRef.current!, markerRepartidor.current!)
        })
      }

      // Centrar el mapa en el repartidor con animación
      googleMapRef.current.panTo(position)
    } catch (error) {
      console.error('Error al actualizar marcador del repartidor:', error)
    }
  }, [ubicacionRepartidor, mapReady])

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

  return (
    <div
      ref={mapRef}
      className="h-96 w-full"
      style={{ minHeight: '400px' }}
    />
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
}: TrackingMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''

  if (!apiKey) {
    return (
      <div className="overflow-hidden rounded-lg border border-red-200 bg-red-50 p-6">
        <div className="text-center">
          <p className="font-medium text-red-900">
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
      {/* Header con estadísticas */}
      {(distanciaKm !== undefined && distanciaKm !== null) ||
      (tiempoEstimadoMin !== undefined && tiempoEstimadoMin !== null) ? (
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
      ) : null}

      {/* Contenedor del mapa con Google Maps Wrapper */}
      <Wrapper apiKey={apiKey} render={Render} libraries={['marker']}>
        <MapComponent
          ubicacionRepartidor={ubicacionRepartidor}
          ubicacionDestino={ubicacionDestino}
        />
      </Wrapper>

      {/* Footer */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <p className="text-center text-xs text-gray-600">
          📍 {ubicacionRepartidor || ubicacionDestino
            ? 'Mapa en tiempo real'
            : 'Esperando ubicación del repartidor'}{' '}
          • Powered by Google Maps
        </p>
      </div>
    </div>
  )
}
