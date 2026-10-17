"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
const money = (v:number) => new Intl.NumberFormat("vi-VN").format(v) + " ₫";
const labels:Record<string,string> = { new:"Mới đặt",confirmed:"Đã xác nhận",shipping:"Đang giao",delivered:"Đã giao",cancelled:"Đã hủy" };
type Order = { id:string;code:string;status:string;fulfillment_status:string;total_vnd:number;placed_at:string;provider:string;payment_status:string;items:{name:string;quantity:number;price:number}[] };
export default function OrdersView({ orders }: { orders:Order[] }) {
  const router = useRouter(); const [busy,setBusy] = useState(""); const [error,setError] = useState("");
  async function cancel(id:string) { setBusy(id); setError(""); const response = await fetch(`/api/orders/${id}/cancel`, { method:"POST" }); const result = await response.json(); if (!response.ok) setError(result.error); else router.refresh(); setBusy(""); }
  if (!orders.length) return <div className="store-empty"><h2>Chưa có đơn hoa nào</h2><p>Bó hoa đầu tiên đang chờ bạn chọn.</p></div>;
  return <div className="store-orders">{orders.map((order) => <article className="store-order" key={order.id}><div className="store-order-top"><div><span className="store-overline">{order.code}</span><h3>{new Intl.DateTimeFormat("vi-VN",{dateStyle:"medium"}).format(new Date(order.placed_at))}</h3></div><span className={`store-order-status status-${order.fulfillment_status}`}>{labels[order.fulfillment_status] ?? order.fulfillment_status}</span></div><div className="store-order-lines">{order.items.map((item,index) => <p key={index}>{item.name} <span>× {item.quantity}</span></p>)}</div><div className="store-order-bottom"><span>{order.provider === "cod" ? "Thanh toán khi nhận" : "Stripe sandbox"} · {order.payment_status === "paid" ? "Đã thanh toán" : "Chưa thanh toán"}</span><strong>{money(order.total_vnd)}</strong>{order.status === "pending" && ["new","confirmed"].includes(order.fulfillment_status) && <button disabled={busy === order.id} onClick={() => cancel(order.id)}>Hủy đơn</button>}</div></article>)}{error && <p className="store-error" role="alert">{error}</p>}</div>;
}
