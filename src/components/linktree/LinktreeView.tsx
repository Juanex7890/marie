import type { CSSProperties } from 'react'
import type { LinktreeConfig } from '@/lib/firebase/db'

const SHAPE_CLASS: Record<LinktreeConfig['buttonShape'], string> = {
  rounded: 'rounded-xl',
  pill: 'rounded-full',
  square: 'rounded-none',
}

function backgroundStyle(config: LinktreeConfig): CSSProperties {
  if (config.backgroundType === 'gradient') {
    return { background: `linear-gradient(160deg, ${config.backgroundGradientFrom}, ${config.backgroundGradientTo})` }
  }
  if (config.backgroundType === 'image' && config.backgroundImageUrl) {
    return {
      backgroundImage: `url(${config.backgroundImageUrl})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { backgroundColor: config.backgroundColor }
}

export function LinktreeView({ config, className = '' }: { config: LinktreeConfig; className?: string }) {
  const links = [...config.links].filter((l) => l.active).sort((a, b) => a.position - b.position)
  const fontClass = config.fontFamily === 'serif' ? 'font-serif' : 'font-sans'

  return (
    <div
      className={`min-h-full w-full flex flex-col items-center px-4 py-16 ${fontClass} ${className}`}
      style={backgroundStyle(config)}
    >
      <div className="w-full max-w-md flex flex-col items-center text-center">
        {config.avatarUrl && (
          <img
            src={config.avatarUrl}
            alt={config.displayName}
            className="h-24 w-24 rounded-full object-cover shadow-soft-lg mb-4 border-4 border-white/70"
          />
        )}
        <h1 className="text-2xl font-bold mb-2" style={{ color: config.textColor }}>
          {config.displayName}
        </h1>
        {config.bio && (
          <p className="text-sm mb-8 opacity-90 whitespace-pre-line" style={{ color: config.textColor }}>
            {config.bio}
          </p>
        )}

        <div className="w-full space-y-3">
          {links.map((link) => (
            <a
              key={link.id}
              href={link.url}
              target={link.url.startsWith('http') ? '_blank' : undefined}
              rel={link.url.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={`flex items-center gap-3 w-full px-5 py-4 shadow-soft transition-transform hover:scale-[1.02] ${SHAPE_CLASS[config.buttonShape]}`}
              style={{ backgroundColor: config.buttonColor, color: config.buttonTextColor }}
            >
              {link.imageUrl && (
                <img src={link.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0" />
              )}
              <span className="flex-1 font-medium">{link.title}</span>
            </a>
          ))}
          {links.length === 0 && (
            <p className="text-sm opacity-70" style={{ color: config.textColor }}>
              Aún no hay enlaces para mostrar.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
