'use client'

import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Clock, AlertCircle, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import { useTrackingPedido, useUbicacionRepartidor } from '@/hooks/useTracking'
import { TrackingTimeline } from '@/components/TrackingTimeline'
import { RepartidorCard } from '@/components/RepartidorCard'
import { TrackingMap } from '@/components/TrackingMap'

export default function TrackingPage() {
  const params = useParams()
  const router = useRouter()
  const pedidoId = params?.id as string

  const { pedidoTracking, loading, error, refetch } = useTrackingPedido(pedidoId)

  const { ubicacion: ubicacionRepartidor } = useUbicacionRepartidor(
    pedidoTracking?.repartidor?.id || null
  )

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Cargando tracking...</p>
        </div>
      </div>
    )
  }

  if (error || !pedidoTracking) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="max-w-md text-center">
          <AlertCircle size={64} className="mx-auto mb-4 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-gray-900">
            Error al cargar tracking
          </h2>
          <p className="mb-6 text-gray-600">
            {error || 'No se pudo obtener la información del pedido'}
          </p>
          <button
            onClick={() => router.push('/pedidos')}
            className="rounded-lg bg-orange-600 px-6 py-3 font-medium text-white hover:bg-orange-700"
          >
            Volver a pedidos
          </button>
        </div>
      </div>
    )
  }

  const coordenadasRepartidor = ubicacionRepartidor
    ? { lat: Number(ubicacionRepartidor.latitud), lng: Number(ubicacionRepartidor.longitud) }
    : null

  const coordenadasDestino =
    pedidoTracking.tracking[0]?.latitud_destino &&
    pedidoTracking.tracking[0]?.longitud_destino
      ? {
          lat: Number(pedidoTracking.tracking[0].latitud_destino),
          lng: Number(pedidoTracking.tracking[0].longitud_destino),
        }
      : null

  const ultimoTracking = pedidoTracking.tracking[pedidoTracking.tracking.length - 1]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-4xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/pedidos"
                className="rounded-lg p-2 hover:bg-gray-100"
              >
                <ArrowLeft size={24} />
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Seguimiento de Pedido
                </h1>
                <p className="text-sm text-gray-600">
                  Pedido #{pedidoId.slice(0, 8)}
                </p>
              </div>
            </div>

            <button
              onClick={refetch}
              className="rounded-lg p-2 hover:bg-gray-100"
              title="Actualizar"
            >
              <RefreshCw size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Contenido */}
      <div className="mx-auto max-w-4xl px-4 py-6">
        <div className="space-y-6">
          {/* Estado Actual */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-center gap-3">
              <Clock size={24} className="text-orange-600" />
              <div>
                <p className="font-semibold text-orange-900">
                  {ultimoTracking.mensaje || 'Estado actual del pedido'}
                </p>
                <p className="text-sm text-orange-700">
                  {getEstadoDescripcion(pedidoTracking.estado_actual)}
                </p>
              </div>
            </div>
          </div>

          {/* Mapa de Tracking */}
          <TrackingMap
            ubicacionRepartidor={coordenadasRepartidor}
            ubicacionDestino={coordenadasDestino}
            distanciaKm={ultimoTracking.distancia_restante_km}
            tiempoEstimadoMin={ultimoTracking.tiempo_estimado_minutos}
          />

          {/* Información del Repartidor */}
          {pedidoTracking.repartidor && (
            <div>
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Tu Repartidor
              </h2>
              <RepartidorCard repartidor={pedidoTracking.repartidor} />
            </div>
          )}

          {/* Timeline de Estados */}
          <div>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Historial del Pedido
            </h2>
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <TrackingTimeline eventos={pedidoTracking.timeline} />
            </div>
          </div>

          {/* Información Adicional */}
          {pedidoTracking.asignacion && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 font-semibold text-gray-900">
                Detalles de la Entrega
              </h3>
              <div className="grid gap-3 text-sm">
                {pedidoTracking.asignacion.distancia_km && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distancia total:</span>
                    <span className="font-medium text-gray-900">
                      {pedidoTracking.asignacion.distancia_km} km
                    </span>
                  </div>
                )}
                {pedidoTracking.asignacion.tiempo_estimado_minutos && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo estimado:</span>
                    <span className="font-medium text-gray-900">
                      {pedidoTracking.asignacion.tiempo_estimado_minutos} min
                    </span>
                  </div>
                )}
                {pedidoTracking.asignacion.tiempo_real_minutos && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tiempo real:</span>
                    <span className="font-medium text-gray-900">
                      {pedidoTracking.asignacion.tiempo_real_minutos} min
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Botón de ayuda */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 text-center">
            <p className="mb-3 text-sm text-gray-600">
              ¿Tienes algún problema con tu pedido?
            </p>
            <button className="rounded-lg bg-orange-600 px-6 py-2 font-medium text-white hover:bg-orange-700">
              Contactar Soporte
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function getEstadoDescripcion(estado: string): string {
  const descripciones: Record<string, string> = {
    pendiente: 'Esperando confirmación de la tienda',
    confirmado: 'La tienda está preparando tu pedido',
    preparando: 'Tu pedido está siendo preparado',
    listo_recoger: 'Esperando que el repartidor recoja el pedido',
    en_camino: 'El repartidor está en camino a tu ubicación',
    entregado: 'Tu pedido ha sido entregado exitosamente',
    cancelado: 'Este pedido fue cancelado',
  }

  return descripciones[estado] || estado
}


