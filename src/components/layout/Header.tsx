'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Menu, X } from 'lucide-react'
import { SearchBar } from '@/components/catalog/SearchBar'
import { CartButton } from '@/components/cart/CartButton'
import { Dialog } from '@/components/ui/Dialog'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)

  const navigation = [
    { name: 'Inicio', href: '/' },
  ]

  return (
    <header className="bg-white shadow-soft sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-serif font-semibold text-green">
                Cojines Marie
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-green hover:text-gold transition-colors font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Search & Cart */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="w-64">
              <SearchBar placeholder="Buscar productos..." />
            </div>
            <CartButton />
          </div>

          {/* Mobile Search Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-green hover:text-gold transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>
            <CartButton />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-green hover:text-gold transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-sand">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-green hover:text-gold transition-colors font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Search Dialog */}
      <Dialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        title="Buscar productos"
      >
        <SearchBar placeholder="Buscar productos..." />
      </Dialog>
    </header>
  )
}
