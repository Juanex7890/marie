import Image from 'next/image'
import { Instagram, Phone } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/images/marielogo.png"
                alt="Cojines Marie"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-contain"
                priority
              />
              <span className="text-xl font-serif font-semibold">Cojines Marie</span>
            </div>
            <p className="text-green-light text-sm">
              Almohadas decorativas artesanales para hacer de tu hogar un lugar unico y acogedor.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://instagram.com/cojinesdecorativos_marie"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white transition hover:bg-gold/90"
                aria-label="Instagram de Cojines Marie"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://wa.me/316388242"
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center transition hover:scale-105"
                aria-label="Contactar por WhatsApp"
              >
                <Image
                  src="/images/whatsapp.png"
                  alt="WhatsApp"
                  width={40}
                  height={40}
                  className="h-10 w-10 object-contain drop-shadow-sm"
                  priority
                />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contacto</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-green-light">
                <Phone className="h-4 w-4" />
                <span className="text-sm">+57 316 6388242</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-green-light mt-8 pt-8 text-center">
          <p className="text-green-light text-sm">
            (c) 2025 Cojines Marie. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
