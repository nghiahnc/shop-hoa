import { listProducts, listCategories } from '@/repositories/catalog.repository';
import { currentUser } from '@/lib/session';
import Header from '@/components/boutique/Header';
import EditorialHome from '@/components/boutique/EditorialHome';
import ProductCard from '@/app/store/ProductCard';
export const dynamic = 'force-dynamic';
export default async function Home() {
  const [products, categories, user] = await Promise.all([listProducts(), listCategories(), currentUser()]);
  return <><Header hero user={user} categories={categories}/><EditorialHome>{products.slice(0, 4).map(product => <ProductCard key={product.id} product={product}/>)}{!products.length && <p className="bt-empty">Bộ sưu tập đang được cập nhật. Mời bạn ghé lại sau.</p>}</EditorialHome></>;
}
