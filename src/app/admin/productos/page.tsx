'use client'

import { useState, useMemo } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, Star, StarOff, Package } from 'lucide-react'
import { useProducts, useProductCategories } from '@/hooks/useProducts'
import { ProductFilters } from '@/types/product'
import ProtectedRoute from '@/components/ProtectedRoute'
import ProductForm from '@/components/ProductForm'
import AdminBreadcrumb from '@/components/AdminBreadcrumb'
import { useNotification } from '@/hooks/useNotification'

export default function AdminProductosPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState<string | null>(null)
  const [filters, setFilters] = useState<ProductFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const { showWarning } = useNotification()

  // Memoizar los filtros para evitar recrear el objeto en cada render
  const memoizedFilters = useMemo(() => filters, [
    filters.search,
    filters.categoria_id,
    filters.activo,
    filters.destacado,
    filters.min_precio,
    filters.max_precio,
    filters.tienda_id
  ])

  const {
    products,
    loading,
    error,
    deleteProduct,
    toggleProductStatus,
    toggleProductFeatured,
  } = useProducts(memoizedFilters)

  const { categories } = useProductCategories()

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el producto "${nombre}"?`)) {
      try {
        await deleteProduct(id)
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean, nombre: string) => {
    try {
      await toggleProductStatus(id, !currentStatus)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleToggleFeatured = async (id: string, currentFeatured: boolean, nombre: string) => {
    try {
      await toggleProductFeatured(id, !currentFeatured)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleEdit = (id: string) => {
    setEditingProduct(id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <AdminBreadcrumb currentPage="Gestión de Productos" />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Productos</h1>
              <p className="text-gray-600">Administra todos los productos de la plataforma</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nuevo Producto
            </button>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Estado
                    </label>
                    <select
                      value={filters.activo === undefined ? '' : filters.activo.toString()}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        activo: e.target.value === '' ? undefined : e.target.value === 'true'
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="">Todos los estados</option>
                      <option value="true">Activos</option>
                      <option value="false">Inactivos</option>
                    </select>
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
                      <option value="true">Destacados</option>
                      <option value="false">No destacados</option>
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
                </div>
              </div>
            )}
          </div>

          {/* Products Table */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600 font-semibold">Error: {error}</p>
              </div>
            ) : products.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No se encontraron productos</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Producto</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Tienda</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Categoría</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Precio</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Stock</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {product.imagen_url ? (
                              <img
                                src={product.imagen_url}
                                alt={product.nombre}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <Package className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-gray-900">{product.nombre}</h3>
                              <p className="text-sm text-gray-600 line-clamp-1">{product.descripcion}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {product.tienda?.logo_url && (
                              <img
                                src={product.tienda.logo_url}
                                alt={product.tienda.nombre}
                                className="w-6 h-6 rounded-full object-cover"
                              />
                            )}
                            <span className="text-sm font-medium text-gray-900">
                              {product.tienda?.nombre || 'Sin tienda'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                            {product.categoria?.nombre || 'Sin categoría'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-lg font-bold text-gray-900">
                            ${product.precio.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            product.stock > 10 
                              ? 'bg-green-100 text-green-800' 
                              : product.stock > 0 
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              product.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.activo ? 'Activo' : 'Inactivo'}
                            </span>
                            {product.destacado && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                ⭐ Destacado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(product.id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(product.id, product.activo, product.nombre)}
                              className={`p-2 rounded-lg transition-colors ${
                                product.activo 
                                  ? 'text-orange-600 hover:bg-orange-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={product.activo ? 'Desactivar' : 'Activar'}
                            >
                              {product.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleToggleFeatured(product.id, product.destacado, product.nombre)}
                              className={`p-2 rounded-lg transition-colors ${
                                product.destacado 
                                  ? 'text-yellow-600 hover:bg-yellow-50' 
                                  : 'text-gray-600 hover:bg-gray-50'
                              }`}
                              title={product.destacado ? 'Quitar destacado' : 'Marcar destacado'}
                            >
                              {product.destacado ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(product.id, product.nombre)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Eliminar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <ProductForm
            productId={editingProduct}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
