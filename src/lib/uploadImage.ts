import { getCloudinaryUploadSignature } from '@/lib/actions/images'

const MAX_FILE_SIZE = 10 * 1024 * 1024

const EXTENSION_MIME_TYPES: Record<string, string> = {
  heic: 'image/heic',
  heif: 'image/heif',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  gif: 'image/gif',
  bmp: 'image/bmp',
}

function getFileExtension(filename: string): string {
  return (filename.split('.').pop() || '').toLowerCase()
}

// iPhones capture photos as HEIC/HEIF, and Safari often reports an empty
// `file.type` for them on the file input, so MIME sniffing alone isn't
// reliable — fall back to the filename extension.
function isImageFile(file: File): boolean {
  if (file.type.startsWith('image/')) return true
  if (file.type) return false
  return getFileExtension(file.name) in EXTENSION_MIME_TYPES
}

export type UploadResult = { success: true; url: string } | { success: false; error: string }

// Uploads a file straight from the browser to Cloudinary using a
// server-signed request, never routing the file bytes through our own
// server. This sidesteps Vercel's ~4.5MB serverless request-body cap, which
// was silently killing uploads of real phone photos.
export async function uploadImageDirect(file: File): Promise<UploadResult> {
  const fileInfo = `archivo: "${file.name}", tipo: "${file.type || 'desconocido'}", tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`

  if (!isImageFile(file)) {
    return { success: false, error: `El archivo debe ser una imagen (${fileInfo})` }
  }

  if (file.size > MAX_FILE_SIZE) {
    return { success: false, error: `La imagen no debe superar 10MB (${fileInfo})` }
  }

  const signatureResult = await getCloudinaryUploadSignature()
  if (!signatureResult.success) {
    return { success: false, error: signatureResult.error }
  }

  const { cloudName, apiKey, timestamp, signature, publicId, folder, format } = signatureResult

  const uploadFormData = new FormData()
  uploadFormData.append('file', file)
  uploadFormData.append('api_key', apiKey)
  uploadFormData.append('timestamp', String(timestamp))
  uploadFormData.append('signature', signature)
  uploadFormData.append('public_id', publicId)
  uploadFormData.append('folder', folder)
  uploadFormData.append('format', format)

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: 'POST',
      body: uploadFormData,
    })

    const data = await response.json().catch(() => null)

    if (!response.ok) {
      const message = data?.error?.message || `HTTP ${response.status}`
      return { success: false, error: `${message} — ${fileInfo}` }
    }

    if (!data?.secure_url) {
      return { success: false, error: `Cloudinary no devolvió una URL válida — ${fileInfo}` }
    }

    return { success: true, url: data.secure_url }
  } catch (networkError) {
    console.error('Error uploading directly to Cloudinary:', networkError)
    const message = networkError instanceof Error ? networkError.message : 'Error de red al subir la imagen'
    return { success: false, error: `${message} — ${fileInfo}` }
  }
}
