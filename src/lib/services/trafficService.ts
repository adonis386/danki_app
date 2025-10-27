// =============================================
// SERVICIO DE TRÁFICO EN TIEMPO REAL
// =============================================

import { createClient } from '@/lib/supabase/client'
import type { Coordenadas } from '@/types/tracking'

const supabase = createClient()

interface TrafficData {
  duration: number // Duración en segundos
  distance: number // Distancia en metros
  trafficLevel: 'low' | 'medium' | 'high'
  route: {
    summary: string
    warnings: string[]
    waypoints: Coordenadas[]
  }
}

interface ETACalculation {
  baseTime: number // Tiempo base sin tráfico (minutos)
  trafficDelay: number // Retraso por tráfico (minutos)
  totalTime: number // Tiempo total estimado (minutos)
  confidence: 'high' | 'medium' | 'low' // Confianza en la estimación
  lastUpdated: Date
}

class TrafficService {
  private googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  private mapboxApiKey = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || ''

  // =============================================
  // GOOGLE MAPS DIRECTIONS API
  // =============================================

  async getGoogleMapsETA(
    origin: Coordenadas,
    destination: Coordenadas,
    mode: 'driving' | 'walking' | 'bicycling' | 'transit' = 'driving'
  ): Promise<TrafficData | null> {
    if (!this.googleMapsApiKey) {
      console.warn('Google Maps API key no configurada')
      return null
    }

    try {
      const originStr = `${origin.lat},${origin.lng}`
      const destinationStr = `${destination.lat},${destination.lng}`
      
      const url = new URL('https://maps.googleapis.com/maps/api/directions/json')
      url.searchParams.set('origin', originStr)
      url.searchParams.set('destination', destinationStr)
      url.searchParams.set('mode', mode)
      url.searchParams.set('traffic_model', 'best_guess')
      url.searchParams.set('departure_time', 'now')
      url.searchParams.set('key', this.googleMapsApiKey)

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.status !== 'OK') {
        throw new Error(`Google Maps API error: ${data.status}`)
      }

      const route = data.routes[0]
      const leg = route.legs[0]
      
      // Calcular nivel de tráfico basado en la duración
      const baseDuration = leg.duration.value // Sin tráfico
      const trafficDuration = leg.duration_in_traffic?.value || baseDuration
      const trafficDelay = trafficDuration - baseDuration
      
      let trafficLevel: 'low' | 'medium' | 'high' = 'low'
      if (trafficDelay > 300) { // Más de 5 minutos de retraso
        trafficLevel = 'high'
      } else if (trafficDelay > 120) { // Más de 2 minutos de retraso
        trafficLevel = 'medium'
      }

      return {
        duration: trafficDuration,
        distance: leg.distance.value,
        trafficLevel,
        route: {
          summary: route.summary,
          warnings: route.warnings || [],
          waypoints: leg.steps.map((step: any) => ({
            lat: step.start_location.lat,
            lng: step.start_location.lng,
          })),
        },
      }
    } catch (error) {
      console.error('Error al obtener ETA de Google Maps:', error)
      return null
    }
  }

  // =============================================
  // MAPBOX DIRECTIONS API (ALTERNATIVA)
  // =============================================

  async getMapboxETA(
    origin: Coordenadas,
    destination: Coordenadas,
    profile: 'driving' | 'walking' | 'cycling' = 'driving'
  ): Promise<TrafficData | null> {
    if (!this.mapboxApiKey) {
      console.warn('Mapbox API key no configurada')
      return null
    }

    try {
      const originStr = `${origin.lng},${origin.lat}`
      const destinationStr = `${destination.lng},${destination.lat}`
      
      const url = new URL(`https://api.mapbox.com/directions/v5/mapbox/${profile}/${originStr};${destinationStr}`)
      url.searchParams.set('access_token', this.mapboxApiKey)
      url.searchParams.set('geometries', 'geojson')
      url.searchParams.set('overview', 'simplified')
      url.searchParams.set('steps', 'true')
      url.searchParams.set('annotations', 'duration,distance')

      const response = await fetch(url.toString())
      const data = await response.json()

      if (data.code !== 'Ok') {
        throw new Error(`Mapbox API error: ${data.code}`)
      }

      const route = data.routes[0]
      const leg = route.legs[0]
      
      // Mapbox no proporciona datos de tráfico en tiempo real en el plan gratuito
      // Usamos una estimación básica
      const trafficLevel: 'low' | 'medium' | 'high' = 'low'

      return {
        duration: route.duration,
        distance: route.distance,
        trafficLevel,
        route: {
          summary: `${profile} route`,
          warnings: [],
          waypoints: route.geometry.coordinates.map((coord: number[]) => ({
            lat: coord[1],
            lng: coord[0],
          })),
        },
      }
    } catch (error) {
      console.error('Error al obtener ETA de Mapbox:', error)
      return null
    }
  }

  // =============================================
  // CÁLCULO DE ETA INTELIGENTE
  // =============================================

  async calculateETA(
    origin: Coordenadas,
    destination: Coordenadas,
    vehicleType: 'moto' | 'bicicleta' | 'auto' | 'a_pie' = 'auto'
  ): Promise<ETACalculation> {
    try {
      // Determinar el modo de transporte
      const mode = this.getTransportMode(vehicleType)
      
      // Intentar obtener datos de tráfico en tiempo real
      let trafficData: TrafficData | null = null
      
      // Priorizar Google Maps si está disponible
      if (this.googleMapsApiKey) {
        trafficData = await this.getGoogleMapsETA(origin, destination, mode as 'driving' | 'walking' | 'bicycling')
      } else if (this.mapboxApiKey) {
        trafficData = await this.getMapboxETA(origin, destination, mode)
      }

      if (trafficData) {
        const totalTimeMinutes = Math.ceil(trafficData.duration / 60)
        const baseTimeMinutes = Math.ceil((trafficData.duration * 0.8) / 60) // Estimación sin tráfico
        const trafficDelayMinutes = totalTimeMinutes - baseTimeMinutes

        return {
          baseTime: baseTimeMinutes,
          trafficDelay: Math.max(0, trafficDelayMinutes),
          totalTime: totalTimeMinutes,
          confidence: 'high',
          lastUpdated: new Date(),
        }
      }

      // Fallback: cálculo básico sin datos de tráfico
      return this.calculateBasicETA(origin, destination, vehicleType)
    } catch (error) {
      console.error('Error al calcular ETA:', error)
      return this.calculateBasicETA(origin, destination, vehicleType)
    }
  }

  private getTransportMode(vehicleType: string): 'driving' | 'walking' | 'cycling' {
    switch (vehicleType) {
      case 'moto':
      case 'auto':
        return 'driving'
      case 'bicicleta':
        return 'cycling'
      case 'a_pie':
        return 'walking'
      default:
        return 'driving'
    }
  }

  private calculateBasicETA(
    origin: Coordenadas,
    destination: Coordenadas,
    vehicleType: string
  ): ETACalculation {
    // Cálculo básico usando fórmula de Haversine
    const distance = this.calculateDistance(origin, destination)
    
    // Velocidades promedio por tipo de vehículo
    const speeds: Record<string, number> = {
      'moto': 35, // km/h
      'auto': 25, // km/h
      'bicicleta': 15, // km/h
      'a_pie': 5, // km/h
    }

    const speed = speeds[vehicleType] || 25
    const baseTimeMinutes = Math.ceil((distance / speed) * 60)
    
    // Agregar tiempo adicional por tráfico (estimación conservadora)
    const trafficDelayMinutes = Math.ceil(baseTimeMinutes * 0.2) // 20% adicional
    const totalTimeMinutes = baseTimeMinutes + trafficDelayMinutes

    return {
      baseTime: baseTimeMinutes,
      trafficDelay: trafficDelayMinutes,
      totalTime: totalTimeMinutes,
      confidence: 'low',
      lastUpdated: new Date(),
    }
  }

  private calculateDistance(origin: Coordenadas, destination: Coordenadas): number {
    const R = 6371 // Radio de la Tierra en km
    const dLat = this.toRadians(destination.lat - origin.lat)
    const dLon = this.toRadians(destination.lng - origin.lng)
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(origin.lat)) * Math.cos(this.toRadians(destination.lat)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180)
  }

  // =============================================
  // ACTUALIZACIÓN DE ETA EN BASE DE DATOS
  // =============================================

  async updatePedidoETA(pedidoId: string, eta: ETACalculation): Promise<void> {
    try {
      const { error } = await supabase
        .from('tracking_pedido')
        .update({
          tiempo_estimado_minutos: eta.totalTime,
          updated_at: new Date().toISOString(),
        })
        .eq('pedido_id', pedidoId)
        .order('timestamp', { ascending: false })
        .limit(1)

      if (error) throw error
    } catch (error) {
      console.error('Error al actualizar ETA en base de datos:', error)
    }
  }

  async updateAsignacionETA(asignacionId: string, eta: ETACalculation): Promise<void> {
    try {
      const { error } = await supabase
        .from('asignaciones_repartidor')
        .update({
          tiempo_estimado_minutos: eta.totalTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', asignacionId)

      if (error) throw error
    } catch (error) {
      console.error('Error al actualizar ETA de asignación:', error)
    }
  }

  // =============================================
  // MONITOREO CONTINUO DE ETA
  // =============================================

  async startETAMonitoring(pedidoId: string, intervalMinutes: number = 5): Promise<() => void> {
    let intervalId: NodeJS.Timeout | null = null

    const updateETA = async () => {
      try {
        // Obtener datos del pedido
        const { data: pedido } = await supabase
          .from('pedidos')
          .select('delivery_address')
          .eq('id', pedidoId)
          .single()

        if (!pedido) return

        // Obtener asignación actual
        const { data: asignacion } = await supabase
          .from('asignaciones_repartidor')
          .select(`
            *,
            repartidores!inner(*)
          `)
          .eq('pedido_id', pedidoId)
          .eq('estado', 'en_camino_cliente')
          .single()

        if (!asignacion) return

        // Obtener última ubicación del repartidor
        const { data: ubicacion } = await supabase
          .from('ubicaciones_repartidor')
          .select('latitud, longitud')
          .eq('repartidor_id', asignacion.repartidor_id)
          .order('timestamp', { ascending: false })
          .limit(1)
          .single()

        if (!ubicacion) return

        // Calcular nueva ETA
        const origin: Coordenadas = {
          lat: ubicacion.latitud,
          lng: ubicacion.longitud,
        }

        // TODO: Geocodificar dirección de destino
        const destination: Coordenadas = {
          lat: 18.4861, // Santo Domingo (placeholder)
          lng: -69.9312,
        }

        const eta = await this.calculateETA(
          origin,
          destination,
          asignacion.repartidores.vehiculo_tipo
        )

        // Actualizar ETA en base de datos
        await this.updatePedidoETA(pedidoId, eta)
        await this.updateAsignacionETA(asignacion.id, eta)

        console.log(`ETA actualizada para pedido ${pedidoId}: ${eta.totalTime} minutos`)
      } catch (error) {
        console.error('Error en monitoreo de ETA:', error)
      }
    }

    // Ejecutar inmediatamente
    await updateETA()

    // Configurar intervalo
    intervalId = setInterval(updateETA, intervalMinutes * 60 * 1000)

    // Retornar función para detener el monitoreo
    return () => {
      if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }
  }

  // =============================================
  // PREDICCIÓN DE TIEMPO DE LLEGADA
  // =============================================

  async predictArrivalTime(
    pedidoId: string,
    currentLocation: Coordenadas
  ): Promise<{ arrivalTime: Date; confidence: number } | null> {
    try {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('delivery_address')
        .eq('id', pedidoId)
        .single()

      if (!pedido) return null

      // TODO: Geocodificar dirección de destino
      const destination: Coordenadas = {
        lat: 18.4861, // Santo Domingo (placeholder)
        lng: -69.9312,
      }

      const eta = await this.calculateETA(currentLocation, destination, 'auto')
      
      const arrivalTime = new Date()
      arrivalTime.setMinutes(arrivalTime.getMinutes() + eta.totalTime)

      const confidence = eta.confidence === 'high' ? 0.9 : eta.confidence === 'medium' ? 0.7 : 0.5

      return {
        arrivalTime,
        confidence,
      }
    } catch (error) {
      console.error('Error al predecir tiempo de llegada:', error)
      return null
    }
  }
}

export const trafficService = new TrafficService()

// =============================================
// HOOK PARA ETA EN TIEMPO REAL
// =============================================

import { useState, useEffect, useCallback } from 'react'

export function useETA(
  origin: Coordenadas | null,
  destination: Coordenadas | null,
  vehicleType: string = 'auto',
  updateInterval: number = 300000 // 5 minutos por defecto
) {
  const [eta, setEta] = useState<ETACalculation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const calculateETA = useCallback(async () => {
    if (!origin || !destination) return

    try {
      setLoading(true)
      setError(null)
      
      const result = await trafficService.calculateETA(origin, destination, vehicleType as 'moto' | 'bicicleta' | 'auto' | 'a_pie')
      setEta(result)
    } catch (err) {
      console.error('Error al calcular ETA:', err)
      setError('Error al calcular tiempo estimado')
    } finally {
      setLoading(false)
    }
  }, [origin, destination, vehicleType])

  // Calcular ETA inicial
  useEffect(() => {
    calculateETA()
  }, [calculateETA])

  // Configurar actualización automática
  useEffect(() => {
    if (!origin || !destination) return

    const interval = setInterval(calculateETA, updateInterval)
    return () => clearInterval(interval)
  }, [calculateETA, updateInterval])

  return {
    eta,
    loading,
    error,
    recalculate: calculateETA,
  }
}
