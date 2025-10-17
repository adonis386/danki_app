export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string
          name: string
          description: string
          permissions: string[]
        }
        Insert: {
          id?: string
          name: string
          description: string
          permissions: string[]
        }
        Update: {
          id?: string
          name?: string
          description?: string
          permissions?: string[]
        }
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          role_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          role_id?: string
          created_at?: string
        }
      }
      tiendas: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          logo_url: string | null
          imagen_portada: string | null
          telefono: string | null
          email: string | null
          direccion: string | null
          latitud: number | null
          longitud: number | null
          rating: number
          num_resenas: number
          tiempo_entrega: number | null
          costo_envio: number
          activo: boolean
          certificado_calidad: boolean
          categoria: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          logo_url?: string | null
          imagen_portada?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          latitud?: number | null
          longitud?: number | null
          rating?: number
          num_resenas?: number
          tiempo_entrega?: number | null
          costo_envio?: number
          activo?: boolean
          certificado_calidad?: boolean
          categoria?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          logo_url?: string | null
          imagen_portada?: string | null
          telefono?: string | null
          email?: string | null
          direccion?: string | null
          latitud?: number | null
          longitud?: number | null
          rating?: number
          num_resenas?: number
          tiempo_entrega?: number | null
          costo_envio?: number
          activo?: boolean
          certificado_calidad?: boolean
          categoria?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      productos: {
        Row: {
          id: string
          tienda_id: string
          categoria_id: string | null
          nombre: string
          descripcion: string | null
          precio: number
          imagen_url: string | null
          stock: number
          activo: boolean
          destacado: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tienda_id: string
          categoria_id?: string | null
          nombre: string
          descripcion?: string | null
          precio: number
          imagen_url?: string | null
          stock?: number
          activo?: boolean
          destacado?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tienda_id?: string
          categoria_id?: string | null
          nombre?: string
          descripcion?: string | null
          precio?: number
          imagen_url?: string | null
          stock?: number
          activo?: boolean
          destacado?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categorias: {
        Row: {
          id: string
          nombre: string
          descripcion: string | null
          icono: string | null
          orden: number
          created_at: string
        }
        Insert: {
          id?: string
          nombre: string
          descripcion?: string | null
          icono?: string | null
          orden?: number
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          descripcion?: string | null
          icono?: string | null
          orden?: number
          created_at?: string
        }
      }
      reseñas: {
        Row: {
          id: string
          user_id: string
          tienda_id: string
          pedido_id: string | null
          rating: number
          titulo: string
          comentario: string | null
          fecha_resena: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          tienda_id: string
          pedido_id?: string | null
          rating: number
          titulo: string
          comentario?: string | null
          fecha_resena?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          tienda_id?: string
          pedido_id?: string | null
          rating?: number
          titulo?: string
          comentario?: string | null
          fecha_resena?: string
          created_at?: string
          updated_at?: string
        }
      }
      reseña_votos: {
        Row: {
          id: string
          reseña_id: string
          user_id: string
          es_util: boolean
          created_at: string
        }
        Insert: {
          id?: string
          reseña_id: string
          user_id: string
          es_util: boolean
          created_at?: string
        }
        Update: {
          id?: string
          reseña_id?: string
          user_id?: string
          es_util?: boolean
          created_at?: string
        }
      }
      reseña_respuestas: {
        Row: {
          id: string
          reseña_id: string
          tienda_id: string
          respuesta: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          reseña_id: string
          tienda_id: string
          respuesta: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          reseña_id?: string
          tienda_id?: string
          respuesta?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}
