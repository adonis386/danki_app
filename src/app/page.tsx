import Header from '@/components/Header'
import StoreCard from '@/components/StoreCard'
import { createClient } from '@/lib/supabase/server'
import { Sparkles, Zap, Shield } from 'lucide-react'

export default async function Home() {
  const supabase = await createClient()
  
  const { data: tiendas } = await supabase
    .from('tiendas')
    .select('*')
    .eq('activo', true)
    .order('rating', { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <Header />
      
      <main className="container mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 px-6 py-3 rounded-full mb-6 shadow-sm">
            <Zap className="w-5 h-5 text-indigo-600" />
            <span className="text-base font-bold text-indigo-900">Delivery Express en minutos</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black mb-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
            Descubre las mejores tiendas
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Pedidos frescos y rápidos directamente a tu puerta. Más de 100+ opciones disponibles.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-indigo-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">100+</p>
                <p className="text-base text-gray-600 font-medium">Tiendas Premium</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-indigo-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">15-30</p>
                <p className="text-base text-gray-600 font-medium">Min de entrega</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 border-2 border-indigo-100 shadow-xl hover:shadow-2xl transition-all hover:scale-105">
            <div className="flex items-center gap-4 mb-3">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-3xl font-black text-gray-900">4.8★</p>
                <p className="text-base text-gray-600 font-medium">Rating promedio</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tiendas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <span className="w-1.5 h-10 bg-gradient-to-b from-indigo-600 to-purple-600 rounded-full"></span>
              Tiendas disponibles
            </h2>
            <button className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-200 flex items-center gap-2">
              <span>Ver todas</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
          </div>

          {tiendas && tiendas.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {tiendas.map((tienda) => (
                <StoreCard
                  key={tienda.id}
                  id={tienda.id}
                  nombre={tienda.nombre}
                  descripcion={tienda.descripcion}
                  logo_url={tienda.logo_url}
                  imagen_portada={tienda.imagen_portada}
                  rating={tienda.rating}
                  num_resenas={tienda.num_resenas}
                  tiempo_entrega={tienda.tiempo_entrega || 60}
                  costo_envio={tienda.costo_envio}
                  certificado_calidad={tienda.certificado_calidad}
                  categoria={tienda.categoria || 'Tienda'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No hay tiendas disponibles en este momento</p>
              <p className="text-sm text-gray-500 mt-1">Vuelve pronto para más opciones</p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-20">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="inline-block mb-4">
              <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Danki
              </span>
            </div>
            <p className="text-gray-400 mb-6">Tu delivery express de confianza</p>
            <div className="flex items-center justify-center gap-6 text-sm text-gray-500">
              <a href="#" className="hover:text-white transition-colors">Términos</a>
              <a href="#" className="hover:text-white transition-colors">Privacidad</a>
              <a href="#" className="hover:text-white transition-colors">Contacto</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
