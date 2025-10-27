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
      if (filters.exclude_status && filters.exclude_status.length > 0) {
        query = query.not('status', 'in', `(${filters.exclude_status.join(',')})`)
      }
    }

    const { data, error } = await query

    if (error) {
      console.error('❌ [OrderService] Error de Supabase:', error)
      
      // Si es un error de RLS, mostrar mensaje más claro
      if (error.message && error.message.includes('infinite recursion')) {
        throw new Error('Error de políticas RLS. Ejecuta database/fix_pedidos_rls_simple.sql')
      }
      
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
      
      console.log('🚀 [OrderService] Iniciando asignación automática para pedido:', order.id)
      
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
        console.log('✅ [OrderService] Repartidor asignado automáticamente:', asignacion.repartidor.nombre)
      } else {
        console.log('⚠️ [OrderService] No se pudo asignar repartidor automáticamente')
        // Notificar a admin o crear tracking manual
      }
    } catch (error) {
      console.error('❌ [OrderService] Error en asignación automática (no crítico):', error)
      
      // Si es un error de tabla faltante, mostrar mensaje más claro
      if (error && typeof error === 'object' && 'message' in error && 
          typeof error.message === 'string' && error.message.includes('no existe')) {
        console.warn('⚠️ [OrderService] Tablas de tracking faltantes. Ejecuta los scripts SQL necesarios.')
      }
      
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
    try {
      // Primero verificar que el pedido existe
      const { data: existingOrder, error: checkError } = await this.supabase
        .from('pedidos')
        .select('id')
        .eq('id', id)
        .single()

      if (checkError || !existingOrder) {
        throw new Error(`Pedido no encontrado: ${id}`)
      }

      // Actualizar el pedido
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

      if (!data) {
        throw new Error('No se pudo actualizar el pedido')
      }

      // Obtener el pedido completo con relaciones
      const completeOrder = await this.getOrderById(id)
      if (!completeOrder) {
        throw new Error('Error al obtener el pedido actualizado')
      }

      return completeOrder
    } catch (error) {
      console.error('Error en updateOrder:', error)
      throw error
    }
  }

  // Cancelar un pedido (versión completamente independiente)
  async cancelOrder(id: string): Promise<Order> {
    try {
      console.log('🚀 Iniciando cancelación del pedido:', id)
      
      // Paso 1: Verificar que el pedido existe
      const { data: currentOrder, error: fetchError } = await this.supabase
        .from('pedidos')
        .select('id, status, user_id')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('❌ Error al obtener pedido:', fetchError)
        throw new Error(`Pedido no encontrado: ${fetchError.message}`)
      }

      if (!currentOrder) {
        throw new Error('Pedido no encontrado')
      }

      console.log('✅ Pedido encontrado - Estado actual:', currentOrder.status)

      // Paso 2: Validar que se puede cancelar
      if (currentOrder.status === 'cancelled') {
        throw new Error('El pedido ya está cancelado')
      }

      if (['delivered', 'out_for_delivery'].includes(currentOrder.status)) {
        throw new Error('No se puede cancelar un pedido que ya está en camino o entregado')
      }

      console.log('✅ Validaciones pasadas - Procediendo con cancelación')

      // Paso 3: Cancelar el pedido directamente
      const { data: updatedOrder, error: updateError } = await this.supabase
        .from('pedidos')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, status, user_id, total, created_at, updated_at')
        .single()

      if (updateError) {
        console.error('❌ Error al actualizar pedido:', updateError)
        throw new Error(`Error al cancelar el pedido: ${updateError.message}`)
      }

      if (!updatedOrder) {
        throw new Error('No se pudo cancelar el pedido')
      }

      console.log('✅ Pedido cancelado exitosamente')

      // Paso 4: Cancelar asignación de repartidor (opcional)
      try {
        const { error: assignmentError } = await this.supabase
          .from('asignaciones_repartidor')
          .update({ 
            estado: 'cancelado',
            updated_at: new Date().toISOString()
          })
          .eq('pedido_id', id)
          .eq('estado', 'asignado')

        if (assignmentError) {
          console.warn('⚠️ No se pudo cancelar asignación:', assignmentError.message)
        } else {
          console.log('✅ Asignación de repartidor cancelada')
        }
      } catch (assignmentError) {
        console.warn('⚠️ Error al cancelar asignación:', assignmentError)
      }

      // Paso 5: Actualizar tracking (opcional)
      try {
        const { error: trackingError } = await this.supabase
          .from('tracking_pedido')
          .insert({
            pedido_id: id,
            estado: 'cancelado',
            mensaje: 'El pedido ha sido cancelado por el cliente',
            timestamp: new Date().toISOString()
          })

        if (trackingError) {
          console.warn('⚠️ No se pudo actualizar tracking:', trackingError.message)
        } else {
          console.log('✅ Tracking actualizado')
        }
      } catch (trackingError) {
        console.warn('⚠️ Error al actualizar tracking:', trackingError)
      }

      // Paso 6: Intentar obtener pedido completo, pero no fallar si no se puede
      try {
        const completeOrder = await this.getOrderById(id)
        if (completeOrder) {
          console.log('✅ Pedido completo obtenido')
          return completeOrder
        }
      } catch (getError) {
        console.warn('⚠️ No se pudo obtener pedido completo:', getError)
      }

      // Paso 7: Devolver pedido básico si no se puede obtener el completo
      console.log('✅ Devolviendo pedido básico')
      return {
        id: updatedOrder.id,
        user_id: updatedOrder.user_id,
        status: updatedOrder.status as any,
        total: updatedOrder.total || 0,
        subtotal: (updatedOrder as any).subtotal || updatedOrder.total || 0,
        delivery_fee: (updatedOrder as any).delivery_fee || 0,
        tax: (updatedOrder as any).tax || 0,
        delivery_address: (updatedOrder as any).delivery_address || '',
        delivery_phone: (updatedOrder as any).delivery_phone || '',
        payment_method: 'cash',
        estimated_delivery_time: (updatedOrder as any).estimated_delivery_time || 30,
        items: [],
        created_at: updatedOrder.created_at,
        updated_at: updatedOrder.updated_at,
      } as Order

    } catch (error) {
      console.error('❌ Error completo al cancelar pedido:', error)
      throw error
    }
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
