export type OrderStatus = 
  | 'pending'      // Pendiente
  | 'confirmed'    // Confirmado
  | 'preparing'    // Preparando
  | 'ready'        // Listo para entrega
  | 'out_for_delivery' // En camino
  | 'delivered'    // Entregado
  | 'cancelled'    // Cancelado

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  // Datos del producto
  product: {
    id: string
    nombre: string
    imagen_url?: string
    tienda_id: string
    tienda_nombre: string
  }
}

export interface Order {
  id: string
  user_id: string
  status: OrderStatus
  total: number
  subtotal: number
  delivery_fee: number
  tax: number
  delivery_address: string
  delivery_phone: string
  delivery_notes?: string
  payment_method: 'cash' | 'card'
  estimated_delivery_time: number
  created_at: string
  updated_at: string
  // Relaciones
  items: OrderItem[]
  user?: {
    id: string
    email: string
    user_metadata?: {
      full_name?: string
    }
  }
}

export interface CreateOrderData {
  items: {
    product_id: string
    quantity: number
    price: number
  }[]
  delivery_address: string
  delivery_phone: string
  delivery_notes?: string
  payment_method: 'cash' | 'card'
  total: number
  subtotal: number
  delivery_fee: number
  tax: number
}

export interface UpdateOrderData {
  status?: OrderStatus
  delivery_address?: string
  delivery_phone?: string
  delivery_notes?: string
  estimated_delivery_time?: number
}

export interface OrderFilters {
  status?: OrderStatus
  user_id?: string
  date_from?: string
  date_to?: string
  search?: string
  exclude_status?: OrderStatus[]
}

export interface OrderStats {
  total_orders: number
  pending_orders: number
  completed_orders: number
  cancelled_orders: number
  total_revenue: number
  average_order_value: number
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  ready: 'Listo para entrega',
  out_for_delivery: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

export const ORDER_STATUS_COLORS: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-orange-100 text-orange-800',
  ready: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-indigo-100 text-indigo-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
}
