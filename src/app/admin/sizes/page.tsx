import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import SizesClient from "./SizesClient";
import { fetchSizes } from "@/lib/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SizesPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const sizes = await fetchSizes();
  return (
    <AdminLayout title="إدارة المقاسات">
      <SizesClient initialSizes={sizes} />
    </AdminLayout>
  );
}
