'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { LogOut, Home, Package, Tag, BarChart3 } from 'lucide-react'

export function AdminHeader() {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: BarChart3 },
    { name: 'Productos', href: '/admin/productos', icon: Package },
    { name: 'Categorías', href: '/admin/categorias', icon: Tag },
  ]

  return (
    <header className="bg-white shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-serif font-semibold text-green">
                Admin Panel
              </span>
            </Link>
            
            <nav className="hidden md:flex items-center space-x-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="flex items-center space-x-2 text-green hover:text-gold transition-colors font-medium"
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/" className="text-green hover:text-gold transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar sesión
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
