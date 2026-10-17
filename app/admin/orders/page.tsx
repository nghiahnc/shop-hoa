import AdminShell from "@/app/admin/AdminShell";
import AdminOrders from "./AdminOrders";
import { requireAdmin } from "@/lib/session";
import { listAdminOrders } from "@/services/order.service";
export const dynamic = "force-dynamic";
export default async function AdminOrdersPage() { await requireAdmin(); const orders = await listAdminOrders(); return <AdminShell title="Đơn hàng"><div className="page-heading"><div><span className="eyebrow">XỬ LÝ ĐƠN HOA</span><h1>Đơn hàng.</h1><p>Theo dõi và cập nhật hành trình giao hoa.</p></div></div><AdminOrders orders={orders}/></AdminShell>; }
