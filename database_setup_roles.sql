-- =============================================
-- SISTEMA DE ROLES Y PERMISOS PARA QUICKBITE
-- =============================================

-- 1. Crear tabla de roles
CREATE TABLE IF NOT EXISTS public.roles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    nivel INTEGER NOT NULL DEFAULT 1, -- 1=Usuario, 2=Admin, 3=SuperAdmin
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Crear tabla de permisos
CREATE TABLE IF NOT EXISTS public.permisos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    recurso VARCHAR(50) NOT NULL, -- 'tiendas', 'productos', 'usuarios', etc.
    accion VARCHAR(50) NOT NULL,  -- 'create', 'read', 'update', 'delete'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Crear tabla de relación roles-permisos
CREATE TABLE IF NOT EXISTS public.rol_permisos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rol_id UUID REFERENCES public.roles(id) ON DELETE CASCADE,
    permiso_id UUID REFERENCES public.permisos(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(rol_id, permiso_id)
);

-- 4. Crear tabla de usuarios extendida
CREATE TABLE IF NOT EXISTS public.usuarios (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(255),
    telefono VARCHAR(20),
    direccion TEXT,
    avatar_url TEXT,
    rol_id UUID REFERENCES public.roles(id) DEFAULT NULL,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Insertar roles básicos
INSERT INTO public.roles (nombre, descripcion, nivel) VALUES
('usuario', 'Usuario regular de la plataforma', 1),
('admin', 'Administrador de tiendas', 2),
('super_admin', 'Super administrador del sistema', 3)
ON CONFLICT (nombre) DO NOTHING;

-- 6. Insertar permisos básicos
INSERT INTO public.permisos (nombre, descripcion, recurso, accion) VALUES
-- Permisos de tiendas
('tiendas_ver', 'Ver tiendas', 'tiendas', 'read'),
('tiendas_crear', 'Crear tiendas', 'tiendas', 'create'),
('tiendas_editar', 'Editar tiendas', 'tiendas', 'update'),
('tiendas_eliminar', 'Eliminar tiendas', 'tiendas', 'delete'),
('tiendas_activar', 'Activar/desactivar tiendas', 'tiendas', 'update'),

-- Permisos de productos
('productos_ver', 'Ver productos', 'productos', 'read'),
('productos_crear', 'Crear productos', 'productos', 'create'),
('productos_editar', 'Editar productos', 'productos', 'update'),
('productos_eliminar', 'Eliminar productos', 'productos', 'delete'),

-- Permisos de usuarios
('usuarios_ver', 'Ver usuarios', 'usuarios', 'read'),
('usuarios_editar', 'Editar usuarios', 'usuarios', 'update'),
('usuarios_eliminar', 'Eliminar usuarios', 'usuarios', 'delete'),
('usuarios_roles', 'Gestionar roles de usuarios', 'usuarios', 'update'),

-- Permisos de pedidos
('pedidos_ver', 'Ver pedidos', 'pedidos', 'read'),
('pedidos_editar', 'Editar pedidos', 'pedidos', 'update'),
('pedidos_eliminar', 'Eliminar pedidos', 'pedidos', 'delete'),

-- Permisos de categorías
('categorias_ver', 'Ver categorías', 'categorias', 'read'),
('categorias_crear', 'Crear categorías', 'categorias', 'create'),
('categorias_editar', 'Editar categorías', 'categorias', 'update'),
('categorias_eliminar', 'Eliminar categorías', 'categorias', 'delete')
ON CONFLICT (nombre) DO NOTHING;

-- 7. Asignar permisos a roles
-- Usuario regular: solo ver tiendas y productos
INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r, public.permisos p
WHERE r.nombre = 'usuario' 
AND p.nombre IN ('tiendas_ver', 'productos_ver', 'pedidos_ver')
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Admin: gestionar tiendas y productos
INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r, public.permisos p
WHERE r.nombre = 'admin' 
AND p.nombre IN (
    'tiendas_ver', 'tiendas_crear', 'tiendas_editar', 'tiendas_eliminar', 'tiendas_activar',
    'productos_ver', 'productos_crear', 'productos_editar', 'productos_eliminar',
    'categorias_ver', 'categorias_crear', 'categorias_editar', 'categorias_eliminar',
    'pedidos_ver', 'pedidos_editar'
)
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- Super Admin: todos los permisos
INSERT INTO public.rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id
FROM public.roles r, public.permisos p
WHERE r.nombre = 'super_admin'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- 8. Habilitar RLS en todas las tablas
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rol_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;

-- 9. Crear políticas RLS

-- Políticas para roles (todos pueden leer, solo super_admin puede modificar)
CREATE POLICY "roles_read_all" ON public.roles FOR SELECT USING (true);
CREATE POLICY "roles_modify_super_admin" ON public.roles FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.roles r ON u.rol_id = r.id
        WHERE u.id = auth.uid() AND r.nombre = 'super_admin'
    )
);

