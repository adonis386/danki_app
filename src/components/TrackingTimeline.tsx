'use client'

import { Check, Circle, Clock, Package, Truck, Home, CheckCircle } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { TimelineEvento } from '@/types/tracking'

interface TrackingTimelineProps {
  eventos: TimelineEvento[]
}

export function TrackingTimeline({ eventos }: TrackingTimelineProps) {
  const getIcono = (estado: string, completado: boolean) => {
    const iconProps = {
      size: 24,
      className: completado ? 'text-green-600' : 'text-gray-400',
    }

    const iconos: Record<string, React.ReactNode> = {
      pendiente: <Clock {...iconProps} />,
      confirmado: <CheckCircle {...iconProps} />,
      preparando: <Package {...iconProps} />,
      listo_recoger: <Package {...iconProps} />,
      en_camino: <Truck {...iconProps} />,
      entregado: <Home {...iconProps} />,
      asignado: <Truck {...iconProps} />,
      aceptado: <CheckCircle {...iconProps} />,
      en_camino_tienda: <Truck {...iconProps} />,
      recogido: <Package {...iconProps} />,
      en_camino_cliente: <Truck {...iconProps} />,
    }

    return iconos[estado] || <Circle {...iconProps} />
  }

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

      {/* Eventos */}
      <div className="space-y-6">
        {eventos.map((evento, index) => (
          <div key={index} className="relative flex gap-4">
            {/* Icono */}
            <div
              className={`relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-4 ${
                evento.completado
                  ? 'border-green-100 bg-green-50'
                  : 'border-gray-100 bg-white'
              }`}
            >
              {evento.completado ? (
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600">
                  <Check size={16} className="text-white" />
                </div>
              ) : (
                getIcono(evento.estado, evento.completado)
              )}
            </div>

            {/* Contenido */}
            <div className="flex-1 pt-1">
              <div className="flex items-start justify-between">
                <div>
                  <p
                    className={`text-sm font-medium ${
                      evento.completado ? 'text-gray-900' : 'text-gray-500'
                    }`}
                  >
                    {evento.mensaje}
                  </p>
                  {evento.timestamp && (
                    <p className="mt-1 text-xs text-gray-500">
                      {format(new Date(evento.timestamp), "d 'de' MMMM, h:mm a", {
                        locale: es,
                      })}
                    </p>
                  )}
                </div>
                {evento.completado && (
                  <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                    Completado
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}


