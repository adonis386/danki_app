'use client'

import { Star, TrendingUp, Users, ThumbsUp } from 'lucide-react'
import { ReviewStats as ReviewStatsType } from '@/types/review'

interface ReviewStatsProps {
  stats: ReviewStatsType
  className?: string
}

export default function ReviewStats({ stats, className = '' }: ReviewStatsProps) {
  const getPercentage = (count: number) => {
    if (stats.total_resenas === 0) return 0
    return Math.round((count / stats.total_resenas) * 100)
  }

  const getRatingColor = (rating: number) => {
    const colors = {
      5: 'bg-green-500',
      4: 'bg-blue-500', 
      3: 'bg-yellow-500',
      2: 'bg-orange-500',
      1: 'bg-red-500'
    }
    return colors[rating as keyof typeof colors] || 'bg-gray-500'
  }

  const getRatingLabel = (rating: number) => {
    const labels = {
      5: 'Excelente',
      4: 'Bueno',
      3: 'Regular', 
      2: 'Malo',
      1: 'Muy malo'
    }
    return labels[rating as keyof typeof labels] || ''
  }

  return (
    <div className={`bg-white border-2 border-gray-200 rounded-2xl p-6 shadow-sm ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Rating Overview */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Calificación General</h3>
          
          {/* Overall Rating */}
          <div className="flex items-center gap-4 mb-6">
            <div className="text-center">
              <div className="text-4xl font-black text-gray-900">
                {stats.rating_promedio.toFixed(1)}
              </div>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <Star
                    key={rating}
                    className={`w-5 h-5 ${
                      rating <= Math.round(stats.rating_promedio)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            
            <div className="flex-1">
              <div className="text-sm text-gray-600 mb-1">
                Basado en {stats.total_resenas} reseña{stats.total_resenas !== 1 ? 's' : ''}
              </div>
              {stats.votos_totales > 0 && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{stats.porcentaje_utiles.toFixed(0)}% útil</span>
                  <span>({stats.votos_utiles} de {stats.votos_totales} votos)</span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-gray-900">{stats.total_resenas}</div>
              <div className="text-xs text-gray-600">Total reseñas</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-green-600">
                {stats.distribucion_ratings[5] + stats.distribucion_ratings[4]}
              </div>
              <div className="text-xs text-gray-600">Positivas</div>
            </div>
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl font-bold text-indigo-600">
                {stats.rating_promedio >= 4 ? 'Excelente' : stats.rating_promedio >= 3 ? 'Bueno' : 'Regular'}
              </div>
              <div className="text-xs text-gray-600">Promedio</div>
            </div>
          </div>
        </div>

        {/* Rating Distribution */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4">Distribución de Calificaciones</h3>
          
          <div className="space-y-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.distribucion_ratings[rating as keyof typeof stats.distribucion_ratings]
              const percentage = getPercentage(count)
              
              return (
                <div key={rating} className="flex items-center gap-3">
                  <div className="flex items-center gap-1 w-16">
                    <span className="text-sm font-medium text-gray-600">{rating}</span>
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getRatingColor(rating)}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 w-12 text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="w-8 text-sm font-medium text-gray-600 text-right">
                    {count}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Additional Stats */}
          {stats.votos_totales > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Utilidad de las reseñas</span>
                <span className="font-medium text-gray-900">
                  {stats.porcentaje_utiles.toFixed(1)}%
                </span>
              </div>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${stats.porcentaje_utiles}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
