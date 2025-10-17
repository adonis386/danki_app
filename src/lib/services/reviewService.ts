import { createClient } from '@/lib/supabase/client'
import { 
  Review, 
  CreateReviewData, 
  UpdateReviewData, 
  ReviewFilters, 
  ReviewStats,
  ReviewVote,
  CreateReviewVoteData,
  ReviewResponse,
  CreateReviewResponseData
} from '@/types/review'

export class ReviewService {
  private supabase = createClient()

  // ========== RESEÑAS ==========

  async getReviews(filters?: ReviewFilters): Promise<Review[]> {
    let query = this.supabase
      .from('reseñas')
      .select(`
        *,
        reseña_votos (
          id,
          user_id,
          es_util
        ),
        reseña_respuestas (
          id,
          respuesta,
          created_at,
          updated_at
        )
      `)
      .order('fecha_resena', { ascending: false })

    if (filters) {
      if (filters.tienda_id) {
        query = query.eq('tienda_id', filters.tienda_id)
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters.rating) {
        query = query.eq('rating', filters.rating)
      }
      if (filters.min_rating) {
        query = query.gte('rating', filters.min_rating)
      }
      if (filters.max_rating) {
        query = query.lte('rating', filters.max_rating)
      }
      if (filters.fecha_desde) {
        query = query.gte('fecha_resena', filters.fecha_desde)
      }
      if (filters.fecha_hasta) {
        query = query.lte('fecha_resena', filters.fecha_hasta)
      }
      if (filters.con_respuesta !== undefined) {
        if (filters.con_respuesta) {
          query = query.not('respuesta', 'is', null)
        } else {
          query = query.is('respuesta', null)
        }
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener reseñas: ${error.message}`)
    }

    // Procesar votos
    const userId = (await this.supabase.auth.getUser()).data.user?.id
    
    return data?.map(review => {
      const votos = review.reseña_votos || []
      const respuesta = review.reseña_respuestas?.[0] || null
      
      // Calcular estadísticas de votos
      const totalUtil = votos.filter((v: any) => v.es_util).length
      const totalNoUtil = votos.filter((v: any) => !v.es_util).length
      
      // Verificar voto del usuario actual
      let miVoto = null
      if (userId) {
        const userVote = votos.find((v: any) => v.user_id === userId)
        if (userVote) {
          miVoto = userVote.es_util ? 'util' : 'no_util'
        }
      }
      
      return {
        ...review,
        respuesta,
        votos: {
          utiles: totalUtil,
          no_utiles: totalNoUtil,
          mi_voto: miVoto
        }
      }
    }) || []
  }

  async getReviewById(id: string): Promise<Review> {
    const { data, error } = await this.supabase
      .from('reseñas')
      .select(`
        *,
        reseña_votos (
          id,
          user_id,
          es_util
        ),
        reseña_respuestas (
          id,
          respuesta,
          created_at,
          updated_at
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      throw new Error(`Error al obtener reseña: ${error.message}`)
    }

    const userId = (await this.supabase.auth.getUser()).data.user?.id
    const votos = data.reseña_votos || []
    const respuesta = data.reseña_respuestas?.[0] || null
    
    // Calcular estadísticas de votos
    const totalUtil = votos.filter((v: any) => v.es_util).length
    const totalNoUtil = votos.filter((v: any) => !v.es_util).length
    
    // Verificar voto del usuario actual
    let miVoto = null
    if (userId) {
      const userVote = votos.find((v: any) => v.user_id === userId)
      if (userVote) {
        miVoto = userVote.es_util ? 'util' : 'no_util'
      }
    }

    return {
      ...data,
      respuesta,
      votos: {
        utiles: totalUtil,
        no_utiles: totalNoUtil,
        mi_voto: miVoto
      }
    }
  }

  async createReview(reviewData: CreateReviewData): Promise<Review> {
    const { data: userData } = await this.supabase.auth.getUser()
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado')
    }

    const { data, error } = await this.supabase
      .from('reseñas')
      .insert({
        ...reviewData,
        user_id: userData.user.id
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear reseña: ${error.message}`)
    }

    return data
  }

  async updateReview(id: string, reviewData: UpdateReviewData): Promise<Review> {
    const { data, error } = await this.supabase
      .from('reseñas')
      .update({
        ...reviewData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar reseña: ${error.message}`)
    }

    return data
  }

  async deleteReview(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('reseñas')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error al eliminar reseña: ${error.message}`)
    }
  }

  async getReviewStats(tiendaId: string): Promise<ReviewStats> {
    const { data: reviews, error } = await this.supabase
      .from('reseñas')
      .select('rating')
      .eq('tienda_id', tiendaId)

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`)
    }

    const total_resenas = reviews?.length || 0
    const rating_promedio = total_resenas > 0 
      ? reviews!.reduce((sum, review) => sum + review.rating, 0) / total_resenas
      : 0

    // Distribución de ratings
    const distribucion_ratings = {
      5: reviews?.filter(r => r.rating === 5).length || 0,
      4: reviews?.filter(r => r.rating === 4).length || 0,
      3: reviews?.filter(r => r.rating === 3).length || 0,
      2: reviews?.filter(r => r.rating === 2).length || 0,
      1: reviews?.filter(r => r.rating === 1).length || 0
    }

    // Obtener votos totales
    const { data: votos, error: votosError } = await this.supabase
      .from('reseña_votos')
      .select('es_util')
      .in('reseña_id', reviews?.map(r => r.id) || [])

    if (votosError) {
      throw new Error(`Error al obtener votos: ${votosError.message}`)
    }

