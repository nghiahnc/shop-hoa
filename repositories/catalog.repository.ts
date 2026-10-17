import "server-only";
import { getPool } from "@/lib/db";

export type CatalogProduct = {
  id: number; slug: string; sku: string; name: string; description: string;
  category: string; category_id: number; price_vnd: number; image_path: string;
  stock: number; occasion: string; flower_style: string; active: boolean;
};

const productQuery = `SELECT p.id::int,p.slug,p.sku,p.name,p.description,p.category_id::int,
  c.name AS category,p.price_vnd::float8,p.image_path,p.active,
  COALESCE(d.occasion,'') AS occasion,COALESCE(d.flower_style,'') AS flower_style,
  (p.opening_stock+COALESCE((SELECT SUM(quantity_delta) FROM inventory_movements WHERE product_id=p.id),0))::int AS stock
  FROM products p JOIN categories c ON c.id=p.category_id
  LEFT JOIN flower_product_details d ON d.product_id=p.id`;

export async function listProducts(filters: { q?: string; category?: string; occasion?: string; includeInactive?: boolean } = {}) {
  const values = [filters.q?.trim() ?? "", filters.category ?? "", filters.occasion ?? ""];
  const result = await getPool().query(`${productQuery}
    WHERE ($1='' OR p.name ILIKE '%'||$1||'%' OR p.description ILIKE '%'||$1||'%')
      AND ($2='' OR c.slug=$2) AND ($3='' OR d.occasion=$3)
      ${filters.includeInactive ? "" : "AND p.active=true"}
    ORDER BY p.id`, values);
  return result.rows as CatalogProduct[];
}

export async function getProduct(slug: string) {
  const result = await getPool().query(`${productQuery} WHERE p.slug=$1 AND p.active=true`, [slug]);
  return (result.rows[0] ?? null) as CatalogProduct | null;
}

export async function listCategories() {
  const result = await getPool().query(`SELECT id::int,name,slug FROM categories ORDER BY id`);
  return result.rows as { id: number; name: string; slug: string }[];
}

export async function listOccasions() {
  const result = await getPool().query(`SELECT DISTINCT occasion FROM flower_product_details ORDER BY occasion`);
  return result.rows.map((row) => String(row.occasion));
}
