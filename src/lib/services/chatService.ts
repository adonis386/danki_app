// =============================================
// SERVICIO DE CHAT CON REPARTIDORES
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'
import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = createClient()

export interface Conversacion {
  id: string
  pedido_id: string
  cliente_id: string
  repartidor_id: string
  activa: boolean
  ultimo_mensaje_at?: string
  cliente_nombre?: string
  repartidor_nombre?: string
  created_at: string
  updated_at: string
}

export interface Mensaje {
  id: string
  conversacion_id: string
  remitente_id: string
  destinatario_id: string
  contenido: string
  tipo: 'texto' | 'imagen' | 'ubicacion' | 'sistema'
  metadata?: Record<string, any>
  leido: boolean
  leido_at?: string
  created_at: string
  remitente_nombre?: string
  es_mio?: boolean
}

export interface NuevoMensaje {
  conversacion_id: string
  destinatario_id: string
  contenido: string
  tipo?: 'texto' | 'imagen' | 'ubicacion' | 'sistema'
  metadata?: Record<string, any>
}

class ChatService {
  private channels: Map<string, RealtimeChannel> = new Map()

  // =============================================
  // CONVERSACIONES
  // =============================================

  async getConversacionByPedido(pedidoId: string): Promise<Conversacion | null> {
    try {
      const { data, error } = await supabase
        .rpc('get_conversacion_pedido', { pedido_id_param: pedidoId })
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          return null // No hay conversación
        }
        throw error
      }

