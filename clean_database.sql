-- =============================================
-- CLEAN DATABASE - START FROM ZERO
-- =============================================

-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos existentes
-- Solo ejecutar si estás seguro de que quieres empezar desde cero

-- 1. Deshabilitar temporalmente las restricciones de clave foránea
SET session_replication_role = replica;

-- 2. Eliminar datos de tablas dependientes primero (orden importante)
DELETE FROM public.pedido_items;
DELETE FROM public.pedidos;
DELETE FROM public.productos;
DELETE FROM public.tiendas;

-- 3. Eliminar datos de tablas de roles (opcional - solo si quieres limpiar también los roles)
-- DELETE FROM public.rol_permisos;
-- DELETE FROM public.user_roles;
-- DELETE FROM public.usuarios;
-- DELETE FROM public.permisos;
-- DELETE FROM public.roles;

-- 4. Reiniciar secuencias de ID (para que empiecen desde 1)
-- Nota: Las tablas usan UUID, pero si tienes alguna con SERIAL, aquí las reiniciarías
-- ALTER SEQUENCE public.tiendas_id_seq RESTART WITH 1;
-- ALTER SEQUENCE public.productos_id_seq RESTART WITH 1;

-- 5. Habilitar nuevamente las restricciones de clave foránea
SET session_replication_role = DEFAULT;

-- 6. Verificar que las tablas están vacías
SELECT 
    schemaname,
    tablename,
    n_tup_ins as "Total Inserted",
    n_tup_upd as "Total Updated", 
    n_tup_del as "Total Deleted",
    n_live_tup as "Live Rows"
FROM pg_stat_user_tables 
WHERE tablename IN ('tiendas', 'productos', 'pedidos', 'pedido_items')
ORDER BY tablename;

-- 7. Verificar que no hay datos
SELECT 'tiendas' as tabla, COUNT(*) as registros FROM public.tiendas
UNION ALL
SELECT 'productos' as tabla, COUNT(*) as registros FROM public.productos
UNION ALL
SELECT 'pedidos' as tabla, COUNT(*) as registros FROM public.pedidos
UNION ALL
SELECT 'pedido_items' as tabla, COUNT(*) as registros FROM public.pedido_items;

-- =============================================
-- OPCIONAL: Limpiar también el carrito del localStorage
-- =============================================
-- Nota: Esto se debe hacer desde el navegador, no desde SQL
-- En la consola del navegador ejecutar:
-- localStorage.removeItem('quickbite_cart');

-- =============================================
-- VERIFICACIÓN FINAL
-- =============================================
-- Después de ejecutar este script, todas las tablas deberían estar vacías
-- y podrás empezar a crear tiendas y productos desde cero

SELECT 'Base de datos limpiada exitosamente' as resultado;
