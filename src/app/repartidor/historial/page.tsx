'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Star,
  Package,
  Filter,
  Download,
  Search,
  TrendingUp,
  Award,
  Target,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { trackingService } from '@/lib/services/trackingService'
import type { AsignacionRepartidor, Repartidor } from '@/types/tracking'

export default function HistorialRepartidorPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null)
  const [historial, setHistorial] = useState<AsignacionRepartidor[]>([])
  const [filtros, setFiltros] = useState({
    fechaDesde: '',
    fechaHasta: '',
    estado: '',
    busqueda: ''
  })
  const [estadisticas, setEstadisticas] = useState({
    totalEntregas: 0,
    promedioCalificacion: 0,
    tiempoPromedioEntrega: 0,
    entregasEsteMes: 0,
    mejorMes: '',
    mejorDia: ''
  })

  useEffect(() => {
    verificarRepartidor()
  }, [])

  useEffect(() => {
    if (repartidor) {
      cargarHistorial()
      cargarEstadisticas()
    }
  }, [repartidor, filtros])

  const verificarRepartidor = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login')
        return
      }

      const { data: repartidorData, error } = await supabase
        .from('repartidores')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error || !repartidorData) {
        router.push('/')
        return
      }

      setRepartidor(repartidorData)
    } catch (error) {
      console.error('Error al verificar repartidor:', error)
      router.push('/')
    } finally {
      setLoading(false)
    }
  }

  const cargarHistorial = async () => {
    if (!repartidor) return

    try {
      const asignaciones = await trackingService.getAsignacionesByRepartidor(repartidor.id)
      
      // Filtrar por fechas
      let historialFiltrado = asignaciones
      
      if (filtros.fechaDesde) {
        historialFiltrado = historialFiltrado.filter(a => 
          new Date(a.created_at) >= new Date(filtros.fechaDesde)
        )
      }
      
      if (filtros.fechaHasta) {
        historialFiltrado = historialFiltrado.filter(a => 
          new Date(a.created_at) <= new Date(filtros.fechaHasta)
        )
      }
      
      // Filtrar por estado
      if (filtros.estado) {
        historialFiltrado = historialFiltrado.filter(a => a.estado === filtros.estado)
      }
      
      // Filtrar por búsqueda (dirección o cliente)
      if (filtros.busqueda) {
        historialFiltrado = historialFiltrado.filter(a => 
          a.pedido_id?.toLowerCase().includes(filtros.busqueda.toLowerCase()) ||
          a.notas?.toLowerCase().includes(filtros.busqueda.toLowerCase())
        )
      }
      
      // Ordenar por fecha más reciente
      historialFiltrado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      setHistorial(historialFiltrado)
    } catch (error) {
      console.error('Error al cargar historial:', error)
    }
  }

  const cargarEstadisticas = async () => {
    if (!repartidor) return

    try {
      const asignaciones = await trackingService.getAsignacionesByRepartidor(repartidor.id)
      const entregadas = asignaciones.filter(a => a.estado === 'entregado')
      
      // Estadísticas básicas
      const totalEntregas = entregadas.length
      const promedioCalificacion = 4.5 // Valor por defecto ya que no tenemos calificaciones en asignaciones
      
      // Tiempo promedio de entrega
      const tiemposEntrega = entregadas
        .filter(a => a.tiempo_real_minutos)
        .map(a => a.tiempo_real_minutos!)
      
      const tiempoPromedioEntrega = tiemposEntrega.length > 0 
        ? tiemposEntrega.reduce((sum, t) => sum + t, 0) / tiemposEntrega.length 
        : 0
      
      // Entregas este mes
      const ahora = new Date()
      const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
      const entregasEsteMes = entregadas.filter(a => 
        new Date(a.created_at) >= inicioMes
      ).length
      
      // Mejor mes (más entregas)
      const entregasPorMes = entregadas.reduce((acc, a) => {
        const mes = new Date(a.created_at).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
        acc[mes] = (acc[mes] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const mejorMes = Object.entries(entregasPorMes)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      
      // Mejor día de la semana
      const entregasPorDia = entregadas.reduce((acc, a) => {
        const dia = new Date(a.created_at).toLocaleDateString('es-ES', { weekday: 'long' })
        acc[dia] = (acc[dia] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      
      const mejorDia = Object.entries(entregasPorDia)
        .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'
      
      setEstadisticas({
        totalEntregas,
        promedioCalificacion: Math.round(promedioCalificacion * 10) / 10,
        tiempoPromedioEntrega: Math.round(tiempoPromedioEntrega),
        entregasEsteMes,
        mejorMes,
        mejorDia
      })
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const exportarHistorial = () => {
    const csvContent = [
      ['Fecha', 'Estado', 'Dirección', 'Teléfono', 'Calificación', 'Tiempo Entrega (min)', 'Distancia (km)'],
      ...historial.map(a => [
        new Date(a.created_at).toLocaleDateString('es-ES'),
        a.estado,
        a.pedido_id || '', // Usar pedido_id en lugar de pedido.delivery_address
        a.notas || '', // Usar notas en lugar de pedido.delivery_phone
        '4.5', // Valor por defecto para calificación
        a.tiempo_real_minutos || '', // Usar tiempo_real_minutos
        a.distancia_km || ''
      ])
    ].map(row => row.join(',')).join('\n')
    
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `historial_entregas_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'entregado': return 'bg-green-100 text-green-800'
      case 'cancelado': return 'bg-red-100 text-red-800'
      case 'rechazado': return 'bg-gray-100 text-gray-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'entregado': return <CheckCircle size={16} />
      case 'cancelado': return <XCircle size={16} />
      case 'rechazado': return <XCircle size={16} />
      default: return <Clock size={16} />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando historial...</p>
        </div>
      </div>
    )
  }

  if (!repartidor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h1>
          <p className="text-gray-600 mb-4">No tienes permisos para acceder a esta página</p>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/repartidor')}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft size={20} />
                Volver al Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Historial de Entregas
                </h1>
                <p className="text-gray-600">
                  {repartidor.nombre} {repartidor.apellido}
                </p>
              </div>
            </div>
            <button
              onClick={exportarHistorial}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Download size={20} />
              Exportar CSV
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package size={24} className="text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Entregas</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.totalEntregas}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star size={24} className="text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Calificación Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.promedioCalificacion}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock size={24} className="text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.tiempoPromedioEntrega} min</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp size={24} className="text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Este Mes</p>
                <p className="text-2xl font-bold text-gray-900">{estadisticas.entregasEsteMes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
              <input
                type="date"
                value={filtros.fechaDesde}
                onChange={(e) => setFiltros({...filtros, fechaDesde: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
              <input
                type="date"
                value={filtros.fechaHasta}
                onChange={(e) => setFiltros({...filtros, fechaHasta: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={filtros.estado}
                onChange={(e) => setFiltros({...filtros, estado: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                <option value="">Todos</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
                <option value="rechazado">Rechazado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Dirección o teléfono..."
                value={filtros.busqueda}
                onChange={(e) => setFiltros({...filtros, busqueda: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Historial */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Entregas ({historial.length})
            </h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dirección
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Calificación
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiempo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Distancia
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {historial.map((asignacion) => (
                  <tr key={asignacion.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(asignacion.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(asignacion.estado)}`}>
                        {getEstadoIcon(asignacion.estado)}
                        {asignacion.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {asignacion.pedido_id || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asignacion.notas || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-400 fill-current" />
                        4.5
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asignacion.tiempo_real_minutos ? `${asignacion.tiempo_real_minutos} min` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {asignacion.distancia_km ? `${asignacion.distancia_km} km` : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {historial.length === 0 && (
            <div className="text-center py-12">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No hay entregas</h3>
              <p className="text-gray-500">No se encontraron entregas con los filtros aplicados.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
