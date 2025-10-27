// =============================================
// SERVICIO DE NOTIFICACIONES PUSH REALES
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

interface PushNotificationData {
  title: string
  body: string
  icon?: string
  badge?: string
  data?: Record<string, any>
  actions?: Array<{
    action: string
    title: string
    icon?: string
  }>
}

interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private registration: ServiceWorkerRegistration | null = null
  private subscription: PushSubscription | null = null

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  // Inicializar el servicio de notificaciones
  async initialize(): Promise<boolean> {
    try {
      // Verificar soporte del navegador
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        console.warn('Push notifications no soportadas en este navegador')
        return false
      }

      // Registrar service worker
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registrado:', this.registration)

      // Verificar permisos
      const permission = await this.checkPermission()
      if (!permission.granted) {
        const result = await this.requestPermission()
        if (!result) {
          console.warn('Permisos de notificación denegados')
          return false
        }
      }

      // Obtener suscripción existente o crear nueva
      this.subscription = await this.getOrCreateSubscription()
      
      if (this.subscription) {
        await this.saveSubscriptionToDatabase(this.subscription)
        console.log('Suscripción push guardada en BD')
        return true
      }

      return false
    } catch (error) {
      console.error('Error al inicializar notificaciones push:', error)
      return false
    }
  }

  // Verificar permisos actuales
  async checkPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return { granted: false, denied: true, default: false }
    }

    const permission = Notification.permission
    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  }

  // Solicitar permisos
  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    } catch (error) {
      console.error('Error al solicitar permisos:', error)
      return false
    }
  }

  // Obtener o crear suscripción push
  private async getOrCreateSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) return null

    try {
      // Intentar obtener suscripción existente
      let subscription = await this.registration.pushManager.getSubscription()
      
      if (!subscription) {
        // Crear nueva suscripción
        subscription = await this.registration.pushManager.subscribe({
          userVisibleOnly: true,
          // applicationServerKey: this.urlBase64ToUint8Array(
          //   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
          // )
        })
      }

      return subscription
    } catch (error) {
      console.error('Error al obtener suscripción push:', error)
      return null
    }
  }

  // Guardar suscripción en la base de datos
  private async saveSubscriptionToDatabase(subscription: PushSubscription): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const subscriptionData = {
        user_id: user.id,
        endpoint: subscription.endpoint,
        p256dh: this.arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: this.arrayBufferToBase64(subscription.getKey('auth')!),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      // Verificar si ya existe
      const { data: existing } = await supabase
        .from('push_subscriptions')
        .select('id')
        .eq('user_id', user.id)
        .eq('endpoint', subscription.endpoint)
        .single()

      if (existing) {
        // Actualizar existente
        await supabase
          .from('push_subscriptions')
          .update(subscriptionData)
          .eq('id', existing.id)
      } else {
        // Crear nueva
        await supabase
          .from('push_subscriptions')
          .insert(subscriptionData)
      }
    } catch (error) {
      console.error('Error al guardar suscripción:', error)
    }
  }

  // Enviar notificación local
  async sendLocalNotification(data: PushNotificationData): Promise<void> {
    if (!this.registration) return

    try {
      await this.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon || '/icon-192x192.png',
        badge: data.badge || '/badge-72x72.png',
        data: data.data,
        // actions: data.actions,
        requireInteraction: true,
        tag: 'danki-notification'
      })
    } catch (error) {
      console.error('Error al enviar notificación local:', error)
    }
  }

  // Enviar notificación a repartidor específico
  async notifyRepartidor(repartidorId: string, notification: PushNotificationData): Promise<void> {
    try {
      // Obtener suscripción del repartidor
      const { data: subscription } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', repartidorId)
        .single()

      if (!subscription) {
        console.warn('No hay suscripción push para el repartidor:', repartidorId)
        return
      }

      // Enviar notificación push
      await this.sendPushNotification(subscription, notification)
    } catch (error) {
      console.error('Error al notificar repartidor:', error)
    }
  }

  // Enviar notificación push real
  private async sendPushNotification(
    subscription: any, 
    notification: PushNotificationData
  ): Promise<void> {
    try {
      const response = await fetch('/api/send-push-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: {
            endpoint: subscription.endpoint,
            keys: {
              p256dh: subscription.p256dh,
              auth: subscription.auth
            }
          },
          notification
        })
      })

      if (!response.ok) {
        throw new Error(`Error al enviar notificación: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error al enviar notificación push:', error)
    }
  }

  // Notificar asignación de pedido
  async notifyPedidoAsignado(pedidoId: string, repartidorId: string): Promise<void> {
    const notification: PushNotificationData = {
      title: '🚚 Nuevo Pedido Asignado',
      body: 'Tienes un nuevo pedido para entregar. ¡Revisa tu dashboard!',
      data: {
        type: 'pedido_asignado',
        pedidoId,
        repartidorId,
        url: '/repartidor'
      },
      actions: [
        {
          action: 'view',
          title: 'Ver Pedido',
          icon: '/icon-view.png'
        },
        {
          action: 'dismiss',
          title: 'Descartar',
          icon: '/icon-dismiss.png'
        }
      ]
    }

    await this.notifyRepartidor(repartidorId, notification)
  }

  // Notificar cambio de estado
  async notifyEstadoCambiado(pedidoId: string, estado: string, clienteId: string): Promise<void> {
    const estadoMessages = {
      'confirmado': 'Tu pedido ha sido confirmado',
      'en_camino': 'Tu pedido está en camino',
      'entregado': 'Tu pedido ha sido entregado',
      'cancelado': 'Tu pedido ha sido cancelado'
    }

    const notification: PushNotificationData = {
      title: '📦 Estado del Pedido',
      body: estadoMessages[estado as keyof typeof estadoMessages] || 'Estado actualizado',
      data: {
        type: 'estado_cambiado',
        pedidoId,
        estado,
        url: '/pedidos'
      }
    }

    await this.notifyRepartidor(clienteId, notification)
  }

  // Notificar disponibilidad
  async notifyDisponibilidadCambiada(repartidorId: string, disponible: boolean): Promise<void> {
    const notification: PushNotificationData = {
      title: disponible ? '🟢 Disponible' : '🔴 No Disponible',
      body: disponible 
        ? 'Estás disponible para recibir nuevos pedidos'
        : 'Ya no estás disponible para nuevos pedidos',
      data: {
        type: 'disponibilidad',
        disponible,
        url: '/repartidor'
      }
    }

    await this.notifyRepartidor(repartidorId, notification)
  }

  // Limpiar suscripción
  async unsubscribe(): Promise<void> {
    try {
      if (this.subscription) {
        await this.subscription.unsubscribe()
        this.subscription = null
      }

      // Eliminar de la base de datos
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase
          .from('push_subscriptions')
          .delete()
          .eq('user_id', user.id)
      }
    } catch (error) {
      console.error('Error al desuscribirse:', error)
    }
  }

  // Utilidades
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

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary)
  }
}

// Instancia singleton
export const pushNotificationService = PushNotificationService.getInstance()
