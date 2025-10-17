-- =============================================
-- CREATE ORDERS TABLES
-- =============================================

-- 1. Crear tabla de pedidos
CREATE TABLE public.pedidos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN (
    'pending',
    'confirmed', 
    'preparing',
    'ready',
    'out_for_delivery',
    'delivered',
    'cancelled'
  )),
  total numeric(10,2) NOT NULL,
  subtotal numeric(10,2) NOT NULL,
  delivery_fee numeric(10,2) NOT NULL DEFAULT 0,
  tax numeric(10,2) NOT NULL DEFAULT 0,
  delivery_address text NOT NULL,
  delivery_phone text NOT NULL,
  delivery_notes text,
  payment_method text NOT NULL CHECK (payment_method IN ('cash', 'card')),
  estimated_delivery_time integer DEFAULT 30, -- en minutos
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 2. Crear tabla de items de pedidos
CREATE TABLE public.pedido_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- 3. Habilitar RLS
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;

-- 4. Políticas RLS para pedidos
-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY "pedidos_select_own" ON public.pedidos
    FOR SELECT USING (auth.uid() = user_id);

-- Los usuarios pueden crear pedidos
CREATE POLICY "pedidos_insert_authenticated" ON public.pedidos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios pedidos (solo ciertos campos)
CREATE POLICY "pedidos_update_own" ON public.pedidos
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Los admins pueden ver todos los pedidos
CREATE POLICY "pedidos_admin_all" ON public.pedidos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- 5. Políticas RLS para pedido_items
-- Los usuarios pueden ver items de sus pedidos
CREATE POLICY "pedido_items_select_own" ON public.pedido_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_items.order_id
            AND p.user_id = auth.uid()
        )
    );

-- Los usuarios pueden crear items para sus pedidos
CREATE POLICY "pedido_items_insert_own" ON public.pedido_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos p
            WHERE p.id = pedido_items.order_id
            AND p.user_id = auth.uid()
        )
    );

-- Los admins pueden ver todos los items
CREATE POLICY "pedido_items_admin_all" ON public.pedido_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name = 'admin'
        )
    );

-- 6. Crear índices para mejor rendimiento
CREATE INDEX idx_pedidos_user_id ON public.pedidos(user_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_pedidos_created_at ON public.pedidos(created_at);
CREATE INDEX idx_pedido_items_order_id ON public.pedido_items(order_id);
CREATE INDEX idx_pedido_items_product_id ON public.pedido_items(product_id);

-- 7. Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger para actualizar updated_at en pedidos
CREATE TRIGGER update_pedidos_updated_at 
    BEFORE UPDATE ON public.pedidos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 9. Función para calcular totales automáticamente (opcional)
CREATE OR REPLACE FUNCTION calculate_order_total(order_id uuid)
RETURNS numeric AS $$
DECLARE
    total_amount numeric;
BEGIN
    SELECT COALESCE(SUM(price * quantity), 0)
    INTO total_amount
    FROM public.pedido_items
    WHERE order_id = calculate_order_total.order_id;
    
    RETURN total_amount;
END;
$$ LANGUAGE plpgsql;

-- 10. Verificar que las tablas se crearon correctamente
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE tablename IN ('pedidos', 'pedido_items')
AND schemaname = 'public';

-- 11. Verificar las políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename IN ('pedidos', 'pedido_items')
AND schemaname = 'public';
