"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronLeft,
  BarChart3,
  Ruler,
} from "lucide-react";

const navItems = [
  { href: "/admin/dashboard", icon: LayoutDashboard, label: "لوحة التحكم" },
  { href: "/admin/products", icon: Package, label: "المنتجات" },
  { href: "/admin/sizes", icon: Ruler, label: "المقاسات" },
  { href: "/admin/orders", icon: ShoppingBag, label: "الطلبات" },
  { href: "/admin/settings", icon: Settings, label: "الإعدادات" },
];

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
}

export default function AdminLayout({ children, title }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-6 border-b border-[#252525]">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image src="/images/logo/waqar-logo.png" alt="وقار" fill className="object-contain" />
          </div>
          <div>
            <p className="font-arabic text-sm font-bold text-white">وقار</p>
            <p className="font-arabic text-xs text-white/30">لوحة الإدارة</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-arabic text-sm transition-all duration-200 ${
                isActive
                  ? "bg-[#3DB4C4]/15 text-[#3DB4C4] border border-[#3DB4C4]/20"
                  : "text-white/50 hover:text-white hover:bg-[#1C1C1C]"
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* View Site */}
      <div className="p-4 border-t border-[#252525]">
        <a
          href="/"
          target="_blank"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-arabic text-sm text-white/30 hover:text-white hover:bg-[#1C1C1C] transition-all mb-1"
        >
          <ChevronLeft size={18} />
          عرض الموقع
        </a>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-arabic text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/5 transition-all"
        >
          <LogOut size={18} />
          تسجيل الخروج
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex" style={{ direction: "rtl" }}>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#0E0E0E] border-l border-[#1C1C1C] fixed top-0 bottom-0 right-0 z-40">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed top-0 right-0 bottom-0 w-64 bg-[#0E0E0E] border-l border-[#1C1C1C] z-50 lg:hidden">
            <button
              className="absolute top-4 left-4 text-white/40 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={20} />
            </button>
            <Sidebar />
          </aside>
        </>
      )}

      {/* Main content */}
      <main className="flex-1 lg:mr-60 flex flex-col min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-[#0A0A0A]/95 backdrop-blur border-b border-[#1C1C1C] px-4 md:px-6 h-16 flex items-center gap-4">
          <button
            className="lg:hidden text-white/50 hover:text-white"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="font-arabic text-base font-semibold text-white">{title}</h1>
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#3DB4C4]/20 flex items-center justify-center">
              <span className="text-[#3DB4C4] text-xs font-bold">م</span>
            </div>
            <span className="font-arabic text-xs text-white/40 hidden md:block">المدير</span>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 p-4 md:p-6">{children}</div>
      </main>
    </div>
  );
}
