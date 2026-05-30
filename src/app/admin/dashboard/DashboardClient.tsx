"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Order, Product } from "@/types";
import {
  ShoppingBag,
  TrendingUp,
  Package,
  Clock,
  CheckCircle,
  Truck,
} from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { subscribeOrders, subscribeProducts } from "@/lib/firestore";

interface Props {
  initialProducts: Product[];
  initialOrders: Order[];
}

const statusMap: Record<Order["status"], { label: string; color: string }> = {
  pending: { label: "قيد الانتظار", color: "text-yellow-400 bg-yellow-400/10" },
  confirmed: { label: "مؤكد", color: "text-blue-400 bg-blue-400/10" },
  shipped: { label: "تم الشحن", color: "text-purple-400 bg-purple-400/10" },
  delivered: { label: "تم التسليم", color: "text-green-400 bg-green-400/10" },
  cancelled: { label: "ملغي", color: "text-red-400 bg-red-400/10" },
};

export default function DashboardClient({ initialProducts, initialOrders }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  // Real-time Firestore subscriptions
  useEffect(() => {
    const unsubP = subscribeProducts((next) => setProducts(next));
    const unsubO = subscribeOrders((next) => setOrders(next));
    return () => {
      unsubP();
      unsubO();
    };
  }, []);

  const stats = useMemo(
    () => ({
      totalOrders: orders.length,
      pendingOrders: orders.filter((o) => o.status === "pending").length,
      totalRevenue: orders.reduce((sum, o) => sum + o.totalPrice, 0),
      totalProducts: products.filter((p) => p.isActive).length,
      confirmedOrders: orders.filter((o) => o.status === "confirmed").length,
      shippedOrders: orders.filter((o) => o.status === "shipped").length,
    }),
    [orders, products]
  );

  const recentOrders = orders.slice(0, 5);

  const statCards = [
    {
      icon: ShoppingBag,
      label: "إجمالي الطلبات",
      value: stats.totalOrders.toLocaleString("ar-SA"),
      color: "text-[#3DB4C4]",
      bg: "bg-[#3DB4C4]/10",
    },
    {
      icon: TrendingUp,
      label: "إجمالي الإيرادات",
      value: formatPrice(stats.totalRevenue),
      color: "text-green-400",
      bg: "bg-green-400/10",
    },
    {
      icon: Clock,
      label: "طلبات معلّقة",
      value: stats.pendingOrders.toLocaleString("ar-SA"),
      color: "text-yellow-400",
      bg: "bg-yellow-400/10",
    },
    {
      icon: Package,
      label: "منتجات نشطة",
      value: stats.totalProducts.toLocaleString("ar-SA"),
      color: "text-blue-400",
      bg: "bg-blue-400/10",
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-arabic text-lg font-bold text-white">
            مرحباً بك، المدير 👋
          </h2>
          <p className="font-arabic text-sm text-white/40 mt-1">
            {new Date().toLocaleDateString("ar-SA", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-[#111111] border border-[#1C1C1C] rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${card.bg}`}>
              <card.icon size={18} className={card.color} />
            </div>
            <div>
              <p className="font-arabic text-2xl font-bold text-white">{card.value}</p>
              <p className="font-arabic text-xs text-white/40 mt-1">{card.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { icon: Clock, label: "معلّق", value: stats.pendingOrders, color: "bg-yellow-400" },
          { icon: CheckCircle, label: "مؤكد", value: stats.confirmedOrders, color: "bg-blue-400" },
          { icon: Truck, label: "شحن", value: stats.shippedOrders, color: "bg-purple-400" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex items-center gap-3"
          >
            <div className={`w-2 h-8 rounded-full ${item.color}`} />
            <div>
              <p className="font-arabic text-lg font-bold text-white">
                {item.value.toLocaleString("ar-SA")}
              </p>
              <p className="font-arabic text-xs text-white/40">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#111111] border border-[#1C1C1C] rounded-2xl overflow-hidden"
      >
        <div className="flex items-center justify-between p-5 border-b border-[#1C1C1C]">
          <h3 className="font-arabic text-sm font-semibold text-white">آخر الطلبات</h3>
          <a
            href="/admin/orders"
            className="font-arabic text-xs text-[#3DB4C4] hover:text-[#5FC9D9] transition-colors"
          >
            عرض الكل
          </a>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C1C1C]">
                {["رقم الطلب", "المنتج", "اللون", "المقاس", "الإجمالي", "الحالة"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-right font-arabic text-xs text-white/30 font-medium"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#1C1C1C]/50 hover:bg-[#1C1C1C]/50 transition-colors"
                >
                  <td className="px-4 py-3 font-arabic text-xs text-[#3DB4C4]">{order.id}</td>
                  <td className="px-4 py-3 font-arabic text-sm text-white">
                    {order.productName}
                    {order.items && order.items.length > 1 && (
                      <span className="ml-1 text-[10px] text-[#3DB4C4]/70">
                        ({order.items.length} منتجات)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-arabic text-sm text-white/60">{order.colorName}</td>
                  <td className="px-4 py-3 font-arabic text-sm text-white/60">{order.size}</td>
                  <td className="px-4 py-3 font-arabic text-sm text-white">
                    {formatPrice(order.totalPrice, order.currency)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block font-arabic text-xs px-2 py-1 rounded-full ${
                        statusMap[order.status]?.color ?? ""
                      }`}
                    >
                      {statusMap[order.status]?.label ?? order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentOrders.length === 0 && (
            <p className="text-center font-arabic text-sm text-white/30 py-8">
              لا توجد طلبات حتى الآن
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
