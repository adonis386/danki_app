'use client'

import { useState, useEffect, useCallback } from 'react'
import { storeService } from '@/lib/services/storeService'
import { Store, CreateStoreData, UpdateStoreData, StoreFilters } from '@/types/store'
import { useNotification } from './useNotification'

export function useStores(filters?: StoreFilters) {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showSuccess, showError } = useNotification()

  const fetchStores = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await storeService.getStores(filters)
      setStores(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar tiendas', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters, showError])

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  const createStore = useCallback(async (storeData: CreateStoreData) => {
    try {
      const newStore = await storeService.createStore(storeData)
      setStores(prev => [newStore, ...prev])
      showSuccess('Tienda creada', 'La tienda se ha creado exitosamente')
      return newStore
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al crear tienda', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const updateStore = useCallback(async (id: string, storeData: UpdateStoreData) => {
    try {
      const updatedStore = await storeService.updateStore(id, storeData)
      setStores(prev => prev.map(store => 
        store.id === id ? updatedStore : store
      ))
      showSuccess('Tienda actualizada', 'La tienda se ha actualizado exitosamente')
      return updatedStore
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al actualizar tienda', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const deleteStore = useCallback(async (id: string) => {
    try {
      await storeService.deleteStore(id)
      setStores(prev => prev.filter(store => store.id !== id))
      showSuccess('Tienda eliminada', 'La tienda se ha eliminado exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al eliminar tienda', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const toggleStoreStatus = useCallback(async (id: string, activo: boolean) => {
    try {
      const updatedStore = await storeService.toggleStoreStatus(id, activo)
      setStores(prev => prev.map(store => 
        store.id === id ? updatedStore : store
      ))
      showSuccess(
        activo ? 'Tienda activada' : 'Tienda desactivada',
        `La tienda ha sido ${activo ? 'activada' : 'desactivada'} exitosamente`
      )
      return updatedStore
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al cambiar estado', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  return {
    stores,
    loading,
    error,
    createStore,
    updateStore,
    deleteStore,
    toggleStoreStatus,
    refetch: fetchStores,
  }
}

export function useStore(id: string) {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  const fetchStore = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await storeService.getStoreById(id)
      setStore(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar tienda', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id, showError])

  useEffect(() => {
    fetchStore()
  }, [fetchStore])

  return {
    store,
    loading,
    error,
    refetch: fetchStore,
  }
}
