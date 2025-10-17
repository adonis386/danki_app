'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { ArrowLeft, CreditCard, MapPin, Phone, Clock, Package } from 'lucide-react'
import Link from 'next/link'
import { useCart } from '@/contexts/CartContext'
import { useOrders } from '@/hooks/useOrders'
import { useAuth } from '@/hooks/useAuth'
import { createOrderSchema, type CreateOrderFormData } from '@/lib/validations/order'
import HomeButton from '@/components/HomeButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

export default function CheckoutPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { cart, clearCart } = useCart()
  const { createOrder } = useOrders()
  const { user } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrderFormData>({
    resolver: zodResolver(createOrderSchema),
    defaultValues: {
      delivery_address: user?.user_metadata?.address || '',
      delivery_phone: user?.user_metadata?.phone || '',
      payment_method: 'cash',
      total: cart.total,
      subtotal: cart.subtotal,
      delivery_fee: cart.deliveryFee,
      tax: cart.tax,
      items: cart.items.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
    },
  })

  const onSubmit = async (data: CreateOrderFormData) => {
    if (cart.items.length === 0) {
      return
    }

    setLoading(true)
    try {
      await createOrder(data)
      clearCart()
      router.push('/pedidos')
    } catch (error) {
      // Error ya manejado en el hook
    } finally {
      setLoading(false)
    }
  }

  if (cart.items.length === 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
          <div className="container mx-auto px-6 py-12">
            <div className="max-w-2xl mx-auto text-center">
              <Package className="w-24 h-24 text-gray-400 mx-auto mb-6" />
              <h1 className="text-3xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h1>
              <p className="text-gray-600 mb-8">Agrega algunos productos antes de proceder al checkout</p>
              <Link
                href="/productos"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-4 rounded-xl font-bold hover:shadow-lg transition-all"
              >
                Explorar Productos
              </Link>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <Header />
        
        <div className="container mx-auto px-6 py-12">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link
                href="/productos"
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </Link>
              <div>
                <h1 className="text-4xl font-black text-gray-900">Checkout</h1>
                <p className="text-lg text-gray-600">Completa tu pedido</p>
              </div>
            </div>
            <HomeButton />
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Formulario de Checkout */}
              <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Información de Entrega</h2>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Dirección */}
                  <div>
                    <label htmlFor="delivery_address" className="block text-sm font-semibold text-gray-700 mb-2">
                      <MapPin className="w-4 h-4 inline mr-2" />
                      Dirección de entrega *
                    </label>
                    <textarea
                      id="delivery_address"
                      {...register('delivery_address')}
                      rows={3}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                      placeholder="Ingresa tu dirección completa"
                    />
                    {errors.delivery_address && (
                      <p className="text-red-600 text-sm mt-1">{errors.delivery_address.message}</p>
                    )}
                  </div>

                  {/* Teléfono */}
                  <div>
                    <label htmlFor="delivery_phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      <Phone className="w-4 h-4 inline mr-2" />
                      Teléfono de contacto *
                    </label>
                    <input
                      id="delivery_phone"
                      type="tel"
                      {...register('delivery_phone')}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                      placeholder="+58 412 123 4567"
                    />
                    {errors.delivery_phone && (
                      <p className="text-red-600 text-sm mt-1">{errors.delivery_phone.message}</p>
                    )}
                  </div>

                  {/* Notas adicionales */}
                  <div>
                    <label htmlFor="delivery_notes" className="block text-sm font-semibold text-gray-700 mb-2">
                      Notas adicionales (opcional)
                    </label>
                    <textarea
                      id="delivery_notes"
                      {...register('delivery_notes')}
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                      placeholder="Instrucciones especiales para la entrega..."
                    />
                    {errors.delivery_notes && (
                      <p className="text-red-600 text-sm mt-1">{errors.delivery_notes.message}</p>
                    )}
                  </div>

                  {/* Método de pago */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      <CreditCard className="w-4 h-4 inline mr-2" />
                      Método de pago *
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio"
                          value="cash"
                          {...register('payment_method')}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div className="ml-3">
                          <span className="font-semibold text-gray-900">Efectivo</span>
                          <p className="text-sm text-gray-600">Paga al recibir tu pedido</p>
                        </div>
                      </label>
                      <label className="flex items-center p-4 bg-gray-50 border-2 border-gray-200 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                        <input
                          type="radio"
                          value="card"
                          {...register('payment_method')}
                          className="w-4 h-4 text-indigo-600"
                        />
                        <div className="ml-3">
                          <span className="font-semibold text-gray-900">Tarjeta</span>
                          <p className="text-sm text-gray-600">Pago con tarjeta de débito/crédito</p>
                        </div>
                      </label>
                    </div>
                    {errors.payment_method && (
                      <p className="text-red-600 text-sm mt-1">{errors.payment_method.message}</p>
                    )}
                  </div>

                  {/* Botón de confirmar pedido */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        Procesando pedido...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Confirmar Pedido - ${cart.total.toFixed(2)}
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Resumen del Pedido */}
              <div className="space-y-6">
                {/* Resumen de productos */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen del Pedido</h3>
                  <div className="space-y-4">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                        {item.product.imagen_url ? (
                          <img
                            src={item.product.imagen_url}
                            alt={item.product.nombre}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-white" />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{item.product.nombre}</h4>
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

                {/* Resumen de costos */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Resumen de Costos</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold">${cart.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Delivery</span>
                      <span className="font-semibold">${cart.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">IVA (16%)</span>
                      <span className="font-semibold">${cart.tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-3">
                      <span>Total</span>
                      <span className="text-indigo-600">${cart.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Información de entrega */}
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-6 h-6 text-blue-600" />
                    <h3 className="text-lg font-bold text-blue-900">Tiempo de Entrega</h3>
                  </div>
                  <p className="text-blue-800">
                    Tu pedido será entregado en aproximadamente <strong>30-45 minutos</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
