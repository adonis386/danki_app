'use client'

import { useState, useEffect, useRef } from 'react'
import { MapPin, Navigation, RefreshCw, Clock, Route, AlertCircle } from 'lucide-react'
import { trafficService } from '@/lib/services/trafficService'
import type { Coordenadas, ETACalculation } from '@/types/tracking'

interface TrackingMapProps {
  pedidoId: string
  ubicacionRepartidor?: Coordenadas
  ubicacionDestino?: Coordenadas
  distancia?: number
  tiempoEstimado?: number
  onLocationUpdate?: (coordenadas: Coordenadas) => void
  className?: string
}

export default function TrackingMap({
  pedidoId,
  ubicacionRepartidor,
  ubicacionDestino,
  distancia,
  tiempoEstimado,
  onLocationUpdate,
  className = ''
}: TrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [directionsService, setDirectionsService] = useState<google.maps.DirectionsService | null>(null)
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null)
  const [route, setRoute] = useState<google.maps.DirectionsResult | null>(null)
  const [eta, setEta] = useState<ETACalculation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  // Inicializar mapa
  useEffect(() => {
    if (!mapRef.current || !window.google) return

    const mapInstance = new google.maps.Map(mapRef.current, {
      zoom: 15,
      center: ubicacionRepartidor || { lat: 19.4326, lng: -99.1332 }, // Ciudad de México por defecto
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    })

    const directionsServiceInstance = new google.maps.DirectionsService()
    const directionsRendererInstance = new google.maps.DirectionsRenderer({
      draggable: false,
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: '#f97316',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    })

    directionsRendererInstance.setMap(mapInstance)

    setMap(mapInstance)
    setDirectionsService(directionsServiceInstance)
    setDirectionsRenderer(directionsRendererInstance)
    setLoading(false)
  }, [])

  // Calcular ruta cuando cambien las ubicaciones
  useEffect(() => {
    if (!directionsService || !directionsRenderer || !ubicacionRepartidor || !ubicacionDestino) return

    calculateRoute()
  }, [directionsService, directionsRenderer, ubicacionRepartidor, ubicacionDestino])

  // Actualizar ETA periódicamente
  useEffect(() => {
    if (!isTracking || !ubicacionRepartidor || !ubicacionDestino) return

    const interval = setInterval(async () => {
      await updateETA()
    }, 30000) // Cada 30 segundos

    return () => clearInterval(interval)
  }, [isTracking, ubicacionRepartidor, ubicacionDestino])

  const calculateRoute = async () => {
    if (!directionsService || !directionsRenderer || !ubicacionRepartidor || !ubicacionDestino) return

    try {
      setError(null)
      
      const request: google.maps.DirectionsRequest = {
        origin: ubicacionRepartidor,
        destination: ubicacionDestino,
        travelMode: google.maps.TravelMode.DRIVING,
        avoidHighways: false,
        avoidTolls: false,
        optimizeWaypoints: false,
        provideRouteAlternatives: false,
        drivingOptions: {
          departureTime: new Date(),
          trafficModel: google.maps.TrafficModel.BEST_GUESS
        }
      }

      const result = await directionsService.route(request)
      
      if (result.routes && result.routes.length > 0) {
        directionsRenderer.setDirections(result)
        setRoute(result)
        
        // Calcular ETA inicial
        await updateETA()
        
        // Ajustar vista del mapa para mostrar toda la ruta
        const bounds = new google.maps.LatLngBounds()
        result.routes[0].overview_path.forEach(point => {
          bounds.extend(point)
        })
        map?.fitBounds(bounds)
      }
    } catch (error) {
      console.error('Error al calcular ruta:', error)
      setError('No se pudo calcular la ruta')
    }
  }

  const updateETA = async () => {
    if (!ubicacionRepartidor || !ubicacionDestino) return

    try {
      const etaData = await trafficService.calculateETA(
        ubicacionRepartidor,
        ubicacionDestino,
        'auto'
      )
      
      // Convertir el resultado a ETACalculation
      const etaCalculation: ETACalculation = {
        tiempo_estimado_minutos: etaData.totalTime || etaData.baseTime || 0,
        distancia_km: 0, // Se calculará por separado
        tiempo_trafico_minutos: etaData.trafficDelay || 0,
        ruta_optimizada: etaData.confidence === 'high',
        ultima_actualizacion: etaData.lastUpdated?.toISOString() || new Date().toISOString()
      }
      
      setEta(etaCalculation)
      setLastUpdate(new Date())
      
      // Notificar actualización de ubicación si hay callback
      if (onLocationUpdate) {
        onLocationUpdate(ubicacionRepartidor)
      }
    } catch (error) {
      console.error('Error al actualizar ETA:', error)
    }
  }

  const toggleTracking = () => {
    setIsTracking(!isTracking)
  }

  const refreshRoute = async () => {
    setLoading(true)
    await calculateRoute()
    setLoading(false)
  }

  const formatTime = (minutes: number): string => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`
    }
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m`
  }

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)} m`
    }
    return `${(meters / 1000).toFixed(1)} km`
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      {/* Header del mapa */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 rounded-lg">
              <MapPin size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Seguimiento en Tiempo Real
              </h3>
              <p className="text-sm text-gray-600">
                Pedido #{pedidoId.slice(-8)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTracking}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isTracking 
                  ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              <Navigation size={16} />
              {isTracking ? 'Detener' : 'Iniciar'} Tracking
            </button>
            
            <button
              onClick={refreshRoute}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* Información de la ruta */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Route size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Distancia</p>
              <p className="text-lg font-semibold text-gray-900">
                {eta?.distancia_km ? `${eta.distancia_km.toFixed(1)} km` : distancia ? `${distancia.toFixed(1)} km` : 'Calculando...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Clock size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Tiempo Estimado</p>
              <p className="text-lg font-semibold text-gray-900">
                {eta?.tiempo_estimado_minutos ? `${eta.tiempo_estimado_minutos} min` : tiempoEstimado ? `${tiempoEstimado} min` : 'Calculando...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <RefreshCw size={20} className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Última Actualización</p>
              <p className="text-lg font-semibold text-gray-900">
                {lastUpdate ? lastUpdate.toLocaleTimeString('es-ES') : 'Nunca'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Mapa */}
      <div className="relative">
        <div 
          ref={mapRef} 
          className="w-full h-96 rounded-b-lg"
          style={{ minHeight: '400px' }}
        />
        
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-b-lg">
            <div className="text-center">
              <RefreshCw size={32} className="animate-spin text-orange-600 mx-auto mb-2" />
              <p className="text-gray-600">Calculando ruta...</p>
            </div>
          </div>
        )}
        
        {error && (
          <div className="absolute top-4 left-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} />
              <span className="font-medium">Error:</span>
              <span>{error}</span>
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      {eta && (
        <div className="p-4 bg-gray-50 rounded-b-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Información de Tráfico</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Estado del tráfico: <span className="font-medium">{eta.tiempo_trafico_minutos ? 'Con tráfico' : 'Sin tráfico'}</span></p>
                <p>Ruta optimizada: <span className="font-medium">{eta.ruta_optimizada ? 'Sí' : 'No'}</span></p>
                <p>Última actualización: <span className="font-medium">{new Date(eta.ultima_actualizacion).toLocaleTimeString()}</span></p>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Detalles de la Ruta</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>Modo de transporte: <span className="font-medium">Automóvil</span></p>
                <p>Evitar autopistas: <span className="font-medium">No</span></p>
                <p>Evitar peajes: <span className="font-medium">No</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
