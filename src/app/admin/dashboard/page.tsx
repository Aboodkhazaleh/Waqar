import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import DashboardClient from "./DashboardClient";
import { fetchProductsServer, fetchOrdersServer } from "@/lib/firestoreServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function DashboardPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");

  const [products, orders] = await Promise.all([
    fetchProductsServer(),
    fetchOrdersServer(),
  ]);

  return (
    <AdminLayout title="لوحة التحكم">
      <DashboardClient
        initialProducts={products}
        initialOrders={orders}
      />
    </AdminLayout>
  );
}
