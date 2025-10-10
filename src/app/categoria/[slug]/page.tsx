import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Filters } from '@/components/catalog/Filters'
import { SearchBar } from '@/components/catalog/SearchBar'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getImageUrl } from '@/lib/utils'

interface PageProps {
  params: Promise<{
    slug: string
  }>
  searchParams: Promise<{
    q?: string
    category?: string
    sort?: string
    page?: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!category) {
    return {
      title: 'Categoría no encontrada',
    }
  }

  return {
    title: category.name,
    description: category.description || `Descubre nuestra colección de ${category.name.toLowerCase()}`,
    openGraph: {
      title: category.name,
      description: category.description || `Descubre nuestra colección de ${category.name.toLowerCase()}`,
      images: category.hero_image ? [getImageUrl(category.hero_image)] : [],
    },
  }
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const supabase = await createClient()
  const { slug } = await params
  const searchParamsResolved = await searchParams
  const page = parseInt(searchParamsResolved.page || '1')
  const limit = 12
  const offset = (page - 1) * limit

  // Get category
  const { data: category } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!category) {
    notFound()
  }

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
      images:product_images(*)
    `)
    .eq('active', true)
    .eq('category_id', category.id)

  // Apply search
  if (searchParamsResolved.q) {
    query = query.or(`name.ilike.%${searchParamsResolved.q}%,description.ilike.%${searchParamsResolved.q}%`)
  }

  // Apply sorting
  switch (searchParamsResolved.sort) {
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
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-green-light mb-6">
          <Link href="/" className="hover:text-gold transition-colors">
            Inicio
          </Link>
          <span>/</span>
          <Link href="/categorias" className="hover:text-gold transition-colors">
            Categorías
          </Link>
          <span>/</span>
          <span className="text-green">{category.name}</span>
        </nav>

        {/* Category Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/categorias">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <Badge variant="category">{category.name}</Badge>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-3xl font-serif font-bold text-green mb-4">
                {category.name}
              </h1>
              {category.description && (
                <p className="text-lg text-green-light mb-6">
                  {category.description}
                </p>
              )}
              <div className="flex items-center space-x-4">
                <span className="text-sm text-green-light">
                  {count || 0} productos
                </span>
              </div>
            </div>
            
            {category.hero_image && (
              <div className="aspect-video relative overflow-hidden rounded-2xl">
                <Image
                  src={getImageUrl(category.hero_image)}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
              </div>
            )}
          </div>
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
                    <SearchBar placeholder="Buscar en esta categoría..." />
                  </div>
                  <Filters
                    categories={categories || []}
                    selectedCategory={searchParamsResolved.category}
                    sortBy={searchParamsResolved.sort}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Products Grid */}
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
                          href={`/categoria/${slug}?${new URLSearchParams({
                            ...searchParamsResolved,
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
                          href={`/categoria/${slug}?${new URLSearchParams({
                            ...searchParamsResolved,
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
                  {searchParamsResolved.q 
                    ? `No hay productos que coincidan con "${searchParamsResolved.q}"`
                    : 'No hay productos disponibles en esta categoría'
                  }
                </p>
                <Link href="/categorias">
                  <Button variant="outline">
                    Ver todas las categorías
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
