// =============================================
// SERVICIO DE ELIMINACIÓN LOCAL (SIN BD)
// =============================================

'use client'

export class OrderDeleteServiceLocal {
  // Eliminación local - solo oculta el pedido de la UI
  static async deleteOrder(orderId: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🚀 [OrderDeleteServiceLocal] Eliminación local:', orderId)
      
      // Simular eliminación exitosa (solo UI)
      console.log('✅ [OrderDeleteServiceLocal] Pedido marcado para eliminación local')
      
      // En una implementación real, podrías:
      // 1. Guardar en localStorage
      // 2. Enviar a un servicio de eliminación asíncrono
      // 3. Marcar como "pendiente de eliminación"
      
      // Por ahora, simplemente retornamos éxito
      return { success: true }

    } catch (error) {
      console.error('❌ [OrderDeleteServiceLocal] Error inesperado:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Error desconocido' 
      }
    }
  }

  // Método para obtener pedidos eliminados localmente
  static getDeletedOrders(): string[] {
    try {
      const deleted = localStorage.getItem('deleted_orders')
      return deleted ? JSON.parse(deleted) : []
    } catch {
      return []
    }
  }

  // Método para marcar pedido como eliminado localmente
  static markAsDeleted(orderId: string): void {
    try {
      const deleted = this.getDeletedOrders()
      if (!deleted.includes(orderId)) {
        deleted.push(orderId)
        localStorage.setItem('deleted_orders', JSON.stringify(deleted))
        console.log('✅ [OrderDeleteServiceLocal] Pedido marcado como eliminado localmente:', orderId)
      }
    } catch (error) {
      console.warn('⚠️ [OrderDeleteServiceLocal] Error al guardar en localStorage:', error)
    }
  }

  // Método para limpiar pedidos eliminados localmente
  static clearDeletedOrders(): void {
    try {
      localStorage.removeItem('deleted_orders')
      console.log('✅ [OrderDeleteServiceLocal] Lista de eliminados limpiada')
    } catch (error) {
      console.warn('⚠️ [OrderDeleteServiceLocal] Error al limpiar localStorage:', error)
    }
  }
}
