-- =============================================
-- SETUP COMPLETO PARA SISTEMA DE RESEÑAS
-- =============================================

-- Paso 1: Verificar/Crear tabla pedido_items si no existe
CREATE TABLE IF NOT EXISTS public.pedido_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id uuid NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.productos(id) ON DELETE CASCADE,
  quantity integer NOT NULL CHECK (quantity > 0),
  price numeric(10,2) NOT NULL CHECK (price >= 0),
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Habilitar RLS en pedido_items si no está habilitado
ALTER TABLE public.pedido_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para pedido_items
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

-- =============================================
-- SISTEMA DE RESEÑAS
-- =============================================

-- 1. Crear tabla de reseñas
CREATE TABLE IF NOT EXISTS public.reseñas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tienda_id uuid NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  pedido_id uuid REFERENCES public.pedidos(id) ON DELETE SET NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  titulo text NOT NULL CHECK (length(titulo) >= 3 AND length(titulo) <= 100),
  comentario text CHECK (length(comentario) <= 1000),
  fecha_resena timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(user_id, tienda_id)
);

-- 2. Crear tabla de votos en reseñas
CREATE TABLE IF NOT EXISTS public.reseña_votos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseña_id uuid NOT NULL REFERENCES public.reseñas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  es_util boolean NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(reseña_id, user_id)
);

-- 3. Crear tabla de respuestas de tiendas
CREATE TABLE IF NOT EXISTS public.reseña_respuestas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseña_id uuid NOT NULL REFERENCES public.reseñas(id) ON DELETE CASCADE,
  tienda_id uuid NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  respuesta text NOT NULL CHECK (length(respuesta) >= 3 AND length(respuesta) <= 500),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(reseña_id)
);

-- 4. Habilitar RLS
ALTER TABLE public.reseñas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseña_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseña_respuestas ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para reseñas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseñas' AND policyname = 'reseñas_select_all') THEN
        CREATE POLICY "reseñas_select_all" ON public.reseñas FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseñas' AND policyname = 'reseñas_insert_authenticated') THEN
        CREATE POLICY "reseñas_insert_authenticated" ON public.reseñas FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseñas' AND policyname = 'reseñas_update_own') THEN
        CREATE POLICY "reseñas_update_own" ON public.reseñas 
        FOR UPDATE USING (auth.uid() = user_id AND created_at > now() - interval '24 hours');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseñas' AND policyname = 'reseñas_delete_own') THEN
        CREATE POLICY "reseñas_delete_own" ON public.reseñas 
        FOR DELETE USING (auth.uid() = user_id AND created_at > now() - interval '24 hours');
    END IF;
END $$;

-- 6. Políticas RLS para votos
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseña_votos' AND policyname = 'reseña_votos_select_all') THEN
        CREATE POLICY "reseña_votos_select_all" ON public.reseña_votos FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseña_votos' AND policyname = 'reseña_votos_insert_authenticated') THEN
        CREATE POLICY "reseña_votos_insert_authenticated" ON public.reseña_votos FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseña_votos' AND policyname = 'reseña_votos_update_own') THEN
        CREATE POLICY "reseña_votos_update_own" ON public.reseña_votos FOR UPDATE USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseña_votos' AND policyname = 'reseña_votos_delete_own') THEN
        CREATE POLICY "reseña_votos_delete_own" ON public.reseña_votos FOR DELETE USING (auth.uid() = user_id);
    END IF;
END $$;

-- 7. Políticas RLS para respuestas
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'reseña_respuestas' AND policyname = 'reseña_respuestas_select_all') THEN
        CREATE POLICY "reseña_respuestas_select_all" ON public.reseña_respuestas FOR SELECT USING (true);
    END IF;
END $$;

-- 8. Crear índices
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reseñas_tienda_id') THEN
        CREATE INDEX idx_reseñas_tienda_id ON public.reseñas(tienda_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reseñas_user_id') THEN
        CREATE INDEX idx_reseñas_user_id ON public.reseñas(user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reseñas_rating') THEN
        CREATE INDEX idx_reseñas_rating ON public.reseñas(rating);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reseñas_fecha') THEN
        CREATE INDEX idx_reseñas_fecha ON public.reseñas(fecha_resena);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reseña_votos_reseña_id') THEN
        CREATE INDEX idx_reseña_votos_reseña_id ON public.reseña_votos(reseña_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_reseña_respuestas_reseña_id') THEN
        CREATE INDEX idx_reseña_respuestas_reseña_id ON public.reseña_respuestas(reseña_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pedido_items_order_id') THEN
        CREATE INDEX idx_pedido_items_order_id ON public.pedido_items(order_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_pedido_items_product_id') THEN
        CREATE INDEX idx_pedido_items_product_id ON public.pedido_items(product_id);
    END IF;
END $$;

-- 9. Función para actualizar rating
CREATE OR REPLACE FUNCTION update_tienda_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.tiendas 
    SET 
        rating = (
            SELECT COALESCE(AVG(rating), 0) 
            FROM public.reseñas 
            WHERE tienda_id = COALESCE(NEW.tienda_id, OLD.tienda_id)
        ),
        num_resenas = (
            SELECT COUNT(*) 
            FROM public.reseñas 
            WHERE tienda_id = COALESCE(NEW.tienda_id, OLD.tienda_id)
        ),
        updated_at = now()
    WHERE id = COALESCE(NEW.tienda_id, OLD.tienda_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- 10. Crear triggers
DROP TRIGGER IF EXISTS trigger_update_tienda_rating_on_insert ON public.reseñas;
CREATE TRIGGER trigger_update_tienda_rating_on_insert
    AFTER INSERT ON public.reseñas
    FOR EACH ROW
    EXECUTE FUNCTION update_tienda_rating();

DROP TRIGGER IF EXISTS trigger_update_tienda_rating_on_update ON public.reseñas;
CREATE TRIGGER trigger_update_tienda_rating_on_update
    AFTER UPDATE ON public.reseñas
    FOR EACH ROW
    EXECUTE FUNCTION update_tienda_rating();

DROP TRIGGER IF EXISTS trigger_update_tienda_rating_on_delete ON public.reseñas;
CREATE TRIGGER trigger_update_tienda_rating_on_delete
    AFTER DELETE ON public.reseñas
    FOR EACH ROW
    EXECUTE FUNCTION update_tienda_rating();

-- ¡Listo! El sistema de reseñas está configurado correctamente
