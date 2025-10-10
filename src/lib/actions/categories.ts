'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export interface CreateCategoryData {
  name: string
  description?: string
  slug: string
  position: number
  active: boolean
  hero_image?: string
}

export interface UpdateCategoryData extends CreateCategoryData {
  id: string
}

export async function createCategory(data: CreateCategoryData) {
  try {
    await requireAdmin()

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .insert({
        name: data.name,
        slug: data.slug,
        description: data.description,
        position: data.position,
        active: data.active,
        hero_image: data.hero_image,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      return { success: false, error: 'Error al crear la categoría' }
    }

    revalidatePath('/admin/categorias')
    return { success: true, category }
  } catch (error) {
    console.error('Error creating category:', error)
    return { success: false, error: 'Error inesperado al crear la categoría' }
  }
}

export async function updateCategory(data: UpdateCategoryData) {
  try {
    await requireAdmin()

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: data.name,
        slug: data.slug,
        description: data.description,
        position: data.position,
        active: data.active,
        hero_image: data.hero_image,
      })
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      return { success: false, error: 'Error al actualizar la categoría' }
    }

    revalidatePath('/admin/categorias')
    revalidatePath(`/admin/categorias/${data.id}`)
    return { success: true, category }
  } catch (error) {
    console.error('Error updating category:', error)
    return { success: false, error: 'Error inesperado al actualizar la categoría' }
  }
}

export async function deleteCategory(categoryId: string) {
  try {
    await requireAdmin()

    // Check if category has products
    const { data: products } = await supabaseAdmin
      .from('products')
      .select('id')
      .eq('category_id', categoryId)
      .limit(1)

    if (products && products.length > 0) {
      return { 
        success: false, 
        error: 'No se puede eliminar la categoría porque tiene productos asociados' 
      }
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', categoryId)

    if (error) {
      console.error('Error deleting category:', error)
      return { success: false, error: 'Error al eliminar la categoría' }
    }

    revalidatePath('/admin/categorias')
    return { success: true }
  } catch (error) {
    console.error('Error deleting category:', error)
    return { success: false, error: 'Error inesperado al eliminar la categoría' }
  }
}

export async function toggleCategoryStatus(categoryId: string) {
  try {
    await requireAdmin()

    // Get current status
    const { data: category } = await supabaseAdmin
      .from('categories')
      .select('active')
      .eq('id', categoryId)
      .single()

    if (!category) {
      return { success: false, error: 'Categoría no encontrada' }
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .update({ active: !category.active })
      .eq('id', categoryId)

    if (error) {
      console.error('Error toggling category status:', error)
      return { success: false, error: 'Error al cambiar el estado de la categoría' }
    }

    revalidatePath('/admin/categorias')
    return { success: true }
  } catch (error) {
    console.error('Error toggling category status:', error)
    return { success: false, error: 'Error inesperado al cambiar el estado' }
  }
}

export async function getCategory(categoryId: string) {
  try {
    await requireAdmin()

    const { data: category, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (error) {
      console.error('Error fetching category:', error)
      return { success: false, error: 'Error al cargar la categoría' }
    }

    return { success: true, category }
  } catch (error) {
    console.error('Error fetching category:', error)
    return { success: false, error: 'Error inesperado al cargar la categoría' }
  }
}

export async function getAllCategories() {
  try {
    await requireAdmin()

    const { data: categories, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('position', { ascending: true })

    if (error) {
      console.error('Error fetching categories:', error)
      return { success: false, error: 'Error al cargar las categorías' }
    }

    return { success: true, categories }
  } catch (error) {
    console.error('Error fetching categories:', error)
    return { success: false, error: 'Error inesperado al cargar las categorías' }
  }
}
