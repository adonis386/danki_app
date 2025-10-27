'use client'

import { useState, useEffect, useRef } from 'react'
import { Send, Paperclip, MapPin, Phone, Clock, Check, CheckCheck } from 'lucide-react'
import { chatService, type Mensaje, type Conversacion } from '@/lib/services/chatService'
import { useToast } from '@/components/Toast'

interface ChatComponentProps {
  conversacionId: string
  pedidoId: string
  className?: string
}

export default function ChatComponent({ 
  conversacionId, 
  pedidoId, 
  className = '' 
}: ChatComponentProps) {
  const { showToast } = useToast()
  const [mensajes, setMensajes] = useState<Mensaje[]>([])
  const [nuevoMensaje, setNuevoMensaje] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [conversacion, setConversacion] = useState<Conversacion | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)

  useEffect(() => {
    cargarDatos()
    suscribirseATiempoReal()
    
    return () => {
      if (channelRef.current) {
        chatService.desuscribirse(channelRef.current)
      }
    }
  }, [conversacionId])

  useEffect(() => {
    scrollToBottom()
  }, [mensajes])

  const cargarDatos = async () => {
    try {
      setCargando(true)
      
      // Cargar conversación
      const conversacionData = await chatService.getConversacionByPedido(pedidoId)
      setConversacion(conversacionData)
      
      // Cargar mensajes
      const mensajesData = await chatService.getMensajes(conversacionId)
      setMensajes(mensajesData)
      
      // Marcar mensajes como leídos
      await chatService.marcarMensajesComoLeidos(conversacionId)
      
    } catch (error) {
      console.error('Error al cargar datos del chat:', error)
      showToast('❌ Error al cargar el chat', 'error')
    } finally {
      setCargando(false)
    }
  }

  const suscribirseATiempoReal = () => {
    const channel = chatService.suscribirseAMensajes(conversacionId, (nuevoMensaje) => {
      setMensajes(prev => [...prev, nuevoMensaje])
      
      // Marcar como leído si es para el usuario actual
      if (!nuevoMensaje.es_mio) {
        chatService.marcarMensajesComoLeidos(conversacionId)
      }
    })
    
    channelRef.current = channel
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || enviando) return

    try {
      setEnviando(true)
      
      if (!conversacion) {
        showToast('❌ No se pudo obtener información de la conversación', 'error')
        return
      }

      const destinatarioId = conversacion.cliente_id === conversacion.repartidor_id 
        ? conversacion.repartidor_id 
        : conversacion.cliente_id

      const mensajeEnviado = await chatService.enviarMensaje({
        conversacion_id: conversacionId,
        destinatario_id: destinatarioId,
        contenido: nuevoMensaje.trim(),
        tipo: 'texto'
      })

      if (mensajeEnviado) {
        setNuevoMensaje('')
        // El mensaje se agregará automáticamente via suscripción en tiempo real
      } else {
        showToast('❌ Error al enviar el mensaje', 'error')
      }
    } catch (error) {
      console.error('Error al enviar mensaje:', error)
      showToast('❌ Error al enviar el mensaje', 'error')
    } finally {
      setEnviando(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      enviarMensaje()
    }
  }

  const enviarMensajeSistema = async (contenido: string) => {
    try {
      await chatService.enviarMensajeSistema(conversacionId, contenido)
    } catch (error) {
      console.error('Error al enviar mensaje del sistema:', error)
    }
  }

  const renderMensaje = (mensaje: Mensaje) => {
    const esMio = mensaje.es_mio
    const esSistema = mensaje.tipo === 'sistema'

    if (esSistema) {
      return (
        <div key={mensaje.id} className="flex justify-center my-2">
          <div className="bg-gray-100 text-gray-600 text-sm px-3 py-1 rounded-full">
            {mensaje.contenido}
          </div>
        </div>
      )
    }

    return (
      <div key={mensaje.id} className={`flex ${esMio ? 'justify-end' : 'justify-start'} mb-4`}>
        <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          esMio 
            ? 'bg-orange-500 text-white' 
            : 'bg-gray-200 text-gray-800'
        }`}>
          <div className="text-sm">{mensaje.contenido}</div>
          <div className={`text-xs mt-1 flex items-center gap-1 ${
            esMio ? 'text-orange-100' : 'text-gray-500'
          }`}>
            <Clock size={12} />
            {chatService.formatearTiempo(mensaje.created_at)}
            {esMio && (
              <div className="ml-1">
                {mensaje.leido ? (
                  <CheckCheck size={12} className="text-blue-300" />
                ) : (
                  <Check size={12} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (cargando) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando chat...</p>
        </div>
      </div>
    )
  }

  if (!conversacion) {
    return (
      <div className={`bg-white rounded-lg shadow-lg ${className}`}>
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-4">No se pudo cargar la conversación</p>
          <button
            onClick={cargarDatos}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg flex flex-col h-96 ${className}`}>
      {/* Header del chat */}
      <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">
              Chat con {conversacion.cliente_nombre || 'Cliente'}
            </h3>
            <p className="text-sm text-gray-600">
              Pedido #{pedidoId.slice(-8)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => enviarMensajeSistema('📍 Ubicación compartida')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg"
              title="Compartir ubicación"
            >
              <MapPin size={20} />
            </button>
            <button
              onClick={() => enviarMensajeSistema('📞 Llamada realizada')}
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-200 rounded-lg"
              title="Marcar llamada"
            >
              <Phone size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Área de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {mensajes.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <p>No hay mensajes aún</p>
            <p className="text-sm">Envía el primer mensaje para comenzar la conversación</p>
          </div>
        ) : (
          mensajes.map(renderMensaje)
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Área de entrada */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <textarea
              value={nuevoMensaje}
              onChange={(e) => setNuevoMensaje(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={1}
              disabled={enviando}
            />
          </div>
          <button
            onClick={enviarMensaje}
            disabled={!nuevoMensaje.trim() || enviando}
            className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enviando ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={20} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
