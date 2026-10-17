import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { CurrentUser } from "@/lib/session";
import { transaction, lockProducts, insertOrder, getOrderForUpdate, releaseOrder, fulfillOrder, listOrdersForUser, listAdminOrders } from "@/repositories/order.repository";

export const orderSchema = z.object({
  items: z.array(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20) })).min(1).max(20),
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().regex(/^[0-9+(). -]{9,20}$/),
  address: z.string().trim().min(5).max(250),
  city: z.string().trim().min(2).max(100),
  note: z.string().trim().max(500).default(""),
  email: z.email().optional(),
  method: z.enum(["cod","stripe"]),
});
export type OrderInput = z.infer<typeof orderSchema>;

export class OrderError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export async function placeOrder(user: CurrentUser, raw: unknown) {
  const parsed = orderSchema.safeParse(raw);
  if (!parsed.success) throw new OrderError("Thông tin nhận hàng hoặc giỏ hàng chưa hợp lệ");
  const data = parsed.data;
  const quantities = new Map<number, number>();
  for (const line of data.items) quantities.set(line.productId, (quantities.get(line.productId) ?? 0) + line.quantity);
  if ([...quantities.values()].some((quantity) => quantity > 20)) throw new OrderError("Tối đa 20 sản phẩm mỗi loại");
  return transaction(async (client) => {
    const ids = [...quantities.keys()].sort((a,b) => a-b);
    const products = await lockProducts(client, ids);
    const lines = products.map((product) => ({ product, quantity: quantities.get(product.id)! }));
    if (lines.some(({ product, quantity }) => product.stock < quantity)) throw new OrderError("Một sản phẩm không đủ tồn kho", 409);
    const total = lines.reduce((sum, { product, quantity }) => sum + product.price_vnd * quantity, 0);
    if (!Number.isSafeInteger(total)) throw new OrderError("Giá trị đơn hàng không hợp lệ");
    const code = `MH-${randomUUID().slice(0,8).toUpperCase()}`;
    const orderId = await insertOrder(client, {
      code,userId:user.id,name:data.name,email:user.role === "admin" && data.email ? data.email : user.email,phone:data.phone,address:data.address,
      city:data.city,note:data.note,method:data.method,lines,total,
    });
    return { orderId, code, total, lines, method: data.method };
  });
}

export async function cancelOrder(orderId: string, user: CurrentUser) {
  return transaction(async (client) => {
    const order = await getOrderForUpdate(client, orderId);
    if (!order || (user.role !== "admin" && order.user_id !== user.id)) throw new OrderError("Không tìm thấy đơn hàng", 404);
    if (order.provider !== "cod" || order.status !== "pending" || !["new","confirmed"].includes(order.fulfillment_status)) throw new OrderError("Đơn không thể hủy ở trạng thái này", 409);
    await releaseOrder(client, orderId);
  });
}

export async function abortStripeOrder(orderId: string) {
  return transaction(async (client) => {
    const order = await getOrderForUpdate(client, orderId);
    if (!order || order.provider !== "stripe" || order.status !== "pending") return;
    await releaseOrder(client, orderId);
    await client.query(`UPDATE payments SET status='failed' WHERE order_id=$1`, [orderId]);
  });
}

const nextStates: Record<string,string[]> = { new:["confirmed","cancelled"], confirmed:["shipping","cancelled"], shipping:["delivered"], delivered:[], cancelled:[] };
export async function advanceOrder(orderId: string, next: string) {
  return transaction(async (client) => {
    const order = await getOrderForUpdate(client, orderId);
    if (!order) throw new OrderError("Không tìm thấy đơn hàng", 404);
    if (["cancelled","needs_review"].includes(order.status)) throw new OrderError("Đơn này không thể chuyển trạng thái", 409);
    if (!nextStates[order.fulfillment_status]?.includes(next)) throw new OrderError("Chuyển trạng thái không hợp lệ", 409);
    if (next === "delivered" && order.provider !== "cod" && order.payment_status !== "paid") throw new OrderError("Đơn cần thanh toán trước khi giao", 409);
    if (next === "cancelled") {
      if (order.provider !== "cod" || order.status !== "pending") throw new OrderError("Chỉ có thể hủy đơn COD chưa thanh toán", 409);
      await releaseOrder(client, orderId);
    } else await fulfillOrder(client, orderId, next, order.provider);
  });
}

export { listOrdersForUser, listAdminOrders };
