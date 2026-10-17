"use client";
import Link from "next/link";
import { demo } from "@/lib/demo";
import { DemoNote, DemoCardNote } from "@/components/DemoFields";
import { useEffect,useState } from "react";
import { useRouter } from "next/navigation";
import { clearCart,readCart,type CartItem } from "@/lib/cart";
import type { CatalogProduct } from "@/repositories/catalog.repository";
const money = (v:number) => new Intl.NumberFormat("vi-VN").format(v) + " ₫";
export default function CheckoutForm({ user,products,stripeConfigured }: { user:{name:string;email:string}; products:CatalogProduct[]; stripeConfigured:boolean }) {
  const router = useRouter();
  const [items,setItems] = useState<CartItem[]>([]);
  const [method,setMethod] = useState<"cod"|"stripe">(stripeConfigured ? "stripe" : "cod");
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState("");
  useEffect(() => { setItems(readCart()); }, []);
  const rows = items.map((item) => ({ item, product: products.find((p) => p.id === item.productId) })).filter((row) => row.product);
  const total = rows.reduce((sum,row) => sum+row.product!.price_vnd*row.item.quantity,0);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const fields = new FormData(event.currentTarget);
    const payload = { items, name:String(fields.get("name")), phone:String(fields.get("phone")), address:String(fields.get("address")), city:String(fields.get("city")), note:String(fields.get("note") ?? ""), method };
    try {
      const response = await fetch(method === "cod" ? "/api/orders" : "/api/checkout", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Không thể tạo đơn");
      if (method === "stripe") { window.location.href = result.url; return; }
      clearCart(); router.push(`/checkout/placed?code=${encodeURIComponent(result.code)}`);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Có lỗi xảy ra"); setBusy(false); }
  }
  return <main className="store-container"><div className="store-page-heading"><span className="store-overline">BƯỚC 02 / 02</span><h1>Gửi lời thương<span>.</span></h1><p>Điền thông tin nhận hàng và hoàn tất đơn hoa của bạn.</p></div>{rows.length ? <form className="store-checkout-layout" onSubmit={submit}><div className="store-checkout-fields"><section className="store-form-card"><span className="store-overline">01 / NGƯỜI NHẬN</span><h2>Thông tin giao hàng</h2><DemoNote>Họ tên, điện thoại, địa chỉ và ghi chú đã điền sẵn. Bạn có thể giữ nguyên rồi bấm đặt hàng.</DemoNote><div className="store-form-grid"><label>Họ và tên<input name="name" required minLength={2} maxLength={100} defaultValue={user.name || demo.name}/></label><label>Số điện thoại<input name="phone" defaultValue={demo.phone} required placeholder="090 123 4567" pattern="[0-9+(). -]{9,20}"/></label></div><label>Địa chỉ nhận hoa<input name="address" defaultValue={demo.address} required minLength={5} maxLength={250} placeholder="Số nhà, đường, phường/xã"/></label><label>Tỉnh / thành phố<input name="city" defaultValue={demo.city} required minLength={2} maxLength={100} placeholder="Ví dụ: Hồ Chí Minh"/></label><label>Lời nhắn cho tiệm<textarea name="note" defaultValue={demo.note} maxLength={500} placeholder="Thời gian giao mong muốn, lời nhắn trên thiệp..."/></label><p>Email xác nhận tài khoản: <b>{user.email}</b></p></section><section className="store-form-card"><span className="store-overline">02 / THANH TOÁN</span><h2>Phương thức thanh toán</h2><label className="store-radio"><input type="radio" checked={method === "cod"} onChange={() => setMethod("cod")}/><span><b>Thanh toán khi nhận hàng</b><small>Đặt đơn ngay, không cần thẻ.</small></span></label><label className="store-radio"><input type="radio" checked={method === "stripe"} disabled={!stripeConfigured} onChange={() => setMethod("stripe")}/><span><b>Stripe Checkout · sandbox</b><small>{stripeConfigured ? "Thanh toán thử bằng thẻ test." : "Chưa cấu hình khóa Stripe test; hãy dùng COD."}</small></span></label>{method === "stripe" && <DemoCardNote/>}</section></div><aside className="store-summary"><span className="store-overline">ĐƠN HÀNG CỦA BẠN</span><h2>{rows.length} mẫu hoa</h2>{rows.map(({item,product}) => <div className="store-checkout-line" key={item.productId}><img src={product!.image_path} alt=""/><span>{product!.name}<small>SL: {item.quantity}</small></span><b>{money(product!.price_vnd*item.quantity)}</b></div>)}<div className="store-summary-total"><span>Tổng cộng</span><strong>{money(total)}</strong></div><button className="store-primary-link" disabled={busy}>{busy ? "Đang xử lý..." : method === "cod" ? "Đặt hàng COD ↗" : "Tiếp tục đến Stripe ↗"}</button><small>Miễn phí vận chuyển trong bản demo. Giá cuối cùng do server xác nhận.</small>{error && <p className="store-error" role="alert">{error}</p>}<Link href="/cart">← Quay lại giỏ hàng</Link></aside></form> : <div className="store-empty"><h2>Chưa có sản phẩm trong giỏ</h2><Link href="/products">Xem hoa tươi →</Link></div>}</main>;
}
