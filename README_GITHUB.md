# 🚀 Danki - Plataforma de Delivery

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38bdf8)](https://tailwindcss.com/)

Una plataforma moderna de delivery similar a UberEats, construida con Next.js 15, TypeScript y Supabase. Permite a usuarios pedir comida de diferentes tiendas, a los propietarios gestionar sus negocios, y cuenta con un sistema completo de reseñas y ratings.

---

## ✨ Características Principales

### 👤 Para Usuarios
- ✅ **Autenticación completa** (registro, login, logout)
- ✅ **Explorar tiendas** por categorías
- ✅ **Carrito de compras** persistente por usuario
- ✅ **Gestión de pedidos** (crear, ver historial)
- ✅ **Sistema de reseñas** (calificar tiendas, votar reseñas útiles)
- ✅ **Perfil de usuario** personalizable
- ✅ **Notificaciones** de éxito/error en tiempo real

### 🏪 Para Propietarios de Tiendas
- ✅ **Crear y gestionar tiendas**
- ✅ **CRUD completo de productos**
- ✅ **Responder a reseñas** de clientes
- ✅ **Ver estadísticas** de la tienda
- ✅ **Gestión de categorías** de productos

### 🔐 Para Administradores
- ✅ **Dashboard administrativo**
- ✅ **Gestión de usuarios y roles**
- ✅ **Moderación de reseñas**
- ✅ **Gestión de tiendas** (aprobar, suspender)

---

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15** - Framework de React con App Router
- **TypeScript** - Tipado estático para mayor seguridad
- **Tailwind CSS** - Estilos modernos y responsivos
- **Lucide React** - Iconos SVG optimizados
- **date-fns** - Manejo de fechas

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL (Base de datos)
  - Authentication (Gestión de usuarios)
  - Row Level Security (Seguridad a nivel de fila)
  - Storage (Almacenamiento de imágenes)

### Gestión de Estado
- **React Context API** - Estado global (Auth, Cart, Notifications)
- **Custom Hooks** - Lógica reutilizable

---

## 📦 Instalación

### Prerrequisitos
- Node.js 18.x o superior
- npm, yarn o pnpm
- Cuenta en [Supabase](https://supabase.com)

### 1. Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/danki.git
cd danki
```

### 2. Instalar Dependencias
```bash
npm install
# o
yarn install
# o
pnpm install
```

### 3. Configurar Variables de Entorno
```bash
# Copia el archivo de ejemplo
cp env.example .env.local

# Edita .env.local con tus credenciales de Supabase
# NEXT_PUBLIC_SUPABASE_URL=tu-url-de-supabase
# NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anonima
```

### 4. Configurar Base de Datos en Supabase

#### Opción A: Script Completo (Recomendado)
```sql
-- Ejecuta en Supabase SQL Editor en este orden:

-- 1. Tablas principales (tiendas, productos, pedidos)
-- Ver: /database/setup_main_tables.sql

-- 2. Sistema de reseñas
-- Ver: /database/fix_reviews_tables.sql

-- 3. Relaciones y foreign keys
-- Ver: /database/fix_relationships.sql
```

#### Opción B: Manual
Consulta el archivo `SOLUCION_COMPLETA_RESEÑAS.md` para instrucciones detalladas.

### 5. Ejecutar en Desarrollo
```bash
npm run dev
# o
yarn dev
# o
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 📂 Estructura del Proyecto

```
danki/
├── src/
│   ├── app/                    # App Router de Next.js
│   │   ├── (auth)/            # Rutas de autenticación
│   │   ├── @profile/          # Ruta paralela para perfil
│   │   ├── admin/             # Dashboard administrativo
│   │   ├── pedidos/           # Gestión de pedidos
│   │   ├── productos/         # CRUD de productos
│   │   ├── tiendas/           # Tiendas y reseñas
│   │   │   └── [id]/
│   │   │       ├── page.tsx   # Detalle de tienda
│   │   │       └── reviews/   # Sistema de reseñas
│   │   ├── layout.tsx         # Layout principal
│   │   └── page.tsx           # Página de inicio
│   ├── components/            # Componentes reutilizables
│   │   ├── AddToCartButton.tsx
│   │   ├── CartSidebar.tsx
│   │   ├── Header.tsx
│   │   ├── NotificationContainer.tsx
│   │   ├── ReviewCard.tsx
│   │   ├── ReviewForm.tsx
│   │   └── ...
│   ├── contexts/              # Contextos de React
│   │   ├── AuthContext.tsx
│   │   ├── CartContext.tsx
│   │   └── NotificationContext.tsx
│   ├── hooks/                 # Custom Hooks
│   │   ├── useAuth.ts
│   │   ├── useCart.ts
│   │   ├── useProducts.ts
│   │   ├── useReviews.ts
│   │   └── ...
│   ├── lib/
│   │   ├── services/          # Servicios de negocio
│   │   │   ├── productService.ts
│   │   │   ├── reviewService.ts
│   │   │   ├── storeService.ts
│   │   │   └── orderService.ts
│   │   ├── supabase/          # Cliente de Supabase
│   │   │   ├── client.ts
│   │   │   └── server.ts
│   │   └── validations/       # Schemas de Zod
│   └── types/                 # Tipos TypeScript
│       ├── database.types.ts
│       ├── product.ts
│       ├── review.ts
│       └── store.ts
├── public/                     # Archivos estáticos
├── database/                   # Scripts SQL
│   ├── fix_reviews_tables.sql
│   ├── fix_relationships.sql
│   └── ...
├── .gitignore
├── env.example
├── next.config.ts
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ Esquema de Base de Datos

### Tablas Principales

#### `tiendas`
```sql
- id (uuid, PK)
- nombre (text)
- descripcion (text)
- direccion (text)
- telefono (text)
- logo_url (text)
- imagen_portada (text)
- rating (numeric)
- num_resenas (integer)
- tiempo_entrega (integer)
- costo_envio (numeric)
- propietario_id (uuid, FK -> auth.users)
- activa (boolean)
- created_at (timestamp)
```

#### `productos`
```sql
- id (uuid, PK)
- tienda_id (uuid, FK -> tiendas)
- categoria_id (uuid, FK -> categorias)
- nombre (text)
- descripcion (text)
- precio (numeric)
- imagen_url (text)
- stock (integer)
- destacado (boolean)
- activo (boolean)
- created_at (timestamp)
```

#### `reseñas`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- tienda_id (uuid, FK -> tiendas)
- pedido_id (uuid, FK -> pedidos)
- rating (integer, 1-5)
- titulo (text)
- comentario (text)
- fecha_resena (timestamp)
- created_at (timestamp)
- updated_at (timestamp)
```

#### `pedidos`
```sql
- id (uuid, PK)
- user_id (uuid, FK -> auth.users)
- direccion_id (uuid, FK -> direcciones)
- total (numeric)
- status (text)
- created_at (timestamp)
```

Ver más detalles en los scripts SQL en `/database/`

---

## 🔐 Sistema de Autenticación

### Roles Disponibles
- **customer** (cliente) - Puede comprar y reseñar
- **store_owner** (propietario) - Puede gestionar tiendas y productos
- **admin** (administrador) - Acceso completo

### Protección de Rutas
```typescript
// Usando el componente ProtectedRoute
<ProtectedRoute>
  <TuComponente />
</ProtectedRoute>

// Usando el hook useAuth
const { user, isLoading } = useAuth()
```

### Row Level Security (RLS)
Todas las tablas tienen políticas RLS configuradas en Supabase para garantizar que los usuarios solo accedan a sus propios datos.

---

## 🎨 Características de UI/UX

- ✅ **Diseño responsive** - Funciona en móviles, tablets y desktop
- ✅ **Gradientes modernos** - Paleta de colores indigo/purple
- ✅ **Animaciones suaves** - Transiciones y hover effects
- ✅ **Loading states** - Spinners y skeletons
- ✅ **Notificaciones toast** - Feedback visual inmediato
- ✅ **Validación de formularios** - Mensajes de error claros
- ✅ **Dark mode ready** - Preparado para modo oscuro

---

## 📱 Sistema de Reseñas

### Funcionalidades
- ✅ **Crear reseñas** (solo si has comprado de la tienda)
- ✅ **Editar/eliminar** reseñas propias (24h)
- ✅ **Sistema de votos** (útil/no útil)
- ✅ **Respuestas de tienda** (propietarios y admins)
- ✅ **Filtros** por rating y búsqueda
- ✅ **Estadísticas** con gráfico de distribución

### Permisos
```typescript
// Solo puede reseñar si:
1. Ha realizado un pedido de la tienda
2. No tiene ya una reseña para esa tienda
3. Está autenticado
```

---

## 🚀 Deployment

### Vercel (Recomendado)
```bash
# 1. Instala Vercel CLI
npm i -g vercel

# 2. Deploy
vercel

# 3. Configura variables de entorno en Vercel Dashboard
# Settings > Environment Variables
```

### Variables de Entorno en Producción
```env
NEXT_PUBLIC_SUPABASE_URL=tu-url-de-produccion
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-de-produccion
NEXT_PUBLIC_APP_URL=https://tu-dominio.com
```

---

## 🧪 Testing (Próximamente)

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e
```

---

## 📈 Roadmap

### ✅ Fase 1 - Completada
- [x] Autenticación de usuarios
- [x] CRUD de tiendas
- [x] CRUD de productos
- [x] Carrito de compras
- [x] Sistema de pedidos
- [x] Sistema de reseñas y ratings

### 🔄 Fase 2 - En Progreso
- [ ] Tracking de pedidos en tiempo real
- [ ] Sistema de repartidores
- [ ] Notificaciones push
- [ ] Integración de pagos (Stripe)
- [ ] Sistema de cupones
- [ ] Chat con repartidores
- [ ] Dashboard administrativo completo
- [ ] Optimización móvil

### 📋 Fase 3 - Planificado
- [ ] App móvil (React Native)
- [ ] Geolocalización y mapas
- [ ] Sistema de promociones
- [ ] Programa de fidelidad
- [ ] Análisis y reportes avanzados

---

## 🤝 Contribuir

Las contribuciones son bienvenidas! Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [tu-github](https://github.com/tu-usuario)

---

## 📞 Soporte

¿Tienes preguntas o problemas?

- 📧 Email: tu-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/tu-usuario/danki/issues)
- 📖 Documentación: Ver `/docs` en el repositorio

---

## 🙏 Agradecimientos

- [Next.js](https://nextjs.org/) - Framework increíble
- [Supabase](https://supabase.com/) - Backend simplificado
- [Tailwind CSS](https://tailwindcss.com/) - Estilos sin esfuerzo
- [Lucide](https://lucide.dev/) - Iconos hermosos

---

<div align="center">

**⭐ Si te gusta este proyecto, dale una estrella en GitHub ⭐**

Hecho con ❤️ y ☕

</div>

