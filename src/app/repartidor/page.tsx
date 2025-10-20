'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  Package, 
  CheckCircle, 
  Clock, 
  MapPin, 
  Phone,
  Navigation,
  AlertCircle,
  TrendingUp,
  Star,
  ArrowLeft
} from 'lucide-react'
import { trackingService } from '@/lib/services/trackingService'
import type { AsignacionRepartidor, Repartidor, EstadisticasRepartidor } from '@/types/tracking'

export default function RepartidorDashboard() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null)
  const [asignaciones, setAsignaciones] = useState<AsignacionRepartidor[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadisticasRepartidor | null>(null)
  const [disponible, setDisponible] = useState(false)
  const [actualizandoUbicacion, setActualizandoUbicacion] = useState(false)

  useEffect(() => {
    verificarRepartidor()
  }, [])

  const verificarRepartidor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      // Obtener datos del repartidor
      const { data: repartidorData, error } = await supabase
        .from('repartidores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !repartidorData) {
        // No es repartidor, redirigir
        router.push('/')
        return
      }

      setRepartidor(repartidorData)
      setDisponible(repartidorData.disponible)
      
      // Cargar asignaciones activas
      await cargarAsignaciones(repartidorData.id)
      
      // Cargar estadísticas
      await cargarEstadisticas(repartidorData.id)
      
    } catch (error) {
      console.error('Error al verificar repartidor:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const cargarAsignaciones = async (repartidorId: string) => {
    try {
      const asignacionesData = await trackingService.getAsignacionesByRepartidor(repartidorId)
      
      // Filtrar solo asignaciones activas
      const activas = asignacionesData.filter(a => 
        !['entregado', 'rechazado'].includes(a.estado)
      )
      
      setAsignaciones(activas)
    } catch (error) {
      console.error('Error al cargar asignaciones:', error)
    }
  }

  const cargarEstadisticas = async (repartidorId: string) => {
    try {
      const { data, error } = await supabase
        .from('asignaciones_repartidor')
        .select('*')
        .eq('repartidor_id', repartidorId)

      if (error) throw error

      const total = data.length
      const completadas = data.filter(a => a.estado === 'entregado').length
      const hoy = data.filter(a => {
        const fecha = new Date(a.created_at)
        const hoyDate = new Date()
        return fecha.toDateString() === hoyDate.toDateString()
      }).length

      setEstadisticas({
        total_entregas: completadas,
        entregas_hoy: hoy,
        calificacion_promedio: repartidor?.calificacion || 0,
        tiempo_promedio_minutos: 30,
        distancia_total_km: 0,
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const toggleDisponibilidad = async () => {
    if (!repartidor) return

    try {
      const nuevoEstado = !disponible
      await trackingService.toggleDisponibilidad(repartidor.id, nuevoEstado)
      setDisponible(nuevoEstado)
      
      if (nuevoEstado) {
        // Iniciar actualización de ubicación
        iniciarActualizacionUbicacion()
      } else {
        // Detener actualización
        setActualizandoUbicacion(false)
      }
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error)
    }
  }

  const iniciarActualizacionUbicacion = () => {
    if (!navigator.geolocation) {
      alert('Tu navegador no soporta geolocalización')
      return
    }

    setActualizandoUbicacion(true)

    // Actualizar ubicación cada 30 segundos
    const intervalId = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          if (repartidor) {
            try {
              await trackingService.createUbicacion({
                repartidor_id: repartidor.id,
                latitud: position.coords.latitude,
                longitud: position.coords.longitude,
                velocidad: position.coords.speed || undefined,
                direccion: position.coords.heading || undefined,
                precision_metros: position.coords.accuracy,
              })
            } catch (error) {
              console.error('Error al actualizar ubicación:', error)
            }
          }
        },
        (error) => {
          console.error('Error al obtener ubicación:', error)
        }
      )
    }, 30000)

    // Guardar interval ID para limpiarlo después
    return () => clearInterval(intervalId)
  }

  const aceptarPedido = async (asignacionId: string) => {
    try {
      await trackingService.aceptarPedido(asignacionId)
      
      // Actualizar tracking del pedido
      const asignacion = asignaciones.find(a => a.id === asignacionId)
      if (asignacion) {
        await trackingService.updateTracking(asignacion.pedido_id, {
          estado: 'confirmado',
          mensaje: 'El repartidor aceptó tu pedido',
        })
      }
      
      // Recargar asignaciones
      if (repartidor) {
        await cargarAsignaciones(repartidor.id)
      }
    } catch (error) {
      console.error('Error al aceptar pedido:', error)
      alert('Error al aceptar el pedido')
    }
  }

  const marcarRecogido = async (asignacionId: string, pedidoId: string) => {
    try {
      await trackingService.marcarRecogido(asignacionId)
      await trackingService.updateTracking(pedidoId, {
        estado: 'en_camino',
        mensaje: 'El repartidor recogió tu pedido y está en camino',
      })
      
      if (repartidor) {
        await cargarAsignaciones(repartidor.id)
      }
    } catch (error) {
      console.error('Error al marcar como recogido:', error)
      alert('Error al actualizar el estado')
    }
  }

  const marcarEntregado = async (asignacionId: string, pedidoId: string) => {
    try {
      await trackingService.marcarEntregado(asignacionId)
      await trackingService.updateTracking(pedidoId, {
        estado: 'entregado',
        mensaje: '¡Tu pedido ha sido entregado!',
      })
      
      if (repartidor) {
        await cargarAsignaciones(repartidor.id)
        await cargarEstadisticas(repartidor.id)
      }
    } catch (error) {
      console.error('Error al marcar como entregado:', error)
      alert('Error al finalizar la entrega')
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!repartidor) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/')}
                className="rounded-lg p-2 hover:bg-gray-100"
                title="Volver al inicio"
              >
                <ArrowLeft size={24} />
              </button>
              {repartidor.foto_url ? (
                <img
                  src={repartidor.foto_url}
                  alt={repartidor.nombre}
                  className="h-12 w-12 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
                  <span className="text-lg font-bold text-orange-600">
                    {repartidor.nombre[0]}
                  </span>
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {repartidor.nombre} {repartidor.apellido}
                </h1>
                <p className="text-sm text-gray-600">
                  {repartidor.vehiculo_tipo || 'Repartidor'}
                </p>
              </div>
            </div>

            {/* Toggle Disponibilidad */}
            <button
              onClick={toggleDisponibilidad}
              className={`flex items-center gap-2 rounded-lg px-6 py-3 font-medium transition-colors ${
                disponible
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              {disponible ? (
                <>
                  <CheckCircle size={20} />
                  Disponible
                </>
              ) : (
                <>
                  <AlertCircle size={20} />
                  No Disponible
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* Estadísticas */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entregas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas?.entregas_hoy || 0}
                </p>
              </div>
              <TrendingUp size={32} className="text-orange-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Entregas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {estadisticas?.total_entregas || 0}
                </p>
              </div>
              <Package size={32} className="text-blue-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Calificación</p>
                <p className="text-2xl font-bold text-gray-900">
                  {repartidor.calificacion.toFixed(1)}
                </p>
              </div>
              <Star size={32} className="text-yellow-600" />
            </div>
          </div>

          <div className="rounded-lg bg-white p-4 shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {asignaciones.length}
                </p>
              </div>
              <Clock size={32} className="text-green-600" />
            </div>
          </div>
        </div>

        {/* Pedidos Asignados */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-bold text-gray-900">
            Pedidos Asignados
          </h2>

          {asignaciones.length === 0 ? (
            <div className="py-12 text-center">
              <Package size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No tienes pedidos asignados</p>
              <p className="mt-2 text-sm text-gray-500">
                {disponible
                  ? 'Esperando nuevos pedidos...'
                  : 'Activa tu disponibilidad para recibir pedidos'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {asignaciones.map((asignacion) => (
                <div
                  key={asignacion.id}
                  className="rounded-lg border border-gray-200 p-4 hover:border-orange-300"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-2">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          asignacion.estado === 'asignado'
                            ? 'bg-yellow-100 text-yellow-800'
                            : asignacion.estado === 'aceptado'
                            ? 'bg-blue-100 text-blue-800'
                            : asignacion.estado === 'recogido'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {getEstadoTexto(asignacion.estado)}
                        </span>
                        <span className="text-sm text-gray-600">
                          Pedido #{asignacion.pedido_id.slice(0, 8)}
                        </span>
                      </div>

                      <div className="space-y-2 text-sm">
                        {asignacion.distancia_km && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <MapPin size={16} />
                            <span>{asignacion.distancia_km} km</span>
                          </div>
                        )}
                        {asignacion.tiempo_estimado_minutos && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock size={16} />
                            <span>{asignacion.tiempo_estimado_minutos} min estimados</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex gap-2">
                      {asignacion.estado === 'asignado' && (
                        <button
                          onClick={() => aceptarPedido(asignacion.id)}
                          className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                        >
                          Aceptar
                        </button>
                      )}
                      
                      {asignacion.estado === 'aceptado' && (
                        <button
                          onClick={() => marcarRecogido(asignacion.id, asignacion.pedido_id)}
                          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                        >
                          Marcar Recogido
                        </button>
                      )}
                      
                      {(asignacion.estado === 'recogido' || asignacion.estado === 'en_camino_cliente') && (
                        <button
                          onClick={() => marcarEntregado(asignacion.id, asignacion.pedido_id)}
                          className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-medium text-white hover:bg-orange-700"
                        >
                          Marcar Entregado
                        </button>
                      )}

                      <button
                        onClick={() => router.push(`/pedidos/${asignacion.pedido_id}/tracking`)}
                        className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getEstadoTexto(estado: string): string {
  const estados: Record<string, string> = {
    asignado: 'Nuevo Pedido',
    aceptado: 'Aceptado',
    rechazado: 'Rechazado',
    en_camino_tienda: 'En camino a tienda',
    recogido: 'Recogido',
    en_camino_cliente: 'En camino al cliente',
    entregado: 'Entregado',
  }
  return estados[estado] || estado
}

