-- =============================================
-- FIX RLS POLICIES FOR PRODUCTOS TABLE
-- =============================================

-- 1. Verificar si RLS está habilitado en la tabla productos
-- (Ya debería estar habilitado, pero verificamos)

-- 2. Eliminar políticas existentes si las hay
DROP POLICY IF EXISTS "productos_read_all" ON public.productos;
DROP POLICY IF EXISTS "productos_insert_authenticated" ON public.productos;
DROP POLICY IF EXISTS "productos_update_owner" ON public.productos;
DROP POLICY IF EXISTS "productos_delete_owner" ON public.productos;
DROP POLICY IF EXISTS "productos_admin_all" ON public.productos;

-- 3. Crear políticas RLS para productos

-- Política para lectura: Todos pueden leer productos activos
CREATE POLICY "productos_read_all" ON public.productos
    FOR SELECT USING (true);

-- Política para inserción: Usuarios autenticados pueden crear productos
CREATE POLICY "productos_insert_authenticated" ON public.productos
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Política para actualización: Usuarios autenticados pueden actualizar productos
CREATE POLICY "productos_update_authenticated" ON public.productos
    FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Política para eliminación: Usuarios autenticados pueden eliminar productos
CREATE POLICY "productos_delete_authenticated" ON public.productos
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- 4. Verificar que RLS está habilitado
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas más específicas basadas en roles (opcional)

-- Política para admins: Pueden hacer todo
CREATE POLICY "productos_admin_all" ON public.productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- Política para store owners: Pueden gestionar productos de sus tiendas
CREATE POLICY "productos_store_owner_manage" ON public.productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'store_owner'
        )
    );

-- 6. Verificar las políticas creadas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'productos';

-- =============================================
-- ALTERNATIVA SIMPLE (si las políticas de roles fallan)
-- =============================================

-- Si las políticas basadas en roles no funcionan, puedes usar esta versión más simple:

/*
-- Eliminar todas las políticas
DROP POLICY IF EXISTS "productos_read_all" ON public.productos;
DROP POLICY IF EXISTS "productos_insert_authenticated" ON public.productos;
DROP POLICY IF EXISTS "productos_update_authenticated" ON public.productos;
DROP POLICY IF EXISTS "productos_delete_authenticated" ON public.productos;
DROP POLICY IF EXISTS "productos_admin_all" ON public.productos;
DROP POLICY IF EXISTS "productos_store_owner_manage" ON public.productos;

-- Políticas simples para usuarios autenticados
CREATE POLICY "productos_all_authenticated" ON public.productos
    FOR ALL USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);
*/
