import StoreHeader from "@/app/store/StoreHeader";
import CartView from "./CartView";
import { listProducts } from "@/repositories/catalog.repository";
import { currentUser } from "@/lib/session";
export const dynamic = "force-dynamic";
export default async function CartPage() { const [products,user] = await Promise.all([listProducts(),currentUser()]); return <div className="storefront"><StoreHeader user={user}/><CartView products={products}/></div>; }
