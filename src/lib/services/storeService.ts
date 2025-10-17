import { createClient } from '@/lib/supabase/client'
import { Store, CreateStoreData, UpdateStoreData, StoreFilters } from '@/types/store'

export class StoreService {
  private supabase = createClient()

  // Obtener todas las tiendas
  async getStores(filters?: StoreFilters): Promise<Store[]> {
    let query = this.supabase
      .from('tiendas')
      .select('*')
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.categoria) {
        query = query.eq('categoria', filters.categoria)
      }
      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }
      if (filters.certificado_calidad !== undefined) {
        query = query.eq('certificado_calidad', filters.certificado_calidad)
      }
      if (filters.min_rating !== undefined) {
        query = query.gte('rating', filters.min_rating)
      }
      if (filters.max_tiempo_entrega !== undefined) {
        query = query.lte('tiempo_entrega', filters.max_tiempo_entrega)
      }
      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener tiendas: ${error.message}`)
    }

    return data || []
  }

  // Obtener una tienda por ID
  async getStoreById(id: string): Promise<Store | null> {
    const { data, error } = await this.supabase
      .from('tiendas')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Tienda no encontrada
      }
      throw new Error(`Error al obtener tienda: ${error.message}`)
    }

    return data
  }

  // Crear una nueva tienda
  async createStore(storeData: CreateStoreData): Promise<Store> {
    const { data, error } = await this.supabase
      .from('tiendas')
      .insert([storeData])
      .select()
      .single()

    if (error) {
      throw new Error(`Error al crear tienda: ${error.message}`)
    }

    return data
  }

  // Actualizar una tienda
  async updateStore(id: string, storeData: UpdateStoreData): Promise<Store> {
    const { data, error } = await this.supabase
      .from('tiendas')
      .update({
        ...storeData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar tienda: ${error.message}`)
    }

    return data
  }

  // Eliminar una tienda
  async deleteStore(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('tiendas')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error al eliminar tienda: ${error.message}`)
    }
  }

  // Obtener categorías disponibles
  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('tiendas')
      .select('categoria')
      .not('categoria', 'is', null)

    if (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`)
    }

    // Extraer categorías únicas
    const categories = [...new Set(data?.map(item => item.categoria) || [])]
    return categories.sort()
  }

  // Activar/Desactivar tienda
  async toggleStoreStatus(id: string, activo: boolean): Promise<Store> {
    return this.updateStore(id, { activo })
  }
}

// Instancia singleton del servicio
export const storeService = new StoreService()
