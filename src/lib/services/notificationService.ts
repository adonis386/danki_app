// =============================================
// SERVICIO DE NOTIFICACIONES PUSH Y EN APP
// =============================================

import { createClient } from '@/lib/supabase/client'
import type { Coordenadas } from '@/types/tracking'

const supabase = createClient()

interface NotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  image?: string
  data?: Record<string, any>
  actions?: NotificationAction[]
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

class NotificationService {
  private vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
  private vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ''

  // =============================================
  // NOTIFICACIONES PUSH (FUTURO)
  // =============================================

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Este navegador no soporta notificaciones')
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    if (Notification.permission === 'denied') {
      throw new Error('Notificaciones bloqueadas por el usuario')
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  async subscribeToPushNotifications(userId: string): Promise<PushSubscription | null> {
    try {
      const permission = await this.requestNotificationPermission()
      
      if (permission !== 'granted') {
        throw new Error('Permisos de notificación denegados')
      }

      // Registrar service worker
      const registration = await navigator.serviceWorker.register('/sw.js')
      
      // Suscribirse a push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        // applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey),
      })

      // Guardar suscripción en la base de datos
      // await this.savePushSubscription(userId, subscription)

      // return subscription
    } catch (error) {
      console.error('Error al suscribirse a notificaciones push:', error)
      return null
    }
    
    return null
  }

  private async savePushSubscription(userId: string, subscription: PushSubscription) {
    try {
      const { error } = await supabase
        .from('push_subscriptions')
        .upsert({
          user_id: userId,
          endpoint: subscription.endpoint,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
          created_at: new Date().toISOString(),
        })

      if (error) throw error
    } catch (error) {
      console.error('Error al guardar suscripción push:', error)
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  // =============================================
  // NOTIFICACIONES EN APP (ACTUAL)
  // =============================================

  async notifyInApp(
    userId: string,
    notification: NotificationData,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ): Promise<void> {
    try {
      // Guardar notificación en la base de datos
      const { error } = await supabase
        .from('notificaciones')
        .insert({
          user_id: userId,
          titulo: notification.title,
          mensaje: notification.body,
          tipo: type,
          icono: notification.icon,
          datos: notification.data,
          leida: false,
          created_at: new Date().toISOString(),
        })

      if (error) throw error

      // Emitir evento para actualizar UI en tiempo real
      this.emitNotificationEvent(userId, { ...notification, type })
    } catch (error) {
      console.error('Error al enviar notificación en app:', error)
    }
  }

  private emitNotificationEvent(userId: string, notification: NotificationData & { type: string }) {
    // Emitir evento personalizado para que los componentes puedan escuchar
    const event = new CustomEvent('notification', {
      detail: {
        userId,
        notification,
        timestamp: new Date().toISOString(),
      },
    })
    
    window.dispatchEvent(event)
  }

  // =============================================
  // NOTIFICACIONES ESPECÍFICAS DE TRACKING
  // =============================================

  async notifyPedidoAsignado(pedidoId: string, repartidorId: string): Promise<void> {
    try {
      // Notificar al cliente
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('user_id')
        .eq('id', pedidoId)
        .single()

      if (pedido) {
        await this.notifyInApp(pedido.user_id, {
          title: '🚚 Repartidor asignado',
          body: 'Tu pedido tiene un repartidor asignado. Pronto estará en camino.',
          icon: '/icons/delivery-truck.svg',
          data: { pedidoId, tipo: 'pedido_asignado' },
        }, 'success')
      }

      // Notificar al repartidor
      await this.notifyInApp(repartidorId, {
        title: '📦 Nuevo pedido asignado',
        body: 'Tienes un nuevo pedido asignado. Revisa los detalles.',
        icon: '/icons/package.svg',
        data: { pedidoId, tipo: 'nuevo_pedido' },
      }, 'info')
    } catch (error) {
      console.error('Error al notificar asignación de pedido:', error)
    }
  }

  async notifyEstadoCambiado(
    pedidoId: string,
    nuevoEstado: string,
    mensaje: string
  ): Promise<void> {
    try {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('user_id')
        .eq('id', pedidoId)
        .single()

      if (!pedido) return

      const estadoConfig = this.getEstadoConfig(nuevoEstado)
      
      await this.notifyInApp(pedido.user_id, {
        title: estadoConfig.title,
        body: mensaje,
        icon: estadoConfig.icon,
        data: { pedidoId, estado: nuevoEstado, tipo: 'estado_cambiado' },
      }, estadoConfig.type)
    } catch (error) {
      console.error('Error al notificar cambio de estado:', error)
    }
  }

  async notifyUbicacionActualizada(
    pedidoId: string,
    ubicacion: Coordenadas,
    distanciaKm: number
  ): Promise<void> {
    try {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('user_id')
        .eq('id', pedidoId)
        .single()

      if (!pedido) return

      await this.notifyInApp(pedido.user_id, {
        title: '📍 Ubicación actualizada',
        body: `Tu repartidor está a ${distanciaKm.toFixed(1)} km de distancia`,
        icon: '/icons/location.svg',
        data: { 
          pedidoId, 
          ubicacion, 
          distanciaKm, 
          tipo: 'ubicacion_actualizada' 
        },
      }, 'info')
    } catch (error) {
      console.error('Error al notificar actualización de ubicación:', error)
    }
  }

  async notifyPedidoEntregado(pedidoId: string): Promise<void> {
    try {
      const { data: pedido } = await supabase
        .from('pedidos')
        .select('user_id')
        .eq('id', pedidoId)
        .single()

      if (!pedido) return

      await this.notifyInApp(pedido.user_id, {
        title: '✅ Pedido entregado',
        body: '¡Tu pedido ha sido entregado! ¡Disfrútalo!',
        icon: '/icons/check-circle.svg',
        data: { pedidoId, tipo: 'pedido_entregado' },
      }, 'success')
    } catch (error) {
      console.error('Error al notificar entrega de pedido:', error)
    }
  }

  // =============================================
  // NOTIFICACIONES POR EMAIL (FUTURO)
  // =============================================

  async sendEmailNotification(
    email: string,
    subject: string,
    body: string,
    template?: string
  ): Promise<void> {
    try {
      // Integrar con SendGrid, Resend, o similar
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: email,
          subject,
          body,
          template,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al enviar email')
      }
    } catch (error) {
      console.error('Error al enviar notificación por email:', error)
    }
  }

  // =============================================
  // UTILIDADES
  // =============================================

  private getEstadoConfig(estado: string) {
    const configs: Record<string, { title: string; icon: string; type: 'info' | 'success' | 'warning' | 'error' }> = {
      'confirmado': {
        title: '✅ Pedido confirmado',
        icon: '/icons/check.svg',
        type: 'success',
      },
      'preparando': {
        title: '👨‍🍳 Preparando tu pedido',
        icon: '/icons/chef.svg',
        type: 'info',
      },
      'listo_recoger': {
        title: '📦 Listo para recoger',
        icon: '/icons/package.svg',
        type: 'info',
      },
      'en_camino': {
        title: '🚚 En camino',
        icon: '/icons/truck.svg',
        type: 'info',
      },
      'entregado': {
        title: '✅ Pedido entregado',
        icon: '/icons/check-circle.svg',
        type: 'success',
      },
      'cancelado': {
        title: '❌ Pedido cancelado',
        icon: '/icons/x-circle.svg',
        type: 'error',
      },
    }

    return configs[estado] || {
      title: '📱 Actualización de pedido',
      icon: '/icons/bell.svg',
      type: 'info',
    }
  }

  // =============================================
  // OBTENER NOTIFICACIONES DEL USUARIO
  // =============================================

  async getUserNotifications(userId: string, limit: number = 50) {
    try {
      const { data, error } = await supabase
        .from('notificaciones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error al obtener notificaciones:', error)
      return []
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('id', notificationId)

      if (error) throw error
    } catch (error) {
      console.error('Error al marcar notificación como leída:', error)
    }
  }

  async markAllAsRead(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('notificaciones')
        .update({ leida: true })
        .eq('user_id', userId)
        .eq('leida', false)

      if (error) throw error
    } catch (error) {
      console.error('Error al marcar todas las notificaciones como leídas:', error)
    }
  }
}

