'use client'

import { useState, useEffect, Suspense } from 'react'
import { Search, X } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { debounce } from '@/lib/utils'

interface SearchBarProps {
  placeholder?: string
  className?: string
}

function SearchBarContent({ placeholder = 'Buscar productos...', className }: SearchBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [query, setQuery] = useState(searchParams.get('q') || '')

  const debouncedSearch = debounce((searchQuery: string) => {
    // Don't redirect if we're on admin pages
    if (pathname.startsWith('/admin')) {
      return
    }
    
    const params = new URLSearchParams(searchParams)
    if (searchQuery.trim()) {
      params.set('q', searchQuery)
    } else {
      params.delete('q')
    }
    params.delete('page')
    router.push(`/busqueda?${params.toString()}`)
  }, 300)

  useEffect(() => {
    debouncedSearch(query)
  }, [query])

  const handleClear = () => {
    setQuery('')
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {query && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function SearchBar({ placeholder = 'Buscar productos...', className }: SearchBarProps) {
  return (
    <Suspense fallback={<div>Loading search...</div>}>
      <SearchBarContent placeholder={placeholder} className={className} />
    </Suspense>
  )
}
