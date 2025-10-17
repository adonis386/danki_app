'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload, Save } from 'lucide-react'
import { storeSchema, type StoreFormData } from '@/lib/validations/store'
import { useStores } from '@/hooks/useStores'
import { useStore } from '@/hooks/useStores'

interface StoreFormProps {
  storeId?: string | null
  onClose: () => void
  onSuccess: () => void
}

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

export default function StoreForm({ storeId, onClose, onSuccess }: StoreFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!storeId

  const { createStore, updateStore } = useStores()
  const { store: existingStore, loading: loadingStore } = useStore(storeId || '')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<StoreFormData>({
    resolver: zodResolver(storeSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      categoria: '',
      logo_url: '',
      imagen_portada: '',
      rating: 0,
      num_resenas: 0,
      tiempo_entrega: 30,
      costo_envio: 0,
      certificado_calidad: false,
      activo: true,
    },
  })

  // Cargar datos de la tienda si está editando
  useEffect(() => {
    if (isEditing && existingStore) {
      reset({
        nombre: existingStore.nombre,
        descripcion: existingStore.descripcion,
        categoria: existingStore.categoria,
        logo_url: existingStore.logo_url || '',
        imagen_portada: existingStore.imagen_portada || '',
        rating: existingStore.rating,
        num_resenas: existingStore.num_resenas,
        tiempo_entrega: existingStore.tiempo_entrega,
        costo_envio: existingStore.costo_envio,
        certificado_calidad: existingStore.certificado_calidad,
        activo: existingStore.activo,
      })
    }
  }, [isEditing, existingStore, reset])

  const onSubmit = async (data: StoreFormData) => {
    setLoading(true)
    try {
      if (isEditing && storeId) {
        await updateStore(storeId, data)
      } else {
        await createStore(data)
      }
      onSuccess()
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setLoading(false)
    }
  }

  if (isEditing && loadingStore) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando tienda...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Editar Tienda' : 'Nueva Tienda'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label htmlFor="nombre" className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la tienda *
              </label>
              <input
                id="nombre"
                {...register('nombre')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="Ej: Pizza Palace"
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría *
              </label>
              <select
                id="categoria"
                {...register('categoria')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="">Selecciona una categoría</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              {errors.categoria && (
                <p className="text-red-600 text-sm mt-1">{errors.categoria.message}</p>
              )}
            </div>

            {/* Tiempo de entrega */}
            <div>
              <label htmlFor="tiempo_entrega" className="block text-sm font-semibold text-gray-700 mb-2">
                Tiempo de entrega (min) *
              </label>
              <input
                id="tiempo_entrega"
                type="number"
                {...register('tiempo_entrega', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="30"
              />
              {errors.tiempo_entrega && (
                <p className="text-red-600 text-sm mt-1">{errors.tiempo_entrega.message}</p>
              )}
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label htmlFor="descripcion" className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción *
            </label>
            <textarea
              id="descripcion"
              {...register('descripcion')}
              rows={3}
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
              placeholder="Describe tu tienda, especialidades, etc."
            />
            {errors.descripcion && (
              <p className="text-red-600 text-sm mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Logo URL */}
            <div>
              <label htmlFor="logo_url" className="block text-sm font-semibold text-gray-700 mb-2">
                URL del Logo
              </label>
              <input
                id="logo_url"
                type="url"
                {...register('logo_url')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="https://ejemplo.com/logo.jpg"
              />
              {errors.logo_url && (
                <p className="text-red-600 text-sm mt-1">{errors.logo_url.message}</p>
              )}
            </div>

            {/* Imagen de portada */}
            <div>
              <label htmlFor="imagen_portada" className="block text-sm font-semibold text-gray-700 mb-2">
                URL de imagen de portada
              </label>
              <input
                id="imagen_portada"
                type="url"
                {...register('imagen_portada')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="https://ejemplo.com/portada.jpg"
              />
              {errors.imagen_portada && (
                <p className="text-red-600 text-sm mt-1">{errors.imagen_portada.message}</p>
              )}
            </div>
          </div>

          {/* Pricing and Rating */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Costo de envío */}
            <div>
              <label htmlFor="costo_envio" className="block text-sm font-semibold text-gray-700 mb-2">
                Costo de envío ($)
              </label>
              <input
                id="costo_envio"
                type="number"
                step="0.01"
                {...register('costo_envio', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="0.00"
              />
              {errors.costo_envio && (
                <p className="text-red-600 text-sm mt-1">{errors.costo_envio.message}</p>
              )}
            </div>

            {/* Rating */}
            <div>
              <label htmlFor="rating" className="block text-sm font-semibold text-gray-700 mb-2">
                Rating (0-5)
              </label>
              <input
                id="rating"
                type="number"
                step="0.1"
                min="0"
                max="5"
                {...register('rating', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="0.0"
              />
              {errors.rating && (
                <p className="text-red-600 text-sm mt-1">{errors.rating.message}</p>
              )}
            </div>

            {/* Número de reseñas */}
            <div>
              <label htmlFor="num_resenas" className="block text-sm font-semibold text-gray-700 mb-2">
                Número de reseñas
              </label>
              <input
                id="num_resenas"
                type="number"
                {...register('num_resenas', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="0"
              />
              {errors.num_resenas && (
                <p className="text-red-600 text-sm mt-1">{errors.num_resenas.message}</p>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center">
              <input
                id="certificado_calidad"
                type="checkbox"
                {...register('certificado_calidad')}
                className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="certificado_calidad" className="ml-2 text-sm font-semibold text-gray-700">
                Certificado de calidad
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="activo"
                type="checkbox"
                {...register('activo')}
                className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="activo" className="ml-2 text-sm font-semibold text-gray-700">
                Tienda activa
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  {isEditing ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isEditing ? 'Actualizar Tienda' : 'Crear Tienda'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
