'use client'

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, X, Loader2 } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { formatPrice, getImageUrl } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  className?: string
  mode?: 'overlay' | 'filters'
  onNavigate?: () => void
}

interface SearchResultImage {
  id: string
  file_path: string
  position: number
}

interface SearchResult {
  id: string
  name: string
  slug: string
  price: number
  compare_at_price?: number | null
  images: SearchResultImage[] | null
}

function SearchBarContent({
  placeholder = 'Buscar productos...',
  className,
  mode = 'overlay',
  onNavigate,
}: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()

  const searchParamsString = searchParams.toString()

  const [query, setQuery] = useState(() => searchParams.get('q') || '')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isFocused, setIsFocused] = useState(false)

  const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const latestQueryRef = useRef('')
  const supabase = useMemo(() => {
    if (mode !== 'overlay') {
      return null
    }
    return createClient()
  }, [mode])

  useEffect(() => {
    if (mode !== 'filters') {
      return
    }

    const fromUrl = new URLSearchParams(searchParamsString).get('q') || ''
    setQuery(fromUrl)
  }, [mode, searchParamsString])

  const fetchResults = useCallback(
    async (searchQuery: string) => {
      if (!supabase) {
        return
      }

      try {
        const { data, error } = await supabase
          .from('products')
          .select(
            `
            id,
            name,
            slug,
            price,
            compare_at_price,
            images:product_images(
              id,
              file_path,
              position
            )
          `
          )
          .eq('active', true)
          .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
          .order('created_at', { ascending: false })
          .limit(6)

        if (latestQueryRef.current !== searchQuery) {
          return
        }

        if (error) {
          console.error('Error fetching search results', error)
          setResults([])
          return
        }

        setResults(data ?? [])
      } finally {
        if (latestQueryRef.current === searchQuery) {
          setIsLoading(false)
        }
      }
    },
    [supabase]
  )

  useEffect(() => {
    if (mode !== 'overlay') {
      return
    }

    const trimmedQuery = query.trim()
    latestQueryRef.current = trimmedQuery

    if (!trimmedQuery) {
      setResults([])
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    const timeout = setTimeout(() => {
      fetchResults(trimmedQuery)
    }, 300)

    return () => clearTimeout(timeout)
  }, [fetchResults, mode, query])

  useEffect(() => {
    if (mode !== 'filters') {
      return
    }

    const handler = setTimeout(() => {
      const trimmedQuery = query.trim()

      const currentParams = new URLSearchParams(searchParamsString)
      const nextParams = new URLSearchParams(searchParamsString)

      if (trimmedQuery) {
        nextParams.set('q', trimmedQuery)
      } else {
        nextParams.delete('q')
      }
      nextParams.delete('page')

      currentParams.delete('page')

      const currentString = currentParams.toString()
      const nextString = nextParams.toString()

      if (currentString === nextString) {
        return
      }

      router.push(nextString ? `${pathname}?${nextString}` : pathname)
    }, 300)

    return () => clearTimeout(handler)
  }, [mode, pathname, query, router, searchParamsString])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  const handleClear = () => {
    setQuery('')
    setResults([])
    setIsLoading(false)
  }

  const handleFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
      blurTimeoutRef.current = null
    }
    setIsFocused(true)
  }

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setIsFocused(false)
    }, 150)
  }

  const handleResultSelect = () => {
    setIsFocused(false)
    onNavigate?.()
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (mode === 'overlay' && results[0]) {
        event.preventDefault()
        handleResultSelect()
        router.push(`/producto/${results[0].slug}`)
      }

      if (mode === 'filters') {
        event.preventDefault()

        const trimmedQuery = query.trim()
        const nextParams = new URLSearchParams(searchParamsString)
        if (trimmedQuery) {
          nextParams.set('q', trimmedQuery)
        } else {
          nextParams.delete('q')
        }
        nextParams.delete('page')

        const nextString = nextParams.toString()
        router.push(nextString ? `${pathname}?${nextString}` : pathname)
      }
    }

    if (event.key === 'Escape') {
      setIsFocused(false)
    }
  }

  const shouldShowOverlay = mode === 'overlay' && isFocused && query.trim().length > 0

  const renderOverlay = () => {
    if (!shouldShowOverlay) {
      return null
    }

    return (
      <div
        className="absolute left-0 right-0 mt-2 rounded-2xl border border-sand bg-white shadow-soft-lg z-50 overflow-hidden"
        onMouseDown={() => {
          if (blurTimeoutRef.current) {
            clearTimeout(blurTimeoutRef.current)
            blurTimeoutRef.current = null
          }
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-4 text-sm text-green-light">
            <Loader2 className="h-4 w-4 animate-spin" />
            Buscando productos...
          </div>
        ) : results.length === 0 ? (
          <div className="p-4 text-sm text-green-light">
            No encontramos productos que coincidan con tu búsqueda.
          </div>
        ) : (
          <ul className="divide-y divide-sand/60 max-h-96 overflow-y-auto">
            {results.map((product) => {
              const mainImage =
                product.images?.find((image) => image.position === 0) ??
                product.images?.[0] ??
                null

              return (
                <li key={product.id}>
                  <Link
                    href={`/producto/${product.slug}`}
                    className="flex items-center gap-3 p-4 hover:bg-sand/40 transition-colors"
                    onClick={handleResultSelect}
                  >
                    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-sand">
                      {mainImage ? (
                        <Image
                          src={getImageUrl(mainImage.file_path)}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-green-light">
                          Sin imagen
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-medium text-green line-clamp-1">
                        {product.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-green-light mt-1">
                        <span>{formatPrice(product.price)}</span>
                        {product.compare_at_price && product.compare_at_price > product.price && (
                          <span className="line-through">
                            {formatPrice(product.compare_at_price)}
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className={`relative ${className ?? ''}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {renderOverlay()}
    </div>
  )
}

export function SearchBar({
  placeholder = 'Buscar productos...',
  className,
  mode = 'overlay',
  onNavigate,
}: SearchBarProps) {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchBarContent
        placeholder={placeholder}
        className={className}
        mode={mode}
        onNavigate={onNavigate}
      />
    </Suspense>
  )
}
