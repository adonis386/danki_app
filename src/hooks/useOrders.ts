'use client'

import { useState, useEffect, useCallback } from 'react'
import { orderService } from '@/lib/services/orderService'
import { Order, CreateOrderData, UpdateOrderData, OrderFilters, OrderStats } from '@/types/order'
import { useNotification } from './useNotification'
import { useAuth } from './useAuth'

export function useOrders(filters?: OrderFilters) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showSuccess, showError } = useNotification()

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrders(filters)
      setOrders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar pedidos', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [filters, showError])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const createOrder = useCallback(async (orderData: CreateOrderData) => {
    try {
      const newOrder = await orderService.createOrder(orderData)
      setOrders(prev => [newOrder, ...prev])
      showSuccess('¡Pedido realizado!', 'Tu pedido ha sido creado exitosamente')
      return newOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al crear pedido', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const updateOrder = useCallback(async (id: string, orderData: UpdateOrderData) => {
    try {
      const updatedOrder = await orderService.updateOrder(id, orderData)
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ))
      showSuccess('Pedido actualizado', 'El pedido se ha actualizado exitosamente')
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al actualizar pedido', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const cancelOrder = useCallback(async (id: string) => {
    try {
      const cancelledOrder = await orderService.cancelOrder(id)
      setOrders(prev => prev.map(order => 
        order.id === id ? cancelledOrder : order
      ))
      showSuccess('Pedido cancelado', 'El pedido ha sido cancelado exitosamente')
      return cancelledOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al cancelar pedido', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  const updateOrderStatus = useCallback(async (id: string, status: string) => {
    try {
      const updatedOrder = await orderService.updateOrderStatus(id, status)
      setOrders(prev => prev.map(order => 
        order.id === id ? updatedOrder : order
      ))
      showSuccess('Estado actualizado', `El pedido ahora está ${status}`)
      return updatedOrder
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al actualizar estado', errorMessage)
      throw err
    }
  }, [showSuccess, showError])

  return {
    orders,
    loading,
    error,
    createOrder,
    updateOrder,
    cancelOrder,
    updateOrderStatus,
    refetch: fetchOrders,
  }
}

export function useOrder(id: string) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  const fetchOrder = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getOrderById(id)
      setOrder(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar pedido', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [id, showError])

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

export function useUserOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { showError } = useNotification()

  const fetchUserOrders = useCallback(async () => {
    if (!user?.id) {
      setOrders([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      const data = await orderService.getUserOrders(user.id)
      setOrders(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      showError('Error al cargar pedidos', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user?.id, showError])

  useEffect(() => {
    fetchUserOrders()
  }, [fetchUserOrders])

  return {
    orders,
    loading,
    error,
    refetch: fetchUserOrders,
  }
}

export function useOrderStats() {
  const { user } = useAuth()
  const [stats, setStats] = useState<OrderStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { showError } = useNotification()

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      const data = await orderService.getOrderStats(user?.id)
      setStats(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      showError('Error al cargar estadísticas', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [user?.id, showError])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    refetch: fetchStats,
  }
}
