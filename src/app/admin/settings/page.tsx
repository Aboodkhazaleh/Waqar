import { redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/auth";
import AdminLayout from "@/components/admin/AdminLayout";
import SettingsClient from "./SettingsClient";
import { fetchSettings } from "@/lib/firestore";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SettingsPage() {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
  const settings = await fetchSettings();
  return (
    <AdminLayout title="الإعدادات">
      <SettingsClient initialSettings={settings} />
    </AdminLayout>
  );
}
