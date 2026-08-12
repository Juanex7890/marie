import { getCategories } from '@/lib/firebase/db'
import { getImageUrl } from '@/lib/utils'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Explora todas las categorías de Cojines Marie: cojines decorativos, servilletas de lino, accesorios para el hogar y más.',
  alternates: {
    canonical: '/categorias',
  },
}

export default async function CategoriasPage() {
  const categories = await getCategories(true)

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-serif font-bold text-green mb-4">
            Categorías
          </h1>
          <p className="text-lg text-green-light max-w-2xl mx-auto">
            Explora nuestras categorías y encuentra el estilo perfecto para tu espacio
          </p>
        </div>

        {categories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category) => (
              <Link key={category.id} href={`/categoria/${category.slug}`} className="group">
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
    </div>
  )
}
