import "server-only";
import { transaction } from "@/repositories/order.repository";

export type ProductDraft = {
  sku: string; name: string; description: string; categoryId: number; priceVnd: number;
  stock: number; imagePath: string; occasion: string; flowerStyle: string; active: boolean;
};

function slugFromSku(sku: string) { return sku.toLowerCase(); }

export async function saveProduct(draft: ProductDraft, id?: number) {
  return transaction(async (client) => {
    if (!id) {
      const result = await client.query(`INSERT INTO products(category_id,sku,slug,name,description,price_vnd,opening_stock,image_path,active)
        VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id::int`,
        [draft.categoryId,draft.sku,slugFromSku(draft.sku),draft.name,draft.description,draft.priceVnd,draft.stock,draft.imagePath,draft.active]);
      id = result.rows[0].id;
      await client.query(`INSERT INTO flower_product_details(product_id,occasion,flower_style) VALUES($1,$2,$3)`, [id,draft.occasion,draft.flowerStyle]);
      return id;
    }
    const old = await client.query(`SELECT id FROM products WHERE id=$1 FOR UPDATE`, [id]);
    if (!old.rowCount) throw new Error("Không tìm thấy sản phẩm");
    const stock = await client.query(`SELECT (p.opening_stock+COALESCE(SUM(m.quantity_delta),0))::int AS stock
      FROM products p LEFT JOIN inventory_movements m ON m.product_id=p.id WHERE p.id=$1 GROUP BY p.id`, [id]);
    const delta = draft.stock - Number(stock.rows[0].stock);
    await client.query(`UPDATE products SET category_id=$1,sku=$2,slug=$3,name=$4,description=$5,price_vnd=$6,image_path=$7,active=$8 WHERE id=$9`,
      [draft.categoryId,draft.sku,slugFromSku(draft.sku),draft.name,draft.description,draft.priceVnd,draft.imagePath,draft.active,id]);
    await client.query(`INSERT INTO flower_product_details(product_id,occasion,flower_style) VALUES($1,$2,$3)
      ON CONFLICT(product_id) DO UPDATE SET occasion=EXCLUDED.occasion,flower_style=EXCLUDED.flower_style`, [id,draft.occasion,draft.flowerStyle]);
    if (delta) await client.query(`INSERT INTO inventory_movements(product_id,quantity_delta,reason) VALUES($1,$2,'adjustment')`, [id,delta]);
    return id;
  });
}

export async function hideProduct(id: number) {
  const { getPool } = await import("@/lib/db");
  const result = await getPool().query(`UPDATE products SET active=false WHERE id=$1 RETURNING id`, [id]);
  return Boolean(result.rowCount);
}
