// =============================================
// SERVICIO DE ASIGNACIÓN AUTOMÁTICA DE REPARTIDORES
// =============================================

import { createClient } from '@/lib/supabase/client'
import { trackingService } from './trackingService'
import type { Repartidor, Coordenadas } from '@/types/tracking'

const supabase = createClient()

interface PedidoParaAsignar {
  id: string
  delivery_address: string
  delivery_phone: string
  tienda_id?: string
  coordenadas_destino?: Coordenadas
}

interface CriteriosAsignacion {
  distancia_maxima_km?: number
  calificacion_minima?: number
  priorizar_cercania?: boolean
  priorizar_calificacion?: boolean
}

class AssignmentService {
  // =============================================
  // ASIGNACIÓN AUTOMÁTICA
  // =============================================

  async asignarRepartidorAutomatico(
    pedido: PedidoParaAsignar,
    criterios: CriteriosAsignacion = {}
  ): Promise<{ repartidor: Repartidor; distancia_km: number; tiempo_estimado: number } | null> {
    try {
      // 1. Obtener repartidores disponibles
      const repartidoresDisponibles = await trackingService.getRepartidores({
        disponible: true,
        activo: true,
        min_calificacion: criterios.calificacion_minima || 3.0,
      })

      if (repartidoresDisponibles.length === 0) {
        console.log('No hay repartidores disponibles')
        return null
      }

      // 2. Si hay coordenadas, calcular distancias
      if (pedido.coordenadas_destino) {
        const repartidoresConDistancia = await Promise.all(
          repartidoresDisponibles.map(async (repartidor) => {
            try {
              const ubicacion = await trackingService.getUltimaUbicacion(repartidor.id)
              
              let distancia = Infinity
              if (ubicacion && pedido.coordenadas_destino) {
                distancia = trackingService.calcularDistancia(
                  { lat: ubicacion.latitud, lng: ubicacion.longitud },
                  pedido.coordenadas_destino
                )
              } else {
                // Si no hay ubicación GPS, usar distancia por defecto basada en calificación
                distancia = 10 + (5 - repartidor.calificacion) // Mejor calificación = menor distancia
              }

              return { repartidor, distancia }
            } catch (error) {
              console.warn(`Error al obtener ubicación para repartidor ${repartidor.id}:`, error)
              // En caso de error, asignar distancia por defecto
              return { 
                repartidor, 
                distancia: 15 + (5 - repartidor.calificacion) 
              }
            }
          })
        )

        // Filtrar por distancia máxima
        const repartidoresCercanos = repartidoresConDistancia.filter(
          (r) => r.distancia <= (criterios.distancia_maxima_km || 50)
        )

        if (repartidoresCercanos.length === 0) {
          console.log('No hay repartidores cerca del destino, asignando por calificación')
          // Si no hay repartidores cercanos, asignar por calificación
          const mejorPorCalificacion = repartidoresDisponibles.reduce(
            (mejor, actual) => actual.calificacion > mejor.calificacion ? actual : mejor
          )
          
          if (mejorPorCalificacion) {
            const tiempoEstimado = trackingService.calcularTiempoEstimado(20) // Distancia estimada
            
            await trackingService.asignarRepartidor(pedido.id, mejorPorCalificacion.id)
            await trackingService.createTracking({
              pedido_id: pedido.id,
              estado: 'confirmado',
              mensaje: 'Repartidor asignado por calificación',
              tiempo_estimado_minutos: tiempoEstimado,
              distancia_restante_km: 20,
            })

            return {
              repartidor: mejorPorCalificacion,
              distancia_km: 20,
              tiempo_estimado: tiempoEstimado,
            }
          }
          
          return null
        }

        // 3. Seleccionar el mejor repartidor
        const mejorRepartidor = this.seleccionarMejorRepartidor(
          repartidoresCercanos,
          criterios
        )

        if (mejorRepartidor) {
          const tiempoEstimado = trackingService.calcularTiempoEstimado(
            mejorRepartidor.distancia
          )

          // 4. Crear asignación
          await trackingService.asignarRepartidor(pedido.id, mejorRepartidor.repartidor.id)

          // 5. Crear tracking inicial
          await trackingService.createTracking({
            pedido_id: pedido.id,
            estado: 'confirmado',
            mensaje: 'Repartidor asignado',
            tiempo_estimado_minutos: tiempoEstimado,
            distancia_restante_km: mejorRepartidor.distancia,
          })

          console.log('✅ [AssignmentService] Repartidor asignado exitosamente:', mejorRepartidor.repartidor.nombre)
          return {
            repartidor: mejorRepartidor.repartidor,
            distancia_km: mejorRepartidor.distancia,
            tiempo_estimado: tiempoEstimado,
          }
        }
      } else {
        // Sin coordenadas, asignar por calificación
        const mejorPorCalificacion = repartidoresDisponibles.reduce((prev, current) =>
          current.calificacion > prev.calificacion ? current : prev
        )

        await trackingService.asignarRepartidor(pedido.id, mejorPorCalificacion.id)

        await trackingService.createTracking({
          pedido_id: pedido.id,
          estado: 'confirmado',
          mensaje: 'Repartidor asignado',
        })

        return {
          repartidor: mejorPorCalificacion,
          distancia_km: 0,
          tiempo_estimado: 30,
        }
      }

      return null
    } catch (error) {
      console.error('Error al asignar repartidor automático:', error)
      return null
    }
  }

