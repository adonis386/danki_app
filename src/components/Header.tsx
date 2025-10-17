'use client'

import { Search, MapPin, ShoppingCart, Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import UserMenu from './UserMenu'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useRoles'
import { useCart } from '@/contexts/CartContext'
import CartSidebar from './CartSidebar'

export default function Header() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isCartOpen, setIsCartOpen] = useState(false)
  const { user } = useAuth()
  const { userRole, canManageStores } = useUserRole()
  const { cart } = useCart()

  return (
    <header className="bg-white shadow-md sticky top-0 z-50 backdrop-blur-lg bg-opacity-95">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
              {/* Logo */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-2 rounded-xl">
                    <span className="text-white font-black text-xl tracking-tight">Danki</span>
                  </div>
                </div>
                <span className="hidden md:block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Delivery Express
                </span>
              </Link>

              {/* Navigation Links */}
              <nav className="hidden lg:flex items-center gap-6 ml-8">
                <Link 
                  href="/productos" 
                  className="text-gray-700 hover:text-indigo-600 font-semibold transition-colors"
                >
                  Productos
                </Link>
              </nav>

          {/* Location */}
          <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-100">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">Entregando a</span>
              <span className="text-sm font-semibold text-gray-800">Caracas, Agua Salud</span>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <div className="relative group">
              <input
                type="text"
                placeholder="¿Qué quieres comer hoy?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-12 pr-4 bg-gray-50 border-2 border-transparent rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all duration-200 placeholder-gray-400"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-3">
            {/* Admin Links */}
            {user && canManageStores() && (
              <div className="hidden md:flex items-center gap-2">
                <Link 
                  href="/admin/tiendas" 
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
                >
                  {userRole?.name === 'admin' ? 'Admin' : 'Mis Tiendas'}
                </Link>
                <Link 
                  href="/admin/productos" 
                  className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
                >
                  Productos
                </Link>
              </div>
            )}

            {/* Cart Icon */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors group"
            >
              <ShoppingCart className="w-6 h-6 text-gray-600 group-hover:text-indigo-600 transition-colors" />
              {cart.itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cart.itemCount}
                </span>
              )}
            </button>

            {/* User Menu */}
            <UserMenu />

            {/* Mobile Menu */}
            <button className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <input
              type="text"
              placeholder="¿Qué quieres comer hoy?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 pl-10 pr-4 bg-gray-50 border-2 border-transparent rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Cart Sidebar */}
      <CartSidebar 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
      />
    </header>
  )
}

