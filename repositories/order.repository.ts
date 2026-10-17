import "server-only";
import { getPool } from "@/lib/db";
import type { PoolClient } from "pg";

export type CartLine = { productId: number; quantity: number };
export type LockedProduct = { id: number; name: string; price_vnd: number; image_path: string; stock: number };

export async function transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const value = await work(client);
    await client.query("COMMIT");
    return value;
  } catch (error) { await client.query("ROLLBACK"); throw error; }
  finally { client.release(); }
}

export async function lockProducts(client: PoolClient, ids: number[]): Promise<LockedProduct[]> {
  // Ordered row locks prevent deadlocks between carts containing the same products.
  const locked = await client.query(`SELECT id FROM products WHERE id=ANY($1::bigint[]) AND active=true ORDER BY id FOR UPDATE`, [ids]);
  if (locked.rowCount !== ids.length) throw new Error("Một sản phẩm không còn bán");
  const result = await client.query(`SELECT p.id::int,p.name,p.price_vnd::float8,p.image_path,
    (p.opening_stock+COALESCE((SELECT SUM(quantity_delta) FROM inventory_movements WHERE product_id=p.id),0))::int AS stock
    FROM products p WHERE p.id=ANY($1::bigint[]) ORDER BY p.id`, [ids]);
  return result.rows;
}

export async function insertOrder(client: PoolClient, input: {
  code: string; userId: string | null; name: string; email: string; phone: string; address: string;
  city: string; note: string; method: "cod" | "stripe"; lines: { product: LockedProduct; quantity: number }[]; total: number;
}) {
  const customer = await client.query(`INSERT INTO customers(full_name,email) VALUES($1,$2)
    ON CONFLICT(email) DO UPDATE SET full_name=EXCLUDED.full_name RETURNING id`, [input.name,input.email]);
  const order = await client.query(`INSERT INTO orders(code,user_id,customer_id,status,source,total_vnd,recipient_name,phone,address_line,city,delivery_note)
    VALUES($1,$2,$3,'pending',$4,$5,$6,$7,$8,$9,$10) RETURNING id::text`,
    [input.code,input.userId,customer.rows[0].id,input.method === "stripe" ? "stripe" : "web",input.total,input.name,input.phone,input.address,input.city,input.note]);
  const orderId = order.rows[0].id as string;
  for (const { product, quantity } of input.lines) {
    await client.query(`INSERT INTO order_items(order_id,product_id,product_name,unit_price_vnd,quantity,line_total_vnd)
      VALUES($1,$2,$3,$4,$5,$6)`, [orderId,product.id,product.name,product.price_vnd,quantity,product.price_vnd*quantity]);
    await client.query(`INSERT INTO inventory_movements(product_id,order_id,quantity_delta,reason)
      VALUES($1,$2,$3,'reserve')`, [product.id,orderId,-quantity]);
  }
  await client.query(`INSERT INTO payments(order_id,provider,status,amount_vnd)
    VALUES($1,$2,'pending',$3)`, [orderId,input.method,input.total]);
  return orderId;
}

export async function listOrdersForUser(userId: string) {
  const result = await getPool().query(`SELECT o.id::text,o.code,o.status,o.fulfillment_status,o.total_vnd::float8,
    o.placed_at::text,p.provider,p.status AS payment_status,
    COALESCE(json_agg(json_build_object('name',i.product_name,'quantity',i.quantity,'price',i.unit_price_vnd::float8)) FILTER(WHERE i.id IS NOT NULL),'[]') AS items
    FROM orders o JOIN payments p ON p.order_id=o.id LEFT JOIN order_items i ON i.order_id=o.id
    WHERE o.user_id=$1 GROUP BY o.id,p.id ORDER BY o.placed_at DESC`, [userId]);
  return result.rows;
}

export async function listAdminOrders() {
  const result = await getPool().query(`SELECT o.id::text,o.code,o.status,o.fulfillment_status,o.total_vnd::float8,
    o.placed_at::text,o.recipient_name,o.phone,o.address_line,o.city,
    p.provider,p.status AS payment_status,COALESCE(c.full_name,'Khách lẻ') AS customer
    FROM orders o JOIN payments p ON p.order_id=o.id LEFT JOIN customers c ON c.id=o.customer_id
    ORDER BY o.placed_at DESC`);
  return result.rows;
}

export async function getOrderForUpdate(client: PoolClient, orderId: string) {
  const result = await client.query(`SELECT o.id::text,o.user_id::text,o.status,o.fulfillment_status,p.provider,p.status AS payment_status
    FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.id=$1 FOR UPDATE OF o,p`, [orderId]);
  return result.rows[0] ?? null;
}

export async function releaseOrder(client: PoolClient, orderId: string) {
  await client.query(`INSERT INTO inventory_movements(product_id,order_id,quantity_delta,reason)
    SELECT product_id,order_id,-quantity_delta,'release' FROM inventory_movements
    WHERE order_id=$1 AND reason='reserve'
    ON CONFLICT(order_id,product_id,reason) DO NOTHING`, [orderId]);
  await client.query(`UPDATE orders SET status='cancelled',fulfillment_status='cancelled' WHERE id=$1`, [orderId]);
  await client.query(`UPDATE payments SET status='expired' WHERE order_id=$1 AND status='pending'`, [orderId]);
}

export async function fulfillOrder(client: PoolClient, orderId: string, next: string, provider: string) {
  if (next === "delivered" && provider === "cod") {
    await client.query(`UPDATE inventory_movements SET reason='sale' WHERE order_id=$1 AND reason='reserve'`, [orderId]);
    await client.query(`UPDATE payments SET status='paid',completed_at=now() WHERE order_id=$1 AND provider='cod'`, [orderId]);
    await client.query(`UPDATE orders SET status='paid' WHERE id=$1 AND status='pending'`, [orderId]);
  }
  await client.query(`UPDATE orders SET fulfillment_status=$1 WHERE id=$2`, [next,orderId]);
}
