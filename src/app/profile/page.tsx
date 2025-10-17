'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { User, Mail, Calendar, Edit, Save, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import ProtectedRoute from '@/components/ProtectedRoute'
import Header from '@/components/Header'

const profileSchema = z.object({
  fullName: z.string().min(1, 'El nombre es requerido'),
  phone: z.string().optional(),
  address: z.string().optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const { showSuccess, showError } = useNotification()
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: user?.user_metadata?.full_name || '',
      phone: user?.user_metadata?.phone || '',
      address: user?.user_metadata?.address || '',
    },
  })

  const onSubmit = async (data: ProfileFormData) => {
    setSaving(true)
    try {
      // Aquí implementarías la actualización del perfil
      console.log('Actualizando perfil:', data)
      
      // Simular llamada a API
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      showSuccess('Perfil actualizado', 'Tu información se ha guardado correctamente')
      setIsEditing(false)
    } catch (error) {
      showError('Error al actualizar', 'No se pudo guardar la información')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    reset()
    setIsEditing(false)
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-purple-50/30">
      <Header />
      
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 mb-4">Mi Perfil</h1>
            <p className="text-lg text-gray-600">Gestiona tu información personal</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-white/80 p-8">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <User className="w-12 h-12 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    {user?.user_metadata?.full_name || 'Usuario'}
                  </h2>
                  <p className="text-gray-600 mb-4">{user?.email}</p>
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    <span>Miembro desde {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="md:col-span-2">
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-xl border-2 border-white/80 p-8">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Información Personal</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* Email (readonly) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Correo electrónico
                    </label>
                    <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                    <p className="text-xs text-gray-500">El correo electrónico no se puede cambiar</p>
                  </div>

                  {/* Full Name */}
                  <div className="space-y-2">
                    <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700">
                      Nombre completo
                    </label>
                    {isEditing ? (
                      <input
                        id="fullName"
                        {...register('fullName')}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        placeholder="Tu nombre completo"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                        <span className="text-gray-900">
                          {user?.user_metadata?.full_name || 'No especificado'}
                        </span>
                      </div>
                    )}
                    {errors.fullName && (
                      <p className="text-red-600 text-sm">{errors.fullName.message}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700">
                      Teléfono
                    </label>
                    {isEditing ? (
                      <input
                        id="phone"
                        {...register('phone')}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
                        placeholder="Tu número de teléfono"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                        <span className="text-gray-900">
                          {user?.user_metadata?.phone || 'No especificado'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  <div className="space-y-2">
                    <label htmlFor="address" className="block text-sm font-semibold text-gray-700">
                      Dirección
                    </label>
                    {isEditing ? (
                      <textarea
                        id="address"
                        {...register('address')}
                        rows={3}
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
                        placeholder="Tu dirección completa"
                      />
                    ) : (
                      <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl">
                        <span className="text-gray-900">
                          {user?.user_metadata?.address || 'No especificada'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  {isEditing && (
                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={saving}
                        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                      >
                        {saving ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Guardando...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Guardar Cambios
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
