export interface Store {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  logo_url?: string
  imagen_portada?: string
  telefono?: string
  email?: string
  direccion?: string
  latitud?: number
  longitud?: number
  rating: number
  num_resenas: number
  tiempo_entrega: number
  costo_envio: number
  certificado_calidad: boolean
  activo: boolean
  created_at: string
  updated_at: string
}

export interface CreateStoreData {
  nombre: string
  descripcion: string
  categoria: string
  logo_url?: string
  imagen_portada?: string
  telefono?: string
  email?: string
  direccion?: string
  latitud?: number
  longitud?: number
  rating?: number
  num_resenas?: number
  tiempo_entrega?: number
  costo_envio?: number
  certificado_calidad?: boolean
  activo?: boolean
}

export interface UpdateStoreData {
  nombre?: string
  descripcion?: string
  categoria?: string
  logo_url?: string
  imagen_portada?: string
  telefono?: string
  email?: string
  direccion?: string
  latitud?: number
  longitud?: number
  rating?: number
  num_resenas?: number
  tiempo_entrega?: number
  costo_envio?: number
  certificado_calidad?: boolean
  activo?: boolean
}

export interface StoreFilters {
  categoria?: string
  activo?: boolean
  certificado_calidad?: boolean
  min_rating?: number
  max_tiempo_entrega?: number
  search?: string
}

export type StoreCategory =
  | 'Restaurante'
  | 'Cafetería'
  | 'Supermercado'
  | 'Farmacia'
  | 'Panadería'
  | 'Floristería'
  | 'Librería'
  | 'Electrónica'
  | 'Ropa'
  | 'Mascotas'
  | 'Hogar'
  | 'Belleza'
  | 'Deportes'
  | 'Otros'

export const storeCategories: StoreCategory[] = [
  'Restaurante',
  'Cafetería',
  'Supermercado',
  'Farmacia',
  'Panadería',
  'Floristería',
  'Librería',
  'Electrónica',
  'Ropa',
  'Mascotas',
  'Hogar',
  'Belleza',
  'Deportes',
  'Otros',
]
