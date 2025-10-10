'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export interface CreateProductData {
  name: string
  description: string
  price: number
  category_id: string
  active: boolean
  compare_at_price?: number
}

export interface UpdateProductData extends CreateProductData {
  id: string
}

export async function createProduct(data: CreateProductData) {
  try {
    await requireAdmin()

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .insert({
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        compare_at_price: data.compare_at_price,
        active: data.active,
        category_id: data.category_id,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return { 
        success: false, 
        error: `Error al crear el producto: ${error.message}` 
      }
    }

    revalidatePath('/admin/productos')
    return { success: true, product }
  } catch (error) {
    console.error('Error creating product:', error)
    return { success: false, error: 'Error inesperado al crear el producto' }
  }
}

export async function updateProduct(data: UpdateProductData) {
  try {
    await requireAdmin()

    // Generate slug from name
    const slug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim()

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .update({
        name: data.name,
        slug,
        description: data.description,
        price: data.price,
        compare_at_price: data.compare_at_price,
        active: data.active,
        category_id: data.category_id,
      })
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return { success: false, error: 'Error al actualizar el producto' }
    }

    revalidatePath('/admin/productos')
    revalidatePath(`/admin/productos/${data.id}`)
    return { success: true, product }
  } catch (error) {
    console.error('Error updating product:', error)
    return { success: false, error: 'Error inesperado al actualizar el producto' }
  }
}

export async function deleteProduct(productId: string) {
  try {
    await requireAdmin()

    const { error } = await supabaseAdmin
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      console.error('Error deleting product:', error)
      return { success: false, error: 'Error al eliminar el producto' }
    }

    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error('Error deleting product:', error)
    return { success: false, error: 'Error inesperado al eliminar el producto' }
  }
}

export async function toggleProductStatus(productId: string) {
  try {
    await requireAdmin()

    // Get current status
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('active')
      .eq('id', productId)
      .single()

    if (!product) {
      return { success: false, error: 'Producto no encontrado' }
    }

    const { error } = await supabaseAdmin
      .from('products')
      .update({ active: !product.active })
      .eq('id', productId)

    if (error) {
      console.error('Error toggling product status:', error)
      return { success: false, error: 'Error al cambiar el estado del producto' }
    }

    revalidatePath('/admin/productos')
    return { success: true }
  } catch (error) {
    console.error('Error toggling product status:', error)
    return { success: false, error: 'Error inesperado al cambiar el estado' }
  }
}

export async function getProduct(productId: string) {
  try {
    await requireAdmin()

    const { data: product, error } = await supabaseAdmin
      .from('products')
      .select(`
        *,
        images:product_images(*),
        categories(*)
      `)
      .eq('id', productId)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return { success: false, error: 'Error al cargar el producto' }
    }

    return { success: true, product }
  } catch (error) {
    console.error('Error fetching product:', error)
    return { success: false, error: 'Error inesperado al cargar el producto' }
  }
}
