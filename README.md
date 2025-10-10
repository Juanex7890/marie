# Cojines Marie - E-commerce de Cojines Decorativos

Una tienda online moderna y elegante para cojines decorativos artesanales, construida con Next.js 14, TypeScript, y Supabase.

## 🎨 Características

- **Diseño elegante** inspirado en la estética de Instagram de cojines decorativos
- **Paleta de colores** cálida: beige, lino, oro y verde oscuro
- **Responsive design** optimizado para todos los dispositivos
- **SEO optimizado** con metadatos dinámicos y sitemap
- **Carrito persistente** usando localStorage
- **Panel de administración** completo con autenticación
- **Búsqueda avanzada** con filtros y ordenación
- **Optimización de imágenes** con Next.js Image

## 🛠️ Tecnologías

- **Frontend**: Next.js 14 (App Router), TypeScript, TailwindCSS
- **Backend**: Supabase (Base de datos + Storage)
- **Autenticación**: JWT personalizado para admin
- **Formularios**: React Hook Form + Zod
- **Animaciones**: Framer Motion
- **Iconos**: Lucide React

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (catalog)/         # Páginas públicas del catálogo
│   ├── admin/             # Panel de administración
│   ├── api/               # API routes
│   ├── cart/              # Página del carrito
│   └── globals.css        # Estilos globales
├── components/            # Componentes reutilizables
│   ├── ui/               # Componentes base (Button, Input, etc.)
│   ├── catalog/          # Componentes del catálogo
│   ├── cart/             # Componentes del carrito
│   ├── admin/            # Componentes del admin
│   └── layout/           # Header, Footer, etc.
├── lib/                  # Utilidades y configuración
│   ├── supabase/         # Cliente de Supabase
│   ├── actions/          # Server Actions
│   └── validators.ts     # Esquemas de validación Zod
└── middleware.ts         # Middleware de autenticación
```

## 🚀 Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd cojines-marie
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar Supabase

1. Crea un nuevo proyecto en [Supabase](https://supabase.com)
2. Ejecuta el SQL del archivo `supabase-schema.sql` en el SQL Editor
3. Ejecuta el SQL del archivo `supabase-seed.sql` para datos de ejemplo
4. Ve a Storage y crea un bucket llamado `product-images` (público)

### 4. Configurar variables de entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
cp env.example .env.local
```

Llena las variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_de_supabase

# Admin Authentication
ADMIN_EMAIL=admin@cojinesmarie.com
ADMIN_PASSWORD=tu_contraseña_segura

# JWT Secret para sesiones de admin
JWT_SECRET=tu_jwt_secret_de_al_menos_32_caracteres

# Token para revalidación ISR
REVALIDATE_TOKEN=tu_token_para_revalidacion
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

Visita [http://localhost:3000](http://localhost:3000) para ver la aplicación.

### 6. Construir para producción

```bash
npm run build
npm start
```

## 📊 Base de Datos

### Esquema Principal

- **categories**: Categorías de productos
- **products**: Productos del catálogo
- **product_images**: Imágenes de productos

### Políticas RLS

- **Público**: Solo puede ver categorías y productos activos
- **Admin**: Acceso completo a todas las operaciones CRUD

## 🔐 Autenticación

El panel de administración usa autenticación simple con email/contraseña almacenados en variables de entorno. Las sesiones se manejan con JWT firmados.

## 🛒 Funcionalidades del Carrito

- Añadir/eliminar productos
- Actualizar cantidades
- Persistencia en localStorage
- Cálculo automático de totales
- Envío gratis en pedidos +50€

## 🔍 Búsqueda y Filtros

- Búsqueda por texto en nombre y descripción
- Filtro por categoría
- Ordenación por precio y fecha
- Paginación automática

## 📱 Responsive Design

- Mobile-first approach
- Breakpoints optimizados
- Navegación adaptativa
- Imágenes responsivas

## 🚀 Despliegue en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Añade el dominio de Supabase a los dominios de imágenes en `next.config.js`
4. Despliega

### Variables de entorno en Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ADMIN_EMAIL
ADMIN_PASSWORD
JWT_SECRET
REVALIDATE_TOKEN
NEXT_PUBLIC_SITE_URL
```

## 📈 SEO y Performance

- Metadatos dinámicos para cada página
- Sitemap.xml automático
- Robots.txt configurado
- Optimización de imágenes con Next.js Image
- Server-side rendering por defecto
- ISR para contenido dinámico

## 🎨 Personalización

### Colores (TailwindCSS)

```css
beige: #EDE4D6
linen: #FAF6EF
sand: #DCCBB3
gold: #C6A65B
green: #264733
```

### Fuentes

- **Títulos**: Playfair Display (serif)
- **Texto**: Inter (sans-serif)

## 📝 Scripts Disponibles

- `npm run dev` - Servidor de desarrollo
- `npm run build` - Construir para producción
- `npm run start` - Servidor de producción
- `npm run lint` - Linter de código
- `npm run postbuild` - Generar sitemap

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Para soporte, contacta con [hola@cojinesmarie.com](mailto:hola@cojinesmarie.com)"# marie" 
