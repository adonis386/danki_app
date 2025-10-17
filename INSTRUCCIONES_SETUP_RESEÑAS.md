# 🏆 Instrucciones para Configurar el Sistema de Reseñas

## ⚠️ IMPORTANTE: Debes ejecutar el SQL en Supabase

El sistema de reseñas está completamente implementado en el código, pero **las tablas necesitan ser creadas en tu base de datos de Supabase**.

---

## 📋 Pasos para Configurar

### **Paso 1: Ir a Supabase**

1. Abre tu navegador y ve a: [https://supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto (el que estás usando para QuickBite)

### **Paso 2: Abrir el SQL Editor**

1. En el menú lateral izquierdo, busca y haz clic en **"SQL Editor"**
2. Haz clic en el botón **"New Query"** (o "+ New query")

### **Paso 3: Copiar y Pegar el SQL**

1. Abre el archivo `setup_reviews_complete.sql` que está en la raíz del proyecto
2. Copia **TODO** el contenido del archivo
3. Pégalo en el editor SQL de Supabase

### **Paso 4: Ejecutar el SQL**

1. Haz clic en el botón **"Run"** (o presiona `Ctrl + Enter`)
2. Espera a que se complete la ejecución (puede tardar unos segundos)
3. Deberías ver un mensaje de éxito

---

## ✅ Verificar que Funcionó

### **Opción 1: Ver las Tablas**

1. En Supabase, ve a **"Table Editor"** en el menú lateral
2. Deberías ver estas nuevas tablas:
   - `reseñas`
   - `reseña_votos`
   - `reseña_respuestas`
   - `pedido_items` (si no existía)

### **Opción 2: Probar en la Aplicación**

1. Reinicia tu servidor de desarrollo (si está corriendo)
2. Ve a: `http://localhost:3000/tiendas/[id]/reviews`
3. Ya NO deberías ver errores en la consola
4. Deberías ver la página de reseñas funcionando correctamente

---

## 🎯 ¿Qué Hace este SQL?

El script SQL hace lo siguiente:

### **1. Tablas Principales:**
- ✅ **`reseñas`** - Almacena las reseñas de los usuarios
- ✅ **`reseña_votos`** - Almacena los votos (útil/no útil) de las reseñas
- ✅ **`reseña_respuestas`** - Almacena las respuestas de las tiendas a las reseñas
- ✅ **`pedido_items`** - Tabla auxiliar para verificar pedidos (si no existe)

### **2. Seguridad (RLS):**
- ✅ Políticas de acceso para que los usuarios solo vean/editen lo permitido
- ✅ Usuarios solo pueden reseñar una vez por tienda
- ✅ Solo pueden editar/eliminar en las primeras 24 horas
- ✅ Solo propietarios pueden responder reseñas

### **3. Automatizaciones:**
- ✅ **Triggers** que actualizan automáticamente el rating promedio de las tiendas
- ✅ **Índices** para mejorar el rendimiento de las consultas

### **4. Validaciones:**
- ✅ Rating debe ser entre 1 y 5 estrellas
- ✅ Título debe tener entre 3 y 100 caracteres
- ✅ Comentario máximo 1000 caracteres
- ✅ Respuesta entre 3 y 500 caracteres

---

## 🚨 Solución de Problemas

### **Error: "relation already exists"**
- **Causa**: Las tablas ya existen
- **Solución**: El script usa `CREATE TABLE IF NOT EXISTS`, así que es seguro ejecutarlo múltiples veces

### **Error: "column fecha_reseña does not exist"**
- **Causa**: Problema con caracteres especiales (ñ) en PostgreSQL
- **Solución**: ✅ Ya está corregido. El script ahora usa `fecha_resena` (sin ñ)

### **Error: "table pedidos does not exist"**
- **Causa**: La tabla de pedidos no existe aún
- **Solución**: Ejecuta primero el script `create_orders_tables.sql` que también está en el proyecto

### **Error: "permission denied"**
- **Causa**: No tienes permisos de administrador en Supabase
- **Solución**: Asegúrate de estar usando el SQL Editor como propietario del proyecto

### **Error persiste después de ejecutar**
- **Solución 1**: Reinicia el servidor de desarrollo (`npm run dev`)
- **Solución 2**: Limpia la caché de Supabase:
  - En Supabase, ve a "Project Settings" → "API"
  - Haz clic en "Restart project"

---

## 📞 ¿Necesitas Ayuda?

Si después de ejecutar el SQL sigues teniendo errores:

1. **Verifica en la consola de Supabase** si hay algún error específico
2. **Copia el error completo** que aparece
3. **Revisa** que todas las tablas previas (`tiendas`, `pedidos`, `productos`) existan
4. **Comparte el error** para que pueda ayudarte

---

## 🎉 Una Vez Configurado

Después de ejecutar el SQL correctamente, podrás:

- ✅ Ver reseñas de las tiendas
- ✅ Crear nuevas reseñas (si has hecho pedidos)
- ✅ Votar reseñas como útil/no útil
- ✅ Ver estadísticas completas de ratings
- ✅ Responder a reseñas (si eres propietario)

¡Todo el código ya está listo, solo falta crear las tablas!

---

## 📝 Archivos Relacionados

- **SQL Principal**: `setup_reviews_complete.sql`
- **SQL Alternativo**: `create_reviews_tables.sql`
- **Tipos TypeScript**: `src/types/review.ts`
- **Servicio**: `src/lib/services/reviewService.ts`
- **Componentes**: `src/components/Review*.tsx`
- **Página**: `src/app/tiendas/[id]/reviews/page.tsx`
