import Link from "next/link";
import StoreHeader from "@/app/store/StoreHeader";
import ProductCard from "@/app/store/ProductCard";
import { listProducts,listCategories,listOccasions } from "@/repositories/catalog.repository";
import { currentUser } from "@/lib/session";

export const dynamic = "force-dynamic";
export default async function Products({ searchParams }: { searchParams: Promise<{ q?: string; category?: string; occasion?: string }> }) {
  const query = await searchParams;
  const [products,categories,occasions,user] = await Promise.all([listProducts(query),listCategories(),listOccasions(),currentUser()]);
  return <div className="storefront"><StoreHeader user={user}/><main className="store-container"><div className="store-page-heading"><span className="store-overline">MỘC HOA / BỘ SƯU TẬP</span><h1>Chọn bó hoa của bạn<span>.</span></h1><p>Từ một lời chúc giản dị đến một dịp thật đặc biệt.</p></div>
    <form className="store-filter" action="/products"><label>Tìm hoa<input type="search" name="q" defaultValue={query.q ?? ""} placeholder="Tên hoa, màu sắc, cảm hứng..."/></label><label>Danh mục<select name="category" defaultValue={query.category ?? ""}><option value="">Tất cả danh mục</option>{categories.map((item) => <option key={item.id} value={item.slug}>{item.name}</option>)}</select></label><label>Dịp tặng<select name="occasion" defaultValue={query.occasion ?? ""}><option value="">Mọi dịp</option>{occasions.map((item) => <option key={item}>{item}</option>)}</select></label><button>Tìm kiếm</button><Link href="/products">Xóa lọc</Link></form>
    <div className="store-results"><b>{products.length} sản phẩm</b><span>Hoa tươi được lựa chọn cho từng dịp</span></div>
    {products.length ? <div className="store-products">{products.map((product) => <ProductCard product={product} key={product.id}/>)}</div> : <div className="store-empty"><h2>Chưa tìm thấy bó hoa phù hợp</h2><p>Thử đổi từ khóa hoặc bộ lọc.</p><Link href="/products">Xem tất cả hoa →</Link></div>}
  </main></div>;
}
