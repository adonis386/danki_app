'use client'

import { useState, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, Star, Filter, Plus, Search } from 'lucide-react'
import Link from 'next/link'
import { useReviews, useReviewStats, useReviewPermissions } from '@/hooks/useReviews'
import { ReviewFilters } from '@/types/review'
import ReviewCard from '@/components/ReviewCard'
import ReviewForm from '@/components/ReviewForm'
import ReviewStats from '@/components/ReviewStats'
import { useStore } from '@/hooks/useStore'
import HomeButton from '@/components/HomeButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

export default function TiendaReviewsPage() {
  const params = useParams()
  const storeId = params.id as string
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filters, setFilters] = useState<ReviewFilters>({})
  const [searchQuery, setSearchQuery] = useState('')

  const { store, loading: storeLoading } = useStore(storeId)
  const { reviews, loading: reviewsLoading } = useReviews({ tienda_id: storeId, ...filters })
  const { stats, loading: statsLoading } = useReviewStats(storeId)
  const { canReview, hasOrdered, loading: permissionsLoading } = useReviewPermissions(storeId)

  // Filtrar reseñas por búsqueda
  const filteredReviews = useMemo(() => {
    if (!searchQuery.trim()) return reviews
    
    const query = searchQuery.toLowerCase()
    return reviews.filter(review => 
      review.titulo.toLowerCase().includes(query) ||
      review.comentario?.toLowerCase().includes(query) ||
      review.user?.user_metadata?.full_name?.toLowerCase().includes(query)
    )
  }, [reviews, searchQuery])

  const handleRatingFilter = (rating?: number) => {
    setFilters(prev => ({
      ...prev,
      rating: rating
    }))
  }

  const handleShowReviewForm = () => {
    if (!canReview) {
      alert('No puedes reseñar esta tienda. Necesitas haber realizado un pedido y no tener una reseña previa.')
      return
    }
    setShowReviewForm(true)
  }

  if (storeLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
          <div className="container mx-auto px-6 py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando tienda...</p>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <Header />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href={`/tiendas/${storeId}`}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-black text-gray-900">
                  Reseñas de {store?.nombre}
                </h1>
                <p className="text-lg text-gray-600">Lo que dicen nuestros clientes</p>
              </div>
            </div>
            <HomeButton />
          </div>

          {/* Stats */}
          {!statsLoading && stats && (
            <div className="mb-8">
              <ReviewStats stats={stats} />
            </div>
          )}

          {/* Actions */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              {/* Search */}
              <div className="flex-1 max-w-md">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar reseñas..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 pr-4 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-5 h-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtrar por:</span>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRatingFilter()}
                    className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                      !filters.rating
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Todas
                  </button>
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => handleRatingFilter(rating)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${
                        filters.rating === rating
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Star className="w-3 h-3" />
                      {rating}
                    </button>
                  ))}
                </div>
              </div>

              {/* Write Review Button */}
              {!permissionsLoading && canReview && (
                <button
                  onClick={handleShowReviewForm}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Escribir Reseña
                </button>
              )}
            </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="mt-6">
                <ReviewForm
                  tiendaId={storeId}
                  onSuccess={() => {
                    setShowReviewForm(false)
                    // Refrescar datos
                    window.location.reload()
                  }}
                  onCancel={() => setShowReviewForm(false)}
                />
              </div>
            )}

            {/* Permissions Info */}
            {!permissionsLoading && !canReview && (
              <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl">
                <p className="text-yellow-800 text-sm">
                  {!hasOrdered 
                    ? 'Necesitas realizar un pedido de esta tienda para poder reseñarla.'
                    : 'Ya has escrito una reseña para esta tienda.'
                  }
                </p>
              </div>
            )}
          </div>

          {/* Reviews List */}
          {reviewsLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando reseñas...</p>
            </div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border-2 border-dashed border-gray-300">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? 'No se encontraron reseñas' : 'Aún no hay reseñas'}
              </h3>
              <p className="text-gray-600">
                {searchQuery 
                  ? 'Intenta con otros términos de búsqueda'
                  : 'Sé el primero en reseñar esta tienda'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredReviews.map((review) => (
                <ReviewCard
                  key={review.id}
                  review={review}
                  onEdit={(review) => {
                    // TODO: Implementar edición
                    console.log('Edit review:', review)
                  }}
                  onDelete={(review) => {
                    // TODO: Implementar eliminación
                    console.log('Delete review:', review)
                  }}
                  onReply={(review) => {
                    // TODO: Implementar respuesta
                    console.log('Reply to review:', review)
                  }}
                />
              ))}
            </div>
          )}
        </div>
        
        {/* Floating Home Button */}
        <HomeButton variant="floating" />
      </div>
    </ProtectedRoute>
  )
}

