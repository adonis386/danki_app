import { createClient } from '@/lib/supabase/client'
import { Product, CreateProductData, UpdateProductData, ProductFilters, ProductCategory } from '@/types/product'

export class ProductService {
  private supabase = createClient()

  // Obtener todos los productos
  async getProducts(filters?: ProductFilters): Promise<Product[]> {
    let query = this.supabase
      .from('productos')
      .select(`
        *,
        tienda:tiendas(id, nombre, logo_url),
        categoria:categorias(id, nombre, icono)
      `)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.tienda_id) {
        query = query.eq('tienda_id', filters.tienda_id)
      }
      if (filters.categoria_id) {
        query = query.eq('categoria_id', filters.categoria_id)
      }
      if (filters.activo !== undefined) {
        query = query.eq('activo', filters.activo)
      }
      if (filters.destacado !== undefined) {
        query = query.eq('destacado', filters.destacado)
      }
      if (filters.min_precio !== undefined) {
        query = query.gte('precio', filters.min_precio)
      }
      if (filters.max_precio !== undefined) {
        query = query.lte('precio', filters.max_precio)
      }
      if (filters.search) {
        query = query.or(`nombre.ilike.%${filters.search}%,descripcion.ilike.%${filters.search}%`)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener productos: ${error.message}`)
    }

    return data || []
  }

  // Obtener un producto por ID
  async getProductById(id: string): Promise<Product | null> {
    const { data, error } = await this.supabase
      .from('productos')
      .select(`
        *,
        tienda:tiendas(id, nombre, logo_url),
        categoria:categorias(id, nombre, icono)
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener producto: ${error.message}`)
    }

    return data
  }

  // Obtener productos por tienda
  async getProductsByStore(storeId: string, filters?: Omit<ProductFilters, 'tienda_id'>): Promise<Product[]> {
    return this.getProducts({ ...filters, tienda_id: storeId })
  }

  // Crear un nuevo producto
  async createProduct(productData: CreateProductData): Promise<Product> {
    const { data, error } = await this.supabase
      .from('productos')
      .insert([productData])
      .select(`
        *,
        tienda:tiendas(id, nombre, logo_url),
        categoria:categorias(id, nombre, icono)
      `)
      .single()

    if (error) {
      throw new Error(`Error al crear producto: ${error.message}`)
    }

    return data
  }

  // Actualizar un producto
  async updateProduct(id: string, productData: UpdateProductData): Promise<Product> {
    const { data, error } = await this.supabase
      .from('productos')
      .update({
        ...productData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select(`
        *,
        tienda:tiendas(id, nombre, logo_url),
        categoria:categorias(id, nombre, icono)
      `)
      .single()

    if (error) {
      throw new Error(`Error al actualizar producto: ${error.message}`)
    }

    return data
  }

  // Eliminar un producto
  async deleteProduct(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('productos')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Error al eliminar producto: ${error.message}`)
    }
  }

  // Obtener categorías de productos
  async getCategories(): Promise<ProductCategory[]> {
    const { data, error } = await this.supabase
      .from('categorias')
      .select('*')
      .order('orden')

    if (error) {
      throw new Error(`Error al obtener categorías: ${error.message}`)
    }

    return data || []
  }

  // Activar/Desactivar producto
  async toggleProductStatus(id: string, activo: boolean): Promise<Product> {
    return this.updateProduct(id, { activo })
  }

  // Marcar/Desmarcar producto como destacado
  async toggleProductFeatured(id: string, destacado: boolean): Promise<Product> {
    return this.updateProduct(id, { destacado })
  }

  // Actualizar stock de producto
  async updateProductStock(id: string, stock: number): Promise<Product> {
    return this.updateProduct(id, { stock })
  }

  // Obtener productos destacados
  async getFeaturedProducts(limit?: number): Promise<Product[]> {
    let query = this.supabase
      .from('productos')
      .select(`
        *,
        tienda:tiendas(id, nombre, logo_url),
        categoria:categorias(id, nombre, icono)
      `)
      .eq('destacado', true)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener productos destacados: ${error.message}`)
    }

    return data || []
  }

  // Buscar productos
  async searchProducts(searchTerm: string, filters?: Omit<ProductFilters, 'search'>): Promise<Product[]> {
    return this.getProducts({ ...filters, search: searchTerm })
  }
}

// Instancia singleton del servicio
export const productService = new ProductService()
