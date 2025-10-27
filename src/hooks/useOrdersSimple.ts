// =============================================
// HOOK SIMPLIFICADO PARA PEDIDOS SIN NOTIFICACIONES
// =============================================

'use client'

import { useState, useEffect, useCallback } from 'react'
import { orderService } from '@/lib/services/orderService'
import { Order, CreateOrderData, UpdateOrderData, OrderFilters, OrderStats, OrderStatus } from '@/types/order'
import { useAuth } from './useAuth'

export function useUserOrders(filters?: OrderFilters) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const fetchOrders = useCallback(async () => {
    try {
      console.log('🔄 [useOrdersSimple] Refetching orders...')
      setLoading(true)
      setError(null)
      
      // Crear filtros que incluyan el user_id del usuario actual y excluyan eliminados
      const userFilters = {
        ...filters,
        user_id: user?.id,
        exclude_status: ['cancelled'] as OrderStatus[] // Excluir pedidos cancelados/eliminados
      }
      
      console.log('🔍 [useOrdersSimple] Filtros aplicados:', userFilters)
      
      const data = await orderService.getOrders(userFilters)
      console.log('✅ [useOrdersSimple] Orders fetched:', data.length, 'orders')
      setOrders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('❌ [useOrdersSimple] Error al cargar pedidos:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters, user])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = useCallback(async (orderData: CreateOrderData) => {
    try {
      const newOrder = await orderService.createOrder(orderData)
      setOrders(prev => [newOrder, ...prev])
      return newOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error al crear pedido:', errorMessage)
      throw err
    }
  }, [])

  const updateOrder = useCallback(async (id: string, orderData: UpdateOrderData) => {
    try {
      const updatedOrder = await orderService.updateOrder(id, orderData)
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ))
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error al actualizar pedido:', errorMessage)
      throw err
    }
  }, [])

  const cancelOrder = useCallback(async (id: string) => {
    try {
      const cancelledOrder = await orderService.cancelOrder(id)
      setOrders(prev => prev.map(order => 
        order.id === id ? cancelledOrder : order
      ))
      return cancelledOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error al cancelar pedido:', errorMessage)
      throw err
    }
  }, [])

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, status)
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ))
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      console.error('Error al actualizar estado:', errorMessage)
      throw err
    }
  }, [])

  const forceRefetch = useCallback(async () => {
    console.log('🔄 [useOrdersSimple] Force refetching orders...')
    try {
      setLoading(true)
      setError(null)
      
      // Crear filtros que incluyan el user_id del usuario actual y excluyan eliminados
      const userFilters = {
        ...filters,
        user_id: user?.id,
        exclude_status: ['cancelled'] as OrderStatus[] // Excluir pedidos cancelados/eliminados
      }
      
      console.log('🔍 [useOrdersSimple] Force refetch con filtros:', userFilters)
      
      // Forzar recarga sin caché
      const data = await orderService.getOrders(userFilters)
      console.log('✅ [useOrdersSimple] Force refetch completed:', data.length, 'orders')
      setOrders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('❌ [useOrdersSimple] Error en force refetch:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters, user])

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    cancelOrder,
    updateOrderStatus,
    refetch: fetchOrders,
    forceRefetch,
  }
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchOrder = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrderById(id)
      setOrder(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      console.error('Error al cargar pedido:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchOrder()
  }, [fetchOrder])

  return {
    order,
    loading,
    error,
    refetch: fetchOrder,
  }
}
