// =============================================
// TIPOS PARA SISTEMA DE TRACKING
// =============================================

export type VehiculoTipo = 'moto' | 'bicicleta' | 'auto' | 'a_pie'

export type EstadoAsignacion =
  | 'asignado'
  | 'aceptado'
  | 'rechazado'
  | 'en_camino_tienda'
  | 'recogido'
  | 'en_camino_cliente'
  | 'entregado'

export type EstadoTracking =
  | 'pendiente'
  | 'confirmado'
  | 'preparando'
  | 'listo_recoger'
  | 'en_camino'
  | 'entregado'
  | 'cancelado'

// =============================================
// REPARTIDOR
// =============================================

export interface Repartidor {
  id: string
  user_id: string | null
  nombre: string
  apellido: string
  telefono: string | null
  foto_url: string | null
  vehiculo_tipo: VehiculoTipo | null
  placa_vehiculo: string | null
  activo: boolean
  disponible: boolean
  calificacion: number
  num_entregas: number
  created_at: string
  updated_at: string
}

export interface CreateRepartidorData {
  nombre: string
  apellido: string
  telefono?: string
  foto_url?: string
  vehiculo_tipo?: VehiculoTipo
  placa_vehiculo?: string
  user_id?: string
}

export interface UpdateRepartidorData {
  nombre?: string
  apellido?: string
  telefono?: string
  foto_url?: string
  vehiculo_tipo?: VehiculoTipo
  placa_vehiculo?: string
  activo?: boolean
  disponible?: boolean
}

// =============================================
// UBICACIÓN
// =============================================

export interface UbicacionRepartidor {
  id: string
  repartidor_id: string
  latitud: number
  longitud: number
  velocidad: number | null
  direccion: number | null
  precision_metros: number | null
  timestamp: string
  created_at: string
}

export interface CreateUbicacionData {
  repartidor_id: string
  latitud: number
  longitud: number
  velocidad?: number
  direccion?: number
  precision_metros?: number
}

export interface Coordenadas {
  lat: number
  lng: number
}

// =============================================
// ASIGNACIÓN
// =============================================

export interface AsignacionRepartidor {
  id: string
  pedido_id: string
  repartidor_id: string | null
  estado: EstadoAsignacion
  distancia_km: number | null
  tiempo_estimado_minutos: number | null
  tiempo_real_minutos: number | null
  fecha_asignacion: string
  fecha_aceptacion: string | null
  fecha_recogida: string | null
  fecha_entrega: string | null
  notas: string | null
  created_at: string
  updated_at: string
  // Relaciones opcionales
  repartidor?: Repartidor
}

export interface CreateAsignacionData {
  pedido_id: string
  repartidor_id?: string
  distancia_km?: number
  tiempo_estimado_minutos?: number
  notas?: string
}

export interface UpdateAsignacionData {
  estado?: EstadoAsignacion
  repartidor_id?: string
  tiempo_real_minutos?: number
  fecha_aceptacion?: string
  fecha_recogida?: string
  fecha_entrega?: string
  notas?: string
}

// =============================================
// TRACKING DEL PEDIDO
// =============================================

export interface TrackingPedido {
  id: string
  pedido_id: string
  estado: EstadoTracking
  latitud_actual: number | null
  longitud_actual: number | null
  latitud_destino: number | null
  longitud_destino: number | null
  tiempo_estimado_minutos: number | null
  distancia_restante_km: number | null
  mensaje: string | null
  timestamp: string
}

export interface CreateTrackingData {
  pedido_id: string
  estado: EstadoTracking
  latitud_actual?: number
  longitud_actual?: number
  latitud_destino?: number
  longitud_destino?: number
  tiempo_estimado_minutos?: number
  distancia_restante_km?: number
  mensaje?: string
}

export interface UpdateTrackingData {
  estado?: EstadoTracking
  latitud_actual?: number
  longitud_actual?: number
  tiempo_estimado_minutos?: number
  distancia_restante_km?: number
  mensaje?: string
}

// =============================================
// TIMELINE DEL PEDIDO
// =============================================

export interface TimelineEvento {
  estado: EstadoTracking | EstadoAsignacion
  mensaje: string
  timestamp: string
  icono?: string
  completado: boolean
}

export interface PedidoConTracking {
  pedido_id: string
  estado_actual: EstadoTracking
  repartidor?: Repartidor
  asignacion?: AsignacionRepartidor
  tracking: TrackingPedido[]
  ubicacion_actual?: UbicacionRepartidor
  timeline: TimelineEvento[]
}

// =============================================
// ESTADÍSTICAS
// =============================================

export interface EstadisticasRepartidor {
  total_entregas: number
  entregas_hoy: number
  calificacion_promedio: number
  tiempo_promedio_minutos: number
  distancia_total_km: number
  ingresos_totales?: number
}

export interface EstadisticasTracking {
  total_pedidos: number
  pedidos_activos: number
  pedidos_completados: number
  tiempo_promedio_entrega: number
  distancia_promedio_km: number
}

// =============================================
// FILTROS Y BÚSQUEDA
// =============================================

export interface RepartidorFilters {
  disponible?: boolean
  activo?: boolean
  vehiculo_tipo?: VehiculoTipo
  min_calificacion?: number
}

export interface TrackingFilters {
  pedido_id?: string
  estado?: EstadoTracking
  fecha_desde?: string
  fecha_hasta?: string
}

// =============================================
// NOTIFICACIONES DE TRACKING
// =============================================

export interface NotificacionTracking {
  tipo: 'estado_cambio' | 'ubicacion_actualizada' | 'repartidor_asignado' | 'pedido_entregado'
  pedido_id: string
  titulo: string
  mensaje: string
  timestamp: string
  datos?: Record<string, unknown>
}

// =============================================
// CONFIGURACIÓN DE MAPA
// =============================================

export interface MapConfig {
  center: Coordenadas
  zoom: number
  marcadores: MapMarcador[]
  ruta?: Coordenadas[]
}

export interface MapMarcador {
  id: string
  posicion: Coordenadas
  tipo: 'repartidor' | 'tienda' | 'cliente'
  titulo?: string
  descripcion?: string
  icono?: string
}

// =============================================
// CÁLCULOS DE DISTANCIA Y TIEMPO
// =============================================

export interface CalculoRuta {
  distancia_km: number
  duracion_minutos: number
  ruta: Coordenadas[]
  instrucciones?: string[]
}

export interface DireccionCompleta {
  calle: string
  numero?: string
  ciudad: string
  estado?: string
  codigo_postal?: string
  pais: string
  coordenadas?: Coordenadas
}


