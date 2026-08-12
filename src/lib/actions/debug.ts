'use server'

import { firestore } from '@/lib/firebase/admin'
import { requireAdmin } from '@/lib/auth'

export async function debugProductCreation() {
  try {
    const session = await requireAdmin()

    const categoriesSnapshot = await firestore().collection('categories').limit(5).get()
    const categories = categoriesSnapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }))

    const testRef = firestore().collection('products').doc()
    const now = new Date().toISOString()
    await testRef.set({
      name: 'Test Product',
      slug: 'test-product',
      description: 'Test description',
      price: 10.0,
      active: true,
      category_id: categories[0]?.id || 'none',
      created_at: now,
      updated_at: now,
    })
    await testRef.delete()

    return {
      success: true as const,
      message: 'All tests passed!',
      categories: categories.length,
      session,
    }
  } catch (error) {
    console.error('Debug error:', error)
    return {
      success: false as const,
      error: `Debug error: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}
