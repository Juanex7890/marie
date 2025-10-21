import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { BestSellersMarquee } from '@/components/home/BestSellersMarquee'
import Link from 'next/link'
import { ArrowRight, Instagram } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'
import { getImageUrl } from '@/lib/utils'

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: categoryList }, { data: bestSellerProducts }] = await Promise.all([
    supabase
      .from('categories')
      .select('*')
      .eq('active', true)
      .order('position', { ascending: true })
      .limit(8),
    supabase
      .from('products')
      .select(`
        *,
        images:product_images(*)
      `)
      .eq('active', true)
      .eq('best_seller', true)
      .order('created_at', { ascending: false })
      .limit(12),
  ])

  const homeCategories = categoryList ?? []
  const bestSellers = bestSellerProducts ?? []

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
            </div>
            <div className="flex items-center justify-center gap-6 mt-6">
            <a
              href="https://wa.me/3166388242"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-green hover:text-gold transition-colors font-medium"
              aria-label="Contactar por WhatsApp"
            >
              <WhatsAppIcon className="h-6 w-6" />
              WhatsApp
            </a>
              <a
                href="https://instagram.com/cojinesdecorativos_marie"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-green hover:text-gold transition-colors font-medium"
                aria-label="Visitar Instagram"
              >
                <Instagram className="h-5 w-5" />
                Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold text-green mb-4">
              Decoración para el Hogar
            </h2>
            <p className="text-lg text-green-light max-w-2xl mx-auto">
              Explora nuestras categorías y encuentra el estilo perfecto para tu espacio
            </p>
          </div>

          {homeCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {homeCategories.map((category) => (
                <Link
                  key={category.id}
                  href={`/categoria/${category.slug}`}
                  className="group"
                >
                  <article className="overflow-hidden rounded-3xl bg-white shadow-soft transition-shadow duration-300 hover:shadow-soft-lg">
                    <div className="relative aspect-[4/3]">
                      {category.hero_image ? (
                        <Image
                          src={getImageUrl(category.hero_image)}
                          alt={category.name}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-sand/40 text-green/50">
                          <span className="text-sm">Sin imagen</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    </div>
                    <div className="px-4 py-4 text-center">
                      <h3 className="text-sm font-semibold uppercase tracking-wide text-green">
                        {category.name}
                      </h3>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-green-light">
              No hay categorías disponibles por ahora.
            </p>
          )}
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

          {bestSellers.length > 0 ? (
            <BestSellersMarquee products={bestSellers} />
          ) : (
            <p className="text-center text-green-light">
              No hay productos disponibles por ahora.
            </p>
          )}
        </div>
      </section>
    </div>
  )
}
