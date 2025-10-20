# 🚚 Sistema de Tracking en Tiempo Real - Danki

## 📋 Resumen

El Sistema de Tracking permite a los usuarios seguir sus pedidos en tiempo real, ver la ubicación del repartidor, y recibir actualizaciones automáticas sobre el estado de su pedido.

---

## ✅ Componentes Implementados

### **1. Base de Datos** ✅

**Archivo**: `database-scripts/setup_tracking_system.sql`

**Tablas creadas:**
- ✅ `repartidores` - Información de repartidores
- ✅ `ubicaciones_repartidor` - Historial de ubicaciones GPS
- ✅ `asignaciones_repartidor` - Asignación de pedidos a repartidores
- ✅ `tracking_pedido` - Historial de estados del pedido

**Características:**
- ✅ Índices para performance
- ✅ Triggers para timestamps automáticos
- ✅ RLS (Row Level Security) configurado
- ✅ Realtime habilitado en Supabase
- ✅ Datos de prueba incluidos

---

### **2. Tipos TypeScript** ✅

**Archivo**: `src/types/tracking.ts`

**Tipos definidos:**
- `Repartidor` - Información del repartidor
- `UbicacionRepartidor` - Coordenadas GPS
- `AsignacionRepartidor` - Asignación pedido-repartidor
- `TrackingPedido` - Estado del pedido
- `PedidoConTracking` - Vista completa del pedido
- `TimelineEvento` - Eventos de la línea de tiempo

**Enums:**
- `VehiculoTipo` - moto | bicicleta | auto | a_pie
- `EstadoAsignacion` - asignado | aceptado | en_camino_tienda | recogido | en_camino_cliente | entregado
- `EstadoTracking` - pendiente | confirmado | preparando | listo_recoger | en_camino | entregado | cancelado

---

### **3. Servicio de Tracking** ✅

**Archivo**: `src/lib/services/trackingService.ts`

**Métodos principales:**

#### **Repartidores:**
- `getRepartidores(filters?)` - Obtener lista de repartidores
- `getRepartidorById(id)` - Obtener repartidor específico
- `createRepartidor(data)` - Crear nuevo repartidor
- `updateRepartidor(id, updates)` - Actualizar repartidor
- `toggleDisponibilidad(id, disponible)` - Cambiar disponibilidad

#### **Ubicaciones:**
- `createUbicacion(data)` - Registrar nueva ubicación GPS
- `getUltimaUbicacion(repartidorId)` - Obtener última ubicación
- `getHistorialUbicaciones(repartidorId, limit)` - Historial de ubicaciones

#### **Asignaciones:**
- `createAsignacion(data)` - Crear asignación
- `updateAsignacion(id, updates)` - Actualizar asignación
- `asignarRepartidor(pedidoId, repartidorId)` - Asignar repartidor a pedido
- `aceptarPedido(asignacionId)` - Repartidor acepta pedido
- `marcarRecogido(asignacionId)` - Marcar pedido como recogido
- `marcarEntregado(asignacionId)` - Marcar pedido como entregado

#### **Tracking:**
- `createTracking(data)` - Crear evento de tracking
- `updateTracking(pedidoId, updates)` - Actualizar tracking
- `getTrackingByPedido(pedidoId)` - Obtener historial completo
- `getPedidoConTracking(pedidoId)` - Obtener vista completa con repartidor y ubicación

#### **Realtime:**
- `subscribeToTracking(pedidoId, callback)` - Suscribirse a cambios en tracking
- `subscribeToUbicacion(repartidorId, callback)` - Suscribirse a ubicación del repartidor
- `unsubscribe(channel)` - Cancelar suscripción

#### **Utilidades:**
- `calcularDistancia(coord1, coord2)` - Cálculo con fórmula de Haversine
- `calcularTiempoEstimado(distanciaKm, velocidadKmH)` - Estimación de tiempo

---

### **4. Hooks Personalizados** ✅

**Archivo**: `src/hooks/useTracking.ts`

**Hooks disponibles:**

#### **`useTrackingPedido(pedidoId)`**
```typescript
const { pedidoTracking, loading, error, refetch } = useTrackingPedido(pedidoId)
```
- ✅ Obtiene tracking completo del pedido
- ✅ Se actualiza en tiempo real automáticamente
- ✅ Incluye repartidor, ubicación y timeline

#### **`useUbicacionRepartidor(repartidorId)`**
```typescript
const { ubicacion, loading, error, refetch } = useUbicacionRepartidor(repartidorId)
```
- ✅ Obtiene última ubicación del repartidor
- ✅ Se actualiza en tiempo real automáticamente

