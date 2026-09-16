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

export function getImageUrl(filePath?: string | null) {
  if (!filePath) {
    return ''
  }

  const trimmedPath = filePath.trim()
  if (!trimmedPath) {
    return ''
  }

  // Return early when the path is already a fully-qualified or data URL
  if (/^(?:https?:)?\/\//i.test(trimmedPath) || trimmedPath.startsWith('data:')) {
    return trimmedPath
  }

  const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  if (!storageBucket) {
    return trimmedPath
  }

  const normalizedPath = trimmedPath.replace(/^\/+/, '')
  const encodedPath = encodeURIComponent(normalizedPath)

  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/${encodedPath}?alt=media`
}
