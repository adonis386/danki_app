// =============================================
// API PARA ENVIAR NOTIFICACIONES PUSH
// =============================================

import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

// Configurar web-push
// webpush.setVapidDetails(
//   'mailto:admin@danki.com',
//   process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
//   process.env.VAPID_PRIVATE_KEY!
// )

interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

interface NotificationData {
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

export async function POST(request: NextRequest) {
  try {
    const { subscription, notification } = await request.json()

    if (!subscription || !notification) {
      return NextResponse.json(
        { error: 'Subscription y notification son requeridos' },
        { status: 400 }
      )
    }

    // Preparar payload de la notificación
    const payload = JSON.stringify({
      title: notification.title,
      body: notification.body,
      icon: notification.icon || '/icon-192x192.png',
      badge: notification.badge || '/badge-72x72.png',
      data: notification.data || {},
      actions: notification.actions || [],
      requireInteraction: true,
      tag: 'danki-notification'
    })

    // Enviar notificación push
    const result = await webpush.sendNotification(
      subscription as PushSubscription,
      payload
    )

    console.log('Notificación push enviada:', result)

    return NextResponse.json({
      success: true,
      message: 'Notificación enviada exitosamente'
    })

  } catch (error) {
    console.error('Error al enviar notificación push:', error)
    
    return NextResponse.json(
      { 
        error: 'Error al enviar notificación',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

// Endpoint para obtener estadísticas de notificaciones
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es requerido' },
        { status: 400 }
      )
    }

    // Aquí podrías obtener estadísticas de notificaciones
    // Por ahora retornamos datos de ejemplo
    return NextResponse.json({
      userId,
      notificationsSent: 0,
      lastNotification: null,
      subscriptionActive: true
    })

  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    
    return NextResponse.json(
      { error: 'Error al obtener estadísticas' },
      { status: 500 }
    )
  }
}
