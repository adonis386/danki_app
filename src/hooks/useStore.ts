'use client'

import { useState, useEffect, useCallback } from 'react'
import { storeService } from '@/lib/services/storeService'
import { Store } from '@/types/store'
import { useNotification } from './useNotification'

export function useStore(id: string) {
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  const fetchStore = useCallback(async () => {
    if (!id) {
      setLoading(false)
      return
    }

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
