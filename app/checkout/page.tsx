import StoreHeader from "@/app/store/StoreHeader";
import CheckoutForm from "./CheckoutForm";
import { requireUser } from "@/lib/session";
import { listProducts } from "@/repositories/catalog.repository";
export const dynamic = "force-dynamic";
export default async function CheckoutPage() { const [user,products] = await Promise.all([requireUser("/checkout"),listProducts()]); return <div className="storefront"><StoreHeader user={user}/><CheckoutForm user={user} products={products} stripeConfigured={Boolean(process.env.STRIPE_SECRET_KEY?.startsWith("sk_test_"))}/></div>; }
