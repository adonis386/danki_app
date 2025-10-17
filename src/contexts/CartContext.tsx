'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Cart, CartItem, CartSummary } from '@/types/cart'
import { useAuth } from '@/hooks/useAuth'

interface CartContextType {
  cart: Cart
  addItem: (product: any, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (productId: string) => number
  getCartSummary: () => CartSummary
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const getCartStorageKey = (userId: string | null) => {
  return userId ? `quickbite_cart_${userId}` : 'quickbite_cart_guest'
}

const initialCart: Cart = {
  items: [],
  total: 0,
  subtotal: 0,
  deliveryFee: 0,
  tax: 0,
  itemCount: 0,
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart>(initialCart)
  const { user } = useAuth()

  // Cargar carrito desde localStorage al inicializar o cuando cambie el usuario
  useEffect(() => {
    const storageKey = getCartStorageKey(user?.id || null)
    const savedCart = localStorage.getItem(storageKey)
    
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart)
        setCart(parsedCart)
      } catch (error) {
        console.error('Error al cargar carrito desde localStorage:', error)
        localStorage.removeItem(storageKey)
        setCart(initialCart)
      }
    } else {
      // Si no hay carrito guardado para este usuario, inicializar carrito vacío
      setCart(initialCart)
    }
  }, [user?.id])

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    const storageKey = getCartStorageKey(user?.id || null)
    localStorage.setItem(storageKey, JSON.stringify(cart))
  }, [cart, user?.id])

  // Calcular totales
  const calculateTotals = (items: CartItem[]): Omit<Cart, 'items'> => {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = subtotal > 0 ? 2.99 : 0 // Fee de delivery fijo
    const tax = subtotal * 0.16 // 16% de IVA
    const total = subtotal + deliveryFee + tax
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      deliveryFee: Math.round(deliveryFee * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      itemCount,
    }
  }

  // Agregar item al carrito
  const addItem = (product: any, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product_id === product.id
      )

      let newItems: CartItem[]

      if (existingItemIndex >= 0) {
        // Si el item ya existe, actualizar cantidad
        newItems = prevCart.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      } else {
        // Si es un nuevo item, agregarlo
        const newItem: CartItem = {
          id: `${product.id}_${Date.now()}`,
          product_id: product.id,
          quantity,
          price: product.precio,
          product: {
            id: product.id,
            nombre: product.nombre,
            descripcion: product.descripcion,
            imagen_url: product.imagen_url,
            tienda_id: product.tienda_id,
            tienda_nombre: product.tienda?.nombre || 'Tienda',
          },
        }
        newItems = [...prevCart.items, newItem]
      }

      const totals = calculateTotals(newItems)

      return {
        items: newItems,
        ...totals,
      }
    })
  }

  // Remover item del carrito
  const removeItem = (productId: string) => {
    setCart(prevCart => {
      const newItems = prevCart.items.filter(item => item.product_id !== productId)
      const totals = calculateTotals(newItems)

      return {
        items: newItems,
        ...totals,
      }
    })
  }

  // Actualizar cantidad de un item
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId)
      return
    }

    setCart(prevCart => {
      const newItems = prevCart.items.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
      const totals = calculateTotals(newItems)

      return {
        items: newItems,
        ...totals,
      }
    })
  }

  // Limpiar carrito
  const clearCart = () => {
    setCart(initialCart)
    const storageKey = getCartStorageKey(user?.id || null)
    localStorage.removeItem(storageKey)
  }

  // Obtener cantidad de un item específico
  const getItemQuantity = (productId: string): number => {
    const item = cart.items.find(item => item.product_id === productId)
    return item ? item.quantity : 0
  }

  // Obtener resumen del carrito
  const getCartSummary = (): CartSummary => {
    return {
      subtotal: cart.subtotal,
      deliveryFee: cart.deliveryFee,
      tax: cart.tax,
      total: cart.total,
      itemCount: cart.itemCount,
    }
  }

  const value = {
    cart,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getItemQuantity,
    getCartSummary,
  }

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
