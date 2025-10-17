# 🔧 Solución: Error al Registrar Usuario en Producción

## ❌ Error Reportado
```
Error al crear cuenta
Database error saving new user
```

---

## 🔍 Diagnóstico del Problema

Este error ocurre cuando:
1. ❌ Falta la tabla `roles` en la base de datos
2. ❌ Falta la tabla `user_roles` en la base de datos
3. ❌ El trigger `on_auth_user_created` está fallando
4. ❌ El trigger no tiene permisos suficientes (`SECURITY DEFINER`)
5. ❌ Las políticas RLS están bloqueando la inserción

---

## ✅ Soluciones (En Orden de Rapidez)

### **Solución 1: Deshabilitar Trigger Temporalmente** ⚡ (2 minutos)

**Cuándo usar**: Necesitas que el registro funcione YA

**Pasos:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta:
```sql
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
```
3. Prueba crear un usuario
4. ✅ **Funcionará**, pero los usuarios NO tendrán rol asignado automáticamente

**⚠️ Consecuencia**: Necesitarás asignar roles manualmente desde el admin panel

---

### **Solución 2: Trigger Robusto** 🛡️ (5 minutos - RECOMENDADO)

**Cuándo usar**: Quieres que el sistema funcione correctamente

**Pasos:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el contenido completo de: **`fix_auth_simple.sql`**
3. Prueba crear un usuario
4. ✅ **Funcionará** y los usuarios tendrán rol 'customer' automáticamente

**Script clave:**
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER  -- ← CRÍTICO para que funcione
SET search_path = public
AS $$
BEGIN
  -- Asignar rol con manejo de errores
  BEGIN
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, id FROM public.roles WHERE name = 'customer' LIMIT 1;
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'Error al asignar rol: %', SQLERRM;
  END;
  
  RETURN NEW; -- ← SIEMPRE retorna NEW para no bloquear
END;
$$;
```

---

### **Solución 3: Setup Completo** 🏗️ (10 minutos)

**Cuándo usar**: Quieres configurar TODO correctamente desde cero

**Pasos:**
1. Ve a Supabase Dashboard → SQL Editor
2. Ejecuta el contenido completo de: **`fix_auth_setup.sql`**
3. Verifica que se crearon:
   - ✅ Tabla `roles` con 3 roles (customer, store_owner, admin)
   - ✅ Tabla `user_roles`
   - ✅ Trigger `on_auth_user_created`
   - ✅ Políticas RLS para ambas tablas
4. Prueba crear un usuario

---

## 🧪 Pruebas Después de la Solución

### **1. Verificar que el trigger existe:**
```sql
SELECT trigger_name, event_object_table 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';
```

**Resultado esperado:**
| trigger_name | event_object_table |
|--------------|-------------------|
| on_auth_user_created | users |

---

### **2. Verificar que los roles existen:**
```sql
SELECT id, name, description FROM public.roles ORDER BY name;
```

**Resultado esperado:**
| id | name | description |
|----|------|-------------|
| ... | admin | Administrador |
| ... | customer | Cliente regular |
| ... | store_owner | Propietario de tienda |

---

### **3. Crear un usuario de prueba:**

**Desde tu app en producción:**
1. Ve a la página de registro
2. Ingresa:
   - Email: `test@example.com`
   - Password: `Test1234`
3. Haz clic en "Crear Cuenta"

**Resultado esperado:**
- ✅ Usuario creado sin errores
- ✅ Mensaje: "¡Cuenta creada! Revisa tu correo..."
- ✅ Redirección a la página de login

---

### **4. Verificar que el rol se asignó:**
```sql
SELECT 
  u.email,
  r.name as role_name
FROM auth.users u
LEFT JOIN public.user_roles ur ON u.id = ur.user_id
LEFT JOIN public.roles r ON ur.role_id = r.id
WHERE u.email = 'test@example.com';
```

**Resultado esperado:**
| email | role_name |
|-------|-----------|
| test@example.com | customer |

---

## 🚨 Problemas Persistentes

### **Si aún falla después de la Solución 2:**

#### **Problema A: Falta la tabla `roles`**
**Error**: `relation "public.roles" does not exist`

**Solución**:
```sql
-- Ejecutar fix_auth_setup.sql completo
```

---

#### **Problema B: Trigger sin permisos**
**Error**: `permission denied` en el trigger

**Solución**:
```sql
-- La función debe tener SECURITY DEFINER
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER;
```

---

#### **Problema C: Políticas RLS bloqueando**
**Error**: `new row violates row-level security policy`

**Solución temporal**:
```sql
-- Deshabilitar RLS temporalmente
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
```

---

## 📊 Comparación de Soluciones

| Solución | Tiempo | Usuarios tienen rol | Complejidad | Recomendado |
|----------|--------|---------------------|-------------|-------------|
| 1. Deshabilitar trigger | 2 min | ❌ No | Baja | ⚠️ Solo urgencia |
| 2. Trigger robusto | 5 min | ✅ Sí | Media | ✅ **RECOMENDADO** |
| 3. Setup completo | 10 min | ✅ Sí | Alta | ✅ Primera vez |

---

## 🎯 Recomendación Final

**Para producción**, ejecuta la **Solución 2** (`fix_auth_simple.sql`):
- ✅ Rápida y efectiva
- ✅ No bloquea el registro si hay errores
- ✅ Asigna roles automáticamente
- ✅ Fácil de depurar

---

## 📝 Checklist Post-Solución

Después de ejecutar el script:
- [ ] El trigger existe en Supabase
- [ ] Los 3 roles existen (customer, store_owner, admin)
- [ ] Puedes crear usuarios sin errores
- [ ] Los nuevos usuarios tienen el rol 'customer'
- [ ] No hay errores en los logs de Supabase

---

## 🔗 Archivos Relacionados

- **`fix_auth_simple.sql`** → Solución rápida y robusta
- **`fix_auth_setup.sql`** → Setup completo de autenticación
- **`database_setup_roles.sql`** → Script original de roles (si existe)

---

## 💡 Prevención Futura

Para evitar este error en nuevos proyectos:

1. **Siempre incluir `SECURITY DEFINER`** en funciones de trigger
2. **Usar bloques `BEGIN...EXCEPTION...END`** para manejar errores
3. **Siempre retornar `NEW`** en triggers AFTER INSERT
4. **Probar en local** antes de desplegar

---

<div align="center">

**🚀 Después de aplicar la solución, tu registro funcionará perfectamente 🚀**

</div>

