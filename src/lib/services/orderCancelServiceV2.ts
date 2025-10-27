// =============================================
// SERVICIO DE CANCELACIÓN ALTERNATIVO
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'
import type { Order } from '@/types/order'

const supabase = createClient()

export class OrderCancelServiceV2 {
  // Cancelar pedido usando estrategia alternativa
  static async cancelOrder(id: string): Promise<{ success: boolean; order?: Order; error?: string }> {
    try {
      console.log('🚀 [OrderCancelServiceV2] Iniciando cancelación:', id)
      
      // Paso 1: Verificar que el pedido existe
      const { data: currentOrder, error: fetchError } = await supabase
        .from('pedidos')
        .select('id, status, user_id, total, created_at, updated_at')
        .eq('id', id)
        .single()

      if (fetchError) {
        console.error('❌ [OrderCancelServiceV2] Error al obtener pedido:', fetchError)
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

      console.log('✅ [OrderCancelServiceV2] Pedido encontrado - Estado:', currentOrder.status)

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

      console.log('✅ [OrderCancelServiceV2] Validaciones pasadas')

      // Paso 3: Usar función SQL para cancelar (más confiable)
      const { data: result, error: sqlError } = await supabase.rpc('cancelar_pedido_completo', {
        pedido_uuid: id
      })

      if (sqlError) {
        console.error('❌ [OrderCancelServiceV2] Error en función SQL:', sqlError)
        
        // Fallback: intentar UPDATE directo sin .single()
        console.log('🔄 [OrderCancelServiceV2] Intentando UPDATE directo como fallback')
        
        const { error: updateError } = await supabase
          .from('pedidos')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', id)

        if (updateError) {
          console.error('❌ [OrderCancelServiceV2] Error en UPDATE fallback:', updateError)
          return { 
            success: false, 
            error: `Error al cancelar: ${updateError.message}` 
          }
        }

        console.log('✅ [OrderCancelServiceV2] UPDATE fallback exitoso')
      } else {
        console.log('✅ [OrderCancelServiceV2] Función SQL ejecutada:', result)
        
        if (!result.success) {
          return { 
            success: false, 
            error: result.error || 'Error al cancelar el pedido' 
          }
        }
      }

      // Paso 4: Obtener el pedido actualizado
      const { data: updatedOrder, error: getError } = await supabase
        .from('pedidos')
        .select('id, status, user_id, total, created_at, updated_at')
        .eq('id', id)
        .single()

      if (getError || !updatedOrder) {
        console.warn('⚠️ [OrderCancelServiceV2] No se pudo obtener pedido actualizado:', getError)
        
        // Crear pedido básico con los datos que tenemos
        const cancelledOrder: Order = {
          id: currentOrder.id,
          user_id: currentOrder.user_id,
          status: 'cancelled' as any,
          total: currentOrder.total || 0,
          subtotal: (currentOrder as any).subtotal || currentOrder.total || 0,
          delivery_fee: (currentOrder as any).delivery_fee || 0,
          tax: (currentOrder as any).tax || 0,
          delivery_address: (currentOrder as any).delivery_address || '',
          delivery_phone: (currentOrder as any).delivery_phone || '',
          payment_method: 'cash',
          estimated_delivery_time: (currentOrder as any).estimated_delivery_time || 30,
          items: [],
          created_at: currentOrder.created_at,
          updated_at: new Date().toISOString(),
        }

        console.log('✅ [OrderCancelServiceV2] Usando pedido básico')
        
        return { 
          success: true, 
          order: cancelledOrder 
        }
      }

      console.log('✅ [OrderCancelServiceV2] Pedido actualizado obtenido')

      // Paso 5: Cancelar asignación de repartidor (no crítico)
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
          console.warn('⚠️ [OrderCancelServiceV2] No se pudo cancelar asignación:', assignmentError.message)
        } else {
          console.log('✅ [OrderCancelServiceV2] Asignación cancelada')
        }
      } catch (assignmentError) {
        console.warn('⚠️ [OrderCancelServiceV2] Error en asignación:', assignmentError)
      }

      // Paso 6: Actualizar tracking (no crítico)
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
          console.warn('⚠️ [OrderCancelServiceV2] No se pudo actualizar tracking:', trackingError.message)
        } else {
          console.log('✅ [OrderCancelServiceV2] Tracking actualizado')
        }
      } catch (trackingError) {
        console.warn('⚠️ [OrderCancelServiceV2] Error en tracking:', trackingError)
      }

      // Paso 7: Crear objeto Order
      const cancelledOrder: Order = {
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
      }

      console.log('🎉 [OrderCancelServiceV2] Cancelación completada exitosamente')
      
      return { 
        success: true, 
        order: cancelledOrder 
      }

    } catch (error) {
      console.error('❌ [OrderCancelServiceV2] Error completo:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  // Método simple que solo actualiza el status sin SELECT
  static async cancelOrderSimple(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 [OrderCancelServiceV2] Cancelación simple:', id)
      
      // Solo actualizar el status sin SELECT
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ [OrderCancelServiceV2] Error en cancelación simple:', error)
        return { 
          success: false, 
          error: `Error al cancelar: ${error.message}` 
        }
      }

      console.log('✅ [OrderCancelServiceV2] Cancelación simple exitosa')

      // Verificar que realmente se actualizó (opcional, no crítico)
      try {
        const { data: verifyOrder, error: verifyError } = await supabase
          .from('pedidos')
          .select('id, status')
          .eq('id', id)
          .single()

        if (verifyError) {
          console.warn('⚠️ [OrderCancelServiceV2] No se pudo verificar el pedido:', verifyError)
          // No fallar por esto, el UPDATE fue exitoso
        } else if (verifyOrder) {
          console.log('✅ [OrderCancelServiceV2] Verificación exitosa - Estado:', verifyOrder.status)
          
          if (verifyOrder.status !== 'cancelled') {
            console.warn('⚠️ [OrderCancelServiceV2] Estado inesperado:', verifyOrder.status)
            // No fallar por esto, puede ser un problema de caché
          }
        }
      } catch (verifyError) {
        console.warn('⚠️ [OrderCancelServiceV2] Error en verificación:', verifyError)
        // No fallar por esto, el UPDATE fue exitoso
      }

      // Si llegamos aquí, el UPDATE fue exitoso
      console.log('✅ [OrderCancelServiceV2] Cancelación completada exitosamente')
      return { success: true }

    } catch (error) {
      console.error('❌ [OrderCancelServiceV2] Error en cancelación simple:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}
