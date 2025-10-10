import { createClient } from '@/lib/supabase/server'
import { CategoryCard } from '@/components/catalog/CategoryCard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Categorías',
  description: 'Explora todas nuestras categorías de cojines decorativos, servilletas de lino y accesorios para el hogar.',
}

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .eq('active', true)
    .order('position', { ascending: true })

  return (
    <div className="min-h-screen bg-linen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold text-green mb-4">
            Nuestras Categorías
          </h1>
          <p className="text-lg text-green-light max-w-2xl mx-auto">
            Descubre nuestra amplia gama de productos organizados por categorías
          </p>
        </div>

        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-green mb-2">
              No hay categorías disponibles
            </h3>
            <p className="text-green-light">
              Estamos trabajando en nuevas categorías. ¡Vuelve pronto!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
