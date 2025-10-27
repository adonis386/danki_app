// =============================================
// SERVICIO DE CANCELACIÓN DE PEDIDOS INDEPENDIENTE
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types/order'

const supabase = createClient()

export class OrderCancelService {
  // Cancelar pedido de forma completamente independiente
  static async cancelOrder(id: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      console.log('🚀 [OrderCancelService] Iniciando cancelación:', id)
      
      // Paso 1: Verificar que el pedido existe y obtener datos básicos
      const { data: currentOrder, error: fetchError } = await supabase
        .from('pedidos')
        .select('id, status, user_id, total, created_at, updated_at')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('❌ [OrderCancelService] Error al obtener pedido:', fetchError)
        return { 
          success: false, 
          error: `Pedido no encontrado: ${fetchError.message}` 
        }
      }

      if (!currentOrder) {
        return { 
          success: false, 
          error: 'Pedido no encontrado' 
        }
      }

      console.log('✅ [OrderCancelService] Pedido encontrado - Estado:', currentOrder.status)

      // Paso 2: Validar que se puede cancelar
      if (currentOrder.status === 'cancelled') {
        return { 
          success: false, 
          error: 'El pedido ya está cancelado' 
        }
      }

      if (['delivered', 'out_for_delivery'].includes(currentOrder.status)) {
        return { 
          success: false, 
          error: 'No se puede cancelar un pedido que ya está en camino o entregado' 
        }
      }

      console.log('✅ [OrderCancelService] Validaciones pasadas')

      // Paso 3: Cancelar el pedido
      console.log('🔄 [OrderCancelService] Ejecutando UPDATE para pedido:', id)
      
      const { data: updatedOrder, error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select('id, status, user_id, total, created_at, updated_at')

      console.log('📊 [OrderCancelService] Resultado UPDATE:', { updatedOrder, updateError })

      if (updateError) {
        console.error('❌ [OrderCancelService] Error al actualizar:', updateError)
        
        // Si es error PGRST116, significa que no se encontró el pedido
        if (updateError.code === 'PGRST116') {
          return { 
            success: false, 
            error: 'El pedido no existe o ya fue eliminado' 
          }
        }
        
        return { 
          success: false, 
          error: `Error al cancelar: ${updateError.message}` 
        }
      }

      // Verificar si se actualizó alguna fila
      if (!updatedOrder || updatedOrder.length === 0) {
        console.error('❌ [OrderCancelService] No se actualizó ninguna fila')
        return { 
          success: false, 
          error: 'No se pudo cancelar el pedido - pedido no encontrado' 
        }
      }

      console.log('✅ [OrderCancelService] Pedido cancelado exitosamente')

      // Paso 4: Cancelar asignación de repartidor (no crítico)
      try {
        const { error: assignmentError } = await supabase
          .from('asignaciones_repartidor')
          .update({ 
            estado: 'cancelado',
            updated_at: new Date().toISOString()
          })
          .eq('pedido_id', id)
          .eq('estado', 'asignado')

        if (assignmentError) {
          console.warn('⚠️ [OrderCancelService] No se pudo cancelar asignación:', assignmentError.message)
        } else {
          console.log('✅ [OrderCancelService] Asignación cancelada')
        }
      } catch (assignmentError) {
        console.warn('⚠️ [OrderCancelService] Error en asignación:', assignmentError)
      }

      // Paso 5: Actualizar tracking (no crítico)
      try {
        const { error: trackingError } = await supabase
          .from('tracking_pedido')
          .insert({
            pedido_id: id,
            estado: 'cancelado',
            mensaje: 'El pedido ha sido cancelado por el cliente',
            timestamp: new Date().toISOString()
          })

        if (trackingError) {
          console.warn('⚠️ [OrderCancelService] No se pudo actualizar tracking:', trackingError.message)
        } else {
          console.log('✅ [OrderCancelService] Tracking actualizado')
        }
      } catch (trackingError) {
        console.warn('⚠️ [OrderCancelService] Error en tracking:', trackingError)
      }

      // Paso 6: Crear objeto Order básico
      const cancelledOrder: Order = {
        id: updatedOrder[0].id,
        user_id: updatedOrder[0].user_id,
        status: updatedOrder[0].status as any,
        total: updatedOrder[0].total || 0,
        subtotal: (updatedOrder[0] as any).subtotal || updatedOrder[0].total || 0,
        delivery_fee: (updatedOrder[0] as any).delivery_fee || 0,
        tax: (updatedOrder[0] as any).tax || 0,
        delivery_address: (updatedOrder[0] as any).delivery_address || '',
        delivery_phone: (updatedOrder[0] as any).delivery_phone || '',
        payment_method: 'cash',
        estimated_delivery_time: (updatedOrder[0] as any).estimated_delivery_time || 30,
        items: [],
        created_at: updatedOrder[0].created_at,
        updated_at: updatedOrder[0].updated_at,
      }

      console.log('🎉 [OrderCancelService] Cancelación completada exitosamente')
      
      return { 
        success: true, 
        order: cancelledOrder 
      }

    } catch (error) {
      console.error('❌ [OrderCancelService] Error completo:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  // Método para verificar si un pedido se puede cancelar
  static async canCancelOrder(id: string): Promise<{ canCancel: boolean; reason?: string }> {
    try {
      const { data: order, error } = await supabase
        .from('pedidos')
        .select('status')
        .eq('id', id)
        .single()

      if (error || !order) {
        return { canCancel: false, reason: 'Pedido no encontrado' }
      }

      if (order.status === 'cancelled') {
        return { canCancel: false, reason: 'El pedido ya está cancelado' }
      }

      if (['delivered', 'out_for_delivery'].includes(order.status)) {
        return { canCancel: false, reason: 'No se puede cancelar un pedido que ya está en camino o entregado' }
      }

      return { canCancel: true }
    } catch (error) {
      return { canCancel: false, reason: 'Error al verificar el pedido' }
    }
  }
}
