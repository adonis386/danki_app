'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Users,
  Plus,
  Search,
  Filter,
  MapPin,
  Star,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Phone,
  Package,
  ArrowLeft
} from 'lucide-react'
import { trackingService } from '@/lib/services/trackingService'
import { assignmentService } from '@/lib/services/assignmentService'
import type { Repartidor } from '@/types/tracking'
import { useAuth } from '@/hooks/useAuth'

export default function AdminRepartidoresPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [repartidores, setRepartidores] = useState<Repartidor[]>([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtroDisponible, setFiltroDisponible] = useState<boolean | undefined>(undefined)
  const [filtroActivo, setFiltroActivo] = useState<boolean | undefined>(undefined)
  const [estadisticas, setEstadisticas] = useState<any>(null)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [repartidorSeleccionado, setRepartidorSeleccionado] = useState<Repartidor | null>(null)

  useEffect(() => {
    if (!authLoading && !user) {
      // Comentado temporalmente para debugging en producción
      // router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    cargarRepartidores()
    cargarEstadisticas()
  }, [filtroDisponible, filtroActivo])

  const cargarRepartidores = async () => {
    try {
      setLoading(true)
      const data = await trackingService.getRepartidores({
        disponible: filtroDisponible,
        activo: filtroActivo,
      })
      setRepartidores(data)
    } catch (error) {
      console.error('Error al cargar repartidores:', error)
    } finally {
      setLoading(false)
    }
  }

  const cargarEstadisticas = async () => {
    try {
      const stats = await assignmentService.obtenerEstadisticasAsignacion()
      setEstadisticas(stats)
    } catch (error) {
      console.error('Error al cargar estadísticas:', error)
    }
  }

  const toggleDisponibilidad = async (id: string, disponible: boolean) => {
    try {
      await trackingService.toggleDisponibilidad(id, !disponible)
      await cargarRepartidores()
    } catch (error) {
      console.error('Error al cambiar disponibilidad:', error)
      alert('Error al actualizar disponibilidad')
    }
  }

  const toggleActivo = async (id: string, activo: boolean) => {
    try {
      await trackingService.updateRepartidor(id, { activo: !activo })
      await cargarRepartidores()
    } catch (error) {
      console.error('Error al cambiar estado activo:', error)
      alert('Error al actualizar estado')
    }
  }

  const eliminarRepartidor = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este repartidor?')) return

    try {
      // TODO: Implementar soft delete o verificar que no tenga pedidos activos
      alert('Funcionalidad de eliminación pendiente de implementar')
    } catch (error) {
      console.error('Error al eliminar repartidor:', error)
      alert('Error al eliminar repartidor')
    }
  }

  const repartidoresFiltrados = repartidores.filter((r) =>
    `${r.nombre} ${r.apellido} ${r.telefono || ''}`
      .toLowerCase()
      .includes(busqueda.toLowerCase())
  )

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
          <p className="mt-4 text-gray-600">Cargando...</p>
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
                onClick={() => router.push('/')}
                className="rounded-lg p-2 hover:bg-gray-100"
                title="Volver al inicio"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestión de Repartidores
                </h1>
                <p className="text-sm text-gray-600">
                  {repartidores.length} repartidores registrados
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/admin/repartidores/nuevo')}
              className="flex items-center gap-2 rounded-lg bg-orange-600 px-4 py-2 font-medium text-white hover:bg-orange-700"
            >
              <Plus size={20} />
              Nuevo Repartidor
            </button>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">Total Asignaciones</p>
              <p className="text-2xl font-bold text-gray-900">
                {estadisticas.total_asignaciones}
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">Tasa Aceptación</p>
              <p className="text-2xl font-bold text-green-600">
                {estadisticas.tasa_aceptacion.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">Tasa Entrega</p>
              <p className="text-2xl font-bold text-blue-600">
                {estadisticas.tasa_entrega.toFixed(1)}%
              </p>
            </div>
            <div className="rounded-lg bg-white p-4 shadow">
              <p className="text-sm text-gray-600">Tiempo Promedio</p>
              <p className="text-2xl font-bold text-orange-600">
                {estadisticas.tiempo_promedio_entrega.toFixed(0)} min
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filtros y Búsqueda */}
      <div className="mx-auto max-w-7xl px-4 pb-6">
        <div className="rounded-lg bg-white p-4 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Buscar por nombre, apellido o teléfono..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full rounded-lg border border-gray-300 py-2 pl-10 pr-4 focus:border-orange-500 focus:outline-none"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <select
                value={filtroDisponible === undefined ? '' : filtroDisponible.toString()}
                onChange={(e) =>
                  setFiltroDisponible(
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Disponibles</option>
                <option value="false">No Disponibles</option>
              </select>

              <select
                value={filtroActivo === undefined ? '' : filtroActivo.toString()}
                onChange={(e) =>
                  setFiltroActivo(
                    e.target.value === '' ? undefined : e.target.value === 'true'
                  )
                }
                className="rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
              >
                <option value="">Todos</option>
                <option value="true">Activos</option>
                <option value="false">Inactivos</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Repartidores */}
      <div className="mx-auto max-w-7xl px-4 pb-6">
        <div className="rounded-lg bg-white shadow">
          {repartidoresFiltrados.length === 0 ? (
            <div className="py-12 text-center">
              <Users size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600">No se encontraron repartidores</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200 bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-600">
                      Repartidor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-600">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-600">
                      Vehículo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-600">
                      Estadísticas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-600">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-600">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {repartidoresFiltrados.map((repartidor) => (
                    <tr key={repartidor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {repartidor.foto_url ? (
                            <img
                              src={repartidor.foto_url}
                              alt={repartidor.nombre}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
                              <span className="font-bold text-orange-600">
                                {repartidor.nombre[0]}
                              </span>
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900">
                              {repartidor.nombre} {repartidor.apellido}
                            </p>
                            <p className="text-sm text-gray-600">
                              ID: {repartidor.id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {repartidor.telefono && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Phone size={16} />
                            {repartidor.telefono}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-gray-900">
                            {repartidor.vehiculo_tipo || 'N/A'}
                          </p>
                          {repartidor.placa_vehiculo && (
                            <p className="text-gray-600">{repartidor.placa_vehiculo}</p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-500" />
                            <span className="font-medium">
                              {repartidor.calificacion.toFixed(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package size={16} className="text-blue-500" />
                            <span>{repartidor.num_entregas}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              repartidor.disponible
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {repartidor.disponible ? 'Disponible' : 'No Disponible'}
                          </span>
                          <span
                            className={`ml-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                              repartidor.activo
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {repartidor.activo ? 'Activo' : 'Inactivo'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              toggleDisponibilidad(repartidor.id, repartidor.disponible)
                            }
                            className="rounded p-2 hover:bg-gray-100"
                            title="Cambiar disponibilidad"
                          >
                            {repartidor.disponible ? (
                              <XCircle size={18} className="text-red-600" />
                            ) : (
                              <CheckCircle size={18} className="text-green-600" />
                            )}
                          </button>
                          <button
                            onClick={() =>
                              router.push(`/admin/repartidores/${repartidor.id}/editar`)
                            }
                            className="rounded p-2 hover:bg-gray-100"
                            title="Editar"
                          >
                            <Edit size={18} className="text-blue-600" />
                          </button>
                          <button
                            onClick={() => eliminarRepartidor(repartidor.id)}
                            className="rounded p-2 hover:bg-gray-100"
                            title="Eliminar"
                          >
                            <Trash2 size={18} className="text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

