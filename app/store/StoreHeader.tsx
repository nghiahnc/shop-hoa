"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { readCart } from "@/lib/cart";

export default function StoreHeader({ user }: { user: { name: string; role: string } | null }) {
  const [count,setCount] = useState(0);
  useEffect(() => {
    const update = () => setCount(readCart().reduce((sum,item) => sum+item.quantity,0));
    update(); window.addEventListener("moc-hoa-cart",update); window.addEventListener("storage",update);
    return () => { window.removeEventListener("moc-hoa-cart",update); window.removeEventListener("storage",update); };
  }, []);
  return <><div className="store-announcement">Gửi một chút thương, nhận cả mùa hoa · Miễn phí vận chuyển trong bản demo</div>
    <header className="store-header"><div className="store-header-inner">
      <Link className="store-logo" href="/"><span className="store-logo-icon">✿</span><span>Mộc Hoa<small>FLOWER STUDIO</small></span></Link>
      <nav aria-label="Điều hướng cửa hàng"><Link href="/">Trang chủ</Link><Link href="/products">Hoa tươi</Link><Link href="/products?occasion=Sinh%20nhật">Theo dịp</Link><Link href="/account/orders">Đơn của tôi</Link></nav>
      <div className="store-header-actions">{user ? <Link href={user.role === "admin" ? "/admin" : "/account/orders"} className="store-user-link">Xin chào, {user.name.split(" ").at(-1)}</Link> : <Link href="/login">Đăng nhập</Link>}<Link href="/cart" className="store-cart-link" aria-label={`Giỏ hàng có ${count} sản phẩm`}>Giỏ hàng <b>{count}</b></Link></div>
    </div></header></>;
}
