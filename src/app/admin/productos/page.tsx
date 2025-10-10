import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import Link from 'next/link'
import { Plus, Edit, Eye, EyeOff, Search, Filter } from 'lucide-react'
import { getImageUrl, formatPrice } from '@/lib/utils'

export default async function ProductsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      categories(*)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-serif font-bold text-green mb-2">
            Gestión de Productos
          </h1>
          <p className="text-green-light">
            Administra el catálogo de productos
          </p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar productos..."
              className="w-full"
            />
          </div>
          <div className="flex space-x-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            <Button>
              <Search className="h-4 w-4 mr-2" />
              Buscar
            </Button>
          </div>
        </div>
      </Card>

      {products && products.length > 0 ? (
        <div className="space-y-4">
          {products.map((product) => {
            const mainImage = product.images?.find((img: any) => img.position === 0) || product.images?.[0]
            const isOnSale = product.compare_at_price && product.compare_at_price > product.price

            return (
              <Card key={product.id} className="p-6">
                <div className="flex items-center space-x-4">
                  {/* Product Image */}
                  <div className="w-20 h-20 relative overflow-hidden rounded-lg bg-sand flex-shrink-0">
                    {mainImage ? (
                      <img
                        src={getImageUrl(mainImage.file_path)}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-green/50 text-2xl">🛍️</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-green truncate">
                          {product.name}
                        </h3>
                        <p className="text-sm text-green-light truncate">
                          {product.categories?.name}
                        </p>
                        <p className="text-sm text-green-light line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                      
                      <div className="flex items-center space-x-2 ml-4">
                        <Badge variant={product.active ? 'default' : 'sale'}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        {isOnSale && (
                          <Badge variant="sale">Oferta</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-bold text-green">
                            {formatPrice(product.price)}
                          </span>
                          {isOnSale && (
                            <span className="text-sm text-gray-500 line-through">
                              {formatPrice(product.compare_at_price!)}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-green-light">
                          {product.images?.length || 0} imágenes
                        </span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Link href={`/producto/${product.slug}`} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        
                        <Link href={`/admin/productos/${product.id}`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </Button>
                        </Link>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          title={product.active ? 'Desactivar' : 'Activar'}
                        >
                          {product.active ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-semibold text-green mb-2">
            No hay productos
          </h3>
          <p className="text-green-light mb-6">
            Crea tu primer producto para comenzar a vender
          </p>
          <Link href="/admin/productos/nuevo">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Producto
            </Button>
          </Link>
        </Card>
      )}
    </div>
  )
}
