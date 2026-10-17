import Link from "next/link";
import StoreHeader from "@/app/store/StoreHeader";
import OrdersView from "./OrdersView";
import { requireUser } from "@/lib/session";
import { listOrdersForUser } from "@/services/order.service";
import { signOut } from "@/auth";
export const dynamic = "force-dynamic";
export default async function OrdersPage() { const user = await requireUser(); const orders = await listOrdersForUser(user.id); return <div className="storefront"><StoreHeader user={user}/><main className="store-container"><div className="store-page-heading"><span className="store-overline">TÀI KHOẢN CỦA TÔI</span><h1>Đơn hoa của bạn<span>.</span></h1><p>{user.name} · {user.email}</p><form action={async () => { "use server"; await signOut({ redirectTo:"/" }); }}><button className="store-text-button">Đăng xuất</button></form></div><OrdersView orders={orders}/><Link href="/products">← Tiếp tục chọn hoa</Link></main></div>; }
