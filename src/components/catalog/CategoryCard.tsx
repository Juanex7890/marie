import Image from 'next/image'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { getImageUrl } from '@/lib/utils'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  hero_image?: string
  position: number
}

interface CategoryCardProps {
  category: Category
}

export function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/categoria/${category.slug}`}>
      <div className="group card hover:scale-105 transition-all duration-300 cursor-pointer">
        <div className="aspect-square relative overflow-hidden rounded-xl mb-4">
          {category.hero_image ? (
            <Image
              src={getImageUrl(category.hero_image)}
              alt={category.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-sand flex items-center justify-center">
              <span className="text-green/50 text-4xl">📦</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-green group-hover:text-gold transition-colors">
            {category.name}
          </h3>
          {category.description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {category.description}
            </p>
          )}
          <Badge variant="category">
            Ver productos
          </Badge>
        </div>
      </div>
    </Link>
  )
}
