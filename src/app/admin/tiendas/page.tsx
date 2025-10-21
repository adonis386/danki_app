'use client'

import { useState } from 'react'
import { Plus, Search, Filter, Edit, Trash2, Eye, EyeOff, MoreVertical } from 'lucide-react'
import { useStores } from '@/hooks/useStores'
import { StoreFilters } from '@/types/store'
import ProtectedRoute from '@/components/ProtectedRoute'
import StoreForm from '@/components/StoreForm'
import AdminBreadcrumb from '@/components/AdminBreadcrumb'
import { useNotification } from '@/hooks/useNotification'

const categories = [
  'Restaurante',
  'Cafetería',
  'Pizzería',
  'Hamburguesería',
  'Sushi',
  'Mexicana',
  'Italiana',
  'China',
  'Vegetariana',
  'Postres',
  'Bebidas',
  'Supermercado',
  'Farmacia',
  'Otros'
]

export default function AdminTiendasPage() {
  const [showForm, setShowForm] = useState(false)
  const [editingStore, setEditingStore] = useState<string | null>(null)
  const [filters, setFilters] = useState<StoreFilters>({})
  const [showFilters, setShowFilters] = useState(false)
  const { showWarning } = useNotification()

  const {
    stores,
    loading,
    error,
    deleteStore,
    toggleStoreStatus,
  } = useStores(filters)

  const handleDelete = async (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la tienda "${nombre}"?`)) {
      try {
        await deleteStore(id)
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  }

  const handleToggleStatus = async (id: string, currentStatus: boolean, nombre: string) => {
    try {
      await toggleStoreStatus(id, !currentStatus)
    } catch (error) {
      // Error ya manejado en el hook
    }
  }

  const handleEdit = (id: string) => {
    setEditingStore(id)
    setShowForm(true)
  }

  const handleCloseForm = () => {
    setShowForm(false)
    setEditingStore(null)
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumb */}
          <AdminBreadcrumb currentPage="Gestión de Tiendas" />
          
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Tiendas</h1>
              <p className="text-gray-600">Administra todas las tiendas de la plataforma</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 md:mt-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Nueva Tienda
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
                    placeholder="Buscar tiendas..."
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
                      value={filters.categoria || ''}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        categoria: e.target.value || undefined 
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="">Todas las categorías</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
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
                      <option value="true">Activas</option>
                      <option value="false">Inactivas</option>
                    </select>
                  </div>

                  {/* Quality Filter */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Calidad
                    </label>
                    <select
                      value={filters.certificado_calidad === undefined ? '' : filters.certificado_calidad.toString()}
                      onChange={(e) => setFilters(prev => ({ 
                        ...prev, 
                        certificado_calidad: e.target.value === '' ? undefined : e.target.value === 'true'
                      }))}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                    >
                      <option value="">Todas</option>
                      <option value="true">Certificadas</option>
                      <option value="false">No certificadas</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Stores Table */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando tiendas...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <p className="text-red-600 font-semibold">Error: {error}</p>
              </div>
            ) : stores.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-gray-600">No se encontraron tiendas</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Tienda</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Categoría</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Rating</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Tiempo</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Estado</th>
                      <th className="px-6 py-4 text-left text-sm font-bold text-gray-900">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {stores.map((store) => (
                      <tr key={store.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {store.logo_url ? (
                              <img
                                src={store.logo_url}
                                alt={store.nombre}
                                className="w-12 h-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {store.nombre.charAt(0)}
                                </span>
                              </div>
                            )}
                            <div>
                              <h3 className="font-bold text-gray-900">{store.nombre}</h3>
                              <p className="text-sm text-gray-600 line-clamp-1">{store.descripcion}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-semibold">
                            {store.categoria}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span className="font-semibold">{store.rating.toFixed(1)}</span>
                            <span className="text-gray-500 text-sm">({store.num_resenas})</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-900 font-semibold">{store.tiempo_entrega} min</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              store.activo 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {store.activo ? 'Activa' : 'Inactiva'}
                            </span>
                            {store.certificado_calidad && (
                              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                ★ Premium
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(store.id)}
                              className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleToggleStatus(store.id, store.activo, store.nombre)}
                              className={`p-2 rounded-lg transition-colors ${
                                store.activo 
                                  ? 'text-orange-600 hover:bg-orange-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={store.activo ? 'Desactivar' : 'Activar'}
                            >
                              {store.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                            <button
                              onClick={() => handleDelete(store.id, store.nombre)}
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

        {/* Store Form Modal */}
        {showForm && (
          <StoreForm
            storeId={editingStore}
            onClose={handleCloseForm}
            onSuccess={handleCloseForm}
          />
        )}
      </div>
    </ProtectedRoute>
  )
}
