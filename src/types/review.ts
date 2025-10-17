export interface Review {
  id: string
  user_id: string
  tienda_id: string
  pedido_id?: string
  rating: number // 1-5
  titulo: string
  comentario?: string
  fecha_resena: string
  created_at: string
  updated_at: string
  
  // Datos del usuario (populated)
  user?: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
      avatar_url?: string
    }
  }
  
  // Datos del pedido (populated)
  pedido?: {
    id: string
    total: number
    created_at: string
  }
  
  // Votos en la reseña
  votos?: {
    utiles: number
    no_utiles: number
    mi_voto?: boolean | null // null = no votado, true = útil, false = no útil
  }
  
  // Respuesta de la tienda
  respuesta?: {
    id: string
    respuesta: string
    created_at: string
    updated_at: string
  }
}

export interface CreateReviewData {
  tienda_id: string
  pedido_id?: string
  rating: number
  titulo: string
  comentario?: string
}

export interface UpdateReviewData {
  rating?: number
  titulo?: string
  comentario?: string
}

export interface ReviewFilters {
  tienda_id?: string
  user_id?: string
  rating?: number
  min_rating?: number
  max_rating?: number
  fecha_desde?: string
  fecha_hasta?: string
  con_respuesta?: boolean
}

export interface ReviewStats {
  total_resenas: number
  rating_promedio: number
  distribucion_ratings: {
    5: number
    4: number
    3: number
    2: number
    1: number
  }
  votos_totales: number
  votos_utiles: number
  porcentaje_utiles: number
}

export interface ReviewVote {
  id: string
  reseña_id: string
  user_id: string
  es_util: boolean
  created_at: string
}

export interface CreateReviewVoteData {
  reseña_id: string
  es_util: boolean
}

export interface ReviewResponse {
  id: string
  reseña_id: string
  tienda_id: string
  respuesta: string
  created_at: string
  updated_at: string
  
  // Datos de la tienda
  tienda?: {
    id: string
    nombre: string
    logo_url?: string
  }
}

export interface CreateReviewResponseData {
  reseña_id: string
  tienda_id: string
  respuesta: string
}

// Constantes para ratings
export const RATING_LABELS = {
  1: 'Muy malo',
  2: 'Malo', 
  3: 'Regular',
  4: 'Bueno',
  5: 'Excelente'
} as const

export const RATING_COLORS = {
  1: 'text-red-500',
  2: 'text-orange-500',
  3: 'text-yellow-500',
  4: 'text-blue-500',
  5: 'text-green-500'
} as const

export const RATING_BG_COLORS = {
  1: 'bg-red-50 border-red-200',
  2: 'bg-orange-50 border-orange-200',
  3: 'bg-yellow-50 border-yellow-200',
  4: 'bg-blue-50 border-blue-200',
  5: 'bg-green-50 border-green-200'
} as const
