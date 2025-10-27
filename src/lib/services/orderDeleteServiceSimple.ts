// =============================================
// SERVICIO DE ELIMINACIÓN SIMPLE Y CONFIABLE
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export class OrderDeleteServiceSimple {
  // Eliminación simple usando solo status 'cancelled' (que sabemos que funciona)
  static async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 [OrderDeleteServiceSimple] Eliminación simple:', orderId)
      
      // Paso 1: Verificar que el pedido existe
      const { data: existingOrder, error: fetchError } = await supabase
        .from('pedidos')
        .select('id, status, user_id')
        .eq('id', orderId)
        .single()

      if (fetchError) {
        console.error('❌ [OrderDeleteServiceSimple] Error al verificar pedido:', fetchError)
        return { 
          success: false, 
          error: `Pedido no encontrado: ${fetchError.message}` 
        }
      }

      if (!existingOrder) {
        return { 
          success: false, 
          error: 'El pedido no existe' 
        }
      }

      console.log('✅ [OrderDeleteServiceSimple] Pedido encontrado - Estado:', existingOrder.status)
      console.log('🔍 [OrderDeleteServiceSimple] Detalles del pedido:', {
        id: existingOrder.id,
        status: existingOrder.status,
        user_id: existingOrder.user_id
      })

      // Paso 2: Marcar como 'cancelled' (que sabemos que funciona)
      console.log('🔄 [OrderDeleteServiceSimple] Marcando como cancelled...')
      
      const { data: updateResult, error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select('id')

      console.log('📊 [OrderDeleteServiceSimple] Resultado UPDATE:', { updateResult, updateError })

      if (updateError) {
        console.error('❌ [OrderDeleteServiceSimple] Error al actualizar:', updateError)
        return { 
          success: false, 
          error: `Error al eliminar: ${updateError.message}` 
        }
      }

      if (updateResult && updateResult.length > 0) {
        console.log('✅ [OrderDeleteServiceSimple] Pedido marcado como cancelled exitosamente')
        return { success: true }
      } else {
        console.warn('⚠️ [OrderDeleteServiceSimple] UPDATE no actualizó ninguna fila')
        
        // Intentar con más información de debugging
        console.log('🔍 [OrderDeleteServiceSimple] Intentando UPDATE con más contexto...')
        
        const { data: debugResult, error: debugError } = await supabase
          .from('pedidos')
          .update({ 
            status: 'cancelled',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .eq('user_id', existingOrder.user_id) // Agregar filtro por user_id
          .select('id, status, user_id')

        console.log('📊 [OrderDeleteServiceSimple] Resultado UPDATE con user_id:', { debugResult, debugError })

        if (debugError) {
          return { 
            success: false, 
            error: `Error al eliminar: UPDATE no actualizó ninguna fila` 
          }
        }

        if (debugResult && debugResult.length > 0) {
          console.log('✅ [OrderDeleteServiceSimple] UPDATE con user_id exitoso')
          return { success: true }
        } else {
          return { 
            success: false, 
            error: `No se pudo eliminar el pedido - posiblemente no tienes permisos para modificar este pedido o ya fue eliminado` 
          }
        }
      }

    } catch (error) {
      console.error('❌ [OrderDeleteServiceSimple] Error inesperado:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}
