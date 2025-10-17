'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Sparkles, Zap, Shield, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useNotification } from '@/hooks/useNotification'
import { loginSchema, type LoginFormData } from '@/lib/validations/auth'
import { useEffect } from 'react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn, user, loading: authLoading } = useAuth()
  const { showSuccess, showError, showInfo } = useNotification()

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!authLoading && user) {
      showInfo('Ya estás conectado', 'Redirigiendo a la página principal...')
      router.push('/')
    }
  }, [user, authLoading, router, showInfo])

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true)
    setError('')

    const { error } = await signIn(data.email, data.password)

    if (error) {
      setError(error.message)
      showError('Error al iniciar sesión', error.message)
      setLoading(false)
    } else {
      showSuccess('¡Bienvenido!', 'Has iniciado sesión correctamente')
      router.push('/')
      router.refresh()
    }
  }

  // Mostrar loading si está verificando autenticación
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  // No mostrar nada si ya está autenticado (se redirigirá)
  if (user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          
          {/* Left Side - Branding & Features */}
          <div className="hidden md:block space-y-8">
            {/* Logo */}
            <div className="space-y-4">
              <Link href="/" className="inline-block">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-10 py-5 rounded-2xl">
                    <span className="text-white font-black text-4xl tracking-tight">Danki</span>
                  </div>
                </div>
              </Link>
              <p className="text-gray-600 text-lg font-medium">Delivery Express</p>
            </div>

            {/* Hero Text */}
            <div className="space-y-4">
              <h1 className="text-4xl font-black text-gray-900 leading-tight">
                Bienvenido de nuevo
              </h1>
              <p className="text-lg text-gray-600">
                Inicia sesión para continuar disfrutando de nuestros servicios de delivery express
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4 pt-8">
              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Entrega Rápida</h3>
                  <p className="text-sm text-gray-600">Pedidos en 15-30 minutos</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80">
                <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">100% Seguro</h3>
                  <p className="text-sm text-gray-600">Protección de datos garantizada</p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/80">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">Calidad Premium</h3>
                  <p className="text-sm text-gray-600">Productos frescos y de calidad</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full">
            {/* Mobile Logo */}
            <div className="md:hidden text-center mb-8">
              <Link href="/" className="inline-block">
                <div className="relative inline-block">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl blur-lg opacity-50"></div>
                  <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-8 py-4 rounded-2xl">
                    <span className="text-white font-black text-3xl tracking-tight">Danki</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Login Card */}
            <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border-2 border-white/80 p-10 md:p-12">
              {/* Header */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-4xl font-black text-gray-900 mb-3">Iniciar Sesión</h2>
                <p className="text-lg text-gray-600">Ingresa tus credenciales para continuar</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-7">
                {error && (
                  <div className="bg-red-50 border-2 border-red-200 text-red-700 px-6 py-5 rounded-xl text-base font-semibold animate-fade-in">
                    {error}
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-3">
                  <label htmlFor="email" className="block text-base font-bold text-gray-800">
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder-gray-400 text-gray-900 text-base"
                    placeholder="tu@email.com"
                  />
                  {errors.email && (
                    <p className="text-red-600 text-sm font-medium">{errors.email.message}</p>
                  )}
                </div>

                {/* Password Field */}
                <div className="space-y-3">
                  <label htmlFor="password" className="block text-base font-bold text-gray-800">
                    Contraseña
                  </label>
                  <input
                    id="password"
                    type="password"
                    {...register('password')}
                    className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-indigo-500 focus:bg-white transition-all placeholder-gray-400 text-gray-900 text-base"
                    placeholder="••••••••"
                  />
                  {errors.password && (
                    <p className="text-red-600 text-sm font-medium">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white py-5 rounded-xl font-black text-xl hover:shadow-2xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-3">
                      <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Iniciando sesión...
                    </span>
                  ) : (
                    'Iniciar Sesión'
                  )}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-10">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-base">
                  <span className="px-5 bg-white text-gray-500 font-medium">¿No tienes cuenta?</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center">
                <Link 
                  href="/register" 
                  className="inline-flex items-center justify-center w-full px-8 py-4 border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all duration-200 text-lg"
                >
                  Crear cuenta nueva
                </Link>
              </div>
            </div>

            {/* Mobile Features */}
            <div className="mt-8 grid grid-cols-3 gap-3 md:hidden">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80 text-center">
                <Zap className="w-5 h-5 text-indigo-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">Rápido</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80 text-center">
                <Shield className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">Seguro</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/80 text-center">
                <Sparkles className="w-5 h-5 text-pink-600 mx-auto mb-2" />
                <p className="text-xs font-semibold text-gray-700">Premium</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

