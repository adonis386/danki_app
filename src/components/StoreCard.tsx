import Image from 'next/image'
import Link from 'next/link'
import { Star, Clock, Shield, Sparkles } from 'lucide-react'

interface StoreCardProps {
  id: string
  nombre: string
  descripcion?: string
  logo_url?: string
  imagen_portada?: string
  telefono?: string
  email?: string
  direccion?: string
  rating: number
  num_resenas: number
  tiempo_entrega: number
  costo_envio: number
  certificado_calidad: boolean
  categoria: string
}

export default function StoreCard({
  id,
  nombre,
  descripcion,
  logo_url,
  imagen_portada,
  telefono,
  email,
  direccion,
  rating,
  num_resenas,
  tiempo_entrega,
  costo_envio,
  certificado_calidad,
  categoria,
}: StoreCardProps) {
  return (
    <Link href={`/tiendas/${id}`}>
      <div className="group bg-white rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer border-2 border-gray-100 hover:border-indigo-300 animate-fade-in">
        {/* Imagen de portada con overlay */}
        <div className="relative h-56 overflow-hidden">
          {imagen_portada ? (
            <Image
              src={imagen_portada}
              alt={nombre}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
              <span className="text-white text-4xl font-black tracking-tight">{nombre.charAt(0)}</span>
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          {/* Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
            {certificado_calidad && (
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 shadow-xl backdrop-blur-sm">
                <Sparkles className="w-5 h-5" />
                Premium
              </div>
            )}
            <div className="bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-full text-sm font-bold text-gray-800 shadow-xl">
              {categoria}
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="p-7">
          <div className="mb-4">
            <h3 className="font-black text-2xl text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
              {nombre}
            </h3>
            {descripcion && (
              <p className="text-base text-gray-600 line-clamp-2 leading-relaxed">{descripcion}</p>
            )}
          </div>

          {/* Rating y tiempo */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-yellow-50 px-4 py-2.5 rounded-xl border border-yellow-100">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="font-black text-base text-gray-900">{rating}</span>
              </div>
              <span className="text-sm text-gray-500 font-medium">({num_resenas})</span>
            </div>
            
            <div className="flex items-center gap-2 text-base text-gray-700 bg-indigo-50 px-4 py-2.5 rounded-xl border border-indigo-100">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span className="font-bold">{tiempo_entrega} min</span>
            </div>
          </div>

          {/* Footer con precio de envío */}
          <div className="flex items-center justify-between pt-5 border-t-2 border-gray-100">
            <span className="text-sm text-gray-600 font-semibold">Envío</span>
            <div className="flex items-center gap-2">
              {costo_envio === 0 ? (
                <span className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-lg">
                  GRATIS
                </span>
              ) : (
                <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  ${costo_envio.toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}

