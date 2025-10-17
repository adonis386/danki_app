'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useRoles'
import { roleService } from '@/lib/services/roleService'
import { useNotification } from '@/hooks/useNotification'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminSetupPage() {
  const { user } = useAuth()
  const { userRole, refetch } = useUserRole()
  const { showSuccess, showError } = useNotification()
  const [loading, setLoading] = useState(false)

  const assignAdminRole = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // Obtener el rol de admin
      const adminRole = await roleService.getRoleByName('admin')
      if (!adminRole) {
        showError('Error', 'No se encontró el rol de admin')
        return
      }

      // Verificar si ya tiene un rol asignado
      const currentRole = await roleService.getUserRole(user.id)
      if (currentRole) {
        // Actualizar rol existente
        await roleService.updateUserRole(user.id, adminRole.id)
        showSuccess('¡Rol actualizado!', 'Ahora eres administrador del sistema')
      } else {
        // Asignar nuevo rol
        await roleService.assignRoleToUser(user.id, adminRole.id)
        showSuccess('¡Rol asignado!', 'Ahora eres administrador del sistema')
      }
      refetch()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      showError('Error al asignar rol', errorMessage)
      console.error('Error completo:', error)
    } finally {
      setLoading(false)
    }
  }

  const assignStoreOwnerRole = async () => {
    if (!user?.id) return

    setLoading(true)
    try {
      // Obtener el rol de store_owner
      const storeOwnerRole = await roleService.getRoleByName('store_owner')
      if (!storeOwnerRole) {
        showError('Error', 'No se encontró el rol de store_owner')
        return
      }

      // Verificar si ya tiene un rol asignado
      const currentRole = await roleService.getUserRole(user.id)
      if (currentRole) {
        // Actualizar rol existente
        await roleService.updateUserRole(user.id, storeOwnerRole.id)
        showSuccess('¡Rol actualizado!', 'Ahora eres propietario de tienda')
      } else {
        // Asignar nuevo rol
        await roleService.assignRoleToUser(user.id, storeOwnerRole.id)
        showSuccess('¡Rol asignado!', 'Ahora eres propietario de tienda')
      }
      refetch()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      showError('Error al asignar rol', errorMessage)
      console.error('Error completo:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-black text-gray-900 mb-4">Configuración de Roles</h1>
              <p className="text-lg text-gray-600">Asigna roles a tu usuario para acceder a las funcionalidades</p>
            </div>

            {/* User Info */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Información del Usuario</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <p className="text-gray-900 font-medium">{user?.email}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">User ID</label>
                  <p className="text-gray-900 font-mono text-sm break-all">{user?.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Rol Actual</label>
                  <p className="text-gray-900 font-medium">
                    {userRole ? userRole.description : 'Sin rol asignado'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Permisos</label>
                  <div className="flex flex-wrap gap-2">
                    {userRole?.permissions?.map((permission, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-semibold"
                      >
                        {permission}
                      </span>
                    )) || (
                      <span className="text-gray-500 text-sm">Sin permisos</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Role Assignment */}
            <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl border-2 border-white/80 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Asignar Roles</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Admin Role */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Administrador</h3>
                  <p className="text-gray-600 mb-4">
                    Acceso completo al sistema. Puede gestionar tiendas, productos, usuarios y configuraciones.
                  </p>
                  <button
                    onClick={assignAdminRole}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-red-600 to-pink-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Asignando...' : userRole?.name === 'admin' ? 'Ya eres Admin' : 'Asignar Rol de Admin'}
                  </button>
                </div>

                {/* Store Owner Role */}
                <div className="border-2 border-gray-200 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Propietario de Tienda</h3>
                  <p className="text-gray-600 mb-4">
                    Puede gestionar sus propias tiendas y productos. Acceso limitado a funciones administrativas.
                  </p>
                  <button
                    onClick={assignStoreOwnerRole}
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Asignando...' : userRole?.name === 'store_owner' ? 'Ya eres Store Owner' : 'Asignar Rol de Store Owner'}
                  </button>
                </div>
              </div>
            </div>

            {/* Debug Info */}
            <div className="mt-8 bg-gray-50 border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-2">Información de Debug</h3>
              <div className="space-y-2 text-sm">
                <p><strong>User ID:</strong> {user?.id || 'No disponible'}</p>
                <p><strong>User Role:</strong> {userRole ? JSON.stringify(userRole, null, 2) : 'Sin rol'}</p>
                <p><strong>Loading:</strong> {loading ? 'Sí' : 'No'}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-2">Instrucciones</h3>
              <ul className="text-blue-800 space-y-2">
                <li>• Haz clic en "Asignar Rol de Admin" para tener acceso completo al sistema</li>
                <li>• Haz clic en "Asignar Rol de Store Owner" para gestionar tiendas</li>
                <li>• Una vez asignado el rol, verás el botón correspondiente en el header</li>
                <li>• Puedes cambiar de rol en cualquier momento</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