export const notificationService = new NotificationService()

// =============================================
// HOOK PARA NOTIFICACIONES
// =============================================

import { useState, useEffect, useCallback } from 'react'

interface Notification {
  id: string
  titulo: string
  mensaje: string
  tipo: 'info' | 'success' | 'warning' | 'error'
  icono?: string
  datos?: Record<string, any>
  leida: boolean
  created_at: string
}

export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const loadNotifications = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      const data = await notificationService.getUserNotifications(userId)
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.leida).length)
    } catch (error) {
      console.error('Error al cargar notificaciones:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId)
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, leida: true } : n)
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error al marcar como leída:', error)
    }
  }, [])

  const markAllAsRead = useCallback(async () => {
    if (!userId) return

    try {
      await notificationService.markAllAsRead(userId)
      setNotifications(prev => prev.map(n => ({ ...n, leida: true })))
      setUnreadCount(0)
    } catch (error) {
      console.error('Error al marcar todas como leídas:', error)
    }
  }, [userId])

  // Escuchar eventos de notificaciones en tiempo real
  useEffect(() => {
    const handleNotification = (event: CustomEvent) => {
      const { userId: eventUserId, notification } = event.detail
      
      if (eventUserId === userId) {
        // Agregar nueva notificación al inicio de la lista
        setNotifications(prev => [{
          id: Date.now().toString(),
          titulo: notification.title,
          mensaje: notification.body,
          tipo: notification.type,
          icono: notification.icon,
          datos: notification.data,
          leida: false,
          created_at: new Date().toISOString(),
        }, ...prev])
        
        setUnreadCount(prev => prev + 1)
      }
    }

    window.addEventListener('notification', handleNotification as EventListener)
    
    return () => {
      window.removeEventListener('notification', handleNotification as EventListener)
    }
  }, [userId])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  return {
    notifications,
    loading,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
  }
}
