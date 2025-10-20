'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Upload } from 'lucide-react'
import Link from 'next/link'
import { trackingService } from '@/lib/services/trackingService'
import type { VehiculoTipo } from '@/types/tracking'

export default function NuevoRepartidorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    foto_url: '',
    vehiculo_tipo: 'moto' as VehiculoTipo,
    placa_vehiculo: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.nombre || !formData.apellido) {
      alert('Nombre y apellido son obligatorios')
      return
    }

    try {
      setLoading(true)
      
      await trackingService.createRepartidor({
        nombre: formData.nombre,
        apellido: formData.apellido,
        telefono: formData.telefono || undefined,
        foto_url: formData.foto_url || undefined,
        vehiculo_tipo: formData.vehiculo_tipo,
        placa_vehiculo: formData.placa_vehiculo || undefined,
      })

      alert('Repartidor creado exitosamente')
      router.push('/admin/repartidores')
    } catch (error) {
      console.error('Error al crear repartidor:', error)
      alert('Error al crear repartidor')
    } finally {
      setLoading(false)
    }
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
                Nuevo Repartidor
              </h1>
              <p className="text-sm text-gray-600">
                Registra un nuevo repartidor en el sistema
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
                      {formData.vehiculo_tipo} {formData.placa_vehiculo && `• ${formData.placa_vehiculo}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-4 border-t border-gray-200 pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 rounded-lg border border-gray-300 py-2 font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-orange-600 py-2 font-medium text-white hover:bg-orange-700 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Crear Repartidor
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Información Adicional */}
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-medium text-blue-900">📝 Información</h3>
          <ul className="space-y-1 text-sm text-blue-800">
            <li>• Los campos marcados con * son obligatorios</li>
            <li>• El repartidor iniciará como "Activo" y "No Disponible"</li>
            <li>• La calificación inicial será 5.0</li>
            <li>• Puede subir una foto después desde la edición</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

