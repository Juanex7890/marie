import { createClient } from '@/lib/supabase/server'
import { ProductCard } from '@/components/catalog/ProductCard'
import { Button } from '@/components/ui/Button'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products (newest)
  const { data: featuredProducts } = await supabase
    .from('products')
    .select(`
      *,
      images:product_images(*)
    `)
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(8)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-linen to-beige py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-serif font-bold text-green">
              Almohadas Decorativas
              <span className="block text-gold">Artesanales</span>
            </h1>
            <p className="text-xl text-green-light max-w-2xl mx-auto">
              Descubre nuestra colección única de cojines decorativos, servilletas de lino 
              y accesorios para el hogar. Cada pieza está hecha con amor y atención al detalle.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/categorias">
                <Button size="lg" className="w-full sm:w-auto">
                  Ver Colección
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/busqueda">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Buscar Productos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Featured Products */}
      <section className="py-16 bg-linen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-green mb-4">
              Más Vendidos
            </h2>
            <p className="text-lg text-green-light max-w-2xl mx-auto">
              Los productos favoritos de nuestros clientes
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {featuredProducts?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Link href="/busqueda">
              <Button variant="outline" size="lg">
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

    </div>
  )
}