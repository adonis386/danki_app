-- =============================================
-- CLEAN EXISTING TABLES ONLY
-- =============================================

-- ⚠️ ADVERTENCIA: Este script eliminará TODOS los datos existentes
-- Solo ejecutar si estás seguro de que quieres empezar desde cero

-- 1. Verificar qué tablas existen
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('tiendas', 'productos', 'pedidos', 'pedido_items')
AND schemaname = 'public'
ORDER BY tablename;

-- 2. Limpiar solo las tablas que existen
-- Empezar con las tablas dependientes primero

-- Limpiar pedido_items si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedido_items') THEN
        DELETE FROM public.pedido_items;
        RAISE NOTICE 'Tabla pedido_items limpiada';
    ELSE
        RAISE NOTICE 'Tabla pedido_items no existe, saltando...';
    END IF;
END $$;

-- Limpiar pedidos si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pedidos') THEN
        DELETE FROM public.pedidos;
        RAISE NOTICE 'Tabla pedidos limpiada';
    ELSE
        RAISE NOTICE 'Tabla pedidos no existe, saltando...';
    END IF;
END $$;

-- Limpiar productos si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'productos') THEN
        DELETE FROM public.productos;
        RAISE NOTICE 'Tabla productos limpiada';
    ELSE
        RAISE NOTICE 'Tabla productos no existe, saltando...';
    END IF;
END $$;

-- Limpiar tiendas si existe
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'tiendas') THEN
        DELETE FROM public.tiendas;
        RAISE NOTICE 'Tabla tiendas limpiada';
    ELSE
        RAISE NOTICE 'Tabla tiendas no existe, saltando...';
    END IF;
END $$;

-- 3. Verificar el estado final
SELECT 'tiendas' as tabla, COUNT(*) as registros FROM public.tiendas
UNION ALL
SELECT 'productos' as tabla, COUNT(*) as registros FROM public.productos
UNION ALL
SELECT 'pedidos' as tabla, COUNT(*) as registros FROM public.pedidos
UNION ALL
SELECT 'pedido_items' as tabla, COUNT(*) as registros FROM public.pedido_items;

-- 4. Mostrar mensaje de éxito
SELECT 'Limpieza completada exitosamente' as resultado;
