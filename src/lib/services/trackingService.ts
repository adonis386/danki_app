// =============================================
// SERVICIO DE TRACKING EN TIEMPO REAL
// =============================================

import { createClient } from '@/lib/supabase/client'
import type {
  Repartidor,
  CreateRepartidorData,
  UpdateRepartidorData,
  UbicacionRepartidor,
  CreateUbicacionData,
  AsignacionRepartidor,
  CreateAsignacionData,
  UpdateAsignacionData,
  TrackingPedido,
  CreateTrackingData,
  UpdateTrackingData,
  PedidoConTracking,
  TimelineEvento,
  EstadoTracking,
  EstadoAsignacion,
  RepartidorFilters,
  Coordenadas,
} from '@/types/tracking'

class TrackingService {
  private supabase = createClient()

  // =============================================
  // REPARTIDORES
  // =============================================

  async getRepartidores(filters?: RepartidorFilters) {
    try {
      let query = this.supabase.from('repartidores').select('*')

      if (filters?.disponible !== undefined) {
        query = query.eq('disponible', filters.disponible)
      }
      if (filters?.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }
      if (filters?.vehiculo_tipo) {
        query = query.eq('vehiculo_tipo', filters.vehiculo_tipo)
      }
      if (filters?.min_calificacion) {
        query = query.gte('calificacion', filters.min_calificacion)
      }

      const { data, error } = await query.order('calificacion', {
        ascending: false,
      })

      if (error) throw error
      return data as Repartidor[]
    } catch (error) {
      console.error('Error al obtener repartidores:', error)
      throw error
    }
  }

  async getRepartidorById(id: string) {
    try {
      const { data, error } = await this.supabase
        .from('repartidores')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data as Repartidor
    } catch (error) {
      console.error('Error al obtener repartidor:', error)
      throw error
    }
  }

