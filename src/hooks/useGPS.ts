// =============================================
// HOOK PARA ACTUALIZACIÓN AUTOMÁTICA DE GPS
// =============================================

import { useState, useCallback, useRef, useEffect } from 'react'
import { trackingService } from '@/lib/services/trackingService'
import type { Coordenadas } from '@/types/tracking'

interface GPSState {
  isTracking: boolean
  isAvailable: boolean
  currentLocation: Coordenadas | null
  accuracy: number | null
  error: string | null
  lastUpdate: Date | null
}

interface GPSOptions {
  enableHighAccuracy?: boolean
  timeout?: number
  maximumAge?: number
  updateInterval?: number // Intervalo en milisegundos
}

export function useGPS(
  repartidorId: string | null,
  options: GPSOptions = {}
) {
  const {
    enableHighAccuracy = true,
    timeout = 10000,
    maximumAge = 0,
    updateInterval = 30000, // 30 segundos por defecto
  } = options

  const [gpsState, setGpsState] = useState<GPSState>({
    isTracking: false,
    isAvailable: false,
    currentLocation: null,
    accuracy: null,
    error: null,
    lastUpdate: null,
  })

  const watchIdRef = useRef<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Verificar disponibilidad de GPS
  useEffect(() => {
    const isAvailable = 'geolocation' in navigator
    setGpsState(prev => ({ ...prev, isAvailable }))
  }, [])

  // Función para obtener ubicación actual
  const getCurrentPosition = useCallback(async (): Promise<Coordenadas | null> => {
    if (!navigator.geolocation || !repartidorId) return null

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const location: Coordenadas = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          try {
            // Guardar ubicación en la base de datos
            await trackingService.createUbicacion({
              repartidor_id: repartidorId,
              latitud: position.coords.latitude,
              longitud: position.coords.longitude,
              velocidad: position.coords.speed || 0,
              direccion: position.coords.heading || 0,
              precision_metros: position.coords.accuracy || 0,
            })

            // Actualizar estado
            setGpsState(prev => ({
              ...prev,
              currentLocation: location,
              accuracy: position.coords.accuracy,
              lastUpdate: new Date(),
              error: null,
            }))

            resolve(location)
          } catch (error) {
            console.error('Error al guardar ubicación:', error)
            setGpsState(prev => ({
              ...prev,
              error: 'Error al guardar ubicación',
            }))
            resolve(null)
          }
        },
        (error) => {
          let errorMessage = 'Error desconocido de GPS'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permisos de ubicación denegados'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible'
              break
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado'
              break
          }

          setGpsState(prev => ({
            ...prev,
            error: errorMessage,
          }))

          resolve(null)
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )
    })
  }, [repartidorId, enableHighAccuracy, timeout, maximumAge])

  // Iniciar seguimiento continuo
  const startTracking = useCallback(async () => {
    if (!navigator.geolocation || !repartidorId || gpsState.isTracking) return

    try {
      setGpsState(prev => ({ ...prev, isTracking: true, error: null }))

      // Obtener ubicación inicial
      await getCurrentPosition()

      // Configurar seguimiento continuo con watchPosition
      watchIdRef.current = navigator.geolocation.watchPosition(
        async (position) => {
          const location: Coordenadas = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          try {
            await trackingService.createUbicacion({
              repartidor_id: repartidorId,
              latitud: position.coords.latitude,
              longitud: position.coords.longitude,
              velocidad: position.coords.speed || 0,
              direccion: position.coords.heading || 0,
              precision_metros: position.coords.accuracy || 0,
            })

            setGpsState(prev => ({
              ...prev,
              currentLocation: location,
              accuracy: position.coords.accuracy,
              lastUpdate: new Date(),
              error: null,
            }))
          } catch (error) {
            console.error('Error al actualizar ubicación:', error)
          }
        },
        (error) => {
          let errorMessage = 'Error de seguimiento GPS'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permisos de ubicación denegados'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible'
              break
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado'
              break
          }

          setGpsState(prev => ({
            ...prev,
            error: errorMessage,
          }))
        },
        {
          enableHighAccuracy,
          timeout,
          maximumAge,
        }
      )

      // Configurar intervalo de respaldo (por si watchPosition falla)
      intervalRef.current = setInterval(async () => {
        await getCurrentPosition()
      }, updateInterval)

    } catch (error) {
      console.error('Error al iniciar seguimiento GPS:', error)
      setGpsState(prev => ({
        ...prev,
        isTracking: false,
        error: 'Error al iniciar seguimiento GPS',
      }))
    }
  }, [repartidorId, gpsState.isTracking, getCurrentPosition, enableHighAccuracy, timeout, maximumAge, updateInterval])

  // Detener seguimiento
  const stopTracking = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }

    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    setGpsState(prev => ({
      ...prev,
      isTracking: false,
    }))
  }, [])

  // Limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      stopTracking()
    }
  }, [stopTracking])

  // Solicitar permisos de ubicación
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!navigator.geolocation) return false

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
      
      if (permission.state === 'granted') {
        return true
      } else if (permission.state === 'prompt') {
        // Intentar obtener ubicación para activar el prompt
        await getCurrentPosition()
        return true
      } else {
        setGpsState(prev => ({
          ...prev,
          error: 'Permisos de ubicación denegados',
        }))
        return false
      }
    } catch (error) {
      console.error('Error al solicitar permisos:', error)
      return false
    }
  }, [getCurrentPosition])

  // Obtener ubicación una sola vez
  const getLocationOnce = useCallback(async (): Promise<Coordenadas | null> => {
    return await getCurrentPosition()
  }, [getCurrentPosition])

  return {
    // Estado
    ...gpsState,
    
    // Acciones
    startTracking,
    stopTracking,
    requestPermission,
    getLocationOnce,
    
    // Utilidades
    isReady: gpsState.isAvailable && !gpsState.error,
    canTrack: gpsState.isAvailable && repartidorId !== null,
  }
}

// Hook simplificado para obtener ubicación actual
export function useCurrentLocation() {
  const [location, setLocation] = useState<Coordenadas | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setError('GPS no disponible')
      return null
    }

    setLoading(true)
    setError(null)

    return new Promise<Coordenadas | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc: Coordenadas = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }
          setLocation(loc)
          setLoading(false)
          resolve(loc)
        },
        (error) => {
          let errorMessage = 'Error al obtener ubicación'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permisos de ubicación denegados'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Ubicación no disponible'
              break
            case error.TIMEOUT:
              errorMessage = 'Tiempo de espera agotado'
              break
          }

          setError(errorMessage)
          setLoading(false)
          resolve(null)
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })
  }, [])

  return {
    location,
    loading,
    error,
    getLocation,
  }
}
