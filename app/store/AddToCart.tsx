"use client";
import { useState } from "react";
import { addCart } from "@/lib/cart";
import Link from "next/link";

export default function AddToCart({ id, stock }: { id: number; stock: number }) {
  const [quantity,setQuantity] = useState(1);
  const [added,setAdded] = useState(false);
  return <div className="store-add-row"><label>Số lượng<input type="number" min="1" max={Math.min(20,stock)} value={quantity} onChange={(event) => setQuantity(Number(event.target.value))}/></label><button disabled={!stock || !Number.isInteger(quantity) || quantity < 1 || quantity > Math.min(20,stock)} onClick={() => { addCart(id,quantity); setAdded(true); }}> {added ? "Đã thêm vào giỏ ✓" : "Thêm vào giỏ hàng"}</button>{added && <Link href="/cart">Xem giỏ hàng →</Link>}</div>;
}
