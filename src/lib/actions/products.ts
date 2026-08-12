'use server'

import * as db from '@/lib/firebase/db'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface CreateProductData {
  name: string
  description: string
  price: number
  category_id: string
  active: boolean
  best_seller: boolean
  compare_at_price?: number
}

export interface UpdateProductData extends CreateProductData {
  id: string
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim()
}

export async function createProduct(data: CreateProductData) {
  try {
    await requireAdmin()

    const product = await db.createProduct({
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      price: data.price,
      compare_at_price: data.compare_at_price ?? null,
      active: data.active,
      best_seller: data.best_seller,
      category_id: data.category_id,
    })

    revalidatePath('/admin/productos')
    revalidatePath('/')
    return { success: true as const, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false as const, error: 'Error inesperado al crear el producto' }
  }
}

export async function updateProduct(data: UpdateProductData) {
  try {
    await requireAdmin()

    const product = await db.updateProduct(data.id, {
      name: data.name,
      slug: slugify(data.name),
      description: data.description,
      price: data.price,
      compare_at_price: data.compare_at_price ?? null,
      active: data.active,
      best_seller: data.best_seller,
      category_id: data.category_id,
    })

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${data.id}`)
    revalidatePath('/')
    return { success: true as const, product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false as const, error: 'Error inesperado al actualizar el producto' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requireAdmin()

    await db.deleteProduct(productId)

    revalidatePath('/admin/productos')
    return { success: true as const }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false as const, error: 'Error inesperado al eliminar el producto' }
  }
}

export async function toggleProductStatus(productId: string) {
  try {
    await requireAdmin()

    const product = await db.getProductById(productId)
    if (!product) {
      return { success: false as const, error: 'Producto no encontrado' }
    }

    await db.updateProduct(productId, { active: !product.active })

    revalidatePath('/admin/productos')
    return { success: true as const }
  } catch (error) {
    console.error('Error toggling product status:', error)
    return { success: false as const, error: 'Error inesperado al cambiar el estado' }
  }
}

export async function getProduct(productId: string) {
  try {
    await requireAdmin()

    const product = await db.getProductById(productId)
    if (!product) {
      return { success: false as const, error: 'Error al cargar el producto' }
    }

    return { success: true as const, product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false as const, error: 'Error inesperado al cargar el producto' }
  }
}
