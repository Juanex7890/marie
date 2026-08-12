-- Add best_seller column to products table
-- This script adds the missing best_seller column that the application expects

-- Add best_seller column to products if it doesn't exist
DO $$ 
BEGIN
    -- Add best_seller column to products if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'best_seller') THEN
        ALTER TABLE products ADD COLUMN best_seller BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- Create index for best_seller column if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_products_best_seller ON products(best_seller);

-- Update the search_products function to include best_seller column
-- Drop existing function first to allow changing return type
DROP FUNCTION IF EXISTS search_products(text, text, text, integer, integer);

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
  best_seller BOOLEAN,
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
