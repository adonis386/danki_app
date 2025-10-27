// =============================================
// SERVICIO DE ELIMINACIÓN MEJORADO
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export class OrderDeleteService {
  // Eliminación inteligente con verificación previa
  static async deleteOrder(orderId: string): Promise<{ success: boolean; method: 'hard' | 'soft' | 'none'; error?: string }> {
    try {
      console.log('🚀 [OrderDeleteService] Iniciando eliminación:', orderId)
      
      // Paso 1: Verificar que el pedido existe
      const { data: existingOrder, error: fetchError } = await supabase
        .from('pedidos')
        .select('id, status, user_id')
        .eq('id', orderId)
        .single()

      if (fetchError) {
        console.error('❌ [OrderDeleteService] Error al verificar pedido:', fetchError)
        return { 
          success: false, 
          method: 'none',
          error: `Pedido no encontrado: ${fetchError.message}` 
        }
      }

      if (!existingOrder) {
        return { 
          success: false, 
          method: 'none',
          error: 'El pedido no existe' 
        }
      }

      console.log('✅ [OrderDeleteService] Pedido encontrado - Estado:', existingOrder.status)

      // Paso 2: Intentar DELETE directo
      console.log('🔄 [OrderDeleteService] Intentando DELETE directo...')
      
      const { data: deleteResult, error: deleteError } = await supabase
        .from('pedidos')
        .delete()
        .eq('id', orderId)
        .select('id')

      console.log('📊 [OrderDeleteService] Resultado DELETE:', { deleteResult, deleteError })

      if (deleteError) {
        console.warn('⚠️ [OrderDeleteService] DELETE falló, intentando soft delete:', deleteError.message)
        
        // Paso 3: Soft delete como fallback
        const { data: softDeleteResult, error: softDeleteError } = await supabase
          .from('pedidos')
          .update({ 
            status: 'deleted',
            updated_at: new Date().toISOString()
          })
          .eq('id', orderId)
          .select('id')

        console.log('📊 [OrderDeleteService] Resultado soft delete:', { softDeleteResult, softDeleteError })

        if (softDeleteError) {
          console.error('❌ [OrderDeleteService] Soft delete también falló:', softDeleteError)
          
          // Intentar con status 'cancelled' como último recurso
          console.log('🔄 [OrderDeleteService] Intentando con status cancelled como último recurso...')
          
          const { data: cancelledResult, error: cancelledError } = await supabase
            .from('pedidos')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select('id')

          console.log('📊 [OrderDeleteService] Resultado cancelled:', { cancelledResult, cancelledError })

          if (cancelledError) {
            return { 
              success: false, 
              method: 'none',
              error: `Error al eliminar: ${softDeleteError.message}. También falló con 'cancelled': ${cancelledError.message}` 
            }
          }

          if (cancelledResult && cancelledResult.length > 0) {
            console.log('✅ [OrderDeleteService] Marcado como cancelled exitosamente')
            return { success: true, method: 'soft' }
          } else {
            return { 
              success: false, 
              method: 'none',
              error: `No se pudo eliminar el pedido. Soft delete falló: ${softDeleteError.message}` 
            }
          }
        }

        if (softDeleteResult && softDeleteResult.length > 0) {
          console.log('✅ [OrderDeleteService] Soft delete exitoso')
          return { success: true, method: 'soft' }
        } else {
          console.warn('⚠️ [OrderDeleteService] Soft delete no actualizó nada')
          return { 
            success: false, 
            method: 'none',
            error: 'No se pudo eliminar el pedido - soft delete no actualizó ninguna fila' 
          }
        }
      } else {
        // DELETE directo fue exitoso
        if (deleteResult && deleteResult.length > 0) {
          console.log('✅ [OrderDeleteService] DELETE directo exitoso')
          return { success: true, method: 'hard' }
        } else {
          console.warn('⚠️ [OrderDeleteService] DELETE ejecutado pero no se eliminó nada')
          
          // Intentar soft delete como fallback
          const { data: softDeleteResult, error: softDeleteError } = await supabase
            .from('pedidos')
            .update({ 
              status: 'deleted',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)
            .select('id')

          if (softDeleteError) {
            console.error('❌ [OrderDeleteService] Soft delete fallback falló:', softDeleteError)
            
            // Intentar con status 'cancelled' como último recurso
            console.log('🔄 [OrderDeleteService] Intentando con status cancelled como último recurso...')
            
            const { data: cancelledResult, error: cancelledError } = await supabase
              .from('pedidos')
              .update({ 
                status: 'cancelled',
                updated_at: new Date().toISOString()
              })
              .eq('id', orderId)
              .select('id')

            console.log('📊 [OrderDeleteService] Resultado cancelled fallback:', { cancelledResult, cancelledError })

            if (cancelledError) {
              return { 
                success: false, 
                method: 'none',
                error: `Error al eliminar: ${softDeleteError.message}. También falló con 'cancelled': ${cancelledError.message}` 
              }
            }

            if (cancelledResult && cancelledResult.length > 0) {
              console.log('✅ [OrderDeleteService] Marcado como cancelled exitosamente (fallback)')
              return { success: true, method: 'soft' }
            } else {
              return { 
                success: false, 
                method: 'none',
                error: `No se pudo eliminar el pedido. Soft delete fallback falló: ${softDeleteError.message}` 
              }
            }
          }

          if (softDeleteResult && softDeleteResult.length > 0) {
            console.log('✅ [OrderDeleteService] Soft delete fallback exitoso')
            return { success: true, method: 'soft' }
          } else {
            return { 
              success: false, 
              method: 'none',
              error: 'No se pudo eliminar el pedido - soft delete fallback no actualizó ninguna fila' 
            }
          }
        }
      }

    } catch (error) {
      console.error('❌ [OrderDeleteService] Error inesperado:', error)
      return { 
        success: false, 
        method: 'none',
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}
