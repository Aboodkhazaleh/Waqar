import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import ProductsClient from "./ProductsClient";
import { fetchProducts } from "@/lib/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ProductsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const products = await fetchProducts();
  return (
    <AdminLayout title="إدارة المنتجات">
      <ProductsClient initialProducts={products} />
    </AdminLayout>
  );
}
