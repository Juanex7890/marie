-- Update existing tables and add missing features

-- Enable necessary extensions (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Add missing columns to existing tables (if they don't exist)
DO $$ 
BEGIN
    -- Add hero_image column to categories if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'hero_image') THEN
        ALTER TABLE categories ADD COLUMN hero_image VARCHAR(255);
    END IF;
    
    -- Add compare_at_price column to products if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'compare_at_price') THEN
        ALTER TABLE products ADD COLUMN compare_at_price DECIMAL(10,2) CHECK (compare_at_price > 0);
    END IF;
    
    -- Add position column to categories if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'categories' AND column_name = 'position') THEN
        ALTER TABLE categories ADD COLUMN position INTEGER NOT NULL DEFAULT 0;
    END IF;
    
    -- Add best_seller column to products if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'best_seller') THEN
        ALTER TABLE products ADD COLUMN best_seller BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Create product_images table if it doesn't exist
CREATE TABLE IF NOT EXISTS product_images (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  file_path VARCHAR(255) NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(active);
CREATE INDEX IF NOT EXISTS idx_categories_position ON categories(position);

CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(best_seller);
CREATE INDEX IF NOT EXISTS idx_products_category_id ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_price ON products(price);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id ON product_images(product_id);
CREATE INDEX IF NOT EXISTS idx_product_images_position ON product_images(position);

-- Create full-text search index for products (if it doesn't exist)
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING gin(to_tsvector('spanish', name || ' ' || COALESCE(description, '')));

-- Create function to update updated_at timestamp (if it doesn't exist)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at (drop first if they exist)
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to check admin role (if it doesn't exist)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'role') = 'admin',
    false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS (if not already enabled)
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Public can view active categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Public can view product images" ON product_images;
DROP POLICY IF EXISTS "Admins can manage product images" ON product_images;

-- Categories policies
CREATE POLICY "Public can view active categories" ON categories
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (is_admin());

-- Products policies
CREATE POLICY "Public can view active products" ON products
  FOR SELECT USING (active = true);

CREATE POLICY "Admins can manage products" ON products
  FOR ALL USING (is_admin());

-- Product images policies
CREATE POLICY "Public can view product images" ON product_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM products 
      WHERE products.id = product_images.product_id 
      AND products.active = true
    )
  );

CREATE POLICY "Admins can manage product images" ON product_images
  FOR ALL USING (is_admin());

-- Create storage bucket for product images (if it doesn't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies (drop existing first)
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update product images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete product images" ON storage.objects;

CREATE POLICY "Public can view product images" ON storage.objects
  FOR SELECT USING (bucket_id = 'product-images');

CREATE POLICY "Admins can upload product images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins can update product images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'product-images' AND is_admin());

CREATE POLICY "Admins can delete product images" ON storage.objects
  FOR DELETE USING (bucket_id = 'product-images' AND is_admin());

-- Create function to search products (if it doesn't exist)
CREATE OR REPLACE FUNCTION search_products(
  search_query TEXT DEFAULT '',
  category_slug TEXT DEFAULT NULL,
  sort_by TEXT DEFAULT 'latest',
  limit_count INTEGER DEFAULT 12,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name VARCHAR(200),
  slug VARCHAR(200),
  description TEXT,
  price DECIMAL(10,2),
  compare_at_price DECIMAL(10,2),
  active BOOLEAN,
  category_id UUID,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  total_count BIGINT
) AS $$
DECLARE
  query TEXT;
  count_query TEXT;
  total BIGINT;
BEGIN
  -- Build the base query
  query := 'SELECT p.*, COUNT(*) OVER() as total_count FROM products p WHERE p.active = true';
  
  -- Add search filter
  IF search_query != '' THEN
    query := query || ' AND (p.name ILIKE ''%' || search_query || '%'' OR p.description ILIKE ''%' || search_query || '%'')';
  END IF;
  
  -- Add category filter
  IF category_slug IS NOT NULL THEN
    query := query || ' AND EXISTS (SELECT 1 FROM categories c WHERE c.id = p.category_id AND c.slug = ''' || category_slug || ''' AND c.active = true)';
  END IF;
  
  -- Add sorting
  CASE sort_by
    WHEN 'price_asc' THEN
      query := query || ' ORDER BY p.price ASC';
    WHEN 'price_desc' THEN
      query := query || ' ORDER BY p.price DESC';
    ELSE
      query := query || ' ORDER BY p.created_at DESC';
  END CASE;
  
  -- Add pagination
  query := query || ' LIMIT ' || limit_count || ' OFFSET ' || offset_count;
  
  -- Execute the query
  RETURN QUERY EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