#### **`useRepartidoresDisponibles(filters?)`**
```typescript
const { repartidores, loading, error, refetch } = useRepartidoresDisponibles()
```
- ✅ Lista de repartidores disponibles
- ✅ Filtros opcionales por tipo de vehículo, calificación

#### **`useAsignacion(pedidoId)`**
```typescript
const { 
  asignacion, 
  loading, 
  error, 
  asignarRepartidor,
  aceptarPedido,
  marcarRecogido,
  marcarEntregado 
} = useAsignacion(pedidoId)
```
- ✅ Gestión completa de asignaciones
- ✅ Métodos para cambiar estado

---

### **5. Componentes de UI** ✅

#### **TrackingTimeline** (`src/components/TrackingTimeline.tsx`)
- ✅ Muestra línea de tiempo del pedido
- ✅ Iconos dinámicos por estado
- ✅ Marca eventos completados
- ✅ Muestra fecha y hora de cada evento

#### **RepartidorCard** (`src/components/RepartidorCard.tsx`)
- ✅ Tarjeta con información del repartidor
- ✅ Foto o iniciales
- ✅ Calificación con estrellas
- ✅ Tipo de vehículo con icono
- ✅ Indicador de disponibilidad
- ✅ Teléfono de contacto

#### **TrackingMap** (`src/components/TrackingMap.tsx`)
- ✅ Mapa visual de tracking
- ✅ Muestra distancia y tiempo estimado
- ✅ Marcadores para repartidor y destino
- ✅ Placeholder para integración futura con Google Maps/Mapbox

---

### **6. Páginas** ✅

#### **Página de Tracking** (`src/app/pedidos/[id]/tracking/page.tsx`)
- ✅ Vista completa del seguimiento del pedido
- ✅ Mapa interactivo
- ✅ Información del repartidor
- ✅ Timeline de eventos
- ✅ Detalles de la entrega
- ✅ Updates en tiempo real
- ✅ Botón para contactar soporte

#### **Página de Pedidos** (`src/app/pedidos/page.tsx`)
- ✅ Botón "Ver Seguimiento en Tiempo Real" agregado
- ✅ Visible solo para pedidos activos (confirmed, preparing, ready, out_for_delivery)

---

## 🚀 Cómo Usar

### **1. Configurar Base de Datos**

```sql
-- En Supabase SQL Editor
-- Ejecutar: database-scripts/setup_tracking_system.sql
```

Este script:
- Crea todas las tablas necesarias
- Configura RLS policies
- Habilita Realtime
- Inserta datos de prueba

### **2. Verificar Realtime**

En Supabase Dashboard → Database → Replication:
- ✅ Verificar que `tracking_pedido` esté habilitado
- ✅ Verificar que `ubicaciones_repartidor` esté habilitado
- ✅ Verificar que `asignaciones_repartidor` esté habilitado

### **3. Usar en la Aplicación**

#### **Ver tracking de un pedido:**
```
http://localhost:3000/pedidos/{pedido-id}/tracking
```

#### **Desde la lista de pedidos:**
1. Ve a "Mis Pedidos"
2. Busca un pedido activo
3. Click en "Ver Seguimiento en Tiempo Real"

---

## 📱 Flujo del Usuario

### **Cliente:**
1. ✅ Realiza un pedido
2. ✅ Recibe confirmación
3. ✅ Ve "Ver Seguimiento en Tiempo Real"
4. ✅ Accede a la página de tracking
5. ✅ Ve mapa, repartidor, timeline
6. ✅ Recibe updates automáticos en tiempo real

### **Repartidor (próximamente):**
1. Ve pedidos asignados
2. Acepta pedido
3. Se actualiza su ubicación GPS automáticamente
4. Marca como recogido
5. Marca como entregado

---

## 🔄 Estados del Pedido

### **Timeline Completa:**
```
1. pendiente → Pedido recibido
2. confirmado → Tienda confirmó el pedido
3. preparando → Preparando tu pedido
4. listo_recoger → Listo para recoger
5. en_camino → Repartidor en camino
6. entregado → Pedido entregado
```

### **Estados de Asignación:**
```
1. asignado → Repartidor asignado
2. aceptado → Repartidor aceptó
3. en_camino_tienda → Yendo a la tienda
4. recogido → Pedido recogido
5. en_camino_cliente → Yendo al cliente
6. entregado → Entregado
```

