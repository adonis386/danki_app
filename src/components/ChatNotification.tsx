'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Bell, X } from 'lucide-react'
import { chatService } from '@/lib/services/chatService'
import { pushNotificationService } from '@/lib/services/pushNotificationService'

interface ChatNotificationProps {
  className?: string
}

export default function ChatNotification({ className = '' }: ChatNotificationProps) {
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0)
  const [mostrarNotificacion, setMostrarNotificacion] = useState(false)
  const [ultimoMensaje, setUltimoMensaje] = useState<string | null>(null)

  useEffect(() => {
    cargarMensajesNoLeidos()
    suscribirseANotificaciones()
    
    return () => {
      // Cleanup de suscripciones
    }
  }, [])

  const cargarMensajesNoLeidos = async () => {
    try {
      const count = await chatService.contarMensajesNoLeidos()
      setMensajesNoLeidos(count)
    } catch (error) {
      console.error('Error al cargar mensajes no leídos:', error)
    }
  }

  const suscribirseANotificaciones = () => {
    // Suscribirse a nuevas conversaciones
    const channelConversaciones = chatService.suscribirseAConversaciones((conversacion) => {
      console.log('Nueva conversación:', conversacion)
      cargarMensajesNoLeidos()
    })

    // Suscribirse a mensajes en todas las conversaciones del usuario
    const channelMensajes = chatService.suscribirseAMensajes('*', (mensaje) => {
      if (!mensaje.es_mio) {
        setMensajesNoLeidos(prev => prev + 1)
        setUltimoMensaje(mensaje.contenido)
        setMostrarNotificacion(true)
        
        // Mostrar notificación push
        pushNotificationService.sendLocalNotification({
          title: '💬 Nuevo Mensaje',
          body: mensaje.contenido,
          data: {
            type: 'nuevo_mensaje',
            conversacionId: mensaje.conversacion_id,
            url: '/pedidos'
          }
        })

        // Auto-ocultar notificación después de 5 segundos
        setTimeout(() => {
          setMostrarNotificacion(false)
        }, 5000)
      }
    })

    return () => {
      chatService.desuscribirse(channelConversaciones)
      chatService.desuscribirse(channelMensajes)
    }
  }

  const ocultarNotificacion = () => {
    setMostrarNotificacion(false)
  }

  if (mensajesNoLeidos === 0 && !mostrarNotificacion) {
    return null
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      {/* Badge de mensajes no leídos */}
      {mensajesNoLeidos > 0 && (
        <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mb-2 animate-pulse">
          {mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}
        </div>
      )}

      {/* Notificación de nuevo mensaje */}
      {mostrarNotificacion && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm animate-slide-in">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageCircle size={20} className="text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm">
                Nuevo Mensaje
              </h4>
              <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                {ultimoMensaje}
              </p>
            </div>
            <button
              onClick={ocultarNotificacion}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente para mostrar notificaciones en el header
export function ChatNotificationBadge({ className = '' }: ChatNotificationProps) {
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0)

  useEffect(() => {
    cargarMensajesNoLeidos()
    
    // Actualizar cada 30 segundos
    const interval = setInterval(cargarMensajesNoLeidos, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const cargarMensajesNoLeidos = async () => {
    try {
      const count = await chatService.contarMensajesNoLeidos()
      setMensajesNoLeidos(count)
    } catch (error) {
      console.error('Error al cargar mensajes no leídos:', error)
    }
  }

  if (mensajesNoLeidos === 0) {
    return null
  }

  return (
    <div className={`relative ${className}`}>
      <MessageCircle size={20} className="text-gray-600" />
      <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
        {mensajesNoLeidos > 99 ? '99+' : mensajesNoLeidos}
      </div>
    </div>
  )
}
