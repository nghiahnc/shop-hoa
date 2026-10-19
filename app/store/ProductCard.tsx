"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState } from "react";
import { addCart } from "@/lib/cart";
import type { CatalogProduct } from "@/repositories/catalog.repository";

const money = (v:number) => new Intl.NumberFormat("vi-VN").format(v) + " ₫";
export default function ProductCard({ product }: { product: CatalogProduct }) {
  const [added,setAdded] = useState(false);
  return <article className="store-product-card"><Link href={`/products/${product.slug}`} className="store-product-photo"><Image width={900} height={1100} sizes="(max-width: 767px) 50vw, 33vw" src={product.image_path} alt={product.name}/><span>{product.occasion}</span></Link>
    <div className="store-product-details"><small>{product.category} · {product.flower_style}</small><Link href={`/products/${product.slug}`}><h3>{product.name}</h3></Link><p>{product.description}</p>
      <div className="store-product-bottom"><strong>{money(product.price_vnd)}</strong><button type="button" aria-label={`Thêm ${product.name} vào giỏ`} disabled={product.stock < 1} onClick={() => { addCart(product.id); setAdded(true); setTimeout(() => setAdded(false),1800); }}>{product.stock < 1 ? "Hết hàng" : added ? "Đã thêm ✓" : "Thêm vào giỏ +"}</button></div><span className="bt-sr-only" role="status">{added ? `Đã thêm ${product.name} vào giỏ hàng.` : ''}</span></div>
  </article>;
}
