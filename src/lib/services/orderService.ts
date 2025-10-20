import { createClient } from '@/lib/supabase/client'
import { Order, CreateOrderData, UpdateOrderData, OrderFilters, OrderStats } from '@/types/order'

export class OrderService {
  private supabase = createClient()

  // Obtener todos los pedidos
  async getOrders(filters?: OrderFilters): Promise<Order[]> {
    let query = this.supabase
      .from('pedidos')
      .select(`
        *,
        items:pedido_items(
          *,
          product:productos(
            id,
            nombre,
            imagen_url,
            tienda_id,
            tienda:tiendas(nombre)
          )
        )
      `)
      .order('created_at', { ascending: false })

    if (filters) {
      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.user_id) {
        query = query.eq('user_id', filters.user_id)
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from)
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to)
      }
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener pedidos: ${error.message}`)
    }

    return data || []
  }

  // Obtener un pedido por ID
  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select(`
        *,
        items:pedido_items(
          *,
          product:productos(
            id,
            nombre,
            imagen_url,
            tienda_id,
            tienda:tiendas(nombre)
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Error al obtener pedido: ${error.message}`)
    }

    return data
  }

  // Obtener pedidos del usuario actual
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.getOrders({ user_id: userId })
  }

  // Crear un nuevo pedido
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    const { data: { user } } = await this.supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Usuario no autenticado')
    }

    // Crear el pedido
    const { data: order, error: orderError } = await this.supabase
      .from('pedidos')
      .insert([{
        user_id: user.id,
        status: 'pending',
        total: orderData.total,
        subtotal: orderData.subtotal,
        delivery_fee: orderData.delivery_fee,
        tax: orderData.tax,
        delivery_address: orderData.delivery_address,
        delivery_phone: orderData.delivery_phone,
        delivery_notes: orderData.delivery_notes,
        payment_method: orderData.payment_method,
        estimated_delivery_time: 30, // 30 minutos por defecto
      }])
      .select()
      .single()

    if (orderError) {
      throw new Error(`Error al crear pedido: ${orderError.message}`)
    }

    // Crear los items del pedido
    const orderItems = orderData.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }))

    const { error: itemsError } = await this.supabase
      .from('pedido_items')
      .insert(orderItems)

    if (itemsError) {
      // Si falla la inserción de items, eliminar el pedido
      await this.supabase.from('pedidos').delete().eq('id', order.id)
      throw new Error(`Error al crear items del pedido: ${itemsError.message}`)
    }

    // =============================================
    // ASIGNACIÓN AUTOMÁTICA DE REPARTIDOR
    // =============================================
    try {
      const { assignmentService } = await import('./assignmentService')
      
      // Intentar geocodificar la dirección
      const coordenadas = await assignmentService.geocodificarDireccion(
        orderData.delivery_address
      )

      // Asignar repartidor automáticamente
      const asignacion = await assignmentService.asignarRepartidorAutomatico(
        {
          id: order.id,
          delivery_address: orderData.delivery_address,
          delivery_phone: orderData.delivery_phone,
          coordenadas_destino: coordenadas || undefined,
        },
        {
          distancia_maxima_km: 20,
          calificacion_minima: 3.5,
          priorizar_cercania: true,
        }
      )

      if (asignacion) {
        console.log('Repartidor asignado automáticamente:', asignacion.repartidor.nombre)
      } else {
        console.log('No se pudo asignar repartidor automáticamente')
        // Notificar a admin o crear tracking manual
      }
    } catch (error) {
      console.error('Error en asignación automática (no crítico):', error)
      // No lanzar error, el pedido ya fue creado
    }

    // Obtener el pedido completo con relaciones
    const completeOrder = await this.getOrderById(order.id)
    if (!completeOrder) {
      throw new Error('Error al obtener el pedido creado')
    }

    return completeOrder
  }

  // Actualizar un pedido
  async updateOrder(id: string, orderData: UpdateOrderData): Promise<Order> {
    const { data, error } = await this.supabase
      .from('pedidos')
      .update({
        ...orderData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Error al actualizar pedido: ${error.message}`)
    }

    // Obtener el pedido completo con relaciones
    const completeOrder = await this.getOrderById(id)
    if (!completeOrder) {
      throw new Error('Error al obtener el pedido actualizado')
    }

    return completeOrder
  }

  // Cancelar un pedido
  async cancelOrder(id: string): Promise<Order> {
    return this.updateOrder(id, { status: 'cancelled' })
  }

  // Actualizar estado del pedido
  async updateOrderStatus(id: string, status: string): Promise<Order> {
    return this.updateOrder(id, { status: status as any })
  }

  // Obtener estadísticas de pedidos
  async getOrderStats(userId?: string): Promise<OrderStats> {
    let query = this.supabase
      .from('pedidos')
      .select('status, total')

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Error al obtener estadísticas: ${error.message}`)
    }

    const orders = data || []
    const totalOrders = orders.length
    const pendingOrders = orders.filter(o => o.status === 'pending').length
    const completedOrders = orders.filter(o => o.status === 'delivered').length
    const cancelledOrders = orders.filter(o => o.status === 'cancelled').length
    const totalRevenue = orders
      .filter(o => o.status === 'delivered')
      .reduce((sum, o) => sum + o.total, 0)
    const averageOrderValue = totalOrders > 0 ? totalRevenue / completedOrders : 0

    return {
      total_orders: totalOrders,
      pending_orders: pendingOrders,
      completed_orders: completedOrders,
      cancelled_orders: cancelledOrders,
      total_revenue: Math.round(totalRevenue * 100) / 100,
      average_order_value: Math.round(averageOrderValue * 100) / 100,
    }
  }

  // Obtener pedidos por tienda
  async getOrdersByStore(storeId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('pedidos')
      .select(`
        *,
        items:pedido_items(
          *,
          product:productos(
            id,
            nombre,
            imagen_url,
            tienda_id,
            tienda:tiendas(nombre)
          )
        )
      `)
      .eq('items.product.tienda_id', storeId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Error al obtener pedidos de la tienda: ${error.message}`)
    }

    return data || []
  }
}

// Instancia singleton del servicio
export const orderService = new OrderService()
