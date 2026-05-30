"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, X } from "lucide-react";

interface TypedConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  busy?: boolean;
  /** Big bold question shown at the top */
  title: string;
  /** Description body — explains the consequence */
  message: string;
  /** Word the admin must type exactly to enable the action. Default: "DELETE" */
  confirmWord?: string;
  /** Button label (e.g. "نعم، احذف") */
  confirmLabel?: string;
}

/**
 * High-friction confirmation modal — admin must type the exact word
 * (default: "DELETE") into a text field before the destructive button
 * becomes clickable. Designed for catastrophic operations only:
 *  - delete all orders
 *  - delete a product
 *  - any irreversible Firestore mutation
 */
export default function TypedConfirmModal({
  open,
  onClose,
  onConfirm,
  busy,
  title,
  message,
  confirmWord = "DELETE",
  confirmLabel = "تأكيد الحذف",
}: TypedConfirmModalProps) {
  const [typed, setTyped] = useState("");

  // Clear text every time the modal opens (so a previously-typed word can't be re-used)
  useEffect(() => {
    if (open) setTyped("");
  }, [open]);

  const canConfirm = typed.trim() === confirmWord && !busy;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={busy ? undefined : onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={{ duration: 0.2 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md mx-4"
          >
            <div className="bg-[#0E0E0E] border border-red-500/30 rounded-2xl shadow-2xl overflow-hidden">
              <div className="p-5 flex items-start gap-4 border-b border-[#1C1C1C]">
                <div className="w-10 h-10 rounded-full bg-red-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-arabic text-base font-bold text-white">{title}</h3>
                  <p className="font-arabic text-sm text-white/60 mt-1 leading-7">
                    {message}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  disabled={busy}
                  className="text-white/40 hover:text-white p-1 -mr-1 disabled:opacity-50"
                  aria-label="إغلاق"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex flex-col gap-3">
                <label className="font-arabic text-xs text-white/60 leading-7">
                  اكتب الكلمة{" "}
                  <code className="font-mono bg-red-500/15 text-red-400 px-1.5 py-0.5 rounded text-xs select-all">
                    {confirmWord}
                  </code>{" "}
                  بالضبط للتأكيد:
                </label>
                <input
                  type="text"
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                  placeholder={confirmWord}
                  className={`bg-[#1C1C1C] border text-white font-mono text-sm rounded-lg px-4 py-3 focus:outline-none transition-all ${
                    canConfirm
                      ? "border-red-500/60"
                      : "border-[#2A2A2A] focus:border-red-500/40"
                  }`}
                  dir="ltr"
                />
              </div>

              <div className="p-4 flex gap-3 justify-end border-t border-[#1C1C1C] bg-[#0A0A0A]">
                <button
                  onClick={onClose}
                  disabled={busy}
                  className="font-arabic text-sm text-white/60 px-4 py-2.5 hover:text-white transition-colors disabled:opacity-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={onConfirm}
                  disabled={!canConfirm}
                  className="flex items-center gap-2 bg-red-500 text-white font-arabic font-bold text-sm px-5 py-2.5 rounded-lg hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  {busy && (
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
