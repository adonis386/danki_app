'use client'

import { useState, useMemo } from 'react'
import { Search, Filter, Package, Star } from 'lucide-react'
import { useProducts, useProductCategories } from '@/hooks/useProducts'
import { ProductFilters } from '@/types/product'
import AddToCartButton from '@/components/AddToCartButton'
import HomeButton from '@/components/HomeButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

export default function ProductosPage() {
  const [filters, setFilters] = useState<ProductFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  // Memoizar los filtros para evitar recrear el objeto en cada render
  const memoizedFilters = useMemo(() => filters, [
    filters.search,
    filters.categoria_id,
    filters.activo,
    filters.destacado,
    filters.min_precio,
    filters.max_precio
  ])
  
  const { products, loading, error } = useProducts(memoizedFilters)
  const { categories } = useProductCategories()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <Header />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-black text-gray-900 mb-4">Nuestros Productos</h1>
            <p className="text-lg text-gray-600">Descubre los mejores productos de nuestras tiendas</p>
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
                    placeholder="Buscar productos..."
                    value={filters.search || ''}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Category Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Categoría
                    </label>
                    <select
                      value={filters.categoria_id || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        categoria_id: e.target.value || undefined 
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>{category.nombre}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Precio máximo
                    </label>
                    <input
                      type="number"
                      placeholder="Sin límite"
                      value={filters.max_precio || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        max_precio: e.target.value ? Number(e.target.value) : undefined
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Featured Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Destacados
                    </label>
                    <select
                      value={filters.destacado === undefined ? '' : filters.destacado.toString()}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        destacado: e.target.value === '' ? undefined : e.target.value === 'true'
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="">Todos</option>
                      <option value="true">Solo destacados</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold">Error: {error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No se encontraron productos</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:scale-105">
                  {/* Product Image */}
                  <div className="relative h-48 bg-gradient-to-br from-indigo-100 to-purple-100">
                    {product.imagen_url ? (
                      <img
                        src={product.imagen_url}
                        alt={product.nombre}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-16 h-16 text-indigo-400" />
                      </div>
                    )}
                    
                    {/* Featured Badge */}
                    {product.destacado && (
                      <div className="absolute top-3 right-3 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Destacado
                      </div>
                    )}

                    {/* Store Badge */}
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-semibold text-gray-800">
                      {product.tienda?.nombre || 'Tienda'}
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {product.nombre}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {product.descripcion}
                    </p>

                    {/* Category */}
                    {product.categoria && (
                      <div className="mb-4">
                        <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold">
                          {product.categoria.nombre}
                        </span>
                      </div>
                    )}

                    {/* Price and Stock */}
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <span className="text-2xl font-black text-indigo-600">
                          ${product.precio.toFixed(2)}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-semibold ${
                          product.stock > 10 
                            ? 'text-green-600' 
                            : product.stock > 0 
                              ? 'text-yellow-600'
                              : 'text-red-600'
                        }`}>
                          {product.stock > 0 ? `${product.stock} disponibles` : 'Agotado'}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <AddToCartButton 
                      product={product} 
                      className="w-full"
                    />
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