  async createRepartidor(repartidorData: CreateRepartidorData) {
    try {
      console.log('Datos del repartidor a crear:', repartidorData)
      
      const { data, error } = await this.supabase
        .from('repartidores')
        .insert(repartidorData)
        .select()
        .single()

      if (error) {
        console.error('Error de Supabase:', error)
        throw new Error(`Error de Supabase: ${error.message || JSON.stringify(error)}`)
      }
      
      if (!data) {
        throw new Error('No se recibió data después de crear el repartidor')
      }
      
      return data as Repartidor
    } catch (error) {
      console.error('Error al crear repartidor:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error(`Error desconocido al crear repartidor: ${JSON.stringify(error)}`)
    }
  }

  async updateRepartidor(id: string, updates: UpdateRepartidorData) {
    try {
      const { data, error } = await this.supabase
        .from('repartidores')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Repartidor
    } catch (error) {
      console.error('Error al actualizar repartidor:', error)
      throw error
    }
  }

  async toggleDisponibilidad(id: string, disponible: boolean) {
    return this.updateRepartidor(id, { disponible })
  }

  // =============================================
  // UBICACIONES
  // =============================================

  async createUbicacion(ubicacionData: CreateUbicacionData) {
    try {
      const { data, error } = await this.supabase
        .from('ubicaciones_repartidor')
        .insert(ubicacionData)
        .select()
        .single()

      if (error) throw error
      return data as UbicacionRepartidor
    } catch (error) {
      console.error('Error al crear ubicación:', error)
      throw error
    }
  }

  async getUltimaUbicacion(repartidorId: string) {
    try {
      const { data, error } = await this.supabase
        .from('ubicaciones_repartidor')
        .select('*')
        .eq('repartidor_id', repartidorId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data as UbicacionRepartidor
    } catch (error) {
      console.error('Error al obtener última ubicación:', error)
      return null
    }
  }

  async getHistorialUbicaciones(
    repartidorId: string,
    limit: number = 50
  ) {
    try {
      const { data, error } = await this.supabase
        .from('ubicaciones_repartidor')
        .select('*')
        .eq('repartidor_id', repartidorId)
        .order('timestamp', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data as UbicacionRepartidor[]
    } catch (error) {
      console.error('Error al obtener historial de ubicaciones:', error)
      throw error
    }
  }

  // =============================================
  // ASIGNACIONES
  // =============================================

  async createAsignacion(asignacionData: CreateAsignacionData) {
    try {
      const { data, error } = await this.supabase
        .from('asignaciones_repartidor')
        .insert(asignacionData)
        .select()
        .single()

      if (error) throw error
      return data as AsignacionRepartidor
    } catch (error) {
      console.error('Error al crear asignación:', error)
      throw error
    }
  }

  async updateAsignacion(id: string, updates: UpdateAsignacionData) {
    try {
      const { data, error } = await this.supabase
        .from('asignaciones_repartidor')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as AsignacionRepartidor
    } catch (error) {
      console.error('Error al actualizar asignación:', error)
      throw error
    }
  }

  async getAsignacionByPedido(pedidoId: string) {
    try {
      const { data, error } = await this.supabase
        .from('asignaciones_repartidor')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (error) {
        // Si no encuentra registros, no es un error crítico
        if (error.code === 'PGRST116') {
          console.log(`No se encontró asignación para el pedido ${pedidoId}`)
          return null
        }
        throw error
      }

      // Verificar si data es válido y no está vacío
      if (!data || Object.keys(data).length === 0) {
        console.log(`Asignación vacía para el pedido ${pedidoId}`)
        return null
      }

      return data as AsignacionRepartidor
    } catch (error) {
      console.error('Error al obtener asignación:', error)
      return null
    }
  }

  async getAsignacionesByRepartidor(repartidorId: string) {
    try {
      const { data, error } = await this.supabase
        .from('asignaciones_repartidor')
        .select('*')
        .eq('repartidor_id', repartidorId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as AsignacionRepartidor[]
    } catch (error) {
      console.error('Error al obtener asignaciones del repartidor:', error)
      throw error
    }
  }

  async asignarRepartidor(pedidoId: string, repartidorId: string) {
    try {
      // Buscar asignación existente
      const asignacionExistente = await this.getAsignacionByPedido(pedidoId)

      if (asignacionExistente) {
        // Actualizar asignación existente
        return await this.updateAsignacion(asignacionExistente.id, {
          repartidor_id: repartidorId,
          estado: 'asignado',
        })
      } else {
        // Crear nueva asignación
        return await this.createAsignacion({
          pedido_id: pedidoId,
          repartidor_id: repartidorId,
        })
      }
    } catch (error) {
      console.error('Error al asignar repartidor:', error)
      throw error
    }
  }

  async aceptarPedido(asignacionId: string) {
    return this.updateAsignacion(asignacionId, {
      estado: 'aceptado',
      fecha_aceptacion: new Date().toISOString(),
    })
  }

  async marcarRecogido(asignacionId: string) {
    return this.updateAsignacion(asignacionId, {
      estado: 'recogido',
      fecha_recogida: new Date().toISOString(),
    })
  }

  async marcarEntregado(asignacionId: string) {
    return this.updateAsignacion(asignacionId, {
      estado: 'entregado',
      fecha_entrega: new Date().toISOString(),
    })
  }

  // =============================================
  // TRACKING
  // =============================================

  async createTracking(trackingData: CreateTrackingData) {
    try {
      const { data, error } = await this.supabase
        .from('tracking_pedido')
        .insert(trackingData)
        .select()
        .single()

      if (error) throw error
      return data as TrackingPedido
    } catch (error) {
      console.error('Error al crear tracking:', error)
      throw error
    }
  }

  async updateTracking(pedidoId: string, updates: UpdateTrackingData) {
    try {
      const { data, error } = await this.supabase
        .from('tracking_pedido')
        .insert({
          pedido_id: pedidoId,
          ...updates,
        })
        .select()
        .single()

      if (error) throw error
      return data as TrackingPedido
    } catch (error) {
      console.error('Error al actualizar tracking:', error)
      throw error
    }
  }

  async getTrackingByPedido(pedidoId: string) {
    try {
      const { data, error } = await this.supabase
        .from('tracking_pedido')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('timestamp', { ascending: true })

      if (error) throw error
      return data as TrackingPedido[]
    } catch (error) {
      console.error('Error al obtener tracking:', error)
      throw error
    }
  }

  async getUltimoTracking(pedidoId: string) {
    try {
      const { data, error } = await this.supabase
        .from('tracking_pedido')
        .select('*')
        .eq('pedido_id', pedidoId)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error
      return data as TrackingPedido
    } catch (error) {
      console.error('Error al obtener último tracking:', error)
      return null
    }
  }

  // =============================================
  // PEDIDO CON TRACKING COMPLETO
  // =============================================

  async getPedidoConTracking(pedidoId: string): Promise<PedidoConTracking | null> {
    try {
      // Obtener tracking
      const tracking = await this.getTrackingByPedido(pedidoId)
      
      // Obtener asignación
      const asignacion = await this.getAsignacionByPedido(pedidoId)

      // Si no hay tracking ni asignación, devolver null
      if ((!tracking || tracking.length === 0) && !asignacion) {
        console.log(`No hay tracking ni asignación para el pedido ${pedidoId}`)
        return null
      }

      // Obtener repartidor si hay asignación
      let repartidor: Repartidor | undefined
      let ubicacionActual: UbicacionRepartidor | undefined

      if (asignacion?.repartidor_id) {
        repartidor = await this.getRepartidorById(asignacion.repartidor_id)
        const ubicacion = await this.getUltimaUbicacion(asignacion.repartidor_id)
        if (ubicacion) ubicacionActual = ubicacion
      }

      // Crear timeline
      const timeline = tracking ? this.crearTimeline(tracking, asignacion) : []

      // Estado actual - usar el último tracking o el estado del pedido
      const estadoActual = tracking && tracking.length > 0 
        ? tracking[tracking.length - 1].estado 
        : 'pendiente'

      return {
        pedido_id: pedidoId,
        estado_actual: estadoActual,
        repartidor,
        asignacion: asignacion || undefined,
        tracking,
        ubicacion_actual: ubicacionActual,
        timeline,
      }
    } catch (error) {
      console.error('Error al obtener pedido con tracking:', error)
      return null
    }
  }

  // =============================================
  // TIMELINE
  // =============================================

  private crearTimeline(
    tracking: TrackingPedido[],
    asignacion?: AsignacionRepartidor | null
  ): TimelineEvento[] {
    const eventos: TimelineEvento[] = []
    const estadoActual = tracking[tracking.length - 1]?.estado

    // Eventos de tracking
    tracking.forEach((t) => {
      eventos.push({
        estado: t.estado,
        mensaje: t.mensaje || this.getMensajeEstado(t.estado),
        timestamp: t.timestamp,
        completado: true,
      })
    })

    // Agregar eventos futuros
    const estadosFuturos: EstadoTracking[] = this.getEstadosFuturos(estadoActual)
    estadosFuturos.forEach((estado) => {
      eventos.push({
        estado,
        mensaje: this.getMensajeEstado(estado),
        timestamp: '',
        completado: false,
      })
    })

    return eventos
  }

  private getMensajeEstado(estado: EstadoTracking | EstadoAsignacion): string {
    const mensajes: Record<string, string> = {
      pendiente: 'Pedido recibido',
      confirmado: 'Pedido confirmado por la tienda',
      preparando: 'Preparando tu pedido',
      listo_recoger: 'Pedido listo para recoger',
      en_camino: 'Repartidor en camino',
      entregado: 'Pedido entregado',
      cancelado: 'Pedido cancelado',
      asignado: 'Repartidor asignado',
      aceptado: 'Repartidor aceptó el pedido',
      en_camino_tienda: 'Repartidor en camino a la tienda',
      recogido: 'Pedido recogido',
      en_camino_cliente: 'En camino a tu ubicación',
    }

    return mensajes[estado] || estado
  }

  private getEstadosFuturos(estadoActual: EstadoTracking): EstadoTracking[] {
    const flujo: EstadoTracking[] = [
      'pendiente',
      'confirmado',
      'preparando',
      'listo_recoger',
      'en_camino',
      'entregado',
    ]

    const indiceActual = flujo.indexOf(estadoActual)
    if (indiceActual === -1) return []

    return flujo.slice(indiceActual + 1)
  }

  // =============================================
  // CÁLCULOS DE DISTANCIA
  // =============================================

  calcularDistancia(coord1: Coordenadas, coord2: Coordenadas): number {
    // Fórmula de Haversine
    const R = 6371 // Radio de la Tierra en km
    const dLat = this.toRad(coord2.lat - coord1.lat)
    const dLon = this.toRad(coord2.lng - coord1.lng)

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
        Math.cos(this.toRad(coord2.lat)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distancia = R * c

    return Math.round(distancia * 100) / 100 // Redondear a 2 decimales
  }

  private toRad(grados: number): number {
    return (grados * Math.PI) / 180
  }

  calcularTiempoEstimado(distanciaKm: number, velocidadKmH: number = 30): number {
    // Tiempo en minutos
    return Math.ceil((distanciaKm / velocidadKmH) * 60)
  }

  // =============================================
  // REALTIME SUBSCRIPTIONS
  // =============================================

  subscribeToTracking(
    pedidoId: string,
    callback: (tracking: TrackingPedido) => void
  ) {
    return this.supabase
      .channel(`tracking:${pedidoId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'tracking_pedido',
          filter: `pedido_id=eq.${pedidoId}`,
        },
        (payload) => {
          callback(payload.new as TrackingPedido)
        }
      )
      .subscribe()
  }

  subscribeToUbicacion(
    repartidorId: string,
    callback: (ubicacion: UbicacionRepartidor) => void
  ) {
    return this.supabase
      .channel(`ubicacion:${repartidorId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ubicaciones_repartidor',
          filter: `repartidor_id=eq.${repartidorId}`,
        },
        (payload) => {
          callback(payload.new as UbicacionRepartidor)
        }
      )
      .subscribe()
  }

  unsubscribe(channel: ReturnType<typeof this.supabase.channel>) {
    this.supabase.removeChannel(channel)
  }
}

export const trackingService = new TrackingService()


