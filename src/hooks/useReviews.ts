'use client'

import { useState, useEffect, useCallback } from 'react'
import { reviewService } from '@/lib/services/reviewService'
import { 
  Review, 
  CreateReviewData, 
  UpdateReviewData, 
  ReviewFilters, 
  ReviewStats,
  CreateReviewVoteData,
  CreateReviewResponseData
} from '@/types/review'
import { useNotification } from './useNotification'

export function useReviews(filters?: ReviewFilters) {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showSuccess, showError } = useNotification()

  const fetchReviews = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await reviewService.getReviews(filters)
      setReviews(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar reseñas', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters?.tienda_id, filters?.user_id, filters?.rating, filters?.min_rating, filters?.max_rating, filters?.fecha_desde, filters?.fecha_hasta, filters?.con_respuesta, showError])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  const createReview = useCallback(async (reviewData: CreateReviewData) => {
    try {
      const newReview = await reviewService.createReview(reviewData)
      setReviews(prev => [newReview, ...prev])
      showSuccess('Reseña creada', 'Tu reseña se ha publicado exitosamente')
      return newReview
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al crear reseña', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const updateReview = useCallback(async (id: string, reviewData: UpdateReviewData) => {
    try {
      const updatedReview = await reviewService.updateReview(id, reviewData)
      setReviews(prev => prev.map(review => 
        review.id === id ? updatedReview : review
      ))
      showSuccess('Reseña actualizada', 'Tu reseña se ha actualizado exitosamente')
      return updatedReview
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al actualizar reseña', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const deleteReview = useCallback(async (id: string) => {
    try {
      await reviewService.deleteReview(id)
      setReviews(prev => prev.filter(review => review.id !== id))
      showSuccess('Reseña eliminada', 'Tu reseña se ha eliminado exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al eliminar reseña', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const voteReview = useCallback(async (voteData: CreateReviewVoteData) => {
    try {
      await reviewService.voteReview(voteData)
      // Refrescar la lista para mostrar votos actualizados
      fetchReviews()
      showSuccess('Voto registrado', 'Tu voto se ha registrado exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al votar', errorMessage)
      throw err
    }
  }, [showError, showSuccess, fetchReviews])

  const removeVote = useCallback(async (reviewId: string) => {
    try {
      await reviewService.removeVote(reviewId)
      // Refrescar la lista para mostrar votos actualizados
      fetchReviews()
      showSuccess('Voto eliminado', 'Tu voto se ha eliminado exitosamente')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al eliminar voto', errorMessage)
      throw err
    }
  }, [showError, showSuccess, fetchReviews])

  return {
    reviews,
    loading,
    error,
    createReview,
    updateReview,
    deleteReview,
    voteReview,
    removeVote,
    refetch: fetchReviews,
  }
}

export function useReview(id: string) {
  const [review, setReview] = useState<Review | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  const fetchReview = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await reviewService.getReviewById(id)
      setReview(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar reseña', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id, showError])

  useEffect(() => {
    fetchReview()
  }, [fetchReview])

  return {
    review,
    loading,
    error,
    refetch: fetchReview,
  }
}

export function useReviewStats(tiendaId: string) {
  const [stats, setStats] = useState<ReviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  const fetchStats = useCallback(async () => {
    if (!tiendaId) return

    try {
      setLoading(true)
      setError(null)
      const data = await reviewService.getReviewStats(tiendaId)
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar estadísticas', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [tiendaId, showError])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}

export function useReviewPermissions(tiendaId: string) {
  const [canReview, setCanReview] = useState(false)
  const [hasOrdered, setHasOrdered] = useState(false)
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  const checkPermissions = useCallback(async () => {
    if (!tiendaId) return

    try {
      setLoading(true)
      const [canReviewResult, hasOrderedResult] = await Promise.all([
        reviewService.canUserReview(tiendaId),
        reviewService.hasUserOrderedFromStore(tiendaId)
      ])
      
      setCanReview(canReviewResult)
      setHasOrdered(hasOrderedResult)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al verificar permisos', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [tiendaId, showError])

  useEffect(() => {
    checkPermissions()
  }, [checkPermissions])

  return {
    canReview,
    hasOrdered,
    loading,
    refetch: checkPermissions,
  }
}
