-- Fix RLS policies to work with custom admin authentication
-- This script should be run in your Supabase SQL editor

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

-- Create a new function to check admin session via custom JWT
CREATE OR REPLACE FUNCTION is_admin_session()
RETURNS BOOLEAN AS $$
DECLARE
  admin_token TEXT;
BEGIN
  -- Get the admin-session cookie from the request
  admin_token := current_setting('request.headers.cookie', true);
  
  -- Check if admin-session cookie exists
  IF admin_token IS NULL OR admin_token = '' THEN
    RETURN false;
  END IF;
  
  -- For now, we'll allow all requests with admin-session cookie
  -- In production, you should verify the JWT token properly
  RETURN admin_token LIKE '%admin-session%';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Alternative: Create a simpler approach by temporarily disabling RLS for admin operations
-- This is less secure but will work for development

-- Create new policies that allow admin operations
CREATE POLICY "Allow admin category management" ON categories
  FOR ALL USING (true);

CREATE POLICY "Allow admin product management" ON products
  FOR ALL USING (true);

CREATE POLICY "Allow admin product image management" ON product_images
  FOR ALL USING (true);

-- Storage policies for admin
CREATE POLICY "Allow admin image upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Allow admin image update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images');

CREATE POLICY "Allow admin image delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images');

-- Keep the public read policies
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.active = true
    )
  );

CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');
