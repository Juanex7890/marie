import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

export default async function CategoriesPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('position', { ascending: true })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-green mb-2">
            Gestión de Categorías
          </h1>
          <p className="text-green-light">
            Administra las categorías de tu tienda
          </p>
        </div>
        <Link href="/admin/categorias/nueva">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Categoría
          </Button>
        </Link>
      </div>

      {categories && categories.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card key={category.id} className="p-6">
              <div className="space-y-4">
                {/* Category Image */}
                <div className="aspect-video relative overflow-hidden rounded-xl bg-sand">
                  {category.hero_image ? (
                    <img
                      src={getImageUrl(category.hero_image)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-green/50 text-4xl">📦</span>
                    </div>
                  )}
                </div>

                {/* Category Info */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-green">
                      {category.name}
                    </h3>
                    <Badge variant={category.active ? 'default' : 'sale'}>
                      {category.active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                  
                  {category.description && (
                    <p className="text-sm text-green-light line-clamp-2">
                      {category.description}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-green-light">
                    <span>Posición: {category.position}</span>
                    <span>Slug: {category.slug}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2">
                  <Link href={`/admin/categorias/${category.id}`}>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </Link>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    title={category.active ? 'Desactivar' : 'Activar'}
                  >
                    {category.active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <div className="flex flex-col space-y-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ArrowUp className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <ArrowDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📦</div>
          <h3 className="text-xl font-semibold text-green mb-2">
            No hay categorías
          </h3>
          <p className="text-green-light mb-6">
            Crea tu primera categoría para organizar tus productos
          </p>
          <Link href="/admin/categorias/nueva">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primera Categoría
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
