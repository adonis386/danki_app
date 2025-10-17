# 🛒 QuickBite - Aplicación de Delivery Express

Aplicación de delivery tipo UberEats construida con Next.js 15, TypeScript, Tailwind CSS y Supabase.

**QuickBite** - Tu delivery express de confianza. Rápido, fresco y seguro.

## 🚀 Características

- ✅ Autenticación de usuarios (Registro/Login)
- ✅ Catálogo de tiendas con filtros
- ✅ Productos por tienda
- ✅ Carrito de compras
- ✅ Sistema de pedidos
- ✅ Panel de administración
- ✅ Reseñas y ratings
- ✅ Sistema de repartidores

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript
- **Estilos**: Tailwind CSS 4
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Estado**: Zustand
- **Formularios**: React Hook Form + Zod

## 📋 Prerequisitos

- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase

## 🔧 Instalación

1. **Clonar el repositorio**
```bash
git clone <tu-repo>
cd my-app
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_project_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

Para obtener estas credenciales:
- Ve a tu proyecto en Supabase
- Settings → API
- Copia el "Project URL" y el "anon public" key

4. **Ejecutar en desarrollo**
```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📁 Estructura del Proyecto

```
my-app/
├── src/
│   ├── app/                    # Páginas y rutas
│   │   ├── login/             # Página de login
│   │   ├── register/          # Página de registro
│   │   └── page.tsx           # Página principal
│   ├── components/            # Componentes reutilizables
│   │   ├── Header.tsx
│   │   └── StoreCard.tsx
│   ├── lib/                   # Utilidades y configuraciones
│   │   ├── supabase/         # Cliente de Supabase
│   │   └── utils.ts
│   ├── types/                 # TypeScript types
│   └── middleware.ts          # Middleware de autenticación
├── public/                    # Archivos estáticos
├── .env.local                 # Variables de entorno (no subir a git)
└── package.json
```

## 🗄️ Base de Datos

El proyecto usa Supabase (PostgreSQL) con las siguientes tablas principales:

- `tiendas` - Información de las tiendas
- `productos` - Catálogo de productos
- `categorias` - Categorías de productos
- `usuarios` - Usuarios (manejado por Supabase Auth)
- `carrito` - Carrito de compras
- `pedidos` - Pedidos realizados
- `items_pedido` - Items de cada pedido
- `direcciones` - Direcciones de entrega
- `repartidores` - Información de repartidores
- `reseñas` - Reseñas de tiendas

## 🚀 Despliegue

### Vercel (Recomendado)

1. Sube tu código a GitHub
2. Ve a [vercel.com](https://vercel.com)
3. Importa tu repositorio
4. Agrega las variables de entorno
5. Deploy automático

### Variables de entorno en producción:
```
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
```

## 📝 Próximas Funcionalidades

- [ ] Sistema de pagos (Stripe/PayPal)
- [ ] Tracking de pedidos en tiempo real
- [ ] Notificaciones push
- [ ] Sistema de cupones y descuentos
- [ ] Chat con repartidores
- [ ] App móvil (React Native)

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👨‍💻 Autor

Tu nombre aquí

---

⭐ Si te gustó este proyecto, dale una estrella en GitHub!
