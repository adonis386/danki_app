-- =============================================
-- VERIFICAR Y CORREGIR RELACIONES ENTRE TABLAS
-- =============================================

-- 1. Verificar que existe la tabla auth.users (esto debería existir por defecto en Supabase)
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'auth' 
            AND table_name = 'users'
        ) 
        THEN 'Tabla auth.users SÍ existe' 
        ELSE 'Tabla auth.users NO existe - PROBLEMA CRÍTICO'
    END as auth_users_check;

-- 2. Verificar estructura de la tabla reseñas
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'reseñas'
ORDER BY ordinal_position;

-- 3. Verificar foreign keys de la tabla reseñas
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='reseñas'
AND tc.table_schema = 'public';

-- 4. Si las foreign keys no existen, las recreamos
DO $$
BEGIN
    -- Verificar si existe la foreign key a auth.users
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'reseñas' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'user_id'
        AND tc.table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Agregando foreign key de user_id a auth.users...';
        
        -- Agregar foreign key constraint
        ALTER TABLE public.reseñas 
        ADD CONSTRAINT reseñas_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key agregada correctamente';
    ELSE
        RAISE NOTICE 'Foreign key de user_id ya existe';
    END IF;
END $$;

-- 5. Verificar que la tabla tiendas existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'tiendas'
        ) 
        THEN 'Tabla tiendas SÍ existe' 
        ELSE 'Tabla tiendas NO existe - PROBLEMA'
    END as tiendas_check;

-- 6. Verificar foreign key a tiendas
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
        ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = 'reseñas' 
        AND tc.constraint_type = 'FOREIGN KEY'
        AND kcu.column_name = 'tienda_id'
        AND tc.table_schema = 'public'
    ) THEN
        RAISE NOTICE 'Agregando foreign key de tienda_id a tiendas...';
        
        ALTER TABLE public.reseñas 
        ADD CONSTRAINT reseñas_tienda_id_fkey 
        FOREIGN KEY (tienda_id) REFERENCES public.tiendas(id) ON DELETE CASCADE;
        
        RAISE NOTICE 'Foreign key de tienda_id agregada correctamente';
    ELSE
        RAISE NOTICE 'Foreign key de tienda_id ya existe';
    END IF;
END $$;

-- 7. Verificar foreign key a pedidos (si existe)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'pedidos'
    ) THEN
        IF NOT EXISTS (
            SELECT 1 FROM information_schema.table_constraints tc
            JOIN information_schema.key_column_usage kcu 
            ON tc.constraint_name = kcu.constraint_name
            WHERE tc.table_name = 'reseñas' 
            AND tc.constraint_type = 'FOREIGN KEY'
            AND kcu.column_name = 'pedido_id'
            AND tc.table_schema = 'public'
        ) THEN
            RAISE NOTICE 'Agregando foreign key de pedido_id a pedidos...';
            
            ALTER TABLE public.reseñas 
            ADD CONSTRAINT reseñas_pedido_id_fkey 
            FOREIGN KEY (pedido_id) REFERENCES public.pedidos(id) ON DELETE SET NULL;
            
            RAISE NOTICE 'Foreign key de pedido_id agregada correctamente';
        ELSE
            RAISE NOTICE 'Foreign key de pedido_id ya existe';
        END IF;
    ELSE
        RAISE NOTICE 'Tabla pedidos no existe, saltando foreign key de pedido_id';
    END IF;
END $$;

-- 8. Mostrar todas las foreign keys finales
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='reseñas'
AND tc.table_schema = 'public'
ORDER BY tc.constraint_name;
