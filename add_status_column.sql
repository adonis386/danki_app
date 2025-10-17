-- =============================================
-- AGREGAR COLUMNA STATUS A LA TABLA PEDIDOS
-- =============================================

-- 1. Verificar si la columna status ya existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pedidos' 
            AND column_name = 'status'
        ) 
        THEN 'La columna status YA existe' 
        ELSE 'La columna status NO existe - agregando...' 
    END as status_check;

-- 2. Agregar columna status si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'pedidos' 
        AND column_name = 'status'
    ) THEN
        -- Agregar columna status
        ALTER TABLE public.pedidos 
        ADD COLUMN status text NOT NULL DEFAULT 'pending' 
        CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'));
        
        RAISE NOTICE 'Columna status agregada correctamente a la tabla pedidos';
    ELSE
        RAISE NOTICE 'La columna status ya existe en la tabla pedidos';
    END IF;
END $$;

-- 3. Verificar que se agregó correctamente
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pedidos' 
AND column_name = 'status';
