-- =============================================
-- SOLUCIÓN SIMPLE: Deshabilitar Trigger Problemático
-- =============================================
-- Si el trigger está bloqueando la creación de usuarios,
-- esta es una solución temporal para permitir el registro

-- OPCIÓN 1: ELIMINAR EL TRIGGER COMPLETAMENTE
-- ⚠️ ADVERTENCIA: Los usuarios nuevos NO tendrán rol asignado automáticamente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Si eliminaste el trigger, los usuarios pueden registrarse pero
-- necesitarás asignar roles manualmente desde el admin panel

-- =============================================

-- OPCIÓN 2: CREAR FUNCIÓN MÁS ROBUSTA (RECOMENDADO)
-- Esta función no bloqueará el registro si hay errores

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Intentar asignar rol 'customer' pero NO bloquear si falla
  BEGIN
    INSERT INTO public.user_roles (user_id, role_id)
    SELECT NEW.id, id FROM public.roles WHERE name = 'customer' LIMIT 1
    ON CONFLICT (user_id, role_id) DO NOTHING;
  EXCEPTION
    WHEN OTHERS THEN
      -- Solo registrar el error, no bloquear el registro
      RAISE WARNING 'No se pudo asignar rol al usuario %: %', NEW.id, SQLERRM;
  END;
  
  -- SIEMPRE retornar NEW para que el usuario se cree
  RETURN NEW;
END;
$$;

-- Recrear el trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================

-- VERIFICAR QUE EL TRIGGER ESTÁ CONFIGURADO
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'on_auth_user_created'
        ) 
        THEN '✅ Trigger configurado correctamente' 
        ELSE '❌ Trigger NO existe'
    END as status;

-- =============================================
-- INSTRUCCIONES
-- =============================================
-- 1. Si quieres DESHABILITAR el trigger temporalmente:
--    Ejecuta solo la OPCIÓN 1 (DROP TRIGGER)
--
-- 2. Si quieres una función más robusta (RECOMENDADO):
--    Ejecuta la OPCIÓN 2 completa
--
-- 3. Después de ejecutar el script, prueba crear un usuario
--
-- 4. Si el problema persiste, el error podría estar en:
--    - Falta la tabla 'roles'
--    - Falta la tabla 'user_roles'
--    - Problemas de permisos en Supabase
--    En ese caso, ejecuta: fix_auth_setup.sql

