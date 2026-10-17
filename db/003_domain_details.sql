CREATE TABLE IF NOT EXISTS flower_product_details (
  product_id bigint PRIMARY KEY REFERENCES products(id) ON DELETE CASCADE,
  occasion text NOT NULL,
  flower_style text NOT NULL
);
INSERT INTO flower_product_details(product_id,occasion,flower_style)
SELECT id,occasion,flower_style FROM products WHERE occasion IS NOT NULL AND flower_style IS NOT NULL
ON CONFLICT(product_id) DO NOTHING;
ALTER TABLE products DROP COLUMN IF EXISTS occasion;
ALTER TABLE products DROP COLUMN IF EXISTS flower_style;
ALTER TABLE products DROP COLUMN IF EXISTS serving;
ALTER TABLE products DROP COLUMN IF EXISTS apparel_size;
ALTER TABLE products DROP COLUMN IF EXISTS apparel_color;
