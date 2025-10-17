-- =============================================
-- CREATE REVIEWS TABLES
-- =============================================

-- 1. Crear tabla de reseñas
CREATE TABLE public.reseñas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tienda_id uuid NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  pedido_id uuid REFERENCES public.pedidos(id) ON DELETE SET NULL, -- Opcional, para vincular con pedido
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  titulo text NOT NULL CHECK (length(titulo) >= 3 AND length(titulo) <= 100),
  comentario text CHECK (length(comentario) <= 1000),
  fecha_reseña timestamp with time zone DEFAULT now() NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Un usuario solo puede hacer una reseña por tienda
  UNIQUE(user_id, tienda_id)
);

-- 2. Crear tabla de votos en reseñas (útil/no útil)
CREATE TABLE public.reseña_votos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseña_id uuid NOT NULL REFERENCES public.reseñas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  es_util boolean NOT NULL, -- true = útil, false = no útil
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Un usuario solo puede votar una vez por reseña
  UNIQUE(reseña_id, user_id)
);

-- 3. Crear tabla de respuestas de tiendas a reseñas
CREATE TABLE public.reseña_respuestas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseña_id uuid NOT NULL REFERENCES public.reseñas(id) ON DELETE CASCADE,
  tienda_id uuid NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  respuesta text NOT NULL CHECK (length(respuesta) >= 3 AND length(respuesta) <= 500),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  
  -- Una reseña solo puede tener una respuesta
  UNIQUE(reseña_id)
);

-- 4. Habilitar RLS
ALTER TABLE public.reseñas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseña_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseña_respuestas ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para reseñas
-- Los usuarios pueden ver todas las reseñas
CREATE POLICY "reseñas_select_all" ON public.reseñas
    FOR SELECT USING (true);

-- Los usuarios pueden crear reseñas (solo si están autenticados)
CREATE POLICY "reseñas_insert_authenticated" ON public.reseñas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propias reseñas (solo en las primeras 24 horas)
CREATE POLICY "reseñas_update_own" ON public.reseñas
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        created_at > now() - interval '24 hours'
    );

-- Los usuarios pueden eliminar sus propias reseñas (solo en las primeras 24 horas)
CREATE POLICY "reseñas_delete_own" ON public.reseñas
    FOR DELETE USING (
        auth.uid() = user_id AND 
        created_at > now() - interval '24 hours'
    );

-- 6. Políticas RLS para votos
-- Los usuarios pueden ver todos los votos
CREATE POLICY "reseña_votos_select_all" ON public.reseña_votos
    FOR SELECT USING (true);

-- Los usuarios pueden crear votos (solo si están autenticados)
CREATE POLICY "reseña_votos_insert_authenticated" ON public.reseña_votos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Los usuarios pueden actualizar sus propios votos
CREATE POLICY "reseña_votos_update_own" ON public.reseña_votos
    FOR UPDATE USING (auth.uid() = user_id);

-- Los usuarios pueden eliminar sus propios votos
CREATE POLICY "reseña_votos_delete_own" ON public.reseña_votos
    FOR DELETE USING (auth.uid() = user_id);

-- 7. Políticas RLS para respuestas
-- Los usuarios pueden ver todas las respuestas
CREATE POLICY "reseña_respuestas_select_all" ON public.reseña_respuestas
    FOR SELECT USING (true);

-- Solo los propietarios de tiendas pueden crear respuestas
CREATE POLICY "reseña_respuestas_insert_store_owners" ON public.reseña_respuestas
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'store_owner')
            AND EXISTS (
                SELECT 1 FROM public.tiendas t
                WHERE t.id = tienda_id 
                AND (
                    r.name = 'admin' OR 
                    (r.name = 'store_owner' AND t.propietario_id = auth.uid())
                )
            )
        )
    );

-- Solo los propietarios de tiendas pueden actualizar sus respuestas
CREATE POLICY "reseña_respuestas_update_store_owners" ON public.reseña_respuestas
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles ur
            JOIN public.roles r ON ur.role_id = r.id
            WHERE ur.user_id = auth.uid() 
            AND r.name IN ('admin', 'store_owner')
            AND EXISTS (
                SELECT 1 FROM public.tiendas t
                WHERE t.id = tienda_id 
                AND (
                    r.name = 'admin' OR 
                    (r.name = 'store_owner' AND t.propietario_id = auth.uid())
                )
            )
        )
    );

-- 8. Crear índices para mejor rendimiento
CREATE INDEX idx_reseñas_tienda_id ON public.reseñas(tienda_id);
CREATE INDEX idx_reseñas_user_id ON public.reseñas(user_id);
CREATE INDEX idx_reseñas_rating ON public.reseñas(rating);
CREATE INDEX idx_reseñas_fecha ON public.reseñas(fecha_reseña);
CREATE INDEX idx_reseña_votos_reseña_id ON public.reseña_votos(reseña_id);
CREATE INDEX idx_reseña_respuestas_reseña_id ON public.reseña_respuestas(reseña_id);

-- 9. Función para actualizar rating promedio de tiendas
CREATE OR REPLACE FUNCTION update_tienda_rating()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar rating promedio y número de reseñas en la tabla tiendas
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

-- 10. Crear triggers para actualizar rating automáticamente
CREATE TRIGGER trigger_update_tienda_rating_on_insert
    AFTER INSERT ON public.reseñas
    FOR EACH ROW
    EXECUTE FUNCTION update_tienda_rating();

CREATE TRIGGER trigger_update_tienda_rating_on_update
    AFTER UPDATE ON public.reseñas
    FOR EACH ROW
    EXECUTE FUNCTION update_tienda_rating();

CREATE TRIGGER trigger_update_tienda_rating_on_delete
    AFTER DELETE ON public.reseñas
    FOR EACH ROW
    EXECUTE FUNCTION update_tienda_rating();

-- 11. Insertar algunos datos de ejemplo (opcional)
-- Solo si quieres datos de prueba
/*
INSERT INTO public.reseñas (user_id, tienda_id, rating, titulo, comentario) VALUES
('user-uuid-1', 'tienda-uuid-1', 5, 'Excelente servicio', 'Muy buena comida y entrega rápida'),
('user-uuid-2', 'tienda-uuid-1', 4, 'Muy bueno', 'Buen sabor, solo tardó un poco en llegar'),
('user-uuid-3', 'tienda-uuid-1', 5, 'Recomendado', 'Perfecto, volveré a pedir');
*/
