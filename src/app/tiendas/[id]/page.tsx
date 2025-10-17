'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MapPin, Phone, Clock, Star, Package, ShoppingBag, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { useProducts } from '@/hooks/useProducts'
import { useStore } from '@/hooks/useStore'
import AddToCartButton from '@/components/AddToCartButton'
import HomeButton from '@/components/HomeButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

export default function TiendaPage() {
  const params = useParams()
  const storeId = params.id as string
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const { store, loading: storeLoading, error: storeError } = useStore(storeId)
  
  // Memoizar los filtros para evitar recrear el objeto en cada render
  const productFilters = useMemo(() => ({
    tienda_id: storeId,
    // No usar categoria_id aquí, filtraremos por nombre en el componente
  }), [storeId])
  
  const { products: allProducts, loading: productsLoading } = useProducts(productFilters)

  // Filtrar productos por categoría seleccionada
  const products = useMemo(() => {
    if (selectedCategory === 'all') {
      return allProducts
    }
    return allProducts.filter(p => p.categoria?.nombre === selectedCategory)
  }, [allProducts, selectedCategory])

  if (storeLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tienda...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (storeError || (!storeLoading && !store)) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Tienda no encontrada</h1>
              <p className="text-gray-600 mb-6">La tienda que buscas no existe o ha sido eliminada</p>
              <Link
                href="/tiendas"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                Ver todas las tiendas
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  // Obtener categorías únicas de los productos
  const categories = Array.from(new Set(allProducts.map(p => p.categoria?.nombre).filter(Boolean)))

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <Header />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-black text-gray-900">{store!.nombre}</h1>
                <p className="text-lg text-gray-600">Explora los productos de esta tienda</p>
              </div>
            </div>
            <HomeButton />
          </div>

          {/* Store Info */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-8 mb-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Store Image */}
              <div className="relative">
                {store!.imagen_portada ? (
                  <img
                    src={store!.imagen_portada}
                    alt={store!.nombre}
                    className="w-full h-64 object-cover rounded-xl"
                  />
                ) : (
                  <div className="w-full h-64 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center">
                    <Package className="w-24 h-24 text-indigo-400" />
                  </div>
                )}
                
                {/* Store Logo */}
                {store!.logo_url && (
                  <div className="absolute -bottom-6 left-6">
                    <img
                      src={store!.logo_url}
                      alt={`Logo de ${store!.nombre}`}
                      className="w-24 h-24 rounded-xl border-4 border-white shadow-lg object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Store Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">{store!.nombre}</h2>
                  {store!.descripcion && (
                    <p className="text-gray-600 mb-4">{store!.descripcion}</p>
                  )}
                </div>

                {/* Store Stats */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="font-semibold text-gray-900">Rating</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{store!.rating.toFixed(1)}</p>
                    <Link 
                      href={`/tiendas/${storeId}/reviews`}
                      className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                    >
                      {store!.num_resenas} reseñas
                    </Link>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <span className="font-semibold text-gray-900">Entrega</span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900">{store!.tiempo_entrega} min</p>
                    <p className="text-sm text-gray-600">Tiempo estimado</p>
                  </div>
                </div>

                {/* Store Info */}
                <div className="space-y-3">
                  {store!.direccion && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{store!.direccion}</span>
                    </div>
                  )}
                  
                  {store!.telefono && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-700">{store!.telefono}</span>
                    </div>
                  )}
                </div>

                {/* Delivery Info */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    <span className="font-semibold text-blue-900">Información de Entrega</span>
                  </div>
                  <p className="text-blue-800 text-sm">
                    Tiempo de entrega: <strong>{store!.tiempo_entrega} minutos</strong>
                  </p>
                  <p className="text-blue-800 text-sm">
                    Costo de envío: <strong>${store!.costo_envio.toFixed(2)}</strong>
                  </p>
                </div>

                {/* Reviews Link */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900">Reseñas de Clientes</h4>
                        <p className="text-sm text-gray-600">
                          {store!.num_resenas} reseña{store!.num_resenas !== 1 ? 's' : ''} • {store!.rating.toFixed(1)} ⭐ promedio
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/tiendas/${storeId}/reviews`}
                      className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all text-sm"
                    >
                      Ver Reseñas
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Filter */}
          {categories.length > 0 && (
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                    selectedCategory === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Todas ({products.length})
                </button>
                {categories.map((category) => {
                  const count = allProducts.filter(p => p.categoria?.nombre === category).length
                  return (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category || 'all')}
                      className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                        selectedCategory === category
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category} ({count})
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Products Grid */}
          {productsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando productos...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay productos</h3>
              <p className="text-gray-600">
                {selectedCategory === 'all' 
                  ? 'Esta tienda no tiene productos disponibles'
                  : `No hay productos en la categoría "${selectedCategory}"`
                }
              </p>
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
        
        {/* Floating Home Button */}
        <HomeButton variant="floating" />
      </div>
    </ProtectedRoute>
  )
}
