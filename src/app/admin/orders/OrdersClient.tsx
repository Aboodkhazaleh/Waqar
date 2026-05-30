"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Search, Trash2, AlertTriangle, X, Check } from "lucide-react";
import { subscribeOrders } from "@/lib/firestore";
import TypedConfirmModal from "@/components/admin/TypedConfirmModal";

interface Props {
  initialOrders: Order[];
}

const statusOptions: { value: Order["status"] | "all"; label: string; color: string }[] = [
  { value: "all", label: "الكل", color: "text-white" },
  { value: "pending", label: "معلّق", color: "text-yellow-400" },
  { value: "confirmed", label: "مؤكد", color: "text-blue-400" },
  { value: "shipped", label: "شحن", color: "text-purple-400" },
  { value: "delivered", label: "تم التسليم", color: "text-green-400" },
  { value: "cancelled", label: "ملغي", color: "text-red-400" },
];

const statusBadge: Record<Order["status"], string> = {
  pending: "text-yellow-400 bg-yellow-400/10",
  confirmed: "text-blue-400 bg-blue-400/10",
  shipped: "text-purple-400 bg-purple-400/10",
  delivered: "text-green-400 bg-green-400/10",
  cancelled: "text-red-400 bg-red-400/10",
};

export default function OrdersClient({ initialOrders }: Props) {
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "all">("all");
  const [confirmDeleteAll, setConfirmDeleteAll] = useState(false);
  const [confirmDeleteOne, setConfirmDeleteOne] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeOrders((next) => setOrders(next));
    return () => unsub();
  }, []);

  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  const filtered = orders.filter((o) => {
    const matchSearch =
      !search ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.productName.includes(search) ||
      (o.customerName?.includes(search) ?? false);
    const matchStatus = statusFilter === "all" || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (orderId: string, status: Order["status"]) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status } : o));
    setOrders(updated);
    await fetch("/api/admin/orders", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleDeleteOne = async (id: string) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setOrders(orders.filter((o) => o.id !== id));
        showToast("ok", `تم حذف الطلب ${id}`);
      } else {
        showToast("err", "فشل الحذف");
      }
    } catch {
      showToast("err", "خطأ في الاتصال");
    } finally {
      setBusy(false);
      setConfirmDeleteOne(null);
    }
  };

  const handleDeleteAll = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
      if (res.ok) {
        setOrders([]);
        showToast("ok", "تم حذف جميع الطلبات");
      } else {
        showToast("err", "فشل حذف الطلبات");
      }
    } catch {
      showToast("err", "خطأ في الاتصال");
    } finally {
      setBusy(false);
      setConfirmDeleteAll(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث برقم الطلب أو الاسم..."
            className="w-full bg-[#111111] border border-[#1C1C1C] text-white font-arabic text-sm rounded-xl px-4 py-2.5 pr-10 placeholder:text-white/20 focus:outline-none focus:border-[#3DB4C4]/40"
          />
          <Search size={15} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/25" />
        </div>
        <button
          onClick={() => setConfirmDeleteAll(true)}
          disabled={orders.length === 0 || busy}
          className="flex items-center justify-center gap-2 bg-red-500/15 text-red-400 border border-red-500/30 font-arabic text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-red-500 hover:text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Trash2 size={14} />
          حذف الكل
        </button>
      </div>

      {/* Status filters */}
      <div className="flex gap-2 flex-wrap">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatusFilter(opt.value as Order["status"] | "all")}
            className={`font-arabic text-xs px-3 py-2 rounded-xl transition-all border ${
              statusFilter === opt.value
                ? "border-[#3DB4C4]/40 bg-[#3DB4C4]/10 text-[#3DB4C4]"
                : "border-[#1C1C1C] bg-[#111111] text-white/40 hover:text-white"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={`border rounded-xl p-3 flex items-center gap-2 ${
              toast.type === "ok"
                ? "bg-green-500/10 border-green-500/20 text-green-400"
                : "bg-red-500/10 border-red-500/20 text-red-400"
            }`}
          >
            {toast.type === "ok" ? <Check size={14} /> : <AlertTriangle size={14} />}
            <p className="font-arabic text-sm">{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Orders count */}
      <p className="font-arabic text-sm text-white/40">{filtered.length} طلب</p>

      {/* Table */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#1C1C1C]">
                {[
                  "رقم الطلب",
                  "المنتج",
                  "اللون / المقاس",
                  "الكمية",
                  "الإجمالي",
                  "الحالة",
                  "التاريخ",
                  "",
                ].map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-3 text-right font-arabic text-xs text-white/30 font-medium whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((order, i) => (
                  <motion.tr
                    key={order.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b border-[#1C1C1C]/50 hover:bg-[#1C1C1C]/50 transition-colors"
                  >
                    <td className="px-3 py-3 font-arabic text-xs text-[#3DB4C4] whitespace-nowrap">
                      {order.id}
                    </td>
                    <td className="px-3 py-3">
                      {order.items && order.items.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-1.5">
                              <span className="font-mono text-[10px] text-[#3DB4C4]/60 mt-0.5">
                                #{idx + 1}
                              </span>
                              <div className="min-w-0">
                                <p className="font-arabic text-sm text-white">
                                  {item.productName}
                                  <span className="text-white/40 text-xs">
                                    {" "}× {item.quantity}
                                  </span>
                                </p>
                                <p className="font-arabic text-[11px] text-white/40">
                                  {item.colorName} • مقاس {item.size}
                                </p>
                                {(item.designName || item.closureName) && (
                                  <p className="font-arabic text-[10px] text-[#3DB4C4]/70 mt-0.5">
                                    {item.designName && <>تصميم: {item.designName}</>}
                                    {item.designName && item.closureName && " • "}
                                    {item.closureName && <>إغلاق: {item.closureName}</>}
                                  </p>
                                )}
                                {item.customText && (
                                  <p className="font-arabic text-[10px] text-[#3DB4C4] mt-0.5">
                                    ✍️ نقش: {item.customText}
                                  </p>
                                )}
                              </div>
                            </div>
                          ))}
                          {order.customerName && (
                            <p className="font-arabic text-[11px] text-white/30 mt-1 border-t border-[#1C1C1C] pt-1">
                              👤 {order.customerName}
                              {order.customerPhone && ` • ${order.customerPhone}`}
                            </p>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="font-arabic text-sm text-white">{order.productName}</p>
                          {order.customerName && (
                            <p className="font-arabic text-xs text-white/35">{order.customerName}</p>
                          )}
                        </>
                      )}
                    </td>
                    <td className="px-3 py-3 font-arabic text-sm text-white/60 whitespace-nowrap">
                      {order.items && order.items.length > 1
                        ? `${order.items.length} منتجات`
                        : `${order.colorName} / ${order.size}`}
                    </td>
                    <td className="px-3 py-3 font-arabic text-sm text-white/60 text-center">
                      {order.items
                        ? order.items.reduce((s, i) => s + i.quantity, 0)
                        : order.quantity}
                    </td>
                    <td className="px-3 py-3 font-arabic text-sm text-white whitespace-nowrap">
                      {formatPrice(order.totalPrice, order.currency)}
                    </td>
                    <td className="px-3 py-3">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value as Order["status"])
                        }
                        className={`bg-transparent font-arabic text-xs px-2 py-1 rounded-lg border border-current/20 cursor-pointer focus:outline-none ${statusBadge[order.status]}`}
                      >
                        {statusOptions.slice(1).map((opt) => (
                          <option
                            key={opt.value}
                            value={opt.value}
                            className="bg-[#111111] text-white"
                          >
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-3 font-arabic text-xs text-white/30 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("ar-SA")}
                    </td>
                    <td className="px-3 py-3">
                      <button
                        onClick={() => setConfirmDeleteOne(order.id)}
                        title="حذف الطلب"
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      >
                        <Trash2 size={12} />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center font-arabic text-sm text-white/30 py-10">
              {orders.length === 0 ? "لا توجد طلبات" : "لا توجد طلبات تطابق البحث"}
            </p>
          )}
        </div>
      </div>

      {/* Confirm Delete All Modal — requires typing "DELETE" */}
      <TypedConfirmModal
        open={confirmDeleteAll}
        onClose={() => setConfirmDeleteAll(false)}
        onConfirm={handleDeleteAll}
        busy={busy}
        title={`حذف جميع الطلبات (${orders.length})؟`}
        message="عملية لا يمكن التراجع عنها. سيتم حذف جميع الطلبات نهائياً من Firestore."
        confirmWord="DELETE"
        confirmLabel="حذف نهائي"
      />

      {/* Confirm Delete Single Modal */}
      <ConfirmModal
        open={confirmDeleteOne !== null}
        onClose={() => setConfirmDeleteOne(null)}
        onConfirm={() => confirmDeleteOne && handleDeleteOne(confirmDeleteOne)}
        busy={busy}
        title="حذف هذا الطلب؟"
        message={`سيتم حذف الطلب ${confirmDeleteOne} نهائياً.`}
        confirmLabel="نعم، احذف"
        variant="danger"
      />
    </div>
  );
}

// ============== Confirm Modal ==============
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  variant?: "danger" | "default";
}
function ConfirmModal({
  open,
  onClose,
  onConfirm,
  busy,
  title,
  message,
  confirmLabel,
  variant = "default",
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-[#0E0E0E] border border-[#252525] rounded-2xl shadow-2xl overflow-hidden">
              {/* Header */}
              <div className="p-5 flex items-start gap-4 border-b border-[#1C1C1C]">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    variant === "danger" ? "bg-red-500/15" : "bg-[#3DB4C4]/15"
                  }`}
                >
                  <AlertTriangle
                    size={18}
                    className={variant === "danger" ? "text-red-400" : "text-[#3DB4C4]"}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-arabic text-base font-bold text-white">{title}</h3>
                  <p className="font-arabic text-sm text-white/50 mt-1 leading-7">{message}</p>
                </div>
                <button
                  onClick={onClose}
                  className="text-white/40 hover:text-white p-1 -mr-1"
                  aria-label="إغلاق"
                >
                  <X size={16} />
                </button>
              </div>
              {/* Actions */}
              <div className="p-4 flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  disabled={busy}
                  className="font-arabic text-sm text-white/60 px-4 py-2.5 hover:text-white transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={onConfirm}
                  disabled={busy}
                  className={`flex items-center gap-2 font-arabic text-sm font-bold px-5 py-2.5 rounded-lg transition-all ${
                    variant === "danger"
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[#3DB4C4] text-black hover:bg-[#5FC9D9]"
                  } disabled:opacity-60`}
                >
                  {busy && (
                    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  )}
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
