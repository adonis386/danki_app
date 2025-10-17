-- =============================================
-- SCRIPT DE CORRECCIÓN PARA SISTEMA DE RESEÑAS
-- Elimina las tablas existentes y las recrea correctamente
-- =============================================

-- PASO 1: Eliminar triggers existentes
DROP TRIGGER IF EXISTS trigger_update_tienda_rating_on_insert ON public.reseñas;
DROP TRIGGER IF EXISTS trigger_update_tienda_rating_on_update ON public.reseñas;
DROP TRIGGER IF EXISTS trigger_update_tienda_rating_on_delete ON public.reseñas;

-- PASO 2: Eliminar función existente
DROP FUNCTION IF EXISTS update_tienda_rating();

-- PASO 3: Eliminar tablas en orden correcto (respetando foreign keys)
DROP TABLE IF EXISTS public.reseña_respuestas CASCADE;
DROP TABLE IF EXISTS public.reseña_votos CASCADE;
DROP TABLE IF EXISTS public.reseñas CASCADE;

-- =============================================
-- PASO 4: RECREAR TABLAS CORRECTAMENTE
-- =============================================

-- 1. Crear tabla de reseñas (CON NOMBRE CORRECTO)
CREATE TABLE public.reseñas (
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

-- 2. Crear tabla de votos
CREATE TABLE public.reseña_votos (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseña_id uuid NOT NULL REFERENCES public.reseñas(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  es_util boolean NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(reseña_id, user_id)
);

-- 3. Crear tabla de respuestas
CREATE TABLE public.reseña_respuestas (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  reseña_id uuid NOT NULL REFERENCES public.reseñas(id) ON DELETE CASCADE,
  tienda_id uuid NOT NULL REFERENCES public.tiendas(id) ON DELETE CASCADE,
  respuesta text NOT NULL CHECK (length(respuesta) >= 3 AND length(respuesta) <= 500),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE(reseña_id)
);

-- =============================================
-- PASO 5: HABILITAR RLS
-- =============================================

ALTER TABLE public.reseñas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseña_votos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reseña_respuestas ENABLE ROW LEVEL SECURITY;

-- =============================================
-- PASO 6: POLÍTICAS RLS PARA RESEÑAS
-- =============================================

CREATE POLICY "reseñas_select_all" ON public.reseñas
    FOR SELECT USING (true);

CREATE POLICY "reseñas_insert_authenticated" ON public.reseñas
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reseñas_update_own" ON public.reseñas
    FOR UPDATE USING (
        auth.uid() = user_id AND 
        created_at > now() - interval '24 hours'
    );

CREATE POLICY "reseñas_delete_own" ON public.reseñas
    FOR DELETE USING (
        auth.uid() = user_id AND 
        created_at > now() - interval '24 hours'
    );

-- =============================================
-- PASO 7: POLÍTICAS RLS PARA VOTOS
-- =============================================

CREATE POLICY "reseña_votos_select_all" ON public.reseña_votos
    FOR SELECT USING (true);

CREATE POLICY "reseña_votos_insert_authenticated" ON public.reseña_votos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "reseña_votos_update_own" ON public.reseña_votos
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "reseña_votos_delete_own" ON public.reseña_votos
    FOR DELETE USING (auth.uid() = user_id);

-- =============================================
-- PASO 8: POLÍTICAS RLS PARA RESPUESTAS
-- =============================================

CREATE POLICY "reseña_respuestas_select_all" ON public.reseña_respuestas
    FOR SELECT USING (true);

-- =============================================
-- PASO 9: CREAR ÍNDICES
-- =============================================

CREATE INDEX idx_reseñas_tienda_id ON public.reseñas(tienda_id);
CREATE INDEX idx_reseñas_user_id ON public.reseñas(user_id);
CREATE INDEX idx_reseñas_rating ON public.reseñas(rating);
CREATE INDEX idx_reseñas_fecha ON public.reseñas(fecha_resena);
CREATE INDEX idx_reseña_votos_reseña_id ON public.reseña_votos(reseña_id);
CREATE INDEX idx_reseña_respuestas_reseña_id ON public.reseña_respuestas(reseña_id);

-- =============================================
-- PASO 10: FUNCIÓN PARA ACTUALIZAR RATING
-- =============================================

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

-- =============================================
-- PASO 11: CREAR TRIGGERS
-- =============================================

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

-- =============================================
-- ¡LISTO! TABLAS RECREADAS CORRECTAMENTE
-- =============================================

-- Verificar que las tablas se crearon
SELECT 
    table_name, 
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as num_columnas
FROM information_schema.tables t
WHERE table_schema = 'public' 
AND table_name IN ('reseñas', 'reseña_votos', 'reseña_respuestas')
ORDER BY table_name;
