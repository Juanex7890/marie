'use server'

import { firestore } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/auth'

export async function testConnection() {
  try {
    const session = await requireAdmin()

    const categoriesSnapshot = await firestore().collection('categories').limit(1).get()
    const productsSnapshot = await firestore().collection('products').limit(1).get()

    return {
      success: true as const,
      message: 'All tests passed',
      session,
      categories: categoriesSnapshot.size,
      products: productsSnapshot.size,
    }
  } catch (error: any) {
    console.error('Test error:', error)
    return { success: false as const, error: error.message }
  }
}
