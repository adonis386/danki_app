'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Star, ThumbsUp, ThumbsDown, MessageCircle, User, Clock } from 'lucide-react'
import { useToast } from '@/components/Toast'

interface CalificacionProps {
  pedidoId: string
  tipo: 'cliente_a_repartidor' | 'repartidor_a_cliente'
  onCalificacionEnviada?: (calificacion: number) => void
  className?: string
}

interface CalificacionData {
  id?: string
  pedido_id: string
  calificador_id: string
  calificado_id: string
  tipo: 'cliente_a_repartidor' | 'repartidor_a_cliente'
  puntuacion: number
  comentario?: string
  aspectos: {
    puntualidad?: number
    comunicacion?: number
    cuidado?: number
    amabilidad?: number
  }
  created_at?: string
}

export default function SistemaCalificaciones({
  pedidoId,
  tipo,
  onCalificacionEnviada,
  className = ''
}: CalificacionProps) {
  const supabase = createClient()
  const { showToast } = useToast()
  
  const [calificacion, setCalificacion] = useState<CalificacionData>({
    pedido_id: pedidoId,
    calificador_id: '',
    calificado_id: '',
    tipo,
    puntuacion: 0,
    comentario: '',
    aspectos: {}
  })
  
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [existingCalificacion, setExistingCalificacion] = useState<CalificacionData | null>(null)

  useEffect(() => {
    loadExistingCalificacion()
  }, [pedidoId, tipo])

  const loadExistingCalificacion = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('calificaciones')
        .select('*')
        .eq('pedido_id', pedidoId)
        .eq('tipo', tipo)
        .eq('calificador_id', user.id)
        .single()

      if (data && !error) {
        setExistingCalificacion(data)
        setCalificacion(data)
        setSubmitted(true)
      }
    } catch (error) {
      console.error('Error al cargar calificación existente:', error)
    }
  }

  const handlePuntuacionChange = (puntuacion: number) => {
    setCalificacion(prev => ({ ...prev, puntuacion }))
  }

  const handleAspectoChange = (aspecto: keyof CalificacionData['aspectos'], valor: number) => {
    setCalificacion(prev => ({
      ...prev,
      aspectos: {
        ...prev.aspectos,
        [aspecto]: valor
      }
    }))
  }

  const handleComentarioChange = (comentario: string) => {
    setCalificacion(prev => ({ ...prev, comentario }))
  }

  const submitCalificacion = async () => {
    try {
      setLoading(true)
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        showToast('❌ Debes estar autenticado para calificar', 'error')
        return
      }

      // Obtener información del pedido para determinar quién califica a quién
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
        showToast('❌ Error al obtener información del pedido', 'error')
        return
      }

      let calificadorId = user.id
      let calificadoId = ''

      if (tipo === 'cliente_a_repartidor') {
        calificadorId = pedido.user_id
        calificadoId = pedido.asignaciones_repartidor?.[0]?.repartidor_id || ''
      } else {
        calificadorId = pedido.asignaciones_repartidor?.[0]?.repartidor_id || ''
        calificadoId = pedido.user_id
      }

      if (!calificadoId) {
        showToast('❌ No se pudo determinar a quién calificar', 'error')
        return
      }

      const calificacionData = {
        ...calificacion,
        calificador_id: calificadorId,
        calificado_id: calificadoId
      }

      if (existingCalificacion) {
        // Actualizar calificación existente
        const { error } = await supabase
          .from('calificaciones')
          .update(calificacionData)
          .eq('id', existingCalificacion.id)

        if (error) throw error
        showToast('✅ Calificación actualizada exitosamente', 'success')
      } else {
        // Crear nueva calificación
        const { error } = await supabase
          .from('calificaciones')
          .insert(calificacionData)

        if (error) throw error
        showToast('✅ Calificación enviada exitosamente', 'success')
      }

      setSubmitted(true)
      onCalificacionEnviada?.(calificacion.puntuacion)

    } catch (error) {
      console.error('Error al enviar calificación:', error)
      showToast('❌ Error al enviar la calificación', 'error')
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (puntuacion: number, onChange?: (valor: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => onChange?.(star)}
            disabled={!onChange}
            className={`${
              onChange ? 'hover:scale-110 transition-transform' : 'cursor-default'
            }`}
          >
            <Star
              size={24}
              className={`${
                star <= puntuacion
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  const renderAspectos = () => {
    const aspectos = [
      { key: 'puntualidad', label: 'Puntualidad', icon: Clock },
      { key: 'comunicacion', label: 'Comunicación', icon: MessageCircle },
      { key: 'cuidado', label: 'Cuidado del Pedido', icon: ThumbsUp },
      { key: 'amabilidad', label: 'Amabilidad', icon: User }
    ] as const

    return (
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Calificación por Aspectos</h4>
        {aspectos.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            {renderStars(
              calificacion.aspectos[key] || 0,
              !submitted ? (valor) => handleAspectoChange(key, valor) : undefined
            )}
          </div>
        ))}
      </div>
    )
  }

  const getTitulo = () => {
    if (tipo === 'cliente_a_repartidor') {
      return 'Califica a tu Repartidor'
    }
    return 'Califica a tu Cliente'
  }

  const getDescripcion = () => {
    if (tipo === 'cliente_a_repartidor') {
      return '¿Cómo fue tu experiencia con el repartidor?'
    }
    return '¿Cómo fue tu experiencia con el cliente?'
  }

  if (submitted && existingCalificacion) {
    return (
      <div className={`bg-green-50 border border-green-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <div className="flex justify-center mb-4">
            {renderStars(existingCalificacion.puntuacion)}
          </div>
          <h3 className="text-lg font-semibold text-green-800 mb-2">
            ¡Calificación Enviada!
          </h3>
          <p className="text-green-700 mb-4">
            Gracias por tu calificación de {existingCalificacion.puntuacion} estrellas
          </p>
          {existingCalificacion.comentario && (
            <div className="bg-white rounded-lg p-4 text-left">
              <p className="text-sm text-gray-600 mb-1">Tu comentario:</p>
              <p className="text-gray-900 italic">"{existingCalificacion.comentario}"</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {getTitulo()}
        </h3>
        <p className="text-gray-600">
          {getDescripcion()}
        </p>
      </div>

      {/* Calificación general */}
      <div className="text-center mb-6">
        <h4 className="font-medium text-gray-900 mb-4">Calificación General</h4>
        {renderStars(calificacion.puntuacion, handlePuntuacionChange)}
        <p className="text-sm text-gray-600 mt-2">
          {calificacion.puntuacion === 0 && 'Selecciona una calificación'}
          {calificacion.puntuacion === 1 && 'Muy malo'}
          {calificacion.puntuacion === 2 && 'Malo'}
          {calificacion.puntuacion === 3 && 'Regular'}
          {calificacion.puntuacion === 4 && 'Bueno'}
          {calificacion.puntuacion === 5 && 'Excelente'}
        </p>
      </div>

      {/* Calificación por aspectos */}
      <div className="mb-6">
        {renderAspectos()}
      </div>

      {/* Comentario */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Comentario (opcional)
        </label>
        <textarea
          value={calificacion.comentario}
          onChange={(e) => handleComentarioChange(e.target.value)}
          disabled={submitted}
          placeholder="Cuéntanos sobre tu experiencia..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
          rows={3}
        />
      </div>

      {/* Botón de envío */}
      <div className="text-center">
        <button
          onClick={submitCalificacion}
          disabled={loading || calificacion.puntuacion === 0}
          className="bg-orange-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Enviando...' : 'Enviar Calificación'}
        </button>
      </div>
    </div>
  )
}
