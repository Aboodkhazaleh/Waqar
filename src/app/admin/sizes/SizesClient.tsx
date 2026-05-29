"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Size } from "@/types";
import { subscribeSizes } from "@/lib/firestore";
import {
  Plus, Edit3, Trash2, Eye, EyeOff, Check, X,
  ArrowUp, ArrowDown, AlertCircle, AlertTriangle, Save,
  Ruler, Hash,
} from "lucide-react";

interface Props {
  initialSizes: Size[];
}

export default function SizesClient({ initialSizes }: Props) {
  const [sizes, setSizes] = useState<Size[]>(initialSizes);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<Size | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeSizes((next) => setSizes(next));
    return () => unsub();
  }, []);

  const showToast = (type: "ok" | "err", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 2500);
  };

  // Sorted (by displayOrder) for display
  const sorted = useMemo(
    () => [...sizes].sort((a, b) => a.displayOrder - b.displayOrder),
    [sizes]
  );

  // ============ Mutations ============
  const apiUpsert = async (size: Size) => {
    setBusy(true);
    try {
      const res = await fetch("/api/admin/sizes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(size),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast("err", data.error ?? "فشل الحفظ");
        return false;
      }
      return true;
    } catch {
      showToast("err", "خطأ في الاتصال");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingId) return;
    const original = sizes.find((s) => s.id === editingId);
    if (!original) return;
    const trimmed = editLabel.trim();
    if (!trimmed) {
      showToast("err", "اسم المقاس لا يمكن أن يكون فارغاً");
      return;
    }
    const ok = await apiUpsert({ ...original, label: trimmed });
    if (ok) {
      showToast("ok", `تم تحديث المقاس "${trimmed}"`);
      setEditingId(null);
    }
  };

  const handleToggleActive = async (size: Size) => {
    const ok = await apiUpsert({ ...size, isActive: !size.isActive });
    if (ok) {
      showToast("ok", `تم ${size.isActive ? "إخفاء" : "تفعيل"} المقاس "${size.label}"`);
    }
  };

  const handleMove = async (size: Size, direction: "up" | "down") => {
    const idx = sorted.findIndex((s) => s.id === size.id);
    if (direction === "up" && idx === 0) return;
    if (direction === "down" && idx === sorted.length - 1) return;
    const swapWith = sorted[direction === "up" ? idx - 1 : idx + 1];

    // Swap their displayOrder values via PUT (bulk)
    const updated = sorted.map((s) => {
      if (s.id === size.id) return { ...s, displayOrder: swapWith.displayOrder };
      if (s.id === swapWith.id) return { ...s, displayOrder: size.displayOrder };
      return s;
    });

    setBusy(true);
    try {
      const res = await fetch("/api/admin/sizes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const data = await res.json();
        showToast("err", data.error ?? "فشل النقل");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/sizes", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: confirmDelete.id }),
      });
      if (res.ok) {
        showToast("ok", `تم حذف المقاس "${confirmDelete.label}"`);
        setConfirmDelete(null);
      } else {
        const data = await res.json();
        showToast("err", data.error ?? "فشل الحذف");
      }
    } finally {
      setBusy(false);
    }
  };

  const handleCreate = async () => {
    const trimmed = newLabel.trim();
    if (!trimmed) {
      showToast("err", "أدخل اسم المقاس");
      return;
    }
    const now = new Date().toISOString();
    const maxOrder = sizes.reduce((m, s) => Math.max(m, s.displayOrder), 0);
    const safeId = `size-${trimmed
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString(36)}`;
    const newSize: Size = {
      id: safeId,
      label: trimmed,
      isActive: true,
      displayOrder: maxOrder + 10,
      createdAt: now,
      updatedAt: now,
    };
    const ok = await apiUpsert(newSize);
    if (ok) {
      showToast("ok", `تم إضافة المقاس "${trimmed}"`);
      setNewLabel("");
      setShowCreate(false);
    }
  };

  const activeCount = sizes.filter((s) => s.isActive).length;

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="إجمالي المقاسات" value={sizes.length.toLocaleString("ar-SA")} icon={Ruler} />
        <StatCard label="مُفعّلة" value={activeCount.toLocaleString("ar-SA")} accent icon={Check} />
        <StatCard label="مُعطّلة" value={(sizes.length - activeCount).toLocaleString("ar-SA")} icon={EyeOff} />
      </div>

      {/* Toolbar — Add new */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-2xl p-4">
        {!showCreate ? (
          <button
            onClick={() => setShowCreate(true)}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-[#3DB4C4] text-black font-arabic font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#5FC9D9] active:scale-[0.98] transition-all disabled:opacity-60"
          >
            <Plus size={16} />
            إضافة مقاس جديد
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreate();
                  if (e.key === "Escape") {
                    setShowCreate(false);
                    setNewLabel("");
                  }
                }}
                placeholder="اسم المقاس (مثال: 56 أو M أو One Size)"
                autoFocus
                className="w-full bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-xl px-4 py-3 pr-10 placeholder:text-white/20 focus:outline-none focus:border-[#3DB4C4]/50"
              />
              <Hash
                size={14}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-white/25 pointer-events-none"
              />
            </div>
            <button
              onClick={handleCreate}
              disabled={busy}
              className="bg-[#3DB4C4] text-black font-arabic font-bold text-sm px-5 py-3 rounded-xl hover:bg-[#5FC9D9] active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {busy ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save size={14} />
              )}
              حفظ
            </button>
            <button
              onClick={() => {
                setShowCreate(false);
                setNewLabel("");
              }}
              className="bg-[#1C1C1C] text-white/60 hover:text-white font-arabic text-sm px-5 py-3 rounded-xl transition-all"
            >
              إلغاء
            </button>
          </div>
        )}
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
            {toast.type === "ok" ? <Check size={14} /> : <AlertCircle size={14} />}
            <p className="font-arabic text-sm">{toast.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sizes list */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-[#1C1C1C] flex items-center justify-between">
          <h3 className="font-arabic text-sm font-semibold text-white">
            قائمة المقاسات
          </h3>
          <span className="font-arabic text-xs text-white/40">
            استخدم الأسهم لترتيب الظهور
          </span>
        </div>
        <div className="divide-y divide-[#1C1C1C]">
          <AnimatePresence initial={false}>
            {sorted.map((size, idx) => {
              const isEditing = editingId === size.id;
              return (
                <motion.div
                  key={size.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                  className={`flex items-center gap-3 px-5 py-3 hover:bg-[#1C1C1C]/40 transition-colors ${
                    !size.isActive ? "opacity-50" : ""
                  }`}
                >
                  {/* Order arrows */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => handleMove(size, "up")}
                      disabled={idx === 0 || busy}
                      className="w-5 h-4 flex items-center justify-center text-white/40 hover:text-[#3DB4C4] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      title="نقل للأعلى"
                    >
                      <ArrowUp size={11} />
                    </button>
                    <button
                      onClick={() => handleMove(size, "down")}
                      disabled={idx === sorted.length - 1 || busy}
                      className="w-5 h-4 flex items-center justify-center text-white/40 hover:text-[#3DB4C4] disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
                      title="نقل للأسفل"
                    >
                      <ArrowDown size={11} />
                    </button>
                  </div>

                  {/* Order number */}
                  <span className="font-mono text-[10px] text-white/30 w-6 text-center">
                    {String(idx + 1).padStart(2, "0")}
                  </span>

                  {/* Label (editable inline) */}
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <input
                        type="text"
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveEdit();
                          if (e.key === "Escape") setEditingId(null);
                        }}
                        autoFocus
                        className="w-full bg-[#1C1C1C] border border-[#3DB4C4]/40 text-white font-arabic text-sm rounded-lg px-3 py-1.5 focus:outline-none"
                      />
                    ) : (
                      <span className="font-arabic text-sm text-white font-medium">
                        {size.label}
                      </span>
                    )}
                  </div>

                  {/* Status badge */}
                  {!isEditing && (
                    <span
                      className={`font-arabic text-[10px] px-2 py-0.5 rounded-full ${
                        size.isActive
                          ? "bg-green-500/15 text-green-400"
                          : "bg-white/10 text-white/40"
                      }`}
                    >
                      {size.isActive ? "نشط" : "معطّل"}
                    </span>
                  )}

                  {/* Action buttons */}
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        disabled={busy}
                        className="w-8 h-8 rounded-lg bg-[#3DB4C4] text-black flex items-center justify-center hover:bg-[#5FC9D9] transition-all disabled:opacity-60"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="w-8 h-8 rounded-lg bg-[#1C1C1C] text-white/60 hover:text-white flex items-center justify-center transition-all"
                      >
                        <X size={14} />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleActive(size)}
                        disabled={busy}
                        title={size.isActive ? "تعطيل" : "تفعيل"}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                          size.isActive
                            ? "bg-[#3DB4C4]/15 text-[#3DB4C4]"
                            : "bg-[#1C1C1C] text-white/40 hover:text-white"
                        }`}
                      >
                        {size.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(size.id);
                          setEditLabel(size.label);
                        }}
                        disabled={busy}
                        title="تعديل"
                        className="w-8 h-8 rounded-lg bg-[#1C1C1C] text-white/60 hover:text-[#3DB4C4] flex items-center justify-center transition-all"
                      >
                        <Edit3 size={13} />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(size)}
                        disabled={busy}
                        title="حذف"
                        className="w-8 h-8 rounded-lg bg-[#1C1C1C] text-red-400/60 hover:text-red-400 hover:bg-red-500/10 flex items-center justify-center transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
        {sorted.length === 0 && (
          <p className="text-center font-arabic text-sm text-white/30 py-10">
            لا توجد مقاسات بعد. اضغط "إضافة مقاس جديد" أعلاه.
          </p>
        )}
      </div>

      <p className="font-arabic text-xs text-white/30 leading-7 max-w-xl">
        💡 المقاسات المُعطّلة لا تظهر في صفحة المنتج للزوّار. عند تعديل اسم مقاس،
        المنتجات الموجودة تحتفظ بالاسم القديم في طلباتها السابقة (للحفاظ على سجلات
        الطلبات).
      </p>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
            >
              <div className="bg-[#0E0E0E] border border-[#252525] rounded-2xl shadow-2xl overflow-hidden">
                <div className="p-5 flex items-start gap-4 border-b border-[#1C1C1C]">
                  <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                    <AlertTriangle size={18} className="text-red-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-arabic text-base font-bold text-white">
                      حذف المقاس "{confirmDelete.label}"؟
                    </h3>
                    <p className="font-arabic text-sm text-white/50 mt-1 leading-7">
                      سيتم حذف هذا المقاس نهائياً. المنتجات التي تستخدمه ستحتفظ
                      بالاسم في سجلاتها، لكنه لن يظهر للزوّار.
                    </p>
                  </div>
                </div>
                <div className="p-4 flex gap-3 justify-end">
                  <button
                    onClick={() => setConfirmDelete(null)}
                    disabled={busy}
                    className="font-arabic text-sm text-white/60 px-4 py-2.5 hover:text-white transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={busy}
                    className="flex items-center gap-2 bg-red-500 text-white font-arabic font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-red-600 transition-all disabled:opacity-60"
                  >
                    {busy && (
                      <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    )}
                    نعم، احذف
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
}
function StatCard({ label, value, accent, icon: Icon }: StatCardProps) {
  return (
    <div
      className={`bg-[#111111] border rounded-xl p-4 ${
        accent ? "border-[#3DB4C4]/20" : "border-[#1C1C1C]"
      }`}
    >
      <div className="flex items-center gap-2 mb-1.5">
        {Icon && (
          <Icon
            size={12}
            className={accent ? "text-[#3DB4C4]" : "text-white/40"}
          />
        )}
        <p className="font-arabic text-xs text-white/40">{label}</p>
      </div>
      <p
        className={`font-arabic text-lg font-bold ${
          accent ? "text-[#3DB4C4]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
