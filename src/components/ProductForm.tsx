'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X, Upload, Save, Package } from 'lucide-react'
import { productSchema, type ProductFormData } from '@/lib/validations/product'
import { useProducts, useProductCategories } from '@/hooks/useProducts'
import { useProduct } from '@/hooks/useProducts'
import { useStores } from '@/hooks/useStores'

interface ProductFormProps {
  productId?: string | null
  onClose: () => void
  onSuccess: () => void
}

export default function ProductForm({ productId, onClose, onSuccess }: ProductFormProps) {
  const [loading, setLoading] = useState(false)
  const isEditing = !!productId

  const { createProduct, updateProduct } = useProducts()
  const { product: existingProduct, loading: loadingProduct } = useProduct(productId || '')
  const { categories } = useProductCategories()
  const { stores } = useStores()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: 0,
      imagen_url: '',
      stock: 0,
      activo: true,
      destacado: false,
      tienda_id: '',
      categoria_id: '',
    },
  })

  // Cargar datos del producto si está editando
  useEffect(() => {
    if (isEditing && existingProduct) {
      reset({
        nombre: existingProduct.nombre,
        descripcion: existingProduct.descripcion,
        precio: existingProduct.precio,
        imagen_url: existingProduct.imagen_url || '',
        stock: existingProduct.stock,
        activo: existingProduct.activo,
        destacado: existingProduct.destacado,
        tienda_id: existingProduct.tienda_id,
        categoria_id: existingProduct.categoria_id || '',
      })
    }
  }, [isEditing, existingProduct, reset])

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true)
    try {
      if (isEditing && productId) {
        await updateProduct(productId, data)
      } else {
        await createProduct(data)
      }
      onSuccess()
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setLoading(false)
    }
  }

  if (isEditing && loadingProduct) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando producto...</p>
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
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
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
                Nombre del producto *
              </label>
              <input
                id="nombre"
                {...register('nombre')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="Ej: Pizza Margherita"
              />
              {errors.nombre && (
                <p className="text-red-600 text-sm mt-1">{errors.nombre.message}</p>
              )}
            </div>

            {/* Tienda */}
            <div>
              <label htmlFor="tienda_id" className="block text-sm font-semibold text-gray-700 mb-2">
                Tienda *
              </label>
              <select
                id="tienda_id"
                {...register('tienda_id')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="">Selecciona una tienda</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.nombre}</option>
                ))}
              </select>
              {errors.tienda_id && (
                <p className="text-red-600 text-sm mt-1">{errors.tienda_id.message}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label htmlFor="categoria_id" className="block text-sm font-semibold text-gray-700 mb-2">
                Categoría
              </label>
              <select
                id="categoria_id"
                {...register('categoria_id')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
              >
                <option value="">Sin categoría</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.nombre}</option>
                ))}
              </select>
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
              placeholder="Describe el producto, ingredientes, etc."
            />
            {errors.descripcion && (
              <p className="text-red-600 text-sm mt-1">{errors.descripcion.message}</p>
            )}
          </div>

          {/* Pricing and Stock */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Precio */}
            <div>
              <label htmlFor="precio" className="block text-sm font-semibold text-gray-700 mb-2">
                Precio ($) *
              </label>
              <input
                id="precio"
                type="number"
                step="0.01"
                min="0"
                {...register('precio', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="0.00"
              />
              {errors.precio && (
                <p className="text-red-600 text-sm mt-1">{errors.precio.message}</p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label htmlFor="stock" className="block text-sm font-semibold text-gray-700 mb-2">
                Stock
              </label>
              <input
                id="stock"
                type="number"
                min="0"
                {...register('stock', { valueAsNumber: true })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="0"
              />
              {errors.stock && (
                <p className="text-red-600 text-sm mt-1">{errors.stock.message}</p>
              )}
            </div>

            {/* Imagen URL */}
            <div>
              <label htmlFor="imagen_url" className="block text-sm font-semibold text-gray-700 mb-2">
                URL de imagen
              </label>
              <input
                id="imagen_url"
                type="url"
                {...register('imagen_url')}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              {errors.imagen_url && (
                <p className="text-red-600 text-sm mt-1">{errors.imagen_url.message}</p>
              )}
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex items-center">
              <input
                id="activo"
                type="checkbox"
                {...register('activo')}
                className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="activo" className="ml-2 text-sm font-semibold text-gray-700">
                Producto activo
              </label>
            </div>

            <div className="flex items-center">
              <input
                id="destacado"
                type="checkbox"
                {...register('destacado')}
                className="w-5 h-5 text-indigo-600 bg-gray-100 border-gray-300 rounded focus:ring-indigo-500 focus:ring-2"
              />
              <label htmlFor="destacado" className="ml-2 text-sm font-semibold text-gray-700">
                Producto destacado
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
                  {isEditing ? 'Actualizar Producto' : 'Crear Producto'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
