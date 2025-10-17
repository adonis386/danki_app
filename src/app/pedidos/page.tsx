'use client'

import { useState } from 'react'
import { Package, Clock, CheckCircle, XCircle, Truck, MapPin, Phone, CreditCard } from 'lucide-react'
import { useUserOrders } from '@/hooks/useOrders'
import { OrderStatus, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from '@/types/order'
import HomeButton from '@/components/HomeButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

export default function PedidosPage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | 'all'>('all')
  const { orders, loading, error } = useUserOrders()

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
                          <h3 className="text-xl font-bold text-gray-900">
                            Pedido #{order.id.slice(-8).toUpperCase()}
                          </h3>
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
