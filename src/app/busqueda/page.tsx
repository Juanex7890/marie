import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Filters } from '@/components/catalog/Filters'
import { SearchBar } from '@/components/catalog/SearchBar'
import { Button } from '@/components/ui/Button'
import { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'

interface PageProps {
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    page?: string
  }>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const query = params.q || ''
  
  return {
    title: query ? `Búsqueda: ${query}` : 'Buscar productos',
    description: query 
      ? `Resultados de búsqueda para "${query}" en nuestra tienda de cojines decorativos`
      : 'Busca entre nuestra amplia colección de cojines decorativos y accesorios para el hogar',
  }
}

export default async function SearchPage({ searchParams }: PageProps) {
  const supabase = await createClient()
  const params = await searchParams
  const page = parseInt(params.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  // Get all categories for filters
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('active', true)
    .order('position', { ascending: true })

  // Build query
  let query = supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      categories(*)
    `)
    .eq('active', true)

  // Apply search
  if (params.q) {
    query = query.or(`name.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  // Apply category filter
  if (params.category) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', params.category)
      .single()
    
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  // Apply sorting
  switch (params.sort) {
    case 'price_asc':
      query = query.order('price', { ascending: true })
      break
    case 'price_desc':
      query = query.order('price', { ascending: false })
      break
    default:
      query = query.order('created_at', { ascending: false })
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1)

  const { data: products, count } = await query

  const totalPages = Math.ceil((count || 0) / limit)

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-bold text-green mb-4">
            {params.q ? `Resultados para "${params.q}"` : 'Buscar productos'}
          </h1>
          <p className="text-lg text-green-light max-w-2xl mx-auto">
            {params.q 
              ? `Encontramos ${count || 0} productos que coinciden con tu búsqueda`
              : 'Explora nuestra amplia colección de cojines decorativos'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-2xl shadow-soft p-6">
                <h3 className="text-lg font-semibold text-green mb-4">
                  Filtros
                </h3>
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-green mb-3">Buscar</h4>
                    <SearchBar placeholder="Buscar productos..." />
                  </div>
                  <Filters
                    categories={categories || []}
                    selectedCategory={params.category}
                    sortBy={params.sort}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            {products && products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center mt-12">
                    <div className="flex items-center space-x-2">
                      {page > 1 && (
                        <Link
                          href={`/busqueda?${new URLSearchParams({
                            ...params,
                            page: (page - 1).toString(),
                          }).toString()}`}
                        >
                          <Button variant="outline" size="sm">
                            Anterior
                          </Button>
                        </Link>
                      )}
                      
                      <span className="px-4 py-2 text-sm text-green-light">
                        Página {page} de {totalPages}
                      </span>
                      
                      {page < totalPages && (
                        <Link
                          href={`/busqueda?${new URLSearchParams({
                            ...params,
                            page: (page + 1).toString(),
                          }).toString()}`}
                        >
                          <Button variant="outline" size="sm">
                            Siguiente
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-green mb-2">
                  No se encontraron productos
                </h3>
                <p className="text-green-light mb-6">
                  {params.q 
                    ? `No hay productos que coincidan con "${params.q}"`
                    : 'Intenta ajustar los filtros o buscar algo diferente'
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link href="/categorias">
                    <Button variant="outline">
                      Ver todas las categorías
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button>
                      Volver al inicio
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
