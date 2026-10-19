import Image from 'next/image';
import Link from "next/link";
import { notFound } from "next/navigation";
import StoreHeader from "@/app/store/StoreHeader";
import AddToCart from "@/app/store/AddToCart";
import ProductCard from "@/app/store/ProductCard";
import { getProduct,listProducts } from "@/repositories/catalog.repository";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
const money = (v:number) => new Intl.NumberFormat("vi-VN").format(v) + " ₫";
export default async function ProductDetail({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const [product,user] = await Promise.all([getProduct(slug),currentUser()]);
  if (!product) notFound();
  const related = (await listProducts({ category: "" })).filter((p) => p.id !== product.id).slice(0,3);
  return <div className="storefront"><StoreHeader user={user}/><main className="store-container"><div className="store-breadcrumb"><Link href="/">Trang chủ</Link> / <Link href="/products">Sản phẩm</Link> / {product.name}</div><div className="store-detail"><div className="store-detail-image"><Image width={900} height={1100} sizes="(max-width: 767px) 50vw, 33vw" src={product.image_path} alt={product.name}/></div><div className="store-detail-info"><span className="store-overline">{product.category} · {product.occasion}</span><h1>{product.name}</h1><p className="store-detail-price">{money(product.price_vnd)}</p><p>{product.description}</p><div className="store-detail-tags"><span>Phong cách: {product.flower_style}</span><span>{product.stock > 0 ? `Còn ${product.stock} bó` : "Hết hàng"}</span><span>Mã: {product.sku}</span></div><AddToCart id={product.id} stock={product.stock}/><div className="store-detail-note">✿ Mỗi bó hoa được chuẩn bị theo đơn. Hình ảnh minh họa từ bộ sưu tập Mộc Hoa.</div></div></div><section className="store-section"><div className="store-section-head"><div><span className="store-overline">CÓ THỂ BẠN THÍCH</span><h2>Thêm một chút cảm hứng</h2></div></div><div className="store-products">{related.map((item) => <ProductCard product={item} key={item.id}/>)}</div></section></main></div>;
}
