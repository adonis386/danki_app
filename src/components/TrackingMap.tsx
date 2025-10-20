'use client'

import { MapPin, Navigation } from 'lucide-react'
import type { Coordenadas } from '@/types/tracking'

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

      {/* Área del mapa (placeholder) */}
      <div className="relative aspect-video bg-gradient-to-br from-blue-50 to-blue-100">
        {/* Placeholder para mapa real */}
        <div className="flex h-full items-center justify-center">
          <div className="text-center">
            <MapPin size={48} className="mx-auto mb-2 text-orange-600" />
            <p className="text-sm font-medium text-gray-700">
              Mapa de seguimiento en tiempo real
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Integración con Google Maps/Mapbox próximamente
            </p>
          </div>
        </div>

        {/* Indicadores de ubicación */}
        {ubicacionRepartidor && (
          <div className="absolute left-1/4 top-1/4 flex flex-col items-center">
            <div className="relative">
              <div className="h-10 w-10 animate-pulse rounded-full bg-orange-500 opacity-75" />
              <Navigation
                size={24}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-white"
              />
            </div>
            <span className="mt-1 rounded bg-white px-2 py-1 text-xs font-medium text-gray-900 shadow">
              Repartidor
            </span>
          </div>
        )}

        {ubicacionDestino && (
          <div className="absolute bottom-1/4 right-1/4 flex flex-col items-center">
            <MapPin size={32} className="text-green-600" />
            <span className="mt-1 rounded bg-white px-2 py-1 text-xs font-medium text-gray-900 shadow">
              Tu ubicación
            </span>
          </div>
        )}
      </div>

      {/* Footer con instrucciones */}
      <div className="border-t border-gray-200 bg-gray-50 p-3">
        <p className="text-center text-xs text-gray-600">
          📍 El repartidor está en camino a tu ubicación
        </p>
      </div>
    </div>
  )
}