---

## 🎯 Características Actuales

✅ **Implementado:**
- Sistema de tracking completo
- Base de datos configurada
- Tipos TypeScript definidos
- Servicio con todos los métodos
- Hooks personalizados
- Componentes de UI
- Página de tracking
- Updates en tiempo real con Supabase Realtime
- Timeline visual
- Información del repartidor
- Cálculo de distancias

⏳ **Pendiente (Fase 3):**
- Integración con Google Maps/Mapbox real
- App para repartidores
- Actualización automática de GPS
- Notificaciones push
- Sistema de rutas optimizadas
- Chat con repartidor

---

## 🗺️ Próximos Pasos

### **Integración con Mapas:**

#### **Opción 1: Google Maps**
```bash
npm install @react-google-maps/api
```

Requiere:
- API Key de Google Cloud
- Billing habilitado
- Maps JavaScript API activada

#### **Opción 2: Mapbox** (Recomendado)
```bash
npm install mapbox-gl react-map-gl
```

Requiere:
- Token de Mapbox (gratis hasta 50k requests/mes)
- Más económico que Google Maps

#### **Opción 3: Leaflet** (Gratis)
```bash
npm install react-leaflet leaflet
```

Requiere:
- Solo instalar librería
- Usa OpenStreetMap (completamente gratis)

---

## 📊 Base de Datos

### **Esquema de Tablas:**

#### **`repartidores`**
```sql
id, user_id, nombre, apellido, telefono, foto_url,
vehiculo_tipo, placa_vehiculo, activo, disponible,
calificacion, num_entregas, created_at, updated_at
```

#### **`ubicaciones_repartidor`**
```sql
id, repartidor_id, latitud, longitud, velocidad,
direccion, precision_metros, timestamp, created_at
```

#### **`asignaciones_repartidor`**
```sql
id, pedido_id, repartidor_id, estado, distancia_km,
tiempo_estimado_minutos, tiempo_real_minutos,
fecha_asignacion, fecha_aceptacion, fecha_recogida,
fecha_entrega, notas, created_at, updated_at
```

#### **`tracking_pedido`**
```sql
id, pedido_id, estado, latitud_actual, longitud_actual,
latitud_destino, longitud_destino, tiempo_estimado_minutos,
distancia_restante_km, mensaje, timestamp
```

---

## 🔐 Seguridad (RLS)

### **Políticas Configuradas:**

- ✅ **Clientes**: Pueden ver tracking de sus propios pedidos
- ✅ **Repartidores**: Pueden actualizar sus ubicaciones y asignaciones
- ✅ **Público**: Puede ver repartidores activos
- ✅ **Admins**: Acceso completo a todas las tablas

---

## 🎨 UI/UX

### **Diseño:**
- ✅ Responsive (móvil, tablet, desktop)
- ✅ Iconos de Lucide React
- ✅ Colores consistentes con el branding (naranja)
- ✅ Animaciones suaves
- ✅ Loading states
- ✅ Error handling

### **Componentes Visuales:**
- ✅ Timeline con línea vertical
- ✅ Indicadores de completado
- ✅ Tarjeta de repartidor con foto
- ✅ Mapa placeholder (listo para integración real)
- ✅ Badges de estado
- ✅ Botones de acción

---

## 📝 Notas de Desarrollo

### **Realtime:**
- Las suscripciones se limpian automáticamente al desmontar componentes
- Los canales usan IDs únicos (`tracking:${pedidoId}`)
- Las actualizaciones son instantáneas

### **Performance:**
- Índices en todas las consultas frecuentes
- Límites en historial de ubicaciones
- Memoización en hooks

### **Testing:**
Para probar el sistema sin repartidores reales:
1. Usa los repartidores de prueba del SQL
2. Simula ubicaciones manualmente en Supabase
3. Actualiza estados desde la consola de Supabase

---

## 🆘 Troubleshooting

### **No se actualizan los datos en tiempo real:**
1. Verificar que Realtime esté habilitado en Supabase
2. Verificar las políticas RLS
3. Revisar la consola del navegador

### **Error al cargar tracking:**
1. Verificar que el pedido existe
2. Verificar que la tabla `tracking_pedido` tiene datos
3. Ejecutar el SQL setup script

### **Mapa no se muestra:**
- El mapa actual es un placeholder
- Para mapa real, integrar Google Maps/Mapbox/Leaflet

---

**Última actualización:** Octubre 2025  
**Versión:** 1.0  
**Proyecto:** Danki - Delivery App


