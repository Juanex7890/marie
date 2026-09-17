export function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
  }).format(price)
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// Bounds a client-side call so a stalled mobile connection (common when a
// server action's response never arrives) can't leave the UI hanging with
// no feedback — it always resolves or rejects within `ms`.
export function withClientTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Injects a Cloudinary delivery transformation (auto format/quality, and an
// optional max width) into the URL's /upload/ segment. This is how we keep
// images small without paying for Vercel's image-optimization quota
// (next.config.js sets images.unoptimized: true) — Cloudinary transforms are
// free and cached at their CDN.
function withCloudinaryTransform(url: string, width?: number): string {
  const uploadMarker = '/upload/'
  const uploadIndex = url.indexOf(uploadMarker)
  if (!url.includes('res.cloudinary.com') || uploadIndex === -1) {
    return url
  }

  const transforms = ['f_auto', 'q_auto']
  if (width) {
    transforms.push('c_limit', `w_${width}`)
  }

  const insertAt = uploadIndex + uploadMarker.length
  return `${url.slice(0, insertAt)}${transforms.join(',')}/${url.slice(insertAt)}`
}

export function getImageUrl(filePath?: string | null, options?: { width?: number }) {
  if (!filePath) {
    return ''
  }

  const trimmedPath = filePath.trim()
  if (!trimmedPath) {
    return ''
  }

  // Return early when the path is already a fully-qualified or data URL
  if (/^(?:https?:)?\/\//i.test(trimmedPath) || trimmedPath.startsWith('data:')) {
    return withCloudinaryTransform(trimmedPath, options?.width)
  }

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (!storageBucket) {
    return trimmedPath
  }

  const normalizedPath = trimmedPath.replace(/^\/+/, '')
  const encodedPath = encodeURIComponent(normalizedPath)

  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodedPath}?alt=media`
}
