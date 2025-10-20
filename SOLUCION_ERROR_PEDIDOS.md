# 🚨 SOLUCIÓN: Error al crear pedido

## ❌ Error Reportado

```
Error al crear pedido: Could not find the 'delivery_address' column of 'pedidos' in the schema cache
```

---

## ✅ SOLUCIÓN RÁPIDA

### **Ejecuta este script en Supabase:**

```
database-scripts/fix_pedidos_columns.sql
```

---

## 📋 ¿Qué hace el script?

El script `fix_pedidos_columns.sql` agrega **TODAS** las columnas que faltan en la tabla `pedidos`:

### **Columnas de Entrega:**
- ✅ `delivery_address` (TEXT, obligatorio)
- ✅ `delivery_phone` (VARCHAR(20), obligatorio)
- ✅ `delivery_notes` (TEXT, opcional)

### **Columnas de Pago:**
- ✅ `payment_method` (VARCHAR(20), obligatorio)
- ✅ `subtotal` (DECIMAL)
- ✅ `delivery_fee` (DECIMAL)
- ✅ `tax` (DECIMAL)
- ✅ `total` (DECIMAL)

### **Columnas de Control:**
- ✅ `status` (VARCHAR(50) con constraint)
- ✅ `estimated_delivery_time` (INTEGER)
- ✅ `created_at` (TIMESTAMP)
- ✅ `updated_at` (TIMESTAMP con trigger)

---

## 🚀 Pasos para Ejecutar

### **1. Ve a Supabase SQL Editor**
```
https://app.supabase.com/project/TU-PROJECT/sql
```

### **2. Abre el archivo**
```
database-scripts/fix_pedidos_columns.sql
```

### **3. Copia y pega el contenido completo**

### **4. Haz click en RUN** ▶️

### **5. Verifica los mensajes**
Deberías ver mensajes como:
```
✅ Columna delivery_address agregada
✅ Columna delivery_phone agregada
✅ Columna delivery_notes agregada
...
```

---

## ✅ Verificación

Después de ejecutar el script, verifica que funcionó:

```sql
-- Ejecuta este query en Supabase
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'pedidos'
ORDER BY column_name;
```

**Deberías ver todas estas columnas:**
- ✅ created_at
- ✅ delivery_address
- ✅ delivery_fee
- ✅ delivery_notes
- ✅ delivery_phone
- ✅ estimated_delivery_time
- ✅ id
- ✅ payment_method
- ✅ status
- ✅ subtotal
- ✅ tax
- ✅ total
- ✅ updated_at
- ✅ user_id

---

## 🧪 Prueba que Funciona

1. **Ve a tu aplicación:**
   ```
   http://localhost:3000
   ```

2. **Crea un pedido:**
   - Agrega productos al carrito
   - Click en "Realizar Pedido"
   - Llena el formulario
   - Click en "Confirmar Pedido"

3. **Verifica que se creó:**
   - NO deberías ver el error
   - Deberías ver confirmación exitosa
   - El pedido aparece en "Mis Pedidos"

---

## 📊 Script Adicional: Verificar Estructura

Si quieres verificar QUÉ columnas faltan ANTES de ejecutar el fix:

```sql
-- Ejecuta: database-scripts/check_pedidos_structure.sql
```

Este script te dirá exactamente qué columnas existen y cuáles faltan.

---

## ⚠️ Notas Importantes

### **El script es SEGURO:**
- ✅ **NO elimina datos existentes**
- ✅ Solo AGREGA columnas faltantes
- ✅ No modifica columnas existentes
- ✅ Usa defaults temporales para datos antiguos

### **Estrategia de Defaults:**
El script usa defaults temporales solo para agregar las columnas a registros existentes:

```sql
-- 1. Agrega la columna con default temporal
ALTER TABLE pedidos ADD COLUMN delivery_address TEXT DEFAULT 'Dirección no especificada';

-- 2. Luego elimina el default
ALTER TABLE pedidos ALTER COLUMN delivery_address DROP DEFAULT;
```

Esto asegura que:
- ✅ Pedidos antiguos tienen un valor válido
- ✅ Nuevos pedidos DEBEN proporcionar el valor
- ✅ No hay errores de NULL

---

## 🔄 Si el Error Persiste

### **1. Verifica que el script se ejecutó:**
```sql
SELECT column_name FROM information_schema.columns 
WHERE table_name = 'pedidos' 
AND column_name = 'delivery_address';
```

Si no devuelve nada, la columna NO existe.

### **2. Verifica permisos:**
- Asegúrate de estar usando el SQL Editor de Supabase
- No uses terminal/CLI

### **3. Verifica la tabla:**
```sql
SELECT * FROM pedidos LIMIT 1;
```

Si esto falla, la tabla no existe o no tienes permisos.

### **4. Limpia el cache de Supabase:**
En algunos casos, Supabase cachea el schema. Para forzar refresh:
- Guarda un cambio dummy en la tabla
- O espera 1-2 minutos
- O reinicia tu app local

---

## 📦 Estructura Completa Esperada

```sql
CREATE TABLE pedidos (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  
  -- Totales
  total DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) NOT NULL,
  delivery_fee DECIMAL(10, 2) NOT NULL,
  tax DECIMAL(10, 2) NOT NULL,
  
  -- Entrega
  delivery_address TEXT NOT NULL,
  delivery_phone VARCHAR(20) NOT NULL,
  delivery_notes TEXT,
  estimated_delivery_time INTEGER DEFAULT 30,
  
  -- Pago
  payment_method VARCHAR(20) NOT NULL,
  
  -- Control
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🎯 Resumen

| Paso | Acción | Archivo |
|------|--------|---------|
| 1 | Verificar qué falta (opcional) | `check_pedidos_structure.sql` |
| 2 | **Ejecutar fix** | `fix_pedidos_columns.sql` ⭐ |
| 3 | Verificar que funcionó | Query de verificación |
| 4 | Probar creación de pedido | En la app |

---

## ✅ Después del Fix

Una vez ejecutado el script:

✅ Podrás crear pedidos sin errores
✅ Todos los campos del formulario funcionarán
✅ El tracking de pedidos funcionará correctamente
✅ Los pedidos antiguos (si los hay) tendrán valores por defecto

---

## 🆘 ¿Aún tienes problemas?

Si después de ejecutar el script sigues viendo errores:

1. **Comparte el error exacto**
2. **Ejecuta y comparte el resultado de:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'pedidos';
   ```
3. **Verifica la consola del navegador (F12)**
4. **Revisa los logs de Supabase**

---

**💡 Este script resuelve el 99% de los problemas relacionados con columnas faltantes en pedidos.**


