-- =====================================================
-- Fenix Brokers - Spanish Translation Migration Script
-- =====================================================
-- Purpose: Bulk translate database content to Spanish
-- NOTE: Brand names are preserved as they are internationally recognized
-- IMPORTANT: Run this in a transaction and BACKUP before executing!
-- =====================================================

BEGIN;

-- =====================================================
-- 1. CATEGORIES - Translate category names and descriptions
-- =====================================================

-- Common cosmetics category translations
UPDATE categories SET 
    name = 'Perfumes',
    description = 'Fragancias de lujo de las mejores marcas internacionales'
WHERE LOWER(name) = 'perfumes' OR LOWER(name) = 'fragrances';

UPDATE categories SET 
    name = 'Cuidado de la Piel',
    description = 'Soluciones profesionales para el cuidado facial y corporal'
WHERE LOWER(name) = 'skincare' OR LOWER(name) = 'skin care';

UPDATE categories SET 
    name = 'Maquillaje',
    description = 'Colección de cosméticos de alta gama para profesionales'
WHERE LOWER(name) = 'makeup' OR LOWER(name) = 'cosmetics';

UPDATE categories SET 
    name = 'Cuidado Capilar',
    description = 'Productos capilares de calidad de salón profesional'
WHERE LOWER(name) = 'hair care' OR LOWER(name) = 'haircare';

UPDATE categories SET 
    name = 'Cuidado Corporal',
    description = 'Tratamientos y productos para el cuidado del cuerpo'
WHERE LOWER(name) = 'body care' OR LOWER(name) = 'bodycare';

UPDATE categories SET 
    name = 'Sets de Regalo',
    description = 'Colecciones de regalo premium cuidadosamente seleccionadas'
WHERE LOWER(name) = 'gift sets' OR LOWER(name) = 'gift set';

UPDATE categories SET 
    name = 'Accesorios de Belleza',
    description = 'Herramientas y accesorios profesionales de belleza'
WHERE LOWER(name) = 'accessories' OR LOWER(name) = 'beauty accessories';

-- =====================================================
-- 2. PRODUCTS - Translate descriptions (keep brand names)
-- Using correct column names: short_description, full_description
-- =====================================================

-- Translate common SHORT description phrases
UPDATE products SET 
    short_description = REPLACE(short_description, 'Authentic product', 'Producto auténtico')
WHERE short_description ILIKE '%Authentic product%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'Premium quality', 'Calidad premium')
WHERE short_description ILIKE '%Premium quality%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'Best seller', 'Más vendido')
WHERE short_description ILIKE '%Best seller%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'New arrival', 'Nueva llegada')
WHERE short_description ILIKE '%New arrival%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'Limited edition', 'Edición limitada')
WHERE short_description ILIKE '%Limited edition%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'Exclusive', 'Exclusivo')
WHERE short_description ILIKE '%Exclusive%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'Professional grade', 'Grado profesional')
WHERE short_description ILIKE '%Professional grade%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'Long-lasting', 'Duradero')
WHERE short_description ILIKE '%Long-lasting%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'Luxury', 'Lujo')
WHERE short_description ILIKE '%Luxury%';

UPDATE products SET 
    short_description = REPLACE(short_description, 'High quality', 'Alta calidad')
WHERE short_description ILIKE '%High quality%';

-- Translate common FULL description phrases
UPDATE products SET 
    full_description = REPLACE(full_description, 'Authentic product', 'Producto auténtico')
WHERE full_description ILIKE '%Authentic product%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'Premium quality', 'Calidad premium')
WHERE full_description ILIKE '%Premium quality%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'Best seller', 'Más vendido')
WHERE full_description ILIKE '%Best seller%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'New arrival', 'Nueva llegada')
WHERE full_description ILIKE '%New arrival%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'Limited edition', 'Edición limitada')
WHERE full_description ILIKE '%Limited edition%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'Exclusive', 'Exclusivo')
WHERE full_description ILIKE '%Exclusive%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'Professional grade', 'Grado profesional')
WHERE full_description ILIKE '%Professional grade%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'Long-lasting', 'Duradero')
WHERE full_description ILIKE '%Long-lasting%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'Luxury', 'Lujo')
WHERE full_description ILIKE '%Luxury%';

UPDATE products SET 
    full_description = REPLACE(full_description, 'High quality', 'Alta calidad')
WHERE full_description ILIKE '%High quality%';

-- =====================================================
-- 3. EMAIL TEMPLATES - Update content in templates
-- The column is 'content' not 'blocks' based on schema
-- =====================================================

-- Update any templates with English unsubscribe text
UPDATE email_templates SET 
    content = REPLACE(content::text, '"unsubscribeText":"Unsubscribe"', '"unsubscribeText":"Darse de baja"')::jsonb
WHERE content::text ILIKE '%"unsubscribeText":"Unsubscribe"%';

UPDATE email_templates SET 
    content = REPLACE(content::text, '"unsubscribeText":"Unsubscribe from this list"', '"unsubscribeText":"Darse de baja de esta lista"')::jsonb
WHERE content::text ILIKE '%"unsubscribeText":"Unsubscribe from this list"%';

-- Update address placeholders
UPDATE email_templates SET 
    content = REPLACE(content::text, '"address":"Address"', '"address":"Dirección"')::jsonb
WHERE content::text ILIKE '%"address":"Address"%';

UPDATE email_templates SET 
    content = REPLACE(content::text, '"Spain"', '"España"')::jsonb
WHERE content::text ILIKE '%"Spain"%';

-- =====================================================
-- VERIFICATION QUERIES (run after to check results)
-- =====================================================

-- Check categories
-- SELECT id, name, description FROM categories;

-- Check products sample
-- SELECT id, title, brand, short_description FROM products LIMIT 10;

-- Check templates
-- SELECT id, name, content FROM email_templates LIMIT 5;

COMMIT;

-- =====================================================
-- ROLLBACK (run if something goes wrong)
-- =====================================================
-- ROLLBACK;