  // =============================================
  // SELECCIÓN DEL MEJOR REPARTIDOR
  // =============================================

  private seleccionarMejorRepartidor(
    repartidores: Array<{ repartidor: Repartidor; distancia: number }>,
    criterios: CriteriosAsignacion
  ): { repartidor: Repartidor; distancia: number } | null {
    if (repartidores.length === 0) return null

    // Ordenar por criterios
    const ordenados = [...repartidores].sort((a, b) => {
      // Priorizar cercanía
      if (criterios.priorizar_cercania) {
        if (a.distancia !== b.distancia) {
          return a.distancia - b.distancia
        }
      }

      // Priorizar calificación
      if (criterios.priorizar_calificacion) {
        if (a.repartidor.calificacion !== b.repartidor.calificacion) {
          return b.repartidor.calificacion - a.repartidor.calificacion
        }
      }

      // Por defecto: balance entre distancia y calificación
      const scoreA = this.calcularScore(a.repartidor, a.distancia)
      const scoreB = this.calcularScore(b.repartidor, b.distancia)
      return scoreB - scoreA
    })

    return ordenados[0]
  }

  // =============================================
  // CÁLCULO DE SCORE
  // =============================================

  private calcularScore(repartidor: Repartidor, distancia: number): number {
    // Score basado en:
    // - Calificación (peso: 0.4)
    // - Proximidad (peso: 0.4)
    // - Número de entregas (peso: 0.2)

    const scoreCalificacion = (repartidor.calificacion / 5) * 0.4
    
    // Proximidad: más cerca = mejor score
    const scoreProximidad = Math.max(0, (1 - distancia / 20)) * 0.4
    
    // Experiencia: más entregas = mejor (normalizado)
    const scoreExperiencia = Math.min(1, repartidor.num_entregas / 100) * 0.2

    return scoreCalificacion + scoreProximidad + scoreExperiencia
  }

  // =============================================
  // REASIGNACIÓN
  // =============================================

  async reasignarPedido(
    pedidoId: string,
    nuevoRepartidorId: string
  ): Promise<boolean> {
    try {
      // Obtener asignación actual
      const asignacionActual = await trackingService.getAsignacionByPedido(pedidoId)

      if (!asignacionActual) {
        throw new Error('No se encontró asignación para este pedido')
      }

      // Actualizar asignación
      await trackingService.updateAsignacion(asignacionActual.id, {
        repartidor_id: nuevoRepartidorId,
        estado: 'asignado',
      })

      // Crear evento de tracking
      await trackingService.createTracking({
        pedido_id: pedidoId,
        estado: 'confirmado',
        mensaje: 'Pedido reasignado a nuevo repartidor',
      })

      return true
    } catch (error) {
      console.error('Error al reasignar pedido:', error)
      return false
    }
  }

  // =============================================
  // ESTADÍSTICAS DE ASIGNACIÓN
  // =============================================

  async obtenerEstadisticasAsignacion() {
    try {
      const { data: asignaciones, error } = await supabase
        .from('asignaciones_repartidor')
        .select('*')

      if (error) throw error

      const total = asignaciones.length
      const aceptadas = asignaciones.filter((a) => a.estado === 'aceptado').length
      const entregadas = asignaciones.filter((a) => a.estado === 'entregado').length
      const rechazadas = asignaciones.filter((a) => a.estado === 'rechazado').length

      const tiemposReales = asignaciones
        .filter((a) => a.tiempo_real_minutos !== null)
        .map((a) => a.tiempo_real_minutos!)

      const tiempoPromedio =
        tiemposReales.length > 0
          ? tiemposReales.reduce((a, b) => a + b, 0) / tiemposReales.length
          : 0

      return {
        total_asignaciones: total,
        tasa_aceptacion: total > 0 ? (aceptadas / total) * 100 : 0,
        tasa_entrega: total > 0 ? (entregadas / total) * 100 : 0,
        tasa_rechazo: total > 0 ? (rechazadas / total) * 100 : 0,
        tiempo_promedio_entrega: tiempoPromedio,
      }
    } catch (error) {
      console.error('Error al obtener estadísticas:', error)
      return null
    }
  }

  // =============================================
  // NOTIFICAR REPARTIDORES DISPONIBLES
  // =============================================

  async notificarRepartidoresDisponibles(pedidoId: string) {
    try {
      // Obtener repartidores disponibles
      const repartidores = await trackingService.getRepartidores({
        disponible: true,
        activo: true,
      })

      console.log(
        `Notificando a ${repartidores.length} repartidores sobre nuevo pedido: ${pedidoId}`
      )

      // Aquí se integraría con el sistema de notificaciones push
      // Por ahora solo registramos en consola

      return repartidores.length
    } catch (error) {
      console.error('Error al notificar repartidores:', error)
      return 0
    }
  }

  // =============================================
  // GEOCODIFICACIÓN (PLACEHOLDER)
  // =============================================

  async geocodificarDireccion(direccion: string): Promise<Coordenadas | null> {
    try {
      // TODO: Integrar con API de geocodificación (Google Maps, Mapbox, etc.)
      // Por ahora retorna coordenadas de ejemplo (Santo Domingo)
      console.log('Geocodificando dirección:', direccion)
      
      return {
        lat: 18.4861,
        lng: -69.9312,
      }
    } catch (error) {
      console.error('Error al geocodificar dirección:', error)
      return null
    }
  }
}

export const assignmentService = new AssignmentService()

