'use server'

import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function testConnection() {
  try {
    console.log('🔍 Testing connection...')
    
    // Test admin auth
    const session = await requireAdmin()
    console.log('✅ Admin session:', session)
    
    // Test simple query
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .limit(1)
    
    if (error) {
      console.error('❌ Query error:', error)
      return { success: false, error: error.message }
    }
    
    console.log('✅ Query successful:', data)
    
    // Test product update
    const { data: products, error: productError } = await supabaseAdmin
      .from('products')
      .select('id, name')
      .limit(1)
    
    if (productError) {
      console.error('❌ Product query error:', productError)
      return { success: false, error: `Product query error: ${productError.message}` }
    }
    
    console.log('✅ Product query successful:', products)
    
    return { success: true, message: 'All tests passed' }
  } catch (error: any) {
    console.error('❌ Test error:', error)
    return { success: false, error: error.message }
  }
}
