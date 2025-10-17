export interface CartItem {
  id: string
  product_id: string
  quantity: number
  price: number
  // Datos del producto (para evitar consultas adicionales)
  product: {
    id: string
    nombre: string
    descripcion: string
    imagen_url?: string
    tienda_id: string
    tienda_nombre: string
  }
}

export interface Cart {
  items: CartItem[]
  total: number
  subtotal: number
  deliveryFee: number
  tax: number
  itemCount: number
}

export interface CartSummary {
  subtotal: number
  deliveryFee: number
  tax: number
  total: number
  itemCount: number
}

export interface DeliveryInfo {
  address: string
  phone: string
  notes?: string
  estimatedTime: number
}

export interface OrderItem {
  product_id: string
  quantity: number
  price: number
}

export interface CreateOrderData {
  items: OrderItem[]
  delivery_info: DeliveryInfo
  payment_method: 'cash' | 'card'
  total: number
}
