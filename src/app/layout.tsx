import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { CartProvider } from '@/components/cart/CartProvider'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { ConditionalHeader } from '@/components/layout/ConditionalHeader'
import { ConditionalFooter } from '@/components/layout/ConditionalFooter'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({ 
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cojines Marie - Almohadas Decorativas Artesanales',
    template: '%s | Cojines Marie'
  },
  description: 'Descubre nuestra colección de cojines decorativos artesanales. Servilletas de lino, cojines de uso diario, infantiles personalizados y más. Envíos a toda España.',
  keywords: ['cojines decorativos', 'almohadas', 'servilletas lino', 'decoración hogar', 'artesanal', 'personalizado'],
  authors: [{ name: 'Cojines Marie' }],
  creator: 'Cojines Marie',
  publisher: 'Cojines Marie',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://cojinesmarie.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: '/',
    title: 'Cojines Marie - Almohadas Decorativas Artesanales',
    description: 'Descubre nuestra colección de cojines decorativos artesanales. Servilletas de lino, cojines de uso diario, infantiles personalizados y más.',
    siteName: 'Cojines Marie',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Cojines Marie - Almohadas Decorativas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cojines Marie - Almohadas Decorativas Artesanales',
    description: 'Descubre nuestra colección de cojines decorativos artesanales.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-linen">
        <CartProvider>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </CartProvider>
      </body>
    </html>
  )
}