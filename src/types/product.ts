export interface Product {
  id: string
  tienda_id: string
  categoria_id?: string
  nombre: string
  descripcion: string
  precio: number
  imagen_url?: string
  stock: number
  activo: boolean
  destacado: boolean
  created_at: string
  updated_at: string
  // Relaciones
  tienda?: {
    id: string
    nombre: string
    logo_url?: string
  }
  categoria?: {
    id: string
    nombre: string
    icono?: string
  }
}

export interface CreateProductData {
  nombre: string
  descripcion: string
  precio: number
  imagen_url?: string
  stock?: number
  activo?: boolean
  destacado?: boolean
  tienda_id: string
  categoria_id?: string
}

export interface UpdateProductData {
  nombre?: string
  descripcion?: string
  precio?: number
  imagen_url?: string
  stock?: number
  activo?: boolean
  destacado?: boolean
  categoria_id?: string
}

export interface ProductFilters {
  tienda_id?: string
  categoria_id?: string
  activo?: boolean
  destacado?: boolean
  min_precio?: number
  max_precio?: number
  search?: string
}

export interface ProductCategory {
  id: string
  nombre: string
  descripcion?: string
  icono?: string
  orden: number
  created_at: string
}