-- Políticas para permisos (todos pueden leer, solo super_admin puede modificar)
CREATE POLICY "permisos_read_all" ON public.permisos FOR SELECT USING (true);
CREATE POLICY "permisos_modify_super_admin" ON public.permisos FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.roles r ON u.rol_id = r.id
        WHERE u.id = auth.uid() AND r.nombre = 'super_admin'
    )
);

-- Políticas para rol_permisos (todos pueden leer, solo super_admin puede modificar)
CREATE POLICY "rol_permisos_read_all" ON public.rol_permisos FOR SELECT USING (true);
CREATE POLICY "rol_permisos_modify_super_admin" ON public.rol_permisos FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.roles r ON u.rol_id = r.id
        WHERE u.id = auth.uid() AND r.nombre = 'super_admin'
    )
);

-- Políticas para usuarios
CREATE POLICY "usuarios_read_own" ON public.usuarios FOR SELECT USING (auth.uid() = id);
CREATE POLICY "usuarios_update_own" ON public.usuarios FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "usuarios_read_admin" ON public.usuarios FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.roles r ON u.rol_id = r.id
        WHERE u.id = auth.uid() AND r.nivel >= 2
    )
);
CREATE POLICY "usuarios_modify_admin" ON public.usuarios FOR ALL USING (
    EXISTS (
        SELECT 1 FROM public.usuarios u
        JOIN public.roles r ON u.rol_id = r.id
        WHERE u.id = auth.uid() AND r.nivel >= 2
    )
);

-- 10. Crear función para obtener permisos del usuario
CREATE OR REPLACE FUNCTION public.get_user_permissions(user_id UUID)
RETURNS TABLE(permiso_nombre TEXT, recurso TEXT, accion TEXT) AS $$
BEGIN
    RETURN QUERY
    SELECT p.nombre, p.recurso, p.accion
    FROM public.usuarios u
    JOIN public.roles r ON u.rol_id = r.id
    JOIN public.rol_permisos rp ON r.id = rp.rol_id
    JOIN public.permisos p ON rp.permiso_id = p.id
    WHERE u.id = user_id AND u.activo = true AND r.activo = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. Crear función para verificar si usuario tiene permiso
CREATE OR REPLACE FUNCTION public.has_permission(user_id UUID, permiso_nombre TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.get_user_permissions(user_id) 
        WHERE permiso_nombre = $2
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Crear trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON public.roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_usuarios_updated_at BEFORE UPDATE ON public.usuarios
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Crear función para crear usuario automáticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.usuarios (id, email, nombre_completo, rol_id)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        (SELECT id FROM public.roles WHERE nombre = 'usuario' LIMIT 1)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 14. Crear trigger para nuevos usuarios
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 15. Insertar usuario super admin (reemplaza con tu email)
-- IMPORTANTE: Cambia 'tu-email@ejemplo.com' por tu email real
INSERT INTO public.usuarios (id, email, nombre_completo, rol_id)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    r.id
FROM auth.users au
CROSS JOIN public.roles r
WHERE au.email = 'tu-email@ejemplo.com'  -- CAMBIA ESTE EMAIL
AND r.nombre = 'super_admin'
ON CONFLICT (id) DO UPDATE SET
    rol_id = EXCLUDED.rol_id,
    updated_at = NOW();

-- =============================================
-- FIN DEL SCRIPT DE ROLES
-- =============================================
