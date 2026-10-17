import { config } from 'dotenv';
import pg from 'pg';
import { access, readFile } from 'node:fs/promises';
import { join } from 'node:path';

config({ path: '.env.local' });
const expectedDatabase = process.cwd().split(/[\\/]/).at(-1).replaceAll('-', '_');
const client = new pg.Client({ connectionString: process.env.DATABASE_URL });
await client.connect();
try {
  const info = await client.query(`SELECT current_database() AS database,
    (SELECT COUNT(*)::int FROM products) AS products,
    (SELECT COUNT(*)::int FROM customers) AS customers,
    (SELECT COUNT(*)::int FROM orders) AS orders`);
  const row = info.rows[0];
  if (row.database !== expectedDatabase || row.products < 12 || row.customers < 25 || row.orders < 120) throw new Error(`Seed/database sai: ${JSON.stringify(row)}`);
  const detailTable = { shop_hoa:'flower_product_details', shop_cafe:'cafe_product_details', shop_thoi_trang:'fashion_product_details' }[expectedDatabase];
  const detail = await client.query(`SELECT COUNT(*)::int AS count FROM ${detailTable}`);
  if (detail.rows[0].count !== row.products) throw new Error('Thuộc tính sản phẩm theo ngành bị thiếu');
  const sums = await client.query(`SELECT COUNT(*)::int AS mismatches FROM orders o
    WHERE o.total_vnd <> (SELECT COALESCE(SUM(i.line_total_vnd),0) FROM order_items i WHERE i.order_id=o.id)`);
  if (sums.rows[0].mismatches) throw new Error('Tổng đơn không khớp dòng hàng');
  const stock = await client.query(`SELECT COUNT(*)::int AS negative FROM (
    SELECT p.id FROM products p LEFT JOIN inventory_movements m ON m.product_id=p.id
    GROUP BY p.id HAVING p.opening_stock + COALESCE(SUM(m.quantity_delta),0) < 0) s`);
  if (stock.rows[0].negative) throw new Error('Có sản phẩm tồn âm');
  const cod = await client.query(`SELECT COUNT(*)::int AS broken FROM orders o JOIN payments p ON p.order_id=o.id
    WHERE p.provider='cod' AND (
      (o.fulfillment_status='cancelled' AND (SELECT COALESCE(SUM(quantity_delta),0) FROM inventory_movements WHERE order_id=o.id)<>0)
      OR (o.fulfillment_status='delivered' AND (o.status<>'paid' OR p.status<>'paid' OR EXISTS(SELECT 1 FROM inventory_movements WHERE order_id=o.id AND reason='reserve')))
      OR (o.fulfillment_status NOT IN ('cancelled','delivered') AND NOT EXISTS(SELECT 1 FROM inventory_movements WHERE order_id=o.id AND reason='reserve'))
    )`);
  if (cod.rows[0].broken) throw new Error('Trạng thái COD hoặc giữ/hoàn kho không khớp');
  const products = JSON.parse(await readFile(join(process.cwd(),'data','products.json'),'utf8'));
  for (const [index,item] of products.entries()) {
    if (!item.author || item.author === 'Pexels' || !item.source.startsWith('https://www.pexels.com/photo/')) throw new Error(`Thiếu nguồn ảnh ${item.sku}`);
    await access(join(process.cwd(),'public','images',`product-${String(index+1).padStart(2,'0')}.jpg`));
  }
  async function expectConstraint(sql, params, code) {
    await client.query('BEGIN');
    try {
      await client.query(sql,params);
      throw new Error(`Ràng buộc ${code} không hoạt động`);
    } catch (error) {
      if (error.code !== code) throw error;
    } finally {
      await client.query('ROLLBACK');
    }
  }
  await expectConstraint(`INSERT INTO products(category_id,sku,slug,name,price_vnd,opening_stock,image_path)
    VALUES(1,'VERIFY-INVALID','verify-invalid','Invalid',-1,0,'/invalid.jpg')`,[],'23514');
  await expectConstraint(`INSERT INTO order_items(order_id,product_id,product_name,unit_price_vnd,quantity,line_total_vnd)
    VALUES(0,1,'Invalid',1,1,1)`,[],'23503');
  console.log(`${row.database}: ${row.products} sản phẩm, ${row.customers} khách, ${row.orders} đơn; tiền, tồn và ${products.length} ảnh hợp lệ.`);
} finally { await client.end(); }
