'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Star, X, Send } from 'lucide-react'
import { CreateReviewData } from '@/types/review'
import { createReviewSchema, type CreateReviewFormData } from '@/lib/validations/review'
import { useReviews } from '@/hooks/useReviews'

interface ReviewFormProps {
  tiendaId: string
  pedidoId?: string
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({ tiendaId, pedidoId, onSuccess, onCancel }: ReviewFormProps) {
  const [selectedRating, setSelectedRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { createReview } = useReviews()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<CreateReviewFormData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      tienda_id: tiendaId,
      pedido_id: pedidoId,
      rating: 0,
      titulo: '',
      comentario: ''
    }
  })

  const watchedRating = watch('rating')

  const handleRatingChange = (rating: number) => {
    setSelectedRating(rating)
    setValue('rating', rating)
  }

  const onSubmit = async (data: CreateReviewFormData) => {
    if (data.rating === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await createReview({
        tienda_id: data.tienda_id,
        pedido_id: data.pedido_id,
        rating: data.rating,
        titulo: data.titulo,
        comentario: data.comentario || undefined
      })
      
      reset()
      setSelectedRating(0)
      onSuccess?.()
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const getRatingLabel = (rating: number) => {
    const labels = {
      1: 'Muy malo',
      2: 'Malo',
      3: 'Regular',
      4: 'Bueno',
      5: 'Excelente'
    }
    return labels[rating as keyof typeof labels] || ''
  }

  return (
    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Escribe tu reseña</h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Calificación *
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => handleRatingChange(rating)}
                onMouseEnter={() => setHoveredRating(rating)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`w-8 h-8 ${
                    rating <= (hoveredRating || selectedRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
            <span className="ml-3 text-lg font-bold text-gray-700">
              {selectedRating > 0 && getRatingLabel(selectedRating)}
            </span>
          </div>
          {errors.rating && (
            <p className="text-red-600 text-sm mt-1">{errors.rating.message}</p>
          )}
        </div>

        {/* Title */}
        <div>
          <label htmlFor="titulo" className="block text-sm font-semibold text-gray-700 mb-2">
            Título de tu reseña *
          </label>
          <input
            id="titulo"
            type="text"
            {...register('titulo')}
            placeholder="Ej: Excelente comida y servicio rápido"
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
          />
          {errors.titulo && (
            <p className="text-red-600 text-sm mt-1">{errors.titulo.message}</p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label htmlFor="comentario" className="block text-sm font-semibold text-gray-700 mb-2">
            Comentario (opcional)
          </label>
          <textarea
            id="comentario"
            {...register('comentario')}
            rows={4}
            placeholder="Comparte más detalles sobre tu experiencia..."
            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
          />
          {errors.comentario && (
            <p className="text-red-600 text-sm mt-1">{errors.comentario.message}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {watch('comentario')?.length || 0}/1000 caracteres
          </p>
        </div>

        {/* Submit Button */}
        <div className="flex gap-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-bold hover:bg-gray-300 transition-colors"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || selectedRating === 0}
            className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Publicando...
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                Publicar Reseña
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
