'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Check } from 'lucide-react'
import { useCart } from '@/contexts/CartContext'
import { useNotification } from '@/hooks/useNotification'

interface AddToCartButtonProps {
  product: {
    id: string
    nombre: string
    descripcion: string
    precio: number
    imagen_url?: string
    tienda_id: string
    tienda?: {
      nombre: string
    }
  }
  variant?: 'default' | 'small' | 'large'
  className?: string
}

export default function AddToCartButton({ 
  product, 
  variant = 'default',
  className = ''
}: AddToCartButtonProps) {
  const { addItem, getItemQuantity } = useCart()
  const { showSuccess } = useNotification()
  const [isAdding, setIsAdding] = useState(false)
  const [justAdded, setJustAdded] = useState(false)

  const quantity = getItemQuantity(product.id)

  const handleAddToCart = async () => {
    setIsAdding(true)
    
    // Simular delay para mejor UX
    await new Promise(resolve => setTimeout(resolve, 300))
    
    addItem(product, 1)
    showSuccess('¡Agregado al carrito!', `${product.nombre} ha sido agregado`)
    
    setIsAdding(false)
    setJustAdded(true)
    
    // Reset del estado "just added" después de 2 segundos
    setTimeout(() => setJustAdded(false), 2000)
  }

  const getButtonContent = () => {
    if (justAdded) {
      return (
        <>
          <Check className="w-4 h-4" />
          <span>Agregado</span>
        </>
      )
    }

    if (isAdding) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span>Agregando...</span>
        </>
      )
    }

    if (quantity > 0) {
      return (
        <>
          <ShoppingCart className="w-4 h-4" />
          <span>Agregar más ({quantity})</span>
        </>
      )
    }

    return (
      <>
        <Plus className="w-4 h-4" />
        <span>Agregar al carrito</span>
      </>
    )
  }

  const getButtonClasses = () => {
    const baseClasses = "flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 hover:shadow-lg"
    
    if (justAdded) {
      return `${baseClasses} bg-green-600 text-white hover:bg-green-700`
    }

    if (quantity > 0) {
      return `${baseClasses} bg-indigo-600 text-white hover:bg-indigo-700`
    }

    return `${baseClasses} bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700`
  }

  const getSizeClasses = () => {
    switch (variant) {
      case 'small':
        return 'px-3 py-2 text-sm'
      case 'large':
        return 'px-6 py-4 text-lg'
      default:
        return 'px-4 py-3 text-base'
    }
  }

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`${getButtonClasses()} ${getSizeClasses()} ${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {getButtonContent()}
    </button>
  )
}
