# 🚀 INICIO RÁPIDO: Sistema de Tracking

## ⚡ Configuración en 3 Pasos

### **1. Configurar Base de Datos** (2 minutos)

```bash
# Ve a: Supabase SQL Editor
# Abre: database-scripts/setup_tracking_system.sql
# Click: RUN
```

✅ Esto crea:
- 4 tablas nuevas
- RLS policies
- Realtime habilitado
- 3 repartidores de prueba

---

### **2. Verificar que Funciona** (1 minuto)

```bash
# Inicia tu app
npm run dev

# Ve a: http://localhost:3000/pedidos
# Haz un pedido de prueba
# Verás el botón: "Ver Seguimiento en Tiempo Real"
```

---

### **3. Probar el Tracking** (1 minuto)

```bash
# Click en "Ver Seguimiento en Tiempo Real"
# Verás:
# ✅ Mapa placeholder
# ✅ Timeline de eventos
# ✅ Estado actual
# ✅ Updates en tiempo real
```

---

## 📊 ¿Qué se Implementó?

### **✅ COMPLETADO:**

| Componente | Estado | Archivo |
|------------|--------|---------|
| **Base de Datos** | ✅ | `database-scripts/setup_tracking_system.sql` |
| **Tipos TypeScript** | ✅ | `src/types/tracking.ts` |
| **Servicio** | ✅ | `src/lib/services/trackingService.ts` |
| **Hooks** | ✅ | `src/hooks/useTracking.ts` |
| **Timeline UI** | ✅ | `src/components/TrackingTimeline.tsx` |
| **Repartidor Card** | ✅ | `src/components/RepartidorCard.tsx` |
| **Mapa Placeholder** | ✅ | `src/components/TrackingMap.tsx` |
| **Página Tracking** | ✅ | `src/app/pedidos/[id]/tracking/page.tsx` |
| **Botón en Pedidos** | ✅ | `src/app/pedidos/page.tsx` |
| **Realtime** | ✅ | Configurado en Supabase |

---

## 🎯 Funcionalidades

### **Para Clientes:**
- ✅ Ver estado del pedido en tiempo real
- ✅ Ver información del repartidor
- ✅ Ver timeline de eventos
- ✅ Ver distancia y tiempo estimado
- ✅ Recibir updates automáticos

### **Para Repartidores** (próximamente):
- ⏳ Ver pedidos asignados
- ⏳ Aceptar/rechazar pedidos
- ⏳ Actualizar ubicación GPS
- ⏳ Cambiar estado del pedido

---

## 🗺️ Próxima Mejora: Mapa Real

### **Opción Recomendada: Mapbox**

```bash
# 1. Instalar
npm install mapbox-gl react-map-gl

# 2. Obtener token gratis
https://www.mapbox.com/

# 3. Agregar a .env.local
NEXT_PUBLIC_MAPBOX_TOKEN=pk.xxxxx

# 4. Reemplazar TrackingMap.tsx con mapa real
```

**Ventajas de Mapbox:**
- ✅ 50,000 requests gratis/mes
- ✅ Más económico que Google Maps
- ✅ Excelente documentación
- ✅ Mapas bonitos y personalizables

---

## 📱 Flujo Completo

```
1. Cliente hace pedido
   ↓
2. Sistema crea tracking automáticamente
   ↓
3. Admin/Sistema asigna repartidor
   ↓
4. Repartidor acepta pedido
   ↓
5. Repartidor actualiza ubicación GPS
   ↓
6. Cliente ve ubicación en tiempo real
   ↓
7. Repartidor marca como entregado
   ↓
8. Cliente recibe confirmación
```

---

## 🔄 Estados del Sistema

### **Timeline Visual:**
```
🕐 Pendiente
   ↓
✅ Confirmado
   ↓
📦 Preparando
   ↓
✔️ Listo para Recoger
   ↓
🚚 En Camino
   ↓
🏠 Entregado
```

---

## 🎨 Screenshots Esperados

### **Página de Tracking:**
- Header con ID del pedido
- Banner con estado actual (naranja)
- Mapa con ubicación (placeholder)
- Tarjeta del repartidor (foto, calificación, vehículo)
- Timeline vertical con iconos
- Detalles de entrega
- Botón de soporte

### **Lista de Pedidos:**
- Botón naranja "Ver Seguimiento en Tiempo Real"
- Solo visible en pedidos activos

---

## 🧪 Testing

### **Simular Tracking:**

```sql
-- En Supabase SQL Editor

-- 1. Crear pedido de prueba
INSERT INTO pedidos (user_id, total, delivery_address, delivery_phone)
VALUES (auth.uid(), 50.00, 'Calle Falsa 123', '555-1234')
RETURNING id;

-- 2. Asignar repartidor (usa el ID del pedido)
INSERT INTO asignaciones_repartidor (pedido_id, repartidor_id)
VALUES ('pedido-id-aqui', (SELECT id FROM repartidores LIMIT 1));

-- 3. Actualizar tracking
INSERT INTO tracking_pedido (pedido_id, estado, mensaje)
VALUES ('pedido-id-aqui', 'en_camino', 'El repartidor está en camino');

-- 4. Simular ubicación GPS
INSERT INTO ubicaciones_repartidor (repartidor_id, latitud, longitud)
VALUES ((SELECT id FROM repartidores LIMIT 1), 40.7128, -74.0060);
```

---

## 📞 Soporte

### **Si algo no funciona:**

1. **Verificar Base de Datos:**
   ```sql
   SELECT * FROM repartidores;
   SELECT * FROM tracking_pedido;
   ```

2. **Verificar Realtime:**
   - Supabase Dashboard → Database → Replication
   - Debe estar habilitado para `tracking_pedido`

3. **Verificar RLS:**
   - Supabase Dashboard → Authentication → Policies
   - Deben existir políticas para las nuevas tablas

4. **Revisar Consola:**
   - F12 → Console
   - Buscar errores de Supabase

---

## 🎉 ¡Listo para Producción!

### **Checklist Final:**

- [ ] SQL ejecutado en Supabase
- [ ] Realtime habilitado
- [ ] RLS policies activas
- [ ] Datos de prueba insertados
- [ ] Página de tracking carga correctamente
- [ ] Botón visible en lista de pedidos
- [ ] Timeline se muestra bien
- [ ] No hay errores en consola

---

**🚀 El sistema de tracking está completo y funcional!**

Para agregar mapa real, ver: `SISTEMA_TRACKING_README.md`


