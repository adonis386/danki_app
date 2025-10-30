'use client'

import { useState } from 'react'
import { X, Plus, Minus, Trash2, ShoppingBag, CreditCard, MapPin } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/hooks/useNotification'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface CartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { cart, updateQuantity, removeItem, clearCart } = useCart()
  const { showSuccess } = useNotification()
  const router = useRouter()
  const [isCheckingOut, setIsCheckingOut] = useState(false)

  const handleCheckout = () => {
    if (cart.items.length === 0) return
    
    onClose()
    router.push('/checkout')
  }

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity)
  }

  const handleRemoveItem = (productId: string, productName: string) => {
    removeItem(productId)
    showSuccess('Producto removido', `${productName} ha sido removido del carrito`)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 right-0 h-full w-full max-w-lg bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <ShoppingBag className="w-6 h-6 text-indigo-600" />
            <h2 className="text-xl font-bold text-gray-900">Mi Carrito</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col bg-gray-100 rounded-b-3xl">
          {cart.items.length === 0 ? (
            /* Empty Cart */
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Tu carrito está vacío</h3>
                <p className="text-gray-600 mb-6">Agrega algunos productos para comenzar</p>
                <button
                  onClick={onClose}
                  className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Explorar Productos
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Cart Items - Aumentamos significativamente la altura */}
              <div className="flex-[3] overflow-y-auto p-6">
                <div className="space-y-6">
                  {cart.items.map((item) => (
                    <div key={item.id} className="bg-white border-2 border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex gap-5">
                        {/* Product Image */}
                        <div className="flex-shrink-0">
                          {item.product.imagen_url ? (
                            <img
                              src={item.product.imagen_url}
                              alt={item.product.nombre}
                              className="w-20 h-20 rounded-xl object-cover border-2 border-gray-100"
                            />
                          ) : (
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center border-2 border-gray-100">
                              <ShoppingBag className="w-10 h-10 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Product Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-2">
                            {item.product.nombre}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {item.product.tienda_nombre}
                          </p>
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-xl font-black text-indigo-600">
                              ${item.price.toFixed(2)}
                            </p>
                            <p className="text-sm font-semibold text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">
                              x{item.quantity}
                            </p>
                          </div>
                          
                          {/* Quantity Controls */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity - 1)}
                                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                              >
                                <Minus className="w-5 h-5" />
                              </button>
                              <span className="w-12 text-center font-bold text-lg">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => handleQuantityChange(item.product_id, item.quantity + 1)}
                                className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-xl flex items-center justify-center transition-colors"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                            <button
                              onClick={() => handleRemoveItem(item.product_id, item.product.nombre)}
                              className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                              title="Eliminar producto"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cart Summary - Reducimos la altura */}
              <div className="flex-[1] border-t-2 border-gray-200 p-6 bg-gradient-to-br from-gray-50 to-indigo-50/30">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Subtotal</span>
                    <span className="font-bold text-gray-900">${cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Delivery</span>
                    <span className="font-bold text-gray-900">${cart.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">IVA (16%)</span>
                    <span className="font-bold text-gray-900">${cart.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-black border-t-2 border-gray-300 pt-2">
                    <span className="text-gray-900">Total</span>
                    <span className="text-indigo-600">${cart.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-3 rounded-2xl font-black hover:shadow-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                >
                  <CreditCard className="w-5 h-5" />
                  Proceder al Checkout
                </button>

                {/* Delivery Info */}
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-800 text-sm">
                    <MapPin className="w-4 h-4" />
                    <span className="font-semibold">Entrega estimada: 30-45 min</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
