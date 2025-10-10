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

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) {
    return trimmedPath
  }

  const sanitizedBase = supabaseUrl.replace(/\/+$/, '')
  const normalizedPath = trimmedPath.replace(/^\/+/, '')

  if (normalizedPath.startsWith('storage/v1/object/public/product-images/')) {
    return `${sanitizedBase}/${normalizedPath}`
  }

  const withoutPublicPrefix = normalizedPath.replace(/^public\//, '')
  const withoutBucket = withoutPublicPrefix.replace(/^product-images\//, '')

  return `${sanitizedBase}/storage/v1/object/public/product-images/${withoutBucket}`
}
