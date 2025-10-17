-- =============================================
-- CREAR TABLA PEDIDO_ITEMS QUE FALTA
-- =============================================

-- 1. Crear tabla pedido_items si no existe
CREATE TABLE IF NOT EXISTS public.pedido_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Habilitar RLS en pedido_items
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas RLS para pedido_items
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pedido_items' 
        AND policyname = 'pedido_items_select_own'
    ) THEN
        CREATE POLICY "pedido_items_select_own" ON public.pedido_items
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM public.pedidos p 
                    WHERE p.id = order_id 
                    AND p.user_id = auth.uid()
                )
            );
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'pedido_items' 
        AND policyname = 'pedido_items_insert_authenticated'
    ) THEN
        CREATE POLICY "pedido_items_insert_authenticated" ON public.pedido_items
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM public.pedidos p 
                    WHERE p.id = order_id 
                    AND p.user_id = auth.uid()
                )
            );
    END IF;
END $$;

-- 4. Crear índices para mejor rendimiento
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pedido_items_order_id') THEN
        CREATE INDEX idx_pedido_items_order_id ON public.pedido_items(order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pedido_items_product_id') THEN
        CREATE INDEX idx_pedido_items_product_id ON public.pedido_items(product_id);
    END IF;
END $$;

-- 5. Verificar que la tabla se creó correctamente
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name = 'pedido_items';
