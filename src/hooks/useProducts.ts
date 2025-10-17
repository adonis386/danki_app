'use client'

import { useState, useEffect, useCallback } from 'react'
import { productService } from '@/lib/services/productService'
import { Product, CreateProductData, UpdateProductData, ProductFilters } from '@/types/product'
import { useNotification } from './useNotification'

export function useProducts(filters?: ProductFilters) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showSuccess, showError } = useNotification()

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProducts(filters)
      setProducts(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar productos', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters?.tienda_id, filters?.categoria_id, filters?.activo, filters?.destacado, filters?.min_precio, filters?.max_precio, filters?.search, showError])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  const createProduct = useCallback(async (productData: CreateProductData) => {
    try {
      const newProduct = await productService.createProduct(productData)
      setProducts(prev => [newProduct, ...prev])
      showSuccess('Producto creado', 'El producto se ha creado exitosamente')
      return newProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al crear producto', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const updateProduct = useCallback(async (id: string, productData: UpdateProductData) => {
    try {
      const updatedProduct = await productService.updateProduct(id, productData)
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ))
      showSuccess('Producto actualizado', 'El producto se ha actualizado exitosamente')
      return updatedProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al actualizar producto', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productService.deleteProduct(id)
      setProducts(prev => prev.filter(product => product.id !== id))
      showSuccess('Producto eliminado', 'El producto se ha eliminado exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al eliminar producto', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const toggleProductStatus = useCallback(async (id: string, activo: boolean) => {
    try {
      const updatedProduct = await productService.toggleProductStatus(id, activo)
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ))
      showSuccess(
        activo ? 'Producto activado' : 'Producto desactivado',
        `El producto ha sido ${activo ? 'activado' : 'desactivado'} exitosamente`
      )
      return updatedProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al cambiar estado', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const toggleProductFeatured = useCallback(async (id: string, destacado: boolean) => {
    try {
      const updatedProduct = await productService.toggleProductFeatured(id, destacado)
      setProducts(prev => prev.map(product => 
        product.id === id ? updatedProduct : product
      ))
      showSuccess(
        destacado ? 'Producto destacado' : 'Producto no destacado',
        `El producto ha sido ${destacado ? 'marcado como destacado' : 'removido de destacados'} exitosamente`
      )
      return updatedProduct
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al cambiar estado destacado', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  return {
    products,
    loading,
    error,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductFeatured,
    refetch: fetchProducts,
  }
}

export function useProduct(id: string) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  const fetchProduct = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await productService.getProductById(id)
      setProduct(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar producto', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id, showError])

  useEffect(() => {
    fetchProduct()
  }, [fetchProduct])

  return {
    product,
    loading,
    error,
    refetch: fetchProduct,
  }
}

export function useProductCategories() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true)
      const data = await productService.getCategories()
      setCategories(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al cargar categorías', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [showError])

  useEffect(() => {
    fetchCategories()
  }, [fetchCategories])

  return {
    categories,
    loading,
    refetch: fetchCategories,
  }
}
