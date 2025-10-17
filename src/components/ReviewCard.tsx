'use client'

import { useState } from 'react'
import { Star, ThumbsUp, ThumbsDown, Reply, MoreVertical, Edit, Trash2, Clock, User } from 'lucide-react'
import { Review, RATING_COLORS, RATING_BG_COLORS } from '@/types/review'
import { useAuth } from '@/hooks/useAuth'
import { useReviews } from '@/hooks/useReviews'
import { formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

interface ReviewCardProps {
  review: Review
  showActions?: boolean
  onEdit?: (review: Review) => void
  onDelete?: (review: Review) => void
  onReply?: (review: Review) => void
}

export default function ReviewCard({ 
  review, 
  showActions = true, 
  onEdit, 
  onDelete, 
  onReply 
}: ReviewCardProps) {
  const [showFullComment, setShowFullComment] = useState(false)
  const [isVoting, setIsVoting] = useState(false)
  const { user } = useAuth()
  const { voteReview, removeVote } = useReviews()

  const isMyReview = user?.id === review.user_id
  const canEdit = isMyReview && new Date().getTime() - new Date(review.created_at).getTime() < 24 * 60 * 60 * 1000
  const commentPreview = review.comentario && review.comentario.length > 150

  const handleVote = async (esUtil: boolean) => {
    if (isVoting || !user) return

    setIsVoting(true)
    try {
      if (review.votos?.mi_voto === esUtil) {
        // Si ya votó lo mismo, remover el voto
        await removeVote(review.id)
      } else {
        // Votar o cambiar voto
        await voteReview({
          reseña_id: review.id,
          es_util: esUtil
        })
      }
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setIsVoting(false)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: es 
      })
    } catch {
      return 'Fecha desconocida'
    }
  }

  const getUserName = () => {
    // Si no tenemos datos del usuario, usar ID truncado
    if (review.user_id) {
      return `Usuario ${review.user_id.slice(-6)}`
    }
    return 'Usuario Anónimo'
  }

  const getUserInitials = () => {
    const name = getUserName()
    if (name.includes('Usuario')) {
      return name.slice(-2).toUpperCase()
    }
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <div className={`bg-white border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${RATING_BG_COLORS[review.rating as keyof typeof RATING_BG_COLORS]}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
            {getUserInitials()}
          </div>
          
          {/* User Info */}
          <div>
            <h4 className="font-bold text-gray-900">{getUserName()}</h4>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{formatDate(review.fecha_resena)}</span>
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="flex items-center gap-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-5 h-5 ${
                i < review.rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
          <span className={`ml-2 font-bold text-lg ${RATING_COLORS[review.rating as keyof typeof RATING_COLORS]}`}>
            {review.rating}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="font-bold text-lg text-gray-900 mb-2">
        {review.titulo}
      </h3>

      {/* Comment */}
      {review.comentario && (
        <div className="mb-4">
          <p className="text-gray-700 leading-relaxed">
            {showFullComment || !commentPreview 
              ? review.comentario 
              : `${review.comentario.substring(0, 150)}...`
            }
          </p>
          {commentPreview && (
            <button
              onClick={() => setShowFullComment(!showFullComment)}
              className="text-indigo-600 hover:text-indigo-800 font-medium mt-2 text-sm"
            >
              {showFullComment ? 'Ver menos' : 'Leer más'}
            </button>
          )}
        </div>
      )}

      {/* Order Info */}
      {review.pedido && (
        <div className="bg-gray-50 rounded-xl p-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="font-medium">Pedido:</span>
            <span>#{review.pedido.id.slice(-8)}</span>
            <span>•</span>
            <span>${review.pedido.total.toFixed(2)}</span>
            <span>•</span>
            <span>{formatDate(review.pedido.created_at)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          {/* Vote Buttons */}
          {user && !isMyReview && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleVote(true)}
                disabled={isVoting}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  review.votos?.mi_voto === true
                    ? 'bg-green-100 text-green-700 border-2 border-green-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700'
                }`}
              >
                <ThumbsUp className="w-4 h-4" />
                <span>Útil ({review.votos?.utiles || 0})</span>
              </button>
              
              <button
                onClick={() => handleVote(false)}
                disabled={isVoting}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                  review.votos?.mi_voto === false
                    ? 'bg-red-100 text-red-700 border-2 border-red-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-700'
                }`}
              >
                <ThumbsDown className="w-4 h-4" />
                <span>No útil ({review.votos?.no_utiles || 0})</span>
              </button>
            </div>
          )}

          {/* Edit/Delete Actions */}
          {canEdit && (
            <div className="flex items-center gap-2">
              {onEdit && (
                <button
                  onClick={() => onEdit(review)}
                  className="p-2 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  title="Editar reseña"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
              
              {onDelete && (
                <button
                  onClick={() => onDelete(review)}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Eliminar reseña"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Reply Button (for store owners) */}
          {onReply && !isMyReview && (
            <button
              onClick={() => onReply(review)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-xl hover:bg-indigo-200 transition-colors text-sm font-medium"
            >
              <Reply className="w-4 h-4" />
              Responder
            </button>
          )}
        </div>
      )}

      {/* Store Response */}
      {review.respuesta && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="bg-indigo-50 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="font-bold text-indigo-900">Respuesta de la tienda</span>
              <span className="text-sm text-indigo-600">
                {formatDate(review.respuesta.created_at)}
              </span>
            </div>
            <p className="text-indigo-800 leading-relaxed">
              {review.respuesta.respuesta}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
