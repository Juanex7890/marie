import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ShoppingCart, Share2 } from 'lucide-react'
import { getImageUrl, formatPrice } from '@/lib/utils'
import { ProductGallery } from '@/components/product/ProductGallery'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { slug } = await params
  
  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      categories(*)
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) {
    return {
      title: 'Producto no encontrado',
    }
  }

  const mainImage = product.images?.find((img: any) => img.position === 0) || product.images?.[0]

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: mainImage ? [getImageUrl(mainImage.file_path)] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const supabase = await createClient()
  const { slug } = await params

  const { data: product } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*),
      categories(*)
    `)
    .eq('slug', slug)
    .eq('active', true)
    .single()

  if (!product) {
    notFound()
  }

  // Get related products
  const { data: relatedProducts } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('active', true)
    .eq('category_id', product.category_id)
    .neq('id', product.id)
    .limit(4)

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  const discountPercentage = isOnSale 
    ? Math.round(((product.compare_at_price! - product.price) / product.compare_at_price!) * 100)
    : 0

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
          <Link 
            href={`/categoria/${product.categories?.slug}`} 
            className="hover:text-gold transition-colors"
          >
            {product.categories?.name}
          </Link>
          <span>/</span>
          <span className="text-green">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <ProductGallery images={product.images ?? []} productName={product.name} />
          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Badge variant="category">{product.categories?.name}</Badge>
                {isOnSale && (
                  <Badge variant="sale">-{discountPercentage}%</Badge>
                )}
                {new Date(product.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) && (
                  <Badge variant="new">Nuevo</Badge>
                )}
              </div>
              
              <h1 className="text-3xl font-serif font-bold text-green mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-3xl font-bold text-green">
                    {formatPrice(product.price)}
                  </span>
                  {isOnSale && (
                    <span className="text-xl text-gray-500 line-through">
                      {formatPrice(product.compare_at_price!)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="prose prose-green max-w-none">
              <h3 className="text-lg font-semibold text-green mb-3">Descripción</h3>
              <p className="text-green-light leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" className="flex-1">
                <ShoppingCart className="h-5 w-5 mr-2" />
                Añadir al carrito
              </Button>
              <Button variant="ghost" size="lg">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            <div className="bg-white rounded-2xl shadow-soft p-6">
              <h3 className="text-lg font-semibold text-green mb-4">Información del producto</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-green-light">Categoría:</span>
                  <span className="text-green">{product.categories?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-light">Disponibilidad:</span>
                  <span className="text-green">En stock</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-light">Envío:</span>
                  <span className="text-green">Se acuerda al momento de la compra</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <div className="mt-16">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-serif font-bold text-green mb-4">
                Productos relacionados
              </h2>
              <p className="text-green-light">
                Otros productos que te pueden interesar
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

