-- Seed data for Cojines Marie

-- Insert categories
INSERT INTO categories (name, slug, description, position) VALUES
('Servilletas lino', 'servilletas-lino', 'Servilletas de lino natural de alta calidad, perfectas para cualquier ocasión', 1),
('Cojines de uso diario', 'cojines-uso-diario', 'Cojines cómodos y elegantes para el día a día', 2),
('Infantiles y personalizados', 'infantiles-personalizados', 'Cojines personalizados para niños con diseños únicos', 3),
('Rústicos', 'rusticos', 'Cojines con estilo rústico y natural', 4),
('Navidad 2025', 'navidad-2025', 'Colección especial de Navidad 2025', 5),
('Toallas navideñas', 'toallas-navidenas', 'Toallas temáticas para la época navideña', 6);

-- Insert sample products
INSERT INTO products (name, slug, description, price, compare_at_price, category_id, active) VALUES
('Cojín Lino Beige', 'cojin-lino-beige', 'Cojín decorativo de lino beige con bordado artesanal. Perfecto para dar un toque elegante a cualquier espacio.', 24.99, 29.99, (SELECT id FROM categories WHERE slug = 'cojines-uso-diario'), true),
('Servilleta Lino Natural', 'servilleta-lino-natural', 'Servilletas de lino 100% natural, lavables y reutilizables. Set de 4 unidades.', 18.50, NULL, (SELECT id FROM categories WHERE slug = 'servilletas-lino'), true),
('Cojín Infantil Unicornio', 'cojin-infantil-unicornio', 'Cojín suave y colorido con diseño de unicornio. Ideal para habitaciones infantiles.', 22.00, NULL, (SELECT id FROM categories WHERE slug = 'infantiles-personalizados'), true),
('Cojín Rústico A cuadros', 'cojin-rustico-cuadros', 'Cojín con estampado a cuadros en tonos tierra. Estilo rústico y acogedor.', 26.99, 32.99, (SELECT id FROM categories WHERE slug = 'rusticos'), true),
('Cojín Navideño Pino', 'cojin-navideno-pino', 'Cojín decorativo con motivo de pino navideño. Perfecto para la época de Navidad.', 19.99, NULL, (SELECT id FROM categories WHERE slug = 'navidad-2025'), true),
('Toalla Navideña Roja', 'toalla-navidena-roja', 'Toalla de mano con motivos navideños en color rojo. 100% algodón.', 12.50, NULL, (SELECT id FROM categories WHERE slug = 'toallas-navidenas'), true),
('Cojín Lino Gris', 'cojin-lino-gris', 'Cojín de lino en color gris claro, minimalista y elegante.', 24.99, NULL, (SELECT id FROM categories WHERE slug = 'cojines-uso-diario'), true),
('Servilleta Lino Bordada', 'servilleta-lino-bordada', 'Servilletas de lino con bordado artesanal. Set de 6 unidades.', 28.00, 35.00, (SELECT id FROM categories WHERE slug = 'servilletas-lino'), true),
('Cojín Infantil Dinosaurio', 'cojin-infantil-dinosaurio', 'Cojín divertido con diseño de dinosaurio. Perfecto para los más pequeños.', 22.00, NULL, (SELECT id FROM categories WHERE slug = 'infantiles-personalizados'), true),
('Cojín Rústico Lana', 'cojin-rustico-lana', 'Cojín de lana natural con textura rústica. Muy acogedor.', 31.99, NULL, (SELECT id FROM categories WHERE slug = 'rusticos'), true),
('Cojín Navideño Renos', 'cojin-navideno-renos', 'Cojín con estampado de renos navideños. Ideal para decorar en Navidad.', 19.99, NULL, (SELECT id FROM categories WHERE slug = 'navidad-2025'), true),
('Toalla Navideña Verde', 'toalla-navidena-verde', 'Toalla de mano navideña en color verde. Motivos de hojas de pino.', 12.50, NULL, (SELECT id FROM categories WHERE slug = 'toallas-navidenas'), true);

-- Insert sample product images (placeholder paths - these would be actual file paths in production)
INSERT INTO product_images (product_id, file_path, position) VALUES
((SELECT id FROM products WHERE slug = 'cojin-lino-beige'), 'cojines/cojin-lino-beige-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'cojin-lino-beige'), 'cojines/cojin-lino-beige-2.jpg', 1),
((SELECT id FROM products WHERE slug = 'servilleta-lino-natural'), 'servilletas/servilleta-lino-natural-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'servilleta-lino-natural'), 'servilletas/servilleta-lino-natural-2.jpg', 1),
((SELECT id FROM products WHERE slug = 'cojin-infantil-unicornio'), 'infantiles/cojin-unicornio-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'cojin-rustico-cuadros'), 'rusticos/cojin-cuadros-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'cojin-navideno-pino'), 'navidad/cojin-pino-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'toalla-navidena-roja'), 'toallas/toalla-roja-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'cojin-lino-gris'), 'cojines/cojin-lino-gris-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'servilleta-lino-bordada'), 'servilletas/servilleta-bordada-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'cojin-infantil-dinosaurio'), 'infantiles/cojin-dinosaurio-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'cojin-rustico-lana'), 'rusticos/cojin-lana-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'cojin-navideno-renos'), 'navidad/cojin-renos-1.jpg', 0),
((SELECT id FROM products WHERE slug = 'toalla-navidena-verde'), 'toallas/toalla-verde-1.jpg', 0);

-- Update category hero images
UPDATE categories SET hero_image = 'categorias/servilletas-lino-hero.jpg' WHERE slug = 'servilletas-lino';
UPDATE categories SET hero_image = 'categorias/cojines-uso-diario-hero.jpg' WHERE slug = 'cojines-uso-diario';
UPDATE categories SET hero_image = 'categorias/infantiles-personalizados-hero.jpg' WHERE slug = 'infantiles-personalizados';
UPDATE categories SET hero_image = 'categorias/rusticos-hero.jpg' WHERE slug = 'rusticos';
UPDATE categories SET hero_image = 'categorias/navidad-2025-hero.jpg' WHERE slug = 'navidad-2025';
UPDATE categories SET hero_image = 'categorias/toallas-navidenas-hero.jpg' WHERE slug = 'toallas-navidenas';
