import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { Package, Tag, Eye, TrendingUp } from 'lucide-react'

export default async function AdminDashboard() {
  await requireAdmin()
  const supabase = await createClient()

  // Get stats
  const [
    { count: totalProducts },
    { count: activeProducts },
    { count: totalCategories },
    { count: activeCategories },
  ] = await Promise.all([
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('categories').select('*', { count: 'exact', head: true }).eq('active', true),
  ])

  // Get recent products
  const { data: recentProducts } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      categories(*)
    `)
    .order('created_at', { ascending: false })
    .limit(5)

  const stats = [
    {
      name: 'Total Productos',
      value: totalProducts || 0,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      name: 'Productos Activos',
      value: activeProducts || 0,
      icon: Eye,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      name: 'Total Categorías',
      value: totalCategories || 0,
      icon: Tag,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      name: 'Categorías Activas',
      value: activeCategories || 0,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-serif font-bold text-green mb-2">
          Panel de Administración
        </h1>
        <p className="text-green-light">
          Gestiona tu tienda de cojines decorativos
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.name} className="p-6">
            <div className="flex items-center">
              <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-green-light">{stat.name}</p>
                <p className="text-2xl font-bold text-green">{stat.value}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-green mb-4">Gestión de Productos</h3>
          <p className="text-green-light mb-4">
            Añade, edita y gestiona tu catálogo de productos
          </p>
          <div className="flex space-x-3">
            <Link href="/admin/productos">
              <Button>Gestionar Productos</Button>
            </Link>
            <Link href="/admin/productos/nuevo">
              <Button variant="outline">Nuevo Producto</Button>
            </Link>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-green mb-4">Gestión de Categorías</h3>
          <p className="text-green-light mb-4">
            Organiza tus productos en categorías
          </p>
          <div className="flex space-x-3">
            <Link href="/admin/categorias">
              <Button>Gestionar Categorías</Button>
            </Link>
            <Link href="/admin/categorias/nueva">
              <Button variant="outline">Nueva Categoría</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Recent Products */}
      {recentProducts && recentProducts.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-green mb-4">Productos Recientes</h3>
          <div className="space-y-3">
            {recentProducts.map((product) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-linen rounded-xl">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-sand rounded-lg flex items-center justify-center">
                    <span className="text-green/50 text-lg">🛍️</span>
                  </div>
                  <div>
                    <p className="font-medium text-green">{product.name}</p>
                    <p className="text-sm text-green-light">
                      {product.categories?.name} • {product.active ? 'Activo' : 'Inactivo'}
                    </p>
                  </div>
                </div>
                <Link href={`/admin/productos/${product.id}`}>
                  <Button variant="ghost" size="sm">
                    Editar
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
