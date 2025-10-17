-- =============================================
-- SOLUCIÓN: Error al crear usuario en producción
-- =============================================
-- Error: "Database error saving new user"
-- Causa: Falta configuración de triggers o tablas relacionadas

-- 1. VERIFICAR SI EXISTE LA TABLA user_roles
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'user_roles'
        ) 
        THEN 'Tabla user_roles SÍ existe' 
        ELSE 'Tabla user_roles NO existe - PROBLEMA'
    END as user_roles_check;

-- 2. CREAR TABLA user_roles SI NO EXISTE
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, role_id)
);

-- 3. VERIFICAR SI EXISTE LA TABLA roles
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'roles'
        ) 
        THEN 'Tabla roles SÍ existe' 
        ELSE 'Tabla roles NO existe - CREANDO...'
    END as roles_check;

-- 4. CREAR TABLA roles SI NO EXISTE
CREATE TABLE IF NOT EXISTS public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- 5. INSERTAR ROLES BÁSICOS SI NO EXISTEN
INSERT INTO public.roles (name, description, permissions)
VALUES 
  ('customer', 'Cliente regular', '["view_products", "create_orders", "view_own_orders"]'::jsonb),
  ('store_owner', 'Propietario de tienda', '["view_products", "create_orders", "manage_store", "manage_products"]'::jsonb),
  ('admin', 'Administrador', '["manage_all"]'::jsonb)
ON CONFLICT (name) DO NOTHING;

-- 6. VERIFICAR SI EXISTE EL TRIGGER PARA ASIGNAR ROL AUTOMÁTICAMENTE
SELECT 
    trigger_name, 
    event_object_table, 
    action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 7. CREAR O REEMPLAZAR LA FUNCIÓN QUE ASIGNA EL ROL CUSTOMER POR DEFECTO
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  customer_role_id uuid;
BEGIN
  -- Obtener el ID del rol 'customer'
  SELECT id INTO customer_role_id FROM public.roles WHERE name = 'customer' LIMIT 1;
  
  -- Si existe el rol, asignarlo al nuevo usuario
  IF customer_role_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role_id)
    VALUES (NEW.id, customer_role_id)
    ON CONFLICT (user_id, role_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- En caso de error, no bloquear la creación del usuario
    RAISE WARNING 'Error al asignar rol al usuario: %', SQLERRM;
    RETURN NEW;
END;
$$;

-- 8. ELIMINAR EL TRIGGER ANTERIOR SI EXISTE
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 9. CREAR EL TRIGGER PARA ASIGNAR ROL AUTOMÁTICAMENTE
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 10. HABILITAR RLS EN LAS TABLAS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

-- 11. POLÍTICAS RLS PARA user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all user roles" ON public.user_roles;
CREATE POLICY "Admins can manage all user roles"
  ON public.user_roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- 12. POLÍTICAS RLS PARA roles
DROP POLICY IF EXISTS "Anyone can view roles" ON public.roles;
CREATE POLICY "Anyone can view roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Only admins can manage roles" ON public.roles;
CREATE POLICY "Only admins can manage roles"
  ON public.roles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur
      INNER JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() AND r.name = 'admin'
    )
  );

-- 13. VERIFICACIÓN FINAL
SELECT 
    'Tabla roles: ' || COUNT(*)::text || ' roles' as roles_count
FROM public.roles;

SELECT 
    'Trigger configurado: ' || 
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.triggers 
        WHERE trigger_name = 'on_auth_user_created'
    ) THEN 'SÍ' ELSE 'NO' END as trigger_status;

-- 14. MOSTRAR ROLES DISPONIBLES
SELECT id, name, description FROM public.roles ORDER BY name;

-- =============================================
-- INSTRUCCIONES
-- =============================================
-- 1. Copia y pega TODO este script en Supabase SQL Editor
-- 2. Ejecuta el script
-- 3. Verifica que los roles se crearon correctamente
-- 4. Prueba crear un usuario nuevo
-- 5. El usuario debería tener el rol 'customer' automáticamente

-- Si aún tienes problemas:
-- - Verifica que el trigger se ejecutó correctamente
-- - Revisa los logs de Supabase Dashboard > Database > Logs
-- - Asegúrate de que la función handle_new_user() tiene SECURITY DEFINER