      return data as Conversacion
    } catch (error) {
      console.error('Error al obtener conversación:', error)
      return null
    }
  }

  async createConversacion(pedidoId: string): Promise<Conversacion | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Obtener información del pedido y repartidor asignado
      const { data: pedido, error: pedidoError } = await supabase
        .from('pedidos')
        .select(`
          id,
          user_id,
          asignaciones_repartidor (
            repartidor_id,
            repartidores (
              user_id
            )
          )
        `)
        .eq('id', pedidoId)
        .single()

      if (pedidoError || !pedido) {
        throw new Error('Pedido no encontrado')
      }

      const repartidorUserId = pedido.asignaciones_repartidor?.[0]?.repartidor_id
      if (!repartidorUserId) {
        throw new Error('No hay repartidor asignado')
      }

      const { data, error } = await supabase
        .from('conversaciones')
        .insert({
          pedido_id: pedidoId,
          cliente_id: pedido.user_id,
          repartidor_id: repartidorUserId
        })
        .select()
        .single()

      if (error) throw error
      return data as Conversacion
    } catch (error) {
      console.error('Error al crear conversación:', error)
      return null
    }
  }

  async getConversacionesUsuario(): Promise<Conversacion[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('conversaciones')
        .select(`
          *,
          pedidos (
            id,
            status,
            delivery_address
          )
        `)
        .or(`cliente_id.eq.${user.id},repartidor_id.eq.${user.id}`)
        .eq('activa', true)
        .order('ultimo_mensaje_at', { ascending: false })

      if (error) throw error
      return data as Conversacion[]
    } catch (error) {
      console.error('Error al obtener conversaciones:', error)
      return []
    }
  }

  // =============================================
  // MENSAJES
  // =============================================

  async getMensajes(conversacionId: string, limit: number = 50): Promise<Mensaje[]> {
    try {
      const { data, error } = await supabase
        .rpc('get_mensajes_conversacion', {
          conversacion_id_param: conversacionId,
          limit_param: limit
        })

      if (error) throw error
      
      // Ordenar por fecha ascendente para mostrar cronológicamente
      return (data as Mensaje[]).reverse()
    } catch (error) {
      console.error('Error al obtener mensajes:', error)
      return []
    }
  }

  async enviarMensaje(mensaje: NuevoMensaje): Promise<Mensaje | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('mensajes')
        .insert({
          conversacion_id: mensaje.conversacion_id,
          remitente_id: user.id,
          destinatario_id: mensaje.destinatario_id,
          contenido: mensaje.contenido,
          tipo: mensaje.tipo || 'texto',
          metadata: mensaje.metadata || {}
        })
        .select()
        .single()

      if (error) throw error
      return data as Mensaje
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      return null
    }
  }

  async marcarMensajesComoLeidos(conversacionId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('mensajes')
        .update({
          leido: true,
          leido_at: new Date().toISOString()
        })
        .eq('conversacion_id', conversacionId)
        .eq('destinatario_id', user.id)
        .eq('leido', false)

      if (error) throw error
    } catch (error) {
      console.error('Error al marcar mensajes como leídos:', error)
    }
  }

  async contarMensajesNoLeidos(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { data, error } = await supabase
        .rpc('contar_mensajes_no_leidos', { user_id_param: user.id })

      if (error) throw error
      return data || 0
    } catch (error) {
      console.error('Error al contar mensajes no leídos:', error)
      return 0
    }
  }

  // =============================================
  // TIEMPO REAL
  // =============================================

  suscribirseAMensajes(
    conversacionId: string,
    callback: (mensaje: Mensaje) => void
  ): RealtimeChannel {
    const channelName = `mensajes:${conversacionId}`
    
    // Si ya existe la suscripción, la reutilizamos
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${conversacionId}`
        },
        async (payload) => {
          try {
            // Obtener el mensaje completo con información del remitente
            const { data: mensajeCompleto } = await supabase
              .rpc('get_mensajes_conversacion', {
                conversacion_id_param: conversacionId,
                limit_param: 1
              })

            if (mensajeCompleto && mensajeCompleto.length > 0) {
              callback(mensajeCompleto[0] as Mensaje)
            }
          } catch (error) {
            console.error('Error al procesar mensaje en tiempo real:', error)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  suscribirseAConversaciones(callback: (conversacion: Conversacion) => void): RealtimeChannel {
    const channelName = 'conversaciones'
    
    if (this.channels.has(channelName)) {
      return this.channels.get(channelName)!
    }

    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversaciones'
        },
        async (payload) => {
          try {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const conversacion = payload.new as Conversacion
              callback(conversacion)
            }
          } catch (error) {
            console.error('Error al procesar conversación en tiempo real:', error)
          }
        }
      )
      .subscribe()

    this.channels.set(channelName, channel)
    return channel
  }

  desuscribirse(channel: RealtimeChannel): void {
    supabase.removeChannel(channel)
    // Remover del mapa de canales
    for (const [key, value] of this.channels.entries()) {
      if (value === channel) {
        this.channels.delete(key)
        break
      }
    }
  }

  desuscribirseTodos(): void {
    this.channels.forEach(channel => {
      supabase.removeChannel(channel)
    })
    this.channels.clear()
  }

  // =============================================
  // UTILIDADES
  // =============================================

  async enviarMensajeSistema(
    conversacionId: string,
    contenido: string,
    metadata?: Record<string, any>
  ): Promise<Mensaje | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      // Obtener información de la conversación
      const { data: conversacion } = await supabase
        .from('conversaciones')
        .select('cliente_id, repartidor_id')
        .eq('id', conversacionId)
        .single()

      if (!conversacion) return null

      // El destinatario es el otro usuario en la conversación
      const destinatarioId = conversacion.cliente_id === user.id 
        ? conversacion.repartidor_id 
        : conversacion.cliente_id

      return await this.enviarMensaje({
        conversacion_id: conversacionId,
        destinatario_id: destinatarioId,
        contenido,
        tipo: 'sistema',
        metadata
      })
    } catch (error) {
      console.error('Error al enviar mensaje del sistema:', error)
      return null
    }
  }

  formatearTiempo(fecha: string): string {
    const ahora = new Date()
    const mensajeFecha = new Date(fecha)
    const diffMs = ahora.getTime() - mensajeFecha.getTime()
    const diffMin = Math.floor(diffMs / (1000 * 60))
    const diffHoras = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMin < 1) return 'Ahora'
    if (diffMin < 60) return `${diffMin}m`
    if (diffHoras < 24) return `${diffHoras}h`
    if (diffDias < 7) return `${diffDias}d`
    
    return mensajeFecha.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short'
    })
  }
}

// Instancia singleton
export const chatService = new ChatService()
