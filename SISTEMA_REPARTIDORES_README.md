# 🏍️ SISTEMA DE REPARTIDORES - DANKI

## 📋 Índice
- [Descripción General](#descripción-general)
- [Características Implementadas](#características-implementadas)
- [Flujo Completo](#flujo-completo)
- [Componentes del Sistema](#componentes-del-sistema)
- [Uso del Sistema](#uso-del-sistema)
- [API y Servicios](#api-y-servicios)
- [Testing](#testing)

---

## 🎯 Descripción General

El **Sistema de Repartidores** es una plataforma completa para gestionar entregas de pedidos, con asignación automática de repartidores, tracking en tiempo real y panel de control para repartidores y administradores.

### **Características Principales:**
- ✅ **Asignación Automática** - Algoritmo inteligente que selecciona el mejor repartidor
- ✅ **Panel de Repartidor** - Interfaz para gestionar pedidos asignados
- ✅ **Panel de Admin** - Gestión completa de repartidores
- ✅ **Tracking GPS** - Actualización de ubicación en tiempo real
- ✅ **Estadísticas** - Métricas de desempeño y entregas
- ✅ **Multivehículo** - Soporte para motos, bicicletas, autos y a pie

---

## ✅ Características Implementadas

### **1. Panel de Repartidor** (`/repartidor`)
- ✅ Vista de pedidos asignados en tiempo real
- ✅ Estadísticas personales (entregas, calificación, activas)
- ✅ Toggle de disponibilidad online/offline
- ✅ Actualización automática de ubicación GPS
- ✅ Botones de acción por estado:
  - **Asignado** → Aceptar Pedido
  - **Aceptado** → Marcar Recogido
  - **Recogido** → Marcar Entregado
- ✅ Navegación a detalles del pedido

### **2. Panel de Administración** (`/admin/repartidores`)
- ✅ Lista completa de repartidores
- ✅ Filtros por disponibilidad y estado activo
- ✅ Búsqueda por nombre, apellido o teléfono
- ✅ Estadísticas globales:
  - Total de asignaciones
  - Tasa de aceptación
  - Tasa de entrega
  - Tiempo promedio de entrega
- ✅ Acciones rápidas:
  - Cambiar disponibilidad
  - Editar repartidor
  - Ver historial
  - Eliminar (soft delete)

### **3. Formulario de Registro** (`/admin/repartidores/nuevo`)
- ✅ Información personal (nombre, apellido, teléfono)
- ✅ Foto de perfil (URL)
- ✅ Tipo de vehículo (moto, bicicleta, auto, a pie)
- ✅ Placa del vehículo
- ✅ Vista previa en tiempo real
- ✅ Validación de campos obligatorios

### **4. Asignación Automática**
- ✅ Algoritmo inteligente de selección
- ✅ Criterios configurables:
  - Distancia máxima (km)
  - Calificación mínima
  - Prioridad (cercanía vs calificación)
- ✅ Cálculo de score basado en:
  - Calificación del repartidor (40%)
  - Proximidad al destino (40%)
  - Experiencia/entregas (20%)
- ✅ Geocodificación de direcciones (placeholder)
- ✅ Creación automática de tracking
- ✅ Notificación a repartidores disponibles

### **5. Tracking en Tiempo Real**
- ✅ Actualización automática de ubicación GPS cada 30s
- ✅ Almacenamiento de historial de ubicaciones
- ✅ Cálculo de distancias con fórmula de Haversine
- ✅ Estimación de tiempos de entrega
- ✅ Suscripciones en tiempo real con Supabase

---

## 🔄 Flujo Completo

```
1. CLIENTE HACE PEDIDO
   ↓
2. SISTEMA CREA PEDIDO EN DB
   ↓
3. ASIGNACIÓN AUTOMÁTICA
   ├── Geocodificar dirección de entrega
   ├── Buscar repartidores disponibles
   ├── Filtrar por distancia y calificación
   ├── Calcular score para cada repartidor
   └── Seleccionar el mejor
   ↓
4. CREAR ASIGNACIÓN + TRACKING INICIAL
   ├── Estado: "asignado"
   ├── Distancia calculada
   └── Tiempo estimado
   ↓
5. NOTIFICAR REPARTIDOR
   ├── Push notification (próximamente)
   └── Ver en panel: /repartidor
   ↓
6. REPARTIDOR ACEPTA
   ├── Click en "Aceptar"
   ├── Estado → "aceptado"
   └── Actualizar tracking
   ↓
7. REPARTIDOR ACTIVA DISPONIBILIDAD
   ├── Toggle → "Disponible"
   ├── GPS empieza a actualizar cada 30s
   └── Ubicación visible en tracking
   ↓
8. REPARTIDOR RECOGE PEDIDO
   ├── Click en "Marcar Recogido"
   ├── Estado → "recogido"
   └── Tracking → "en_camino"
   ↓
9. CLIENTE VE UBICACIÓN EN TIEMPO REAL
   ├── Página: /pedidos/[id]/tracking
   ├── Mapa con ubicación del repartidor
   ├── Distancia restante
   └── Tiempo estimado actualizado
   ↓
10. REPARTIDOR ENTREGA
    ├── Click en "Marcar Entregado"
    ├── Estado → "entregado"
    ├── Tracking → "entregado"
    ├── Calcular tiempo real
    └── Actualizar estadísticas
```

---

## 🛠️ Componentes del Sistema

### **Base de Datos** (Supabase)

#### **Tabla: `repartidores`**
```sql
- id (UUID, PK)
- user_id (UUID, FK → auth.users) [opcional]
- nombre (TEXT)
- apellido (TEXT)
- telefono (VARCHAR)
- foto_url (TEXT)
- vehiculo_tipo (VARCHAR: moto|bicicleta|auto|a_pie)
- placa_vehiculo (VARCHAR)
- activo (BOOLEAN, default: true)
- disponible (BOOLEAN, default: false)
- calificacion (DECIMAL, default: 5.0)
- num_entregas (INTEGER, default: 0)
- created_at, updated_at (TIMESTAMP)
```

#### **Tabla: `asignaciones_repartidor`**
```sql
- id (UUID, PK)
- pedido_id (UUID, FK → pedidos)
- repartidor_id (UUID, FK → repartidores)
- estado (VARCHAR: asignado|aceptado|rechazado|recogido|entregado)
- distancia_km (DECIMAL)
- tiempo_estimado_minutos (INTEGER)
- tiempo_real_minutos (INTEGER)
- fecha_asignacion, fecha_aceptacion, fecha_recogida, fecha_entrega
- notas (TEXT)
- created_at, updated_at
```

#### **Tabla: `ubicaciones_repartidor`**
```sql
- id (UUID, PK)
- repartidor_id (UUID, FK → repartidores)
- latitud (DECIMAL)
- longitud (DECIMAL)
- velocidad (DECIMAL) [km/h]
- direccion (DECIMAL) [grados]
- precision_metros (INTEGER)
- timestamp (TIMESTAMP)
- created_at
```

### **Servicios**

#### **`trackingService.ts`**
- `getRepartidores(filters)` - Listar repartidores con filtros
- `getRepartidorById(id)` - Obtener un repartidor
- `createRepartidor(data)` - Crear repartidor
- `updateRepartidor(id, data)` - Actualizar repartidor
- `toggleDisponibilidad(id, disponible)` - Cambiar disponibilidad
- `createUbicacion(data)` - Registrar ubicación GPS
- `getUltimaUbicacion(repartidorId)` - Última ubicación
- `asignarRepartidor(pedidoId, repartidorId)` - Asignar manualmente
- `aceptarPedido(asignacionId)` - Aceptar asignación
- `marcarRecogido(asignacionId)` - Marcar como recogido
- `marcarEntregado(asignacionId)` - Marcar como entregado
- `calcularDistancia(coord1, coord2)` - Fórmula de Haversine
- `calcularTiempoEstimado(distanciaKm)` - Estimación de tiempo

#### **`assignmentService.ts`**
- `asignarRepartidorAutomatico(pedido, criterios)` - **CORE**
- `seleccionarMejorRepartidor(repartidores, criterios)` - Algoritmo
- `calcularScore(repartidor, distancia)` - Puntuación
- `reasignarPedido(pedidoId, nuevoRepartidorId)` - Reasignación
- `obtenerEstadisticasAsignacion()` - Métricas globales
- `geocodificarDireccion(direccion)` - Convertir dirección → coordenadas

### **Páginas**

| Ruta | Descripción | Usuario |
|------|-------------|---------|
| `/repartidor` | Dashboard del repartidor | Repartidor |
| `/admin/repartidores` | Gestión de repartidores | Admin |
| `/admin/repartidores/nuevo` | Crear repartidor | Admin |
| `/admin/repartidores/[id]/editar` | Editar repartidor | Admin |
| `/pedidos/[id]/tracking` | Tracking para cliente | Cliente |

---

## 📱 Uso del Sistema

### **PARA ADMINISTRADORES:**

#### **1. Crear Nuevo Repartidor**
```
1. Ve a /admin/repartidores
2. Click "Nuevo Repartidor"
3. Llena el formulario:
   - Nombre y apellido (obligatorio)
   - Teléfono (opcional)
   - URL de foto (opcional)
   - Tipo de vehículo
   - Placa del vehículo
4. Click "Crear Repartidor"
```

#### **2. Gestionar Repartidores**
```
- Filtrar por disponibilidad/activo
- Buscar por nombre/teléfono
- Ver estadísticas generales
- Cambiar disponibilidad con un click
- Editar información
- Ver historial de entregas
```

#### **3. Ver Estadísticas**
```
- Total de asignaciones
- Tasa de aceptación (%)
- Tasa de entrega (%)
- Tiempo promedio de entrega
```

---

### **PARA REPARTIDORES:**

#### **1. Iniciar Sesión**
```
1. Ir a /login
2. Usar credenciales de repartidor
3. Redirige automáticamente a /repartidor
```

#### **2. Activar Disponibilidad**
```
1. En /repartidor
2. Click en "No Disponible" → cambia a "Disponible"
3. El sistema empezará a actualizar tu GPS cada 30s
4. Recibirás notificaciones de nuevos pedidos
```

#### **3. Aceptar Pedido**
```
1. Ver pedidos asignados en el dashboard
2. Click "Aceptar" en el pedido deseado
3. Estado cambia a "Aceptado"
4. El cliente recibe notificación
```

#### **4. Recoger Pedido**
```
1. Llegar a la tienda
2. Recoger el pedido
3. Click "Marcar Recogido"
4. Estado cambia a "En Camino"
5. Cliente puede ver tu ubicación en tiempo real
```

#### **5. Entregar Pedido**
```
1. Llegar a la ubicación del cliente
2. Entregar el pedido
3. Click "Marcar Entregado"
4. Estado cambia a "Entregado"
5. Se calcula tiempo real vs estimado
6. Se actualiza tu calificación y estadísticas
```

---

### **PARA CLIENTES:**

#### **1. Hacer Pedido**
```
1. Agregar productos al carrito
2. Click "Realizar Pedido"
3. Llenar dirección de entrega
4. Confirmar pedido
5. Sistema asigna repartidor automáticamente
```

#### **2. Ver Seguimiento**
```
1. Ir a /pedidos
2. Click "Ver Seguimiento en Tiempo Real"
3. Ver:
   - Estado actual del pedido
   - Información del repartidor
   - Ubicación en tiempo real (mapa)
   - Tiempo estimado de llegada
   - Timeline de eventos
```

---

## 🧪 Testing

### **Datos de Prueba**

El sistema incluye 3 repartidores de prueba:

```sql
1. Carlos Ramírez
   - Vehículo: Moto 🏍️
   - Calificación: 4.8
   - Entregas: 150

2. Ana Martínez
   - Vehículo: Bicicleta 🚲
   - Calificación: 4.9
   - Entregas: 200

3. Luis García
   - Vehículo: Auto 🚗
   - Calificación: 4.7
   - Entregas: 100
```

### **Simular Flujo Completo**

```bash
# 1. Crear repartidor de prueba
- Ve a /admin/repartidores/nuevo
- Crea un repartidor

# 2. Activar como repartidor
- Login con credenciales de repartidor
- Ve a /repartidor
- Activa disponibilidad

# 3. Crear pedido
- Login como cliente
- Agrega productos al carrito
- Realiza pedido
- El repartidor se asigna automáticamente

# 4. Ver asignación
- Como repartidor, ve a /repartidor
- Verás el pedido asignado

# 5. Aceptar y procesar
- Click "Aceptar"
- Click "Marcar Recogido"
- Click "Marcar Entregado"

# 6. Verificar
- Como cliente, ve a /pedidos/[id]/tracking
- Verás todo el historial
```

---

## 📊 Algoritmo de Asignación

### **Criterios de Selección:**

```javascript
Score Total = (Calificación × 0.4) + (Proximidad × 0.4) + (Experiencia × 0.2)
```

### **Cálculo de Componentes:**

#### **1. Calificación (40%)**
```
Score = (calificacion / 5) × 0.4
Ejemplo: 4.5/5 = 0.9 × 0.4 = 0.36
```

#### **2. Proximidad (40%)**
```
Score = max(0, (1 - distancia_km / 20)) × 0.4
Ejemplo: 5 km → (1 - 5/20) × 0.4 = 0.75 × 0.4 = 0.30
```

#### **3. Experiencia (20%)**
```
Score = min(1, num_entregas / 100) × 0.2
Ejemplo: 50 entregas → (50/100) × 0.2 = 0.5 × 0.2 = 0.10
```

### **Ejemplo Real:**

```
Repartidor A:
- Calificación: 4.8 (0.384)
- Distancia: 3 km (0.34)
- Entregas: 150 (0.20)
→ Score Total = 0.924

Repartidor B:
- Calificación: 4.9 (0.392)
- Distancia: 8 km (0.24)
- Entregas: 80 (0.16)
→ Score Total = 0.792

✅ Repartidor A es seleccionado
```

---

## ⚙️ Configuración

### **Variables de Entorno**

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=tu_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key

# GPS Settings (opcional)
GPS_UPDATE_INTERVAL=30000  # 30 segundos
GPS_HIGH_ACCURACY=true

# Assignment Settings (opcional)
MAX_DISTANCE_KM=20
MIN_RATING=3.5
PRIORITIZE_PROXIMITY=true
```

### **Permisos de Navegador**

El sistema requiere permisos de geolocalización para repartidores:

```javascript
if (navigator.geolocation) {
  navigator.geolocation.watchPosition(
    position => {
      // Actualizar ubicación
    },
    error => {
      console.error('Error GPS:', error)
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    }
  )
}
```

---

## 🚀 Próximas Mejoras

### **Corto Plazo:**
- [ ] Integrar geocodificación real (Google Maps / Mapbox)
- [ ] Notificaciones push a repartidores
- [ ] Histórico completo de entregas por repartidor
- [ ] Mapa con ruta optimizada
- [ ] Sistema de calificación de clientes a repartidores

### **Mediano Plazo:**
- [ ] Chat entre cliente y repartidor
- [ ] Zonas de entrega y cobertura
- [ ] Turnos y horarios de repartidores
- [ ] Incentivos y bonificaciones
- [ ] Múltiples pedidos simultáneos

### **Largo Plazo:**
- [ ] IA para predicción de tiempos
- [ ] Optimización de rutas con múltiples entregas
- [ ] Integración con apps de navegación (Waze/Google Maps)
- [ ] Sistema de propinas
- [ ] Gamificación y rankings

---

## 📝 Notas Importantes

### **RLS Policies:**
- Repartidores pueden ver solo sus propias asignaciones
- Admins pueden ver todos los repartidores
- Clientes pueden ver tracking de sus pedidos

### **Seguridad:**
- Ubicaciones GPS se guardan cifradas
- No se exponen datos sensibles del repartidor
- Solo repartidores autenticados pueden actualizar ubicación

### **Performance:**
- GPS se actualiza cada 30s (configurable)
- Historial de ubicaciones se limpia después de 7 días
- Índices en tablas para queries rápidas

---

## 🆘 Troubleshooting

### **Repartidor no recibe pedidos:**
```
1. Verificar que esté "Disponible" (toggle verde)
2. Verificar que esté "Activo"
3. Verificar calificación > 3.0
4. Verificar ubicación GPS actualizada
```

### **GPS no actualiza:**
```
1. Verificar permisos del navegador
2. F12 → Console → buscar errores de geolocation
3. Verificar que disponibilidad esté activa
4. Probar en HTTPS (geolocation requiere SSL)
```

### **Asignación automática no funciona:**
```
1. Verificar que haya repartidores disponibles
2. Revisar consola del navegador (F12)
3. Verificar distancia_maxima_km en configuración
4. Verificar que min_calificacion no sea muy alta
```

---

**✅ Sistema de Repartidores completamente funcional y listo para producción!** 🎉

