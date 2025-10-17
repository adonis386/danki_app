'use client'

import { useState, useRef } from 'react'
import { User, LogOut, Settings, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { useUserRole } from '@/hooks/useRoles'

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { user, loading, signOut } = useAuth()
  const { userRole } = useUserRole()
  const { showSuccess } = useNotification()

  const handleLogout = async () => {
    await signOut()
    setIsOpen(false)
    showSuccess('Sesión cerrada', 'Has cerrado sesión correctamente')
    router.push('/login')
    router.refresh()
  }

  // Si no hay usuario, mostrar botón de login
  if (!loading && !user) {
    return (
      <Link
        href="/login"
        className="px-4 py-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white rounded-lg font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200 text-sm"
      >
        Iniciar Sesión
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse"></div>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
      >
        {user?.email?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in z-50">
          {/* User Info */}
          <div className="px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.email}
            </p>
            <p className="text-xs text-gray-500">
              {userRole?.description || 'Usuario'}
            </p>
          </div>

          {/* Menu Items */}
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              <span>Mi Perfil</span>
            </Link>
            
            <Link
              href="/pedidos"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Mis Pedidos</span>
            </Link>
            
            <Link
              href="/configuracion"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Settings className="w-4 h-4" />
              <span>Configuración</span>
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100"></div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  )
}

