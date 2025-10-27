'use client'

import { useState, useEffect } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, CreditCard, Navigation, AlertTriangle, Star, MessageCircle } from 'lucide-react'
import Link from 'next/link'
import { useUserOrders } from '@/hooks/useOrdersSimple'
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order'
import HomeButton from '@/components/HomeButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'
import { useConfirmDialog } from '@/components/ConfirmDialog'
import { useToast } from '@/components/Toast'
import { createClient } from '@/lib/supabase/client'
import { OrderDeleteServiceLocal } from '@/lib/services/orderDeleteServiceLocal'
import SistemaCalificaciones from '@/components/SistemaCalificaciones'
import ChatComponent from '@/components/ChatComponent'
import { chatService } from '@/lib/services/chatService'

export default function PedidosPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null)
  const [showCalificacion, setShowCalificacion] = useState<string | null>(null)
  const [showChat, setShowChat] = useState<string | null>(null)
  const { orders: initialOrders, loading, error, refetch, forceRefetch } = useUserOrders()
  const [orders, setOrders] = useState(initialOrders)
  const { showConfirm, hideConfirm, ConfirmDialogComponent } = useConfirmDialog()
  const { showToast, ToastContainer } = useToast()
  const supabase = createClient()

  // Sincronizar orders cuando cambien y filtrar eliminados localmente
  useEffect(() => {
    const deletedOrders = OrderDeleteServiceLocal.getDeletedOrders()
    const filteredOrders = initialOrders.filter(order => !deletedOrders.includes(order.id))
    setOrders(filteredOrders)
    console.log('🔍 [PedidosPage] Pedidos filtrados:', {
      total: initialOrders.length,
      eliminados: deletedOrders.length,
      mostrados: filteredOrders.length
    })
  }, [initialOrders])

  const filteredOrders = selectedStatus === 'all' 
    ? orders 
    : orders.filter(order => order.status === selectedStatus)

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5" />
      case 'confirmed':
      case 'preparing':
        return <Package className="w-5 h-5" />
      case 'ready':
      case 'out_for_delivery':
        return <Truck className="w-5 h-5" />
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />
      case 'cancelled':
        return <XCircle className="w-5 h-5" />
      default:
        return <Package className="w-5 h-5" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handleCancelOrder = async (orderId: string) => {
    showConfirm({
      title: 'Cancelar Pedido',
      message: '¿Estás seguro de que quieres cancelar este pedido?\n\n⚠️ Esta acción no se puede deshacer.\nSi el pedido ya está siendo preparado, podrías incurrir en cargos.',
      confirmText: 'Sí, Cancelar',
      cancelText: 'No, Mantener',
      type: 'danger',
      isLoading: cancellingOrderId === orderId,
      onConfirm: async () => {
        try {
          setCancellingOrderId(orderId)
          
          console.log('🚀 [PedidosPage] Cancelación directa:', orderId)
          
          // Cancelación directa con Supabase - sin servicios intermedios
          const { error: updateError } = await supabase
            .from('pedidos')
            .update({ 
              status: 'cancelled',
              updated_at: new Date().toISOString()
            })
            .eq('id', orderId)

          if (updateError) {
            console.error('❌ [PedidosPage] Error en UPDATE:', updateError)
            showToast(`❌ Error al cancelar: ${updateError.message}`, 'error')
          } else {
            console.log('✅ [PedidosPage] UPDATE exitoso, actualizando UI...')
            
            // Actualizar el estado local inmediatamente
            const updatedOrders = orders.map(order => 
              order.id === orderId 
                ? { ...order, status: 'cancelled' as any, updated_at: new Date().toISOString() }
                : order
            )
            
            // Forzar re-render con el estado actualizado
            setOrders(updatedOrders)
            
            // Mostrar mensaje de éxito
            showToast('✅ Pedido cancelado exitosamente', 'success')
            console.log('✅ [PedidosPage] UI actualizada y toast mostrado')
            
            // NO hacer refetch - mantener el estado local actualizado
            console.log('ℹ️ [PedidosPage] Manteniendo estado local sin refetch')
          }
          
        } catch (error) {
          console.error('❌ [PedidosPage] Error inesperado:', error)
          showToast('❌ Error inesperado al cancelar el pedido', 'error')
        } finally {
          setCancellingOrderId(null)
          hideConfirm() // Cerrar el diálogo después de la operación
        }
      }
    })
  }

  const handleDeleteOrder = async (orderId: string) => {
    showConfirm({
      title: 'Eliminar Pedido',
      message: '¿Estás seguro de que quieres eliminar este pedido?\n\n⚠️ Esta acción lo ocultará de tu lista de pedidos.\nEl pedido permanecerá en el sistema pero no será visible para ti.',
      confirmText: 'Sí, Eliminar',
      cancelText: 'No, Mantener',
      type: 'danger',
      isLoading: cancellingOrderId === orderId,
      onConfirm: async () => {
        try {
          setCancellingOrderId(orderId)
          
          console.log('🚀 [PedidosPage] Eliminación con servicio mejorado:', orderId)
          
          // Usar el servicio local de eliminación
          const result = await OrderDeleteServiceLocal.deleteOrder(orderId)
          
          if (result.success) {
            console.log('✅ [PedidosPage] Eliminación local exitosa')
            
            // Marcar como eliminado localmente
            OrderDeleteServiceLocal.markAsDeleted(orderId)
            
            // Remover el pedido del estado local
            const updatedOrders = orders.filter(order => order.id !== orderId)
            setOrders(updatedOrders)
            
            // Mostrar mensaje de éxito
            showToast('✅ Pedido eliminado exitosamente', 'success')
            console.log('✅ [PedidosPage] Pedido eliminado de la UI (eliminación local)')
          } else {
            console.error('❌ [PedidosPage] Error en eliminación local:', result.error)
            showToast(`❌ ${result.error}`, 'error')
          }
          
        } catch (error) {
          console.error('❌ [PedidosPage] Error inesperado:', error)
          showToast('❌ Error inesperado al eliminar el pedido', 'error')
        } finally {
          setCancellingOrderId(null)
          hideConfirm() // Cerrar el diálogo después de la operación
        }
      }
    })
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <Header />
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <HomeButton />
            </div>
            <h1 className="text-5xl font-black text-gray-900 mb-4">Mis Pedidos</h1>
            <p className="text-lg text-gray-600">Gestiona y revisa el estado de tus pedidos</p>
          </div>

          {/* Filters */}
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-6 mb-8">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                  selectedStatus === 'all'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Todos ({orders.length})
              </button>
              {Object.entries(ORDER_STATUS_LABELS).map(([status, label]) => {
                const count = orders.filter(order => order.status === status).length
                return (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status as OrderStatus)}
                    className={`px-4 py-2 rounded-xl font-semibold transition-all ${
                      selectedStatus === status
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {label} ({count})
                  </button>
                )
              })}
            </div>
          </div>

          {/* Orders List */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Cargando pedidos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-600 font-semibold">Error: {error}</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {selectedStatus === 'all' ? 'No tienes pedidos' : `No hay pedidos ${ORDER_STATUS_LABELS[selectedStatus as OrderStatus].toLowerCase()}`}
              </h3>
              <p className="text-gray-600">
                {selectedStatus === 'all' 
                  ? 'Realiza tu primer pedido para verlo aquí'
                  : 'No se encontraron pedidos con este estado'
                }
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 overflow-hidden">
                  {/* Order Header */}
                  <div className="p-6 border-b border-gray-200">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${ORDER_STATUS_COLORS[order.status]}`}>
                          {getStatusIcon(order.status)}
                        </div>
                        <div>
                          <Link 
                            href={`/pedidos/${order.id}/tracking`}
                            className="text-xl font-bold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                          >
                            Pedido #{order.id.slice(-8).toUpperCase()}
                          </Link>
                          <p className="text-gray-600">
                            {formatDate(order.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600">
                          ${order.total.toFixed(2)}
                        </p>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${ORDER_STATUS_COLORS[order.status]}`}>
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="p-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">Productos</h4>
                    <div className="grid gap-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                          {item.product.imagen_url ? (
                            <img
                              src={item.product.imagen_url}
                              alt={item.product.nombre}
                              className="w-16 h-16 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <Package className="w-8 h-8 text-white" />
                            </div>
                          )}
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900">{item.product.nombre}</h5>
                            <p className="text-sm text-gray-600">{item.product.tienda_nombre}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${item.price.toFixed(2)}</p>
                            <p className="text-sm text-gray-600">x{item.quantity}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Details */}
                  <div className="p-6 bg-gray-50 border-t border-gray-200">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Delivery Info */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin className="w-5 h-5" />
                          Información de Entrega
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Dirección:</strong> {order.delivery_address}</p>
                          <p><strong>Teléfono:</strong> {order.delivery_phone}</p>
                          {order.delivery_notes && (
                            <p><strong>Notas:</strong> {order.delivery_notes}</p>
                          )}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard className="w-5 h-5" />
                          Información de Pago
                        </h4>
                        <div className="space-y-2 text-sm">
                          <p><strong>Método:</strong> {order.payment_method === 'cash' ? 'Efectivo' : 'Tarjeta'}</p>
                          <p><strong>Subtotal:</strong> ${order.subtotal.toFixed(2)}</p>
                          <p><strong>Delivery:</strong> ${order.delivery_fee.toFixed(2)}</p>
                          <p><strong>IVA:</strong> ${order.tax.toFixed(2)}</p>
                          <p><strong>Total:</strong> ${order.total.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Botones de Acción */}
                    <div className="mt-6 flex flex-col sm:flex-row gap-3">
                      {/* Botón de Tracking - Siempre visible para pedidos activos */}
                      {order.status !== 'delivered' && order.status !== 'cancelled' && (
                        <Link
                          href={`/pedidos/${order.id}/tracking`}
                          className="flex items-center justify-center gap-2 flex-1 bg-orange-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-orange-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          <Navigation size={20} />
                          {order.status === 'pending' ? 'Ver Detalles del Pedido' : 'Ver Seguimiento en Tiempo Real'}
                        </Link>
                      )}
                      
                      {/* Botón de Reordenar - Solo para pedidos entregados */}
                      {order.status === 'delivered' && (
                        <Link
                          href={`/tiendas/${order.items[0]?.product.tienda_id}`}
                          className="flex items-center justify-center gap-2 flex-1 bg-green-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-green-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          <Package size={20} />
                          Volver a Pedir
                        </Link>
                      )}
                      
                      {/* Botón de Chat - Para pedidos con repartidor asignado */}
                      {(order.status === 'confirmed' || order.status === 'preparing' || order.status === 'ready' || order.status === 'out_for_delivery') && (
                        <button
                          onClick={() => setShowChat(order.id)}
                          className="flex items-center justify-center gap-2 flex-1 bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
                        >
                          <MessageCircle size={20} />
                          Chat con Repartidor
                        </button>
                      )}
                      
                      {/* Botones de Acción */}
                      <div className="flex gap-3">
                        {/* Botón de Cancelar - Solo para pedidos pendientes */}
                        {order.status === 'pending' && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancellingOrderId === order.id}
                            className={`flex items-center justify-center gap-2 flex-1 font-semibold py-3 px-6 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                              cancellingOrderId === order.id
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-red-600 text-white hover:bg-red-700'
                            }`}
                          >
                            {cancellingOrderId === order.id ? (
                              <>
                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Cancelando...
                              </>
                            ) : (
                              <>
                                <XCircle size={20} />
                                Cancelar
                              </>
                            )}
                          </button>
                        )}

                        {/* Botón de Eliminar - Para todos los pedidos */}
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className={`flex items-center justify-center gap-2 font-semibold py-3 px-4 rounded-xl transition-all shadow-lg hover:shadow-xl ${
                            cancellingOrderId === order.id
                              ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                              : 'bg-gray-600 text-white hover:bg-gray-700'
                          }`}
                        >
                          {cancellingOrderId === order.id ? (
                            <>
                              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            </>
                          ) : (
                            <>
                              <XCircle size={18} />
                              Eliminar
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Componente de confirmación */}
      <ConfirmDialogComponent />
      
      {/* Componente de toasts */}
      {/* Modal de Calificación */}
      {showCalificacion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Calificar Repartidor
                </h3>
                <button
                  onClick={() => setShowCalificacion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <SistemaCalificaciones
                pedidoId={showCalificacion}
                tipo="cliente_a_repartidor"
                onCalificacionEnviada={() => {
                  setShowCalificacion(null)
                  showToast('✅ Calificación enviada exitosamente', 'success')
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Modal de Chat */}
      {showChat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Chat con Repartidor
                </h3>
                <button
                  onClick={() => setShowChat(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle size={24} />
                </button>
              </div>
              
              <ChatComponent
                conversacionId={showChat}
                pedidoId={showChat}
                className="h-96"
              />
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </ProtectedRoute>
  )
}
