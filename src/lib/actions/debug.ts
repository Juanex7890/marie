'use server'

import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth'

export async function debugProductCreation() {
  try {
    console.log('🔍 Starting debug...')
    
    // Test admin authentication
    console.log('🔍 Testing admin auth...')
    const session = await requireAdmin()
    console.log('✅ Admin session:', session)
    
    // Test Supabase connection
    console.log('🔍 Testing Supabase connection...')
    const supabase = await createClient()
    console.log('✅ Supabase client created')
    
    // Test categories query
    console.log('🔍 Testing categories query...')
    const { data: categories, error: categoriesError } = await supabaseAdmin
      .from('categories')
      .select('id, name')
      .limit(5)
    
    if (categoriesError) {
      console.error('❌ Categories error:', categoriesError)
      return { success: false, error: `Categories error: ${categoriesError.message}` }
    }
    
    console.log('✅ Categories found:', categories)
    
    // Test product creation with minimal data
    console.log('🔍 Testing product creation...')
    const { data: product, error: productError } = await supabaseAdmin
      .from('products')
      .insert({
        name: 'Test Product',
        slug: 'test-product',
        description: 'Test description',
        price: 10.00,
        active: true,
        category_id: categories?.[0]?.id || '00000000-0000-0000-0000-000000000000'
      })
      .select()
      .single()
    
    if (productError) {
      console.error('❌ Product creation error:', productError)
      return { success: false, error: `Product creation error: ${productError.message}` }
    }
    
    console.log('✅ Product created successfully:', product)
    
    // Clean up test product
    await supabaseAdmin.from('products').delete().eq('id', product.id)
    console.log('✅ Test product cleaned up')
    
    return { 
      success: true, 
      message: 'All tests passed!',
      categories: categories?.length || 0
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return { 
      success: false, 
      error: `Debug error: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }
  }
}
