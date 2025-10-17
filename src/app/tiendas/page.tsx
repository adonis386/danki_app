'use client'

import { useState } from 'react'
import { Search, Filter, Store, Star, Clock, MapPin } from 'lucide-react'
import { useStores } from '@/hooks/useStores'
import { StoreCategory, storeCategories } from '@/types/store'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function TiendasPage() {
  const [filters, setFilters] = useState({
    search: '',
    category: 'all' as StoreCategory | 'all',
    active: true,
  })
  const [showFilters, setShowFilters] = useState(false)

  const { stores, loading, error } = useStores()

  const filteredStores = stores.filter(store => {
    if (filters.search && !store.nombre.toLowerCase().includes(filters.search.toLowerCase())) {
      return false
    }
    if (filters.category !== 'all' && store.categoria !== filters.category) {
      return false
    }
    if (filters.active && !store.activo) {
      return false
    }
    return true
  })

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-gray-900 mb-4">Nuestras Tiendas</h1>
            <p className="text-lg text-gray-600">Descubre las mejores tiendas de tu zona</p>
          </div>

          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar tiendas..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              {/* Filter Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-3 bg-gray-100 border-2 border-gray-200 rounded-xl hover:bg-gray-200 transition-colors flex items-center gap-2"
              >
                <Filter className="w-5 h-5" />
                Filtros
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        category: e.target.value as StoreCategory | 'all'
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="all">Todas las categorías</option>
                      {storeCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Active Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={filters.active ? 'active' : 'all'}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        active: e.target.value === 'active'
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="all">Todas</option>
                      <option value="active">Solo activas</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stores Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tiendas...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold">Error: {error}</p>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="text-center py-12">
              <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No se encontraron tiendas</h3>
              <p className="text-gray-600">
                {filters.search || filters.category !== 'all' 
                  ? 'Intenta ajustar los filtros de búsqueda'
                  : 'No hay tiendas disponibles en este momento'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStores.map((store) => (
                <div key={store.id} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {/* Store Image */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100">
                    {store.imagen_portada ? (
                      <img
                        src={store.imagen_portada}
                        alt={store.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Store className="w-16 h-16 text-indigo-400" />
                      </div>
                    )}
                    
                    {/* Store Logo */}
                    {store.logo_url && (
                      <div className="absolute -bottom-6 left-6">
                        <img
                          src={store.logo_url}
                          alt={`Logo de ${store.nombre}`}
                          className="w-16 h-16 rounded-xl border-4 border-white shadow-lg object-cover"
                        />
                      </div>
                    )}

                    {/* Category Badge */}
                    <div className="absolute top-3 right-3">
                      <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-xs font-semibold">
                        {store.categoria}
                      </span>
                    </div>
                  </div>

                  {/* Store Info */}
                  <div className="p-6 pt-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {store.nombre}
                    </h3>
                    {store.descripcion && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {store.descripcion}
                      </p>
                    )}

                    {/* Store Stats */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{store.rating.toFixed(1)}</p>
                          <p className="text-xs text-gray-600">{store.num_resenas} reseñas</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-indigo-500" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{store.tiempo_entrega} min</p>
                          <p className="text-xs text-gray-600">Entrega</p>
                        </div>
                      </div>
                    </div>

                    {/* Store Details */}
                    <div className="space-y-2 mb-6">
                      {store.direccion && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span className="line-clamp-1">{store.direccion}</span>
                        </div>
                      )}
                      
                      {store.telefono && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span>{store.telefono}</span>
                        </div>
                      )}
                    </div>

                    {/* View Store Button */}
                    <a
                      href={`/tiendas/${store.id}`}
                      className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Store className="w-5 h-5" />
                      Ver Tienda
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
