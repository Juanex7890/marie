'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { X, Filter } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
}

interface FiltersProps {
  categories: Category[]
  selectedCategory?: string
  sortBy?: string
}

function FiltersContent({ categories, selectedCategory, sortBy }: FiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [showMobileFilters, setShowMobileFilters] = useState(false)

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams)
    if (categorySlug === selectedCategory) {
      params.delete('category')
    } else {
      params.set('category', categorySlug)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const handleSortChange = (sort: string) => {
    const params = new URLSearchParams(searchParams)
    if (sort === 'latest') {
      params.delete('sort')
    } else {
      params.set('sort', sort)
    }
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams)
    params.delete('category')
    params.delete('sort')
    params.delete('page')
    router.push(`?${params.toString()}`)
  }

  const hasActiveFilters = selectedCategory || (sortBy && sortBy !== 'latest')

  return (
    <div className="space-y-4">
      {/* Mobile filter toggle */}
      <div className="lg:hidden">
        <Button
          variant="outline"
          onClick={() => setShowMobileFilters(!showMobileFilters)}
          className="w-full"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="default" className="ml-2">
              {[selectedCategory, sortBy !== 'latest' ? sortBy : null].filter(Boolean).length}
            </Badge>
          )}
        </Button>
      </div>

      {/* Filters */}
      <div className={`space-y-4 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>
        {/* Categories */}
        <div>
          <h3 className="text-sm font-medium text-green mb-3">Categorías</h3>
          <div className="space-y-2">
            <Button
              variant={!selectedCategory ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleCategoryChange('')}
              className="w-full justify-start"
            >
              Todas las categorías
            </Button>
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.slug ? 'primary' : 'ghost'}
                size="sm"
                onClick={() => handleCategoryChange(category.slug)}
                className="w-full justify-start"
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div>
          <h3 className="text-sm font-medium text-green mb-3">Ordenar por</h3>
          <div className="space-y-2">
            <Button
              variant={sortBy === 'latest' || !sortBy ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSortChange('latest')}
              className="w-full justify-start"
            >
              Más recientes
            </Button>
            <Button
              variant={sortBy === 'price_asc' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSortChange('price_asc')}
              className="w-full justify-start"
            >
              Precio: menor a mayor
            </Button>
            <Button
              variant={sortBy === 'price_desc' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => handleSortChange('price_desc')}
              className="w-full justify-start"
            >
              Precio: mayor a menor
            </Button>
          </div>
        </div>

        {/* Clear filters */}
        {hasActiveFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="w-full"
          >
            <X className="h-4 w-4 mr-2" />
            Limpiar filtros
          </Button>
        )}
      </div>
    </div>
  )
}

export function Filters({ categories, selectedCategory, sortBy }: FiltersProps) {
  return (
    <Suspense fallback={<div>Loading filters...</div>}>
      <FiltersContent categories={categories} selectedCategory={selectedCategory} sortBy={sortBy} />
    </Suspense>
  )
}
