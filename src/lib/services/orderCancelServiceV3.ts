// =============================================
// SERVICIO DE CANCELACIÓN ULTRA SIMPLE
// =============================================

'use client'

import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export class OrderCancelServiceV3 {
  // Cancelación ultra simple - solo UPDATE, sin verificación
  static async cancelOrder(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 [OrderCancelServiceV3] Cancelación ultra simple:', id)
      
      // Solo actualizar el status - sin SELECT, sin verificación
      const { error } = await supabase
        .from('pedidos')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (error) {
        console.error('❌ [OrderCancelServiceV3] Error en UPDATE:', error)
        return { 
          success: false, 
          error: `Error al cancelar: ${error.message}` 
        }
      }

      console.log('✅ [OrderCancelServiceV3] UPDATE ejecutado exitosamente')
      return { success: true }

    } catch (error) {
      console.error('❌ [OrderCancelServiceV3] Error inesperado:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  // Versión con retry automático
  static async cancelOrderWithRetry(id: string, maxRetries: number = 3): Promise<{ success: boolean; error?: string }> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 [OrderCancelServiceV3] Intento ${attempt}/${maxRetries} para cancelar:`, id)
      
      const result = await this.cancelOrder(id)
      
      if (result.success) {
        console.log(`✅ [OrderCancelServiceV3] Cancelación exitosa en intento ${attempt}`)
        return result
      }
      
      if (attempt < maxRetries) {
        console.log(`⏳ [OrderCancelServiceV3] Esperando antes del siguiente intento...`)
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt)) // Espera incremental
      }
    }
    
    console.error(`❌ [OrderCancelServiceV3] Falló después de ${maxRetries} intentos`)
    return { 
      success: false, 
      error: `No se pudo cancelar después de ${maxRetries} intentos` 
    }
  }

  // Versión definitiva - solo UPDATE, sin verificaciones problemáticas
  static async cancelOrderSafe(id: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 [OrderCancelServiceV3] Cancelación definitiva:', id)
      
      // Solo UPDATE - sin verificaciones previas ni posteriores
      const { error: updateError } = await supabase
        .from('pedidos')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) {
        console.error('❌ [OrderCancelServiceV3] Error al actualizar:', updateError)
        return { 
          success: false, 
          error: `Error al cancelar: ${updateError.message}` 
        }
      }

      console.log('✅ [OrderCancelServiceV3] UPDATE ejecutado exitosamente')
      return { success: true }

    } catch (error) {
      console.error('❌ [OrderCancelServiceV3] Error inesperado:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }
}