    const votos_totales = votos?.length || 0
    const votos_utiles = votos?.filter(v => v.es_util).length || 0
    const porcentaje_utiles = votos_totales > 0 ? (votos_utiles / votos_totales) * 100 : 0

    return {
      total_resenas,
      rating_promedio: Math.round(rating_promedio * 10) / 10,
      distribucion_ratings,
      votos_totales,
      votos_utiles,
      porcentaje_utiles: Math.round(porcentaje_utiles * 10) / 10
    }
  }

  // ========== VOTOS ==========

  async getMyVote(reviewId: string): Promise<boolean | null> {
    const { data: userData } = await this.supabase.auth.getUser()
    
    if (!userData.user) {
      return null
    }

    const { data, error } = await this.supabase
      .from('reseña_votos')
      .select('es_util')
      .eq('reseña_id', reviewId)
      .eq('user_id', userData.user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw new Error(`Error al obtener voto: ${error.message}`)
    }

    return data?.es_util ?? null
  }

  async voteReview(voteData: CreateReviewVoteData): Promise<ReviewVote> {
    const { data: userData } = await this.supabase.auth.getUser()
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado')
    }

    // Verificar si ya existe un voto
    const existingVote = await this.getMyVote(voteData.reseña_id)

    let data, error

    if (existingVote !== null) {
      // Actualizar voto existente
      const result = await this.supabase
        .from('reseña_votos')
        .update({
          es_util: voteData.es_util,
          created_at: new Date().toISOString()
        })
        .eq('reseña_id', voteData.reseña_id)
        .eq('user_id', userData.user.id)
        .select()
        .single()

      data = result.data
      error = result.error
    } else {
      // Crear nuevo voto
      const result = await this.supabase
        .from('reseña_votos')
        .insert({
          ...voteData,
          user_id: userData.user.id
        })
        .select()
        .single()

      data = result.data
      error = result.error
    }

    if (error) {
      throw new Error(`Error al votar reseña: ${error.message}`)
    }

    return data
  }

  async removeVote(reviewId: string): Promise<void> {
    const { data: userData } = await this.supabase.auth.getUser()
    
    if (!userData.user) {
      throw new Error('Usuario no autenticado')
    }

    const { error } = await this.supabase
      .from('reseña_votos')
      .delete()
      .eq('reseña_id', reviewId)
      .eq('user_id', userData.user.id)

    if (error) {
      throw new Error(`Error al eliminar voto: ${error.message}`)
    }
  }

  // ========== RESPUESTAS ==========

  async getReviewResponse(reviewId: string): Promise<ReviewResponse | null> {
    const { data, error } = await this.supabase
      .from('reseña_respuestas')
      .select(`
        *,
        tienda:tienda_id (
          id,
          nombre,
          logo_url
        )
      `)
      .eq('reseña_id', reviewId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al obtener respuesta: ${error.message}`)
    }

    return data
  }

  async createReviewResponse(responseData: CreateReviewResponseData): Promise<ReviewResponse> {
    const { data, error } = await this.supabase
      .from('reseña_respuestas')
      .insert(responseData)
      .select(`
        *,
        tienda:tienda_id (
          id,
          nombre,
          logo_url
        )
      `)
      .single()

    if (error) {
      throw new Error(`Error al crear respuesta: ${error.message}`)
    }

    return data
  }

  async updateReviewResponse(id: string, respuesta: string): Promise<ReviewResponse> {
    const { data, error } = await this.supabase
      .from('reseña_respuestas')
      .update({
        respuesta,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        tienda:tienda_id (
          id,
          nombre,
          logo_url
        )
      `)
      .single()

    if (error) {
      throw new Error(`Error al actualizar respuesta: ${error.message}`)
    }

    return data
  }

  async deleteReviewResponse(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('reseña_respuestas')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error al eliminar respuesta: ${error.message}`)
    }
  }

  // ========== UTILIDADES ==========

  async canUserReview(tiendaId: string): Promise<boolean> {
    const { data: userData } = await this.supabase.auth.getUser()
    
    if (!userData.user) {
      return false
    }

    // Verificar si ya tiene una reseña para esta tienda
    const { data, error } = await this.supabase
      .from('reseñas')
      .select('id')
      .eq('tienda_id', tiendaId)
      .eq('user_id', userData.user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(`Error al verificar reseña: ${error.message}`)
    }

    return data === null // Puede reseñar si no existe reseña
  }

  async hasUserOrderedFromStore(tiendaId: string): Promise<boolean> {
    const { data: userData } = await this.supabase.auth.getUser()
    
    if (!userData.user) {
      return false
    }

    try {
      // Intentar primero buscar todos los pedidos (sin filtro de status)
      const { data: allData, error: allError } = await this.supabase
        .from('pedidos')
        .select(`
          id,
          pedido_items (
            product_id,
            producto:product_id (
              tienda_id
            )
          )
        `)
        .eq('user_id', userData.user.id)

      if (allError) {
        console.warn('Error al verificar pedidos del usuario:', allError)
        // En caso de error, permitir reseñar (fallback)
        return true
      }

      // Verificar si algún item del pedido es de esta tienda
      const hasOrdered = allData?.some(pedido => 
        pedido.pedido_items?.some((item: any) => 
          item.producto?.tienda_id === tiendaId
        )
      ) || false

      return hasOrdered
    } catch (error) {
      console.warn('Error al verificar pedidos del usuario:', error)
      // En caso de error, permitir reseñar (fallback)
      return true
    }
  }
}

export const reviewService = new ReviewService()
