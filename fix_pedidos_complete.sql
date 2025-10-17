-- =============================================
-- VERIFICAR Y CORREGIR TABLA PEDIDOS COMPLETAMENTE
-- =============================================

-- 1. Mostrar estructura actual de pedidos
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pedidos'
ORDER BY ordinal_position;

-- 2. Verificar si existe columna status
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pedidos' 
        AND column_name = 'status'
    ) THEN
        RAISE NOTICE 'La columna status NO existe en la tabla pedidos';
        RAISE NOTICE 'Agregando columna status...';
        
        -- Agregar columna status
        ALTER TABLE public.pedidos 
        ADD COLUMN status text NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'));
        
        RAISE NOTICE 'Columna status agregada correctamente';
    ELSE
        RAISE NOTICE 'La columna status SÍ existe en la tabla pedidos';
    END IF;
END $$;

-- 3. Verificar otras columnas importantes
DO $$
DECLARE
    missing_columns text[] := ARRAY[]::text[];
BEGIN
    -- Verificar columnas críticas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'user_id') THEN
        missing_columns := array_append(missing_columns, 'user_id');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'total') THEN
        missing_columns := array_append(missing_columns, 'total');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'created_at') THEN
        missing_columns := array_append(missing_columns, 'created_at');
    END IF;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Faltan columnas importantes: %', array_to_string(missing_columns, ', ');
        RAISE NOTICE 'Se recomienda recrear la tabla pedidos completamente';
    ELSE
        RAISE NOTICE 'Todas las columnas críticas están presentes';
    END IF;
END $$;

-- 4. Mostrar estructura final
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pedidos'
ORDER BY ordinal_position;

-- 5. Verificar que pedido_items existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = 'pedido_items'
        ) 
        THEN 'Tabla pedido_items SÍ existe' 
        ELSE 'Tabla pedido_items NO existe - se necesita crear'
    END as pedido_items_check;
