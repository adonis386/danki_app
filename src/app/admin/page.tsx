'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { useUserRole } from '@/hooks/useRoles'
import { createClient } from '@/lib/supabase/client'
import { 
  Users, 
  Store, 
  Package, 
  Truck, 
  BarChart3, 
  Settings, 
  Bell,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import ProtectedRoute from '@/components/ProtectedRoute'

interface DashboardStats {
  totalUsers: number
  totalStores: number
  totalProducts: number
  totalDrivers: number
  totalOrders: number
  totalRevenue: number
  pendingOrders: number
  activeOrders: number
  completedOrders: number
}

export default function AdminDashboard() {
  const { user } = useAuth()
  const { userRole, loading: roleLoading } = useUserRole()
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    totalDrivers: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    activeOrders: 0,
    completedOrders: 0
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Obtener estadísticas de usuarios
        const { count: usersCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })

        // Obtener estadísticas de tiendas
        const { count: storesCount } = await supabase
          .from('tiendas')
          .select('*', { count: 'exact', head: true })

        // Obtener estadísticas de productos
        const { count: productsCount } = await supabase
          .from('productos')
          .select('*', { count: 'exact', head: true })

        // Obtener estadísticas de repartidores
        const { count: driversCount } = await supabase
          .from('repartidores')
          .select('*', { count: 'exact', head: true })

        // Obtener estadísticas de pedidos
        const { data: ordersData } = await supabase
          .from('pedidos')
          .select('status, total')

        const orders = ordersData || []
        const totalOrders = orders.length
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
        const pendingOrders = orders.filter(o => o.status === 'pending').length
        const activeOrders = orders.filter(o => ['confirmed', 'preparing', 'ready', 'out_for_delivery'].includes(o.status)).length
        const completedOrders = orders.filter(o => o.status === 'delivered').length

        setStats({
          totalUsers: usersCount || 0,
          totalStores: storesCount || 0,
          totalProducts: productsCount || 0,
          totalDrivers: driversCount || 0,
          totalOrders,
          totalRevenue,
          pendingOrders,
          activeOrders,
          completedOrders
        })
      } catch (error) {
        console.error('Error al cargar estadísticas:', error)
      } finally {
        setLoading(false)
      }
    }

    if (userRole?.name === 'admin') {
      loadStats()
    }
  }, [userRole])

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando panel de administración...</p>
        </div>
      </div>
    )
  }

  if (userRole?.name !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Acceso Denegado</h1>
          <p className="text-gray-600">No tienes permisos para acceder al panel de administración.</p>
          <Link 
            href="/"
            className="mt-4 inline-block bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-gray-600 mt-1">Bienvenido, {user?.email}</p>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Bell className="w-6 h-6" />
                </button>
                <button className="p-2 text-gray-400 hover:text-gray-500">
                  <Settings className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Usuarios Totales"
              value={stats.totalUsers}
              icon={Users}
              color="blue"
              change="+12%"
            />
            <StatCard
              title="Tiendas Activas"
              value={stats.totalStores}
              icon={Store}
              color="green"
              change="+5%"
            />
            <StatCard
              title="Productos"
              value={stats.totalProducts}
              icon={Package}
              color="purple"
              change="+8%"
            />
            <StatCard
              title="Repartidores"
              value={stats.totalDrivers}
              icon={Truck}
              color="orange"
              change="+3%"
            />
          </div>

          {/* Orders Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              title="Pedidos Totales"
              value={stats.totalOrders}
              icon={ShoppingCart}
              color="indigo"
              change="+15%"
            />
            <StatCard
              title="Ingresos Totales"
              value={`$${stats.totalRevenue.toFixed(2)}`}
              icon={DollarSign}
              color="green"
              change="+22%"
            />
            <StatCard
              title="Pedidos Pendientes"
              value={stats.pendingOrders}
              icon={Clock}
              color="yellow"
              change="+2%"
            />
            <StatCard
              title="Pedidos Completados"
              value={stats.completedOrders}
              icon={CheckCircle}
              color="green"
              change="+18%"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Management Cards */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Gestión del Sistema</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ManagementCard
                  title="Gestión de Tiendas"
                  description="Administrar tiendas, productos y configuraciones"
                  icon={Store}
                  href="/admin/tiendas"
                  color="green"
                />
                <ManagementCard
                  title="Gestión de Repartidores"
                  description="Administrar repartidores y asignaciones"
                  icon={Truck}
                  href="/admin/repartidores"
                  color="orange"
                />
                <ManagementCard
                  title="Gestión de Productos"
                  description="Administrar catálogo de productos"
                  icon={Package}
                  href="/admin/productos"
                  color="purple"
                />
                <ManagementCard
                  title="Configuración"
                  description="Configuración del sistema y roles"
                  icon={Settings}
                  href="/admin/setup"
                  color="gray"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Actividad Reciente</h2>
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="space-y-4">
                  <ActivityItem
                    icon={Store}
                    title="Nueva tienda registrada"
                    description="Sushi Tokyo se unió a la plataforma"
                    time="Hace 2 horas"
                  />
                  <ActivityItem
                    icon={Truck}
                    title="Repartidor asignado"
                    description="Carlos M. asignado a pedido #12345"
                    time="Hace 3 horas"
                  />
                  <ActivityItem
                    icon={CheckCircle}
                    title="Pedido completado"
                    description="Pedido #12344 entregado exitosamente"
                    time="Hace 4 horas"
                  />
                  <ActivityItem
                    icon={Package}
                    title="Producto agregado"
                    description="Nuevo producto en Pizza Corner"
                    time="Hace 5 horas"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}

// Componente para tarjetas de estadísticas
function StatCard({ title, value, icon: Icon, color, change }: {
  title: string
  value: string | number
  icon: any
  color: string
  change: string
}) {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
    orange: 'bg-orange-500',
    indigo: 'bg-indigo-500',
    yellow: 'bg-yellow-500',
    gray: 'bg-gray-500'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-green-600 flex items-center">
            <TrendingUp className="w-4 h-4 mr-1" />
            {change}
          </p>
        </div>
      </div>
    </div>
  )
}

// Componente para tarjetas de gestión
function ManagementCard({ title, description, icon: Icon, href, color }: {
  title: string
  description: string
  icon: any
  href: string
  color: string
}) {
  const colorClasses = {
    green: 'bg-green-500 hover:bg-green-600',
    orange: 'bg-orange-500 hover:bg-orange-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    gray: 'bg-gray-500 hover:bg-gray-600'
  }

  return (
    <Link href={href} className="block">
      <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center mb-4">
          <div className={`p-3 rounded-lg ${colorClasses[color as keyof typeof colorClasses]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 ml-4">{title}</h3>
        </div>
        <p className="text-gray-600">{description}</p>
      </div>
    </Link>
  )
}

// Componente para elementos de actividad
function ActivityItem({ icon: Icon, title, description, time }: {
  icon: any
  title: string
  description: string
  time: string
}) {
  return (
    <div className="flex items-start">
      <div className="p-2 bg-gray-100 rounded-lg">
        <Icon className="w-4 h-4 text-gray-600" />
      </div>
      <div className="ml-3 flex-1">
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-xs text-gray-500 mt-1">{time}</p>
      </div>
    </div>
  )
}
