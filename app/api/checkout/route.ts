import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prepareDemoCustomer, demoCheckoutText } from "@/lib/stripe-demo";
import { currentUser } from "@/lib/session";
import { placeOrder, abortStripeOrder, OrderError } from "@/services/order.service";
import { getPool } from "@/lib/db";

export const runtime = "nodejs";

function isCurrencyError(error: unknown) {
  const value = error as { code?: string; param?: string; message?: string };
  return value?.code === "invalid_currency" || Boolean(value?.param?.includes("currency")) || /currency.*(unsupported|not supported|invalid)/i.test(value?.message ?? "");
}

export async function POST(request: NextRequest) {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Vui lòng đăng nhập" }, { status: 401 });
  const email = user.email;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key?.startsWith("sk_test_")) return NextResponse.json({ error: "Stripe sandbox chưa được cấu hình. Hãy chọn thanh toán COD." }, { status: 503 });
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 }); }
  if (!body.items && body.productId) body = {
    items: [{ productId: Number(body.productId), quantity: Number(body.quantity) }],
    name: String(body.customerName ?? user.name), email: String(body.customerEmail ?? user.email), phone: "0900000000",
    address: "Đơn thử tại Mộc Hoa", city: "Hồ Chí Minh", note: "Đơn thử từ dashboard", method: "stripe",
  };
  let order: Awaited<ReturnType<typeof placeOrder>>;
  try { order = await placeOrder(user, { ...body, method: "stripe" }); }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Không thể tạo đơn" }, { status: error instanceof OrderError ? error.status : 500 }); }
  const stripe = new Stripe(key); const demoName = String(body.name ?? user.name);
  const rate = Number(process.env.DEMO_VND_PER_USD ?? "26000");
  const preferred = process.env.STRIPE_CHECKOUT_CURRENCY?.toUpperCase() === "USD" ? "USD" : "VND";
  const origin = request.nextUrl.origin;
  let demoCustomer: string | undefined;
  async function makeSession(currency: "VND" | "USD") {
    demoCustomer ??= await prepareDemoCustomer(stripe, { orderId: order.orderId, shop: "MH", name: demoName, email: email });
    if (currency === "USD" && (!Number.isSafeInteger(rate) || rate <= 0)) throw new Error("DEMO_VND_PER_USD không hợp lệ");
    return stripe.checkout.sessions.create({
      mode: "payment", allowed_payment_method_types: ["card"],
      line_items: order.lines.map(({ product, quantity }) => ({
        price_data: { currency: currency.toLowerCase(), unit_amount: currency === "USD" ? Math.max(1,Math.round(product.price_vnd/rate*100)) : product.price_vnd,
          product_data: { name: product.name } }, quantity,
      })),
      metadata: { order_id: order.orderId, shop: "MH" }, customer: demoCustomer, custom_text: demoCheckoutText,
      success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/checkout/cancel?order=${order.code}`,
    }, { idempotencyKey: `shop-MH-${order.orderId}-${currency}` });
  }
  try {
    let currency: "VND" | "USD" = preferred;
    let session: Stripe.Checkout.Session;
    try { session = await makeSession(currency); }
    catch (error) { if (currency !== "VND" || !isCurrencyError(error)) throw error; currency = "USD"; session = await makeSession(currency); }
    await getPool().query(`UPDATE payments SET stripe_session_id=$1,charge_currency=$2,charge_amount=$3,demo_rate_vnd_per_usd=$4 WHERE order_id=$5`,
      [session.id,currency,session.amount_total,currency === "USD" ? rate : null,order.orderId]);
    return NextResponse.json({ url: session.url, orderCode: order.code, currency });
  } catch (error) {
    await abortStripeOrder(order.orderId);
    return NextResponse.json({ error: error instanceof Error ? `Stripe sandbox: ${error.message}` : "Không thể mở Stripe Checkout" }, { status: 502 });
  }
}
