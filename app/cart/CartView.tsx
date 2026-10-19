"use client";
import Image from 'next/image';
import Link from "next/link";
import { useEffect,useState } from "react";
import { readCart,saveCart,type CartItem } from "@/lib/cart";
import type { CatalogProduct } from "@/repositories/catalog.repository";
const money = (v:number) => new Intl.NumberFormat("vi-VN").format(v) + " ₫";
export default function CartView({ products }: { products: CatalogProduct[] }) {
  const [ready, setReady] = useState(false);
  const [items,setItems] = useState<CartItem[]>([]);
  useEffect(() => { setItems(readCart()); setReady(true); }, []);
  const rows = items.map((item) => ({ item, product: products.find((p) => p.id === item.productId) })).filter((row) => row.product);
  const total = rows.reduce((sum,row) => sum+row.product!.price_vnd*row.item.quantity,0);
  function change(id:number,quantity:number) { const next = quantity < 1 ? items.filter((item) => item.productId !== id) : items.map((item) => item.productId === id ? { ...item,quantity:Math.min(20,quantity) } : item); setItems(next); saveCart(next); }
if (!ready) return <div className="bt-loading" role="status">Đang tải giỏ hàng...</div>;
    return <main className="store-container"><div className="store-page-heading"><span className="store-overline">BƯỚC 01 / 02</span><h1>Giỏ hoa của bạn<span>.</span></h1><p>Kiểm tra từng bó hoa trước khi gửi lời thương.</p></div>{rows.length ? <div className="store-cart-layout"><div className="store-cart-list">{rows.map(({item,product}) => <div className="store-cart-item" key={item.productId}><Image width={900} height={1100} sizes="(max-width: 767px) 50vw, 33vw" src={product!.image_path} alt={product!.name}/><div><small>{product!.category}</small><Link href={`/products/${product!.slug}`}><h3>{product!.name}</h3></Link><p>{money(product!.price_vnd)}</p><button className="store-text-button" onClick={() => change(item.productId,0)}>Xóa</button></div><div className="store-quantity"><button aria-label="Giảm số lượng" onClick={() => change(item.productId,item.quantity-1)}>−</button><span>{item.quantity}</span><button aria-label="Tăng số lượng" disabled={item.quantity >= Math.min(20,product!.stock)} onClick={() => change(item.productId,item.quantity+1)}>+</button></div><strong>{money(product!.price_vnd*item.quantity)}</strong></div>)}</div><aside className="store-summary"><span className="store-overline">TỔNG ĐƠN HÀNG</span><h2>Chi tiết giỏ hàng</h2><div><span>Tạm tính</span><b>{money(total)}</b></div><div><span>Vận chuyển demo</span><b>Miễn phí</b></div><div className="store-summary-total"><span>Tổng cộng</span><strong>{money(total)}</strong></div><Link className="store-primary-link" href="/checkout">Tiếp tục đặt hàng ↗</Link><small>Giá và tồn kho được xác nhận lại khi đặt đơn.</small></aside></div> : <div className="store-empty"><h2>Giỏ hoa đang trống</h2><p>Chọn một bó hoa để bắt đầu câu chuyện.</p><Link className="store-primary-link" href="/products">Khám phá hoa tươi ↗</Link></div>}</main>;
}
