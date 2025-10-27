import { Instagram, Mail, Phone } from 'lucide-react'
import { WhatsAppIcon } from '@/components/icons/WhatsAppIcon'

export function Footer() {
  return (
    <footer className="bg-green text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gold rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-serif font-semibold">
                Cojines Marie
              </span>
            </div>
            <p className="text-green-light text-sm">
              Almohadas decorativas artesanales para hacer de tu hogar un lugar único y acogedor.
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
                <WhatsAppIcon className="h-10 w-10 drop-shadow-sm" />
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
            © 2025 Cojines Marie. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
