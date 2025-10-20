// =============================================
// HOOKS PARA TRACKING EN TIEMPO REAL
// =============================================

import { useState, useEffect, useCallback } from 'react'
import { trackingService } from '@/lib/services/trackingService'
import type {
  PedidoConTracking,
  TrackingPedido,
  UbicacionRepartidor,
  Repartidor,
  RepartidorFilters,
  AsignacionRepartidor,
} from '@/types/tracking'

// =============================================
// HOOK: TRACKING DE PEDIDO
// =============================================

export function useTrackingPedido(pedidoId: string | null) {
  const [pedidoTracking, setPedidoTracking] = useState<PedidoConTracking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarTracking = useCallback(async () => {
    if (!pedidoId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await trackingService.getPedidoConTracking(pedidoId)
      setPedidoTracking(data)
    } catch (err) {
      console.error('Error al cargar tracking:', err)
      setError('Error al cargar el tracking del pedido')
    } finally {
      setLoading(false)
    }
  }, [pedidoId])

  useEffect(() => {
    cargarTracking()
  }, [cargarTracking])

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!pedidoId) return

    const channel = trackingService.subscribeToTracking(
      pedidoId,
      (nuevoTracking: TrackingPedido) => {
        setPedidoTracking((prev) => {
          if (!prev) return null

          return {
            ...prev,
            tracking: [...prev.tracking, nuevoTracking],
            estado_actual: nuevoTracking.estado,
            timeline: trackingService['crearTimeline'](
              [...prev.tracking, nuevoTracking],
              prev.asignacion
            ),
          }
        })
      }
    )

    return () => {
      trackingService.unsubscribe(channel)
    }
  }, [pedidoId])

  return {
    pedidoTracking,
    loading,
    error,
    refetch: cargarTracking,
  }
}

// =============================================
// HOOK: UBICACIÓN EN TIEMPO REAL
// =============================================

export function useUbicacionRepartidor(repartidorId: string | null) {
  const [ubicacion, setUbicacion] = useState<UbicacionRepartidor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarUbicacion = useCallback(async () => {
    if (!repartidorId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await trackingService.getUltimaUbicacion(repartidorId)
      setUbicacion(data)
    } catch (err) {
      console.error('Error al cargar ubicación:', err)
      setError('Error al cargar la ubicación del repartidor')
    } finally {
      setLoading(false)
    }
  }, [repartidorId])

  useEffect(() => {
    cargarUbicacion()
  }, [cargarUbicacion])

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!repartidorId) return

    const channel = trackingService.subscribeToUbicacion(
      repartidorId,
      (nuevaUbicacion: UbicacionRepartidor) => {
        setUbicacion(nuevaUbicacion)
      }
    )

    return () => {
      trackingService.unsubscribe(channel)
    }
  }, [repartidorId])

  return {
    ubicacion,
    loading,
    error,
    refetch: cargarUbicacion,
  }
}

// =============================================
// HOOK: REPARTIDORES DISPONIBLES
// =============================================

export function useRepartidoresDisponibles(filters?: RepartidorFilters) {
  const [repartidores, setRepartidores] = useState<Repartidor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarRepartidores = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await trackingService.getRepartidores({
        disponible: true,
        activo: true,
        ...filters,
      })
      setRepartidores(data)
    } catch (err) {
      console.error('Error al cargar repartidores:', err)
      setError('Error al cargar repartidores disponibles')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    cargarRepartidores()
  }, [cargarRepartidores])

  return {
    repartidores,
    loading,
    error,
    refetch: cargarRepartidores,
  }
}

// =============================================
// HOOK: ASIGNACIÓN DE REPARTIDOR
// =============================================

export function useAsignacion(pedidoId: string | null) {
  const [asignacion, setAsignacion] = useState<AsignacionRepartidor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarAsignacion = useCallback(async () => {
    if (!pedidoId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await trackingService.getAsignacionByPedido(pedidoId)
      setAsignacion(data)
    } catch (err) {
      console.error('Error al cargar asignación:', err)
      setError('Error al cargar la asignación')
    } finally {
      setLoading(false)
    }
  }, [pedidoId])

  useEffect(() => {
    cargarAsignacion()
  }, [cargarAsignacion])

  const asignarRepartidor = useCallback(
    async (repartidorId: string) => {
      if (!pedidoId) return

      try {
        setError(null)
        const data = await trackingService.asignarRepartidor(pedidoId, repartidorId)
        setAsignacion(data)
        return data
      } catch (err) {
        console.error('Error al asignar repartidor:', err)
        setError('Error al asignar repartidor')
        throw err
      }
    },
    [pedidoId]
  )

  const aceptarPedido = useCallback(async () => {
    if (!asignacion) return

    try {
      setError(null)
      const data = await trackingService.aceptarPedido(asignacion.id)
      setAsignacion(data)
      return data
    } catch (err) {
      console.error('Error al aceptar pedido:', err)
      setError('Error al aceptar pedido')
      throw err
    }
  }, [asignacion])

  const marcarRecogido = useCallback(async () => {
    if (!asignacion) return

    try {
      setError(null)
      const data = await trackingService.marcarRecogido(asignacion.id)
      setAsignacion(data)
      return data
    } catch (err) {
      console.error('Error al marcar como recogido:', err)
      setError('Error al marcar como recogido')
      throw err
    }
  }, [asignacion])

  const marcarEntregado = useCallback(async () => {
    if (!asignacion) return

    try {
      setError(null)
      const data = await trackingService.marcarEntregado(asignacion.id)
      setAsignacion(data)
      return data
    } catch (err) {
      console.error('Error al marcar como entregado:', err)
      setError('Error al marcar como entregado')
      throw err
    }
  }, [asignacion])

  return {
    asignacion,
    loading,
    error,
    refetch: cargarAsignacion,
    asignarRepartidor,
    aceptarPedido,
    marcarRecogido,
    marcarEntregado,
  }
}

// =============================================
// HOOK: HISTORIAL DE TRACKING
// =============================================

export function useHistorialTracking(pedidoId: string | null) {
  const [tracking, setTracking] = useState<TrackingPedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargarTracking = useCallback(async () => {
    if (!pedidoId) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await trackingService.getTrackingByPedido(pedidoId)
      setTracking(data)
    } catch (err) {
      console.error('Error al cargar historial de tracking:', err)
      setError('Error al cargar el historial')
    } finally {
      setLoading(false)
    }
  }, [pedidoId])

  useEffect(() => {
    cargarTracking()
  }, [cargarTracking])

  return {
    tracking,
    loading,
    error,
    refetch: cargarTracking,
  }
}


