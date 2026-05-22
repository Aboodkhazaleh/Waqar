import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Waqar Admin",
  description: "Admin dashboard for Waqar — Jordanian luxury fashion brand.",
  robots: "noindex, nofollow",
};

export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
