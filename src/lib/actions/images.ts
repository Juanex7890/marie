'use server'

import { randomUUID } from 'crypto'
import { v2 as cloudinary } from 'cloudinary'
import { unstable_rethrow } from 'next/navigation'
import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'

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
  return 'Error inesperado'
}

// Signs upload parameters so the browser can POST the file bytes directly
// to Cloudinary, bypassing our own server entirely. Vercel's serverless
// functions cap request bodies at ~4.5MB regardless of Next.js config, which
// silently killed uploads of real phone photos (commonly 3-10MB) — this
// avoids that ceiling completely.
export async function getCloudinaryUploadSignature() {
  const refId = randomUUID().slice(0, 8)

  try {
    await requireAdmin()

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME
    const apiKey = process.env.CLOUDINARY_API_KEY
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudName || !apiKey || !apiSecret) {
      return {
        success: false as const,
        error: 'Faltan las variables de entorno de Cloudinary (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)',
      }
    }

    const timestamp = Math.round(Date.now() / 1000)
    const publicId = randomUUID()
    const folder = 'cojines-marie'
    // Convert everything (HEIC from iPhones included) to JPEG so it renders
    // in every browser, not just Safari.
    const format = 'jpg'

    const signature = cloudinary.utils.api_sign_request(
      { timestamp, public_id: publicId, folder, format },
      apiSecret
    )

    return {
      success: true as const,
      cloudName,
      apiKey,
      timestamp,
      publicId,
      folder,
      format,
      signature,
    }
  } catch (error) {
    unstable_rethrow(error)
    console.error(`[signature ${refId}] Error generating upload signature:`, error)
    return { success: false as const, error: `${extractErrorMessage(error)} [ref: ${refId}]` }
  }
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
