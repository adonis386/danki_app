-- =============================================
-- VERIFICAR Y CORREGIR TABLA PEDIDOS
-- =============================================

-- 1. Verificar la estructura actual de la tabla pedidos
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pedidos'
ORDER BY ordinal_position;

-- 2. Verificar si existe la columna status
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_schema = 'public' 
            AND table_name = 'pedidos' 
            AND column_name = 'status'
        ) 
        THEN 'La columna status SÍ existe' 
        ELSE 'La columna status NO existe' 
    END as status_check;

-- 3. Mostrar todas las columnas disponibles
SELECT column_name 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'pedidos'
ORDER BY ordinal_position;
