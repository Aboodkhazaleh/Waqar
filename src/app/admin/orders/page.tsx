import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import OrdersClient from "./OrdersClient";
import { fetchOrders } from "@/lib/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function OrdersPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const orders = await fetchOrders();
  return (
    <AdminLayout title="الطلبات">
      <OrdersClient initialOrders={orders} />
    </AdminLayout>
  );
}
