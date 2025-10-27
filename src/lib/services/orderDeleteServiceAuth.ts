// =============================================
// SERVICIO DE ELIMINACIÓN CON AUTENTICACIÓN
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export class OrderDeleteServiceAuth {
  // Eliminación con verificación de autenticación
  static async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 [OrderDeleteServiceAuth] Eliminación con auth:', orderId)
      
      // Paso 1: Obtener usuario actual
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        console.error('❌ [OrderDeleteServiceAuth] Error de autenticación:', authError)
        return { 
          success: false, 
          error: 'No estás autenticado. Por favor, inicia sesión nuevamente.' 
        }
      }

      console.log('✅ [OrderDeleteServiceAuth] Usuario autenticado:', user.id)

      // Paso 2: Verificar que el pedido existe y pertenece al usuario
      const { data: existingOrder, error: fetchError } = await supabase
        .from('pedidos')
        .select('id, status, user_id')
        .eq('id', orderId)
        .eq('user_id', user.id) // Solo pedidos del usuario actual
        .single()

      if (fetchError) {
        console.error('❌ [OrderDeleteServiceAuth] Error al verificar pedido:', fetchError)
        return { 
          success: false, 
          error: `Pedido no encontrado o no tienes permisos: ${fetchError.message}` 
        }
      }

      if (!existingOrder) {
        return { 
          success: false, 
          error: 'El pedido no existe o no tienes permisos para eliminarlo' 
        }
      }

      console.log('✅ [OrderDeleteServiceAuth] Pedido encontrado - Estado:', existingOrder.status)
      console.log('🔍 [OrderDeleteServiceAuth] Detalles del pedido:', {
        id: existingOrder.id,
        status: existingOrder.status,
        user_id: existingOrder.user_id,
        current_user: user.id
      })

      // Paso 3: Marcar como 'cancelled' con filtro por user_id
      console.log('🔄 [OrderDeleteServiceAuth] Marcando como cancelled...')
      
      const { data: updateResult, error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .eq('user_id', user.id) // Doble verificación por user_id
        .select('id, status, user_id')

      console.log('📊 [OrderDeleteServiceAuth] Resultado UPDATE:', { updateResult, updateError })

      if (updateError) {
        console.error('❌ [OrderDeleteServiceAuth] Error al actualizar:', updateError)
        return { 
          success: false, 
          error: `Error al eliminar: ${updateError.message}` 
        }
      }

      if (updateResult && updateResult.length > 0) {
        console.log('✅ [OrderDeleteServiceAuth] Pedido marcado como cancelled exitosamente')
        console.log('📊 [OrderDeleteServiceAuth] Pedido actualizado:', updateResult[0])
        return { success: true }
      } else {
        console.warn('⚠️ [OrderDeleteServiceAuth] UPDATE no actualizó ninguna fila')
        return { 
          success: false, 
          error: 'No se pudo eliminar el pedido - posiblemente ya fue eliminado o no tienes permisos' 
        }
      }

    } catch (error) {
      console.error('❌ [OrderDeleteServiceAuth] Error inesperado:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}
