'use server'

import { randomUUID } from 'crypto'
import { v2 as cloudinary } from 'cloudinary'
import { unstable_rethrow } from 'next/navigation'
import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'

const MAX_FILE_SIZE = 5 * 1024 * 1024
const UPLOAD_TIMEOUT_MS = 20000

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

function resolveMimeType(file: File): string {
  if (file.type) return file.type
  return EXTENSION_MIME_TYPES[getFileExtension(file.name)] || 'application/octet-stream'
}

function withTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms)
    }),
  ])
}

function getCloudinaryClient() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error(
      'Faltan las variables de entorno de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)'
    )
  }

  cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true })
  return cloudinary
}

export async function uploadImageFile(formData: FormData) {
  const refId = randomUUID().slice(0, 8)

  try {
    await requireAdmin()

    const file = formData.get('file')
    if (!(file instanceof File)) {
      return { success: false as const, error: 'No se seleccionó ningún archivo' }
    }

    const fileInfo = `archivo: "${file.name}", tipo: "${file.type || 'desconocido'}", tamaño: ${(file.size / 1024 / 1024).toFixed(2)}MB`

    if (!isImageFile(file)) {
      return { success: false as const, error: `El archivo debe ser una imagen (${fileInfo})` }
    }

    if (file.size > MAX_FILE_SIZE) {
      return { success: false as const, error: `La imagen no debe superar 5MB (${fileInfo})` }
    }

    const client = getCloudinaryClient()
    const bytes = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${resolveMimeType(file)};base64,${bytes.toString('base64')}`

    let result
    try {
      result = await withTimeout(
        client.uploader.upload(dataUri, {
          folder: 'cojines-marie',
          public_id: randomUUID(),
          resource_type: 'image',
          // Convert everything (HEIC from iPhones included) to JPEG so it
          // renders in every browser, not just Safari.
          format: 'jpg',
        }),
        UPLOAD_TIMEOUT_MS,
        'Tiempo de espera agotado subiendo la imagen a Cloudinary'
      )
    } catch (uploadError) {
      console.error(`[upload ${refId}] Cloudinary rejected the upload (${fileInfo}):`, uploadError)
      return {
        success: false as const,
        error: `${extractErrorMessage(uploadError)} — ${fileInfo} [ref: ${refId}]`,
      }
    }

    return { success: true as const, url: result.secure_url }
  } catch (error) {
    unstable_rethrow(error)
    console.error(`[upload ${refId}] Unexpected error:`, error)
    return { success: false as const, error: `${extractErrorMessage(error)} [ref: ${refId}]` }
  }
}

function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    const err = error as Record<string, unknown>
    const parts: string[] = []
    if (typeof err.message === 'string') parts.push(err.message)
    if (typeof err.http_code === 'number') parts.push(`código ${err.http_code}`)
    if (typeof err.name === 'string' && err.name !== 'Error') parts.push(err.name)
    if (parts.length > 0) return parts.join(' — ')
  }
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return 'Error inesperado al subir la imagen'
}

export async function uploadProductImage(imageData: string, productId: string, position: number = 0) {
  const refId = randomUUID().slice(0, 8)

  try {
    await requireAdmin()

    const image = await db.addImage({
      product_id: productId,
      file_path: imageData,
      position,
    })

    return {
      success: true as const,
      image,
      url: imageData
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error(`[saveImage ${refId}] Error saving image record:`, error)
    return { success: false as const, error: `${extractErrorMessage(error)} [ref: ${refId}]` }
  }
}

export async function deleteProductImage(imageId: string) {
  const refId = randomUUID().slice(0, 8)

  try {
    await requireAdmin()

    const image = await db.getImage(imageId)
    if (!image) {
      return { success: false as const, error: 'Imagen no encontrada' }
    }

    await db.deleteImage(imageId)

    return { success: true as const }
  } catch (error) {
    unstable_rethrow(error)
    console.error(`[deleteImage ${refId}] Error deleting image:`, error)
    return { success: false as const, error: `${extractErrorMessage(error)} [ref: ${refId}]` }
  }
}

export async function getProductImages(productId: string) {
  const refId = randomUUID().slice(0, 8)

  try {
    await requireAdmin()

    const images = await db.getImages(productId)
    return { success: true as const, images }
  } catch (error) {
    unstable_rethrow(error)
    console.error(`[getImages ${refId}] Error fetching images:`, error)
    return { success: false as const, error: `${extractErrorMessage(error)} [ref: ${refId}]` }
  }
}
