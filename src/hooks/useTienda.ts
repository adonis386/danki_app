import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { roleService } from '@/lib/services/roleService'

interface Tienda {
  id: string
  nombre: string
}

export function useTienda() {
  const { user } = useAuth()
  const [tienda, setTienda] = useState<Tienda | null>(null)
  const [loading, setLoading] = useState(true)
  const [isTienda, setIsTienda] = useState(false)

  useEffect(() => {
    const loadTienda = async () => {
      if (!user) {
        setTienda(null)
        setIsTienda(false)
        setLoading(false)
        return
      }

      try {
        // Verificar si el usuario es una tienda
        const esTienda = await roleService.isTienda(user.id)
        setIsTienda(esTienda)

        if (esTienda) {
          // Obtener datos de la tienda
          const tiendaData = await roleService.getTiendaByUserId(user.id)
          setTienda(tiendaData)
        } else {
          setTienda(null)
        }
      } catch (error) {
        console.error('Error al cargar datos de la tienda:', error)
        setTienda(null)
        setIsTienda(false)
      } finally {
        setLoading(false)
      }
    }

    loadTienda()
  }, [user])

  return {
    tienda,
    isTienda,
    loading,
    refetch: () => {
      setLoading(true)
      // Recargar datos
      if (user) {
        roleService.isTienda(user.id).then(setIsTienda)
        roleService.getTiendaByUserId(user.id).then(setTienda).finally(() => setLoading(false))
      }
    }
  }
}
