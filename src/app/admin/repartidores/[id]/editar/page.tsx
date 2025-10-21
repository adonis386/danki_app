'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { trackingService } from '@/lib/services/trackingService'
import type { VehiculoTipo, Repartidor } from '@/types/tracking'

export default function EditarRepartidorPage() {
  const router = useRouter()
  const params = useParams()
  const repartidorId = params?.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [repartidor, setRepartidor] = useState<Repartidor | null>(null)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    foto_url: '',
    vehiculo_tipo: 'moto' as VehiculoTipo,
    placa_vehiculo: '',
    activo: true,
    disponible: false,
  })

  useEffect(() => {
    if (repartidorId) {
      cargarRepartidor()
    }
  }, [repartidorId])

  const cargarRepartidor = async () => {
    try {
      setLoading(true)
      const data = await trackingService.getRepartidorById(repartidorId)
      setRepartidor(data)
      
      // Llenar el formulario con los datos existentes
      setFormData({
        nombre: data.nombre,
        apellido: data.apellido,
        telefono: data.telefono || '',
        foto_url: data.foto_url || '',
        vehiculo_tipo: data.vehiculo_tipo || 'moto',
        placa_vehiculo: data.placa_vehiculo || '',
        activo: data.activo,
        disponible: data.disponible,
      })
    } catch (error) {
      console.error('Error al cargar repartidor:', error)
      alert('Error al cargar los datos del repartidor')
      router.push('/admin/repartidores')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.apellido) {
      alert('Nombre y apellido son obligatorios')
      return
    }

    try {
      setSaving(true)
      
      await trackingService.updateRepartidor(repartidorId, {
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono || undefined,
        foto_url: formData.foto_url || undefined,
        vehiculo_tipo: formData.vehiculo_tipo,
        placa_vehiculo: formData.placa_vehiculo || undefined,
        activo: formData.activo,
        disponible: formData.disponible,
      })

      alert('Repartidor actualizado exitosamente')
      router.push('/admin/repartidores')
    } catch (error) {
      console.error('Error al actualizar repartidor:', error)
      alert('Error al actualizar repartidor')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-orange-600" />
          <p className="mt-4 text-gray-600">Cargando datos del repartidor...</p>
        </div>
      </div>
    )
  }

  if (!repartidor) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-gray-600">Repartidor no encontrado</p>
          <Link
            href="/admin/repartidores"
            className="mt-4 inline-block rounded-lg bg-orange-600 px-6 py-2 text-white hover:bg-orange-700"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/repartidores"
              className="rounded-lg p-2 hover:bg-gray-100"
            >
              <ArrowLeft size={24} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Editar Repartidor
              </h1>
              <p className="text-sm text-gray-600">
                {repartidor.nombre} {repartidor.apellido}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Formulario */}
      <div className="mx-auto max-w-3xl px-4 py-6">
        <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow">
          <div className="space-y-6">
            {/* Información Personal */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Información Personal
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Apellido *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.apellido}
                    onChange={(e) =>
                      setFormData({ ...formData, apellido: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    placeholder="+1 (809) 123-4567"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    URL de Foto
                  </label>
                  <input
                    type="url"
                    value={formData.foto_url}
                    onChange={(e) =>
                      setFormData({ ...formData, foto_url: e.target.value })
                    }
                    placeholder="https://ejemplo.com/foto.jpg"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Información del Vehículo */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Información del Vehículo
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Tipo de Vehículo
                  </label>
                  <select
                    value={formData.vehiculo_tipo}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        vehiculo_tipo: e.target.value as VehiculoTipo,
                      })
                    }
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                  >
                    <option value="moto">Moto 🏍️</option>
                    <option value="bicicleta">Bicicleta 🚲</option>
                    <option value="auto">Auto 🚗</option>
                    <option value="a_pie">A Pie 🚶</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">
                    Placa del Vehículo
                  </label>
                  <input
                    type="text"
                    value={formData.placa_vehiculo}
                    onChange={(e) =>
                      setFormData({ ...formData, placa_vehiculo: e.target.value })
                    }
                    placeholder="ABC-1234"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-orange-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Estado del Repartidor
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.activo}
                    onChange={(e) =>
                      setFormData({ ...formData, activo: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Activo</p>
                    <p className="text-sm text-gray-600">
                      El repartidor puede recibir asignaciones
                    </p>
                  </div>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.disponible}
                    onChange={(e) =>
                      setFormData({ ...formData, disponible: e.target.checked })
                    }
                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <div>
                    <p className="font-medium text-gray-900">Disponible</p>
                    <p className="text-sm text-gray-600">
                      El repartidor está online y puede aceptar pedidos ahora
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Estadísticas (solo lectura) */}
            <div>
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Estadísticas
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Calificación</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {repartidor.calificacion.toFixed(1)} ⭐
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Total Entregas</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {repartidor.num_entregas}
                  </p>
                </div>
                <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600">Miembro desde</p>
                  <p className="text-sm font-medium text-gray-900">
                    {new Date(repartidor.created_at).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>

            {/* Vista Previa */}
            {formData.foto_url && (
              <div>
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Vista Previa
                </h2>
                <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-4">
                  <img
                    src={formData.foto_url}
                    alt="Vista previa"
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                  <div>
                    <p className="font-medium text-gray-900">
                      {formData.nombre} {formData.apellido}
                    </p>
                    <p className="text-sm text-gray-600">
                      {formData.vehiculo_tipo}{' '}
                      {formData.placa_vehiculo && `• ${formData.placa_vehiculo}`}
                    </p>
                    <div className="mt-1 flex gap-2">
                      {formData.activo && (
                        <span className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800">
                          Activo
                        </span>
                      )}
                      {formData.disponible && (
                        <span className="inline-flex items-center rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                          Disponible
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => router.push('/admin/repartidores')}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Guardar Cambios
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Información Adicional */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-900">ℹ️ Información</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Los cambios se aplicarán inmediatamente</li>
            <li>• La calificación y el número de entregas no son editables</li>
            <li>• Al desactivar, el repartidor no recibirá nuevas asignaciones</li>
            <li>• El repartidor puede cambiar su disponibilidad desde su panel</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

