'use client'

import { Star, Bike, Car, Footprints } from 'lucide-react'
import type { Repartidor } from '@/types/tracking'

interface RepartidorCardProps {
  repartidor: Repartidor
  showStats?: boolean
}

export function RepartidorCard({ repartidor, showStats = true }: RepartidorCardProps) {
  const getVehiculoIcono = () => {
    const iconProps = { size: 20, className: 'text-gray-600' }

    const iconos: Record<string, React.ReactNode> = {
      moto: <Bike {...iconProps} />,
      bicicleta: <Bike {...iconProps} />,
      auto: <Car {...iconProps} />,
      a_pie: <Footprints {...iconProps} />,
    }

    return iconos[repartidor.vehiculo_tipo || 'moto'] || <Bike {...iconProps} />
  }

  const getVehiculoNombre = () => {
    const nombres: Record<string, string> = {
      moto: 'Moto',
      bicicleta: 'Bicicleta',
      auto: 'Auto',
      a_pie: 'A pie',
    }

    return nombres[repartidor.vehiculo_tipo || 'moto'] || 'Vehículo'
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-start gap-4">
        {/* Foto del repartidor */}
        <div className="relative h-16 w-16 flex-shrink-0">
          {repartidor.foto_url ? (
            <img
              src={repartidor.foto_url}
              alt={`${repartidor.nombre} ${repartidor.apellido}`}
              className="h-full w-full rounded-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center rounded-full bg-orange-100 text-xl font-semibold text-orange-600">
              {repartidor.nombre.charAt(0)}
              {repartidor.apellido.charAt(0)}
            </div>
          )}

          {/* Indicador de disponibilidad */}
          {repartidor.disponible && (
            <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>

        {/* Información */}
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {repartidor.nombre} {repartidor.apellido}
              </h3>

              {/* Calificación */}
              <div className="mt-1 flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium text-gray-900">
                  {repartidor.calificacion.toFixed(1)}
                </span>
                {showStats && (
                  <span className="text-sm text-gray-500">
                    ({repartidor.num_entregas} entregas)
                  </span>
                )}
              </div>
            </div>

            {/* Estado */}
            {repartidor.disponible && (
              <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-700">
                Disponible
              </span>
            )}
          </div>

          {/* Vehículo */}
          <div className="mt-2 flex items-center gap-2">
            {getVehiculoIcono()}
            <span className="text-sm text-gray-600">{getVehiculoNombre()}</span>
            {repartidor.placa_vehiculo && (
              <span className="text-sm font-medium text-gray-900">
                {repartidor.placa_vehiculo}
              </span>
            )}
          </div>

          {/* Teléfono */}
          {repartidor.telefono && (
            <p className="mt-2 text-sm text-gray-600">
              Tel: {repartidor.telefono}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


