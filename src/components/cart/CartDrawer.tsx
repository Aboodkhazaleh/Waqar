"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  Check,
  AlertCircle,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";

interface CartDrawerProps {
  /** Used in WhatsApp deep-link after successful checkout */
  whatsappNumber?: string;
}

export default function CartDrawer({ whatsappNumber }: CartDrawerProps) {
  const {
    items,
    totalItems,
    totalPrice,
    isOpen,
    setOpen,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Lock body scroll while drawer is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Reset checkout state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowCheckout(false);
      setError("");
      setSuccess(false);
    }
  }, [isOpen]);

  const currency = items[0]?.currency ?? "د.أ";

  const handleSubmitOrder = async () => {
    setError("");
    if (!customerName.trim()) {
      setError("الرجاء إدخال الاسم");
      return;
    }
    if (!customerPhone.trim()) {
      setError("الرجاء إدخال رقم الهاتف");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim() || undefined,
          items: items.map((i) => ({
            productId: i.productId,
            productSlug: i.productSlug,
            productName: i.productName,
            colorId: i.colorId,
            colorName: i.colorName,
            colorHex: i.colorHex,
            size: i.size,
            quantity: i.quantity,
            price: i.price,
            currency: i.currency,
            image: i.image,
          })),
          totalPrice,
          currency,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "تعذّر إرسال الطلب");
        return;
      }
      setSuccess(true);

      // Send WhatsApp confirmation to the store
      if (whatsappNumber) {
        const lines: string[] = [
          "السلام عليكم،",
          "",
          `لقد قمت بطلب من موقع وقار:`,
          `🧾 رقم الطلب: ${data.orderId ?? "—"}`,
          `👤 الاسم: ${customerName.trim()}`,
          `📞 الهاتف: ${customerPhone.trim()}`,
          "",
          "🛍️ تفاصيل الطلب:",
          ...items.map(
            (i, idx) =>
              `${idx + 1}. ${i.productName} — ${i.colorName} — مقاس ${i.size} — ${i.quantity} × ${formatPrice(i.price, i.currency)}`
          ),
          "",
          `💰 الإجمالي: ${formatPrice(totalPrice, currency)}`,
        ];
        if (notes.trim()) lines.push("", `📝 ملاحظات: ${notes.trim()}`);
        const url = `https://wa.me/${whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(lines.join("\n"))}`;
        window.open(url, "_blank");
      }

      // Clear cart after a brief success state
      setTimeout(() => {
        clearCart();
        setCustomerName("");
        setCustomerPhone("");
        setNotes("");
        setOpen(false);
        setShowCheckout(false);
        setSuccess(false);
      }, 1800);
    } catch {
      setError("خطأ في الاتصال — تحقّق من الإنترنت");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[80]"
          />

          {/* Drawer — slides in from left (since RTL, left feels natural for "after") */}
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 bottom-0 left-0 w-full sm:w-[440px] z-[90] bg-[#0A0A0A] border-r border-[#1C1C1C] flex flex-col"
            style={{ direction: "rtl" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#1C1C1C]">
              <div className="flex items-center gap-2">
                <ShoppingBag size={18} className="text-accent" />
                <h2 className="font-arabic text-base font-bold text-white">
                  سلّتي
                </h2>
                {totalItems > 0 && (
                  <span className="font-arabic text-xs text-white/40">
                    ({totalItems})
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#1C1C1C] rounded-lg transition-all"
                aria-label="إغلاق السلة"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {success ? (
                <SuccessState />
              ) : items.length === 0 ? (
                <EmptyState onClose={() => setOpen(false)} />
              ) : showCheckout ? (
                <CheckoutForm
                  customerName={customerName}
                  setCustomerName={setCustomerName}
                  customerPhone={customerPhone}
                  setCustomerPhone={setCustomerPhone}
                  notes={notes}
                  setNotes={setNotes}
                  error={error}
                  onBack={() => setShowCheckout(false)}
                />
              ) : (
                <div className="flex flex-col gap-3">
                  {items.map((item) => (
                    <CartLine
                      key={item.key}
                      item={item}
                      onRemove={() => removeItem(item.key)}
                      onIncrement={() =>
                        updateQuantity(item.key, item.quantity + 1)
                      }
                      onDecrement={() =>
                        updateQuantity(item.key, item.quantity - 1)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer / actions */}
            {items.length > 0 && !success && (
              <div className="border-t border-[#1C1C1C] p-4 flex flex-col gap-3 bg-[#0A0A0A]">
                <div className="flex items-center justify-between">
                  <span className="font-arabic text-sm text-white/60">المجموع</span>
                  <span className="font-arabic text-xl font-bold text-accent">
                    {formatPrice(totalPrice, currency)}
                  </span>
                </div>
                {showCheckout ? (
                  <button
                    onClick={handleSubmitOrder}
                    disabled={submitting}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-black font-arabic font-bold text-base py-3.5 rounded-xl hover:bg-[#5FC9D9] active:scale-[0.99] transition-all disabled:opacity-60"
                  >
                    {submitting ? (
                      <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Check size={16} />
                    )}
                    تأكيد الطلب
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full flex items-center justify-center gap-2 bg-accent text-black font-arabic font-bold text-base py-3.5 rounded-xl hover:bg-[#5FC9D9] active:scale-[0.99] transition-all"
                  >
                    إتمام الطلب
                    <ArrowLeft size={16} />
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// =====================================================================
// Cart line item
// =====================================================================
interface CartLineProps {
  item: ReturnType<typeof useCart>["items"][number];
  onRemove: () => void;
  onIncrement: () => void;
  onDecrement: () => void;
}
function CartLine({ item, onRemove, onIncrement, onDecrement }: CartLineProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
      className="flex gap-3 bg-[#111111] border border-[#1C1C1C] rounded-xl p-3"
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-[#1C1C1C]">
        {item.image ? (
          <Image
            src={item.image}
            alt={item.productName}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-white/20">
            <ShoppingBag size={20} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-arabic text-sm text-white font-semibold truncate">
              {item.productName}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <span
                className="w-3 h-3 rounded-full border border-white/10"
                style={{ backgroundColor: item.colorHex }}
              />
              <p className="font-arabic text-xs text-white/50 truncate">
                {item.colorName} • مقاس {item.size}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            aria-label="حذف"
            className="w-7 h-7 flex-shrink-0 flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          >
            <Trash2 size={13} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-auto pt-1">
          {/* Qty controls */}
          <div className="inline-flex items-center gap-0 border border-[#2A2A2A] rounded-lg overflow-hidden">
            <button
              onClick={onDecrement}
              className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-accent hover:bg-[#1C1C1C] transition-all"
              aria-label="إنقاص الكمية"
            >
              <Minus size={11} />
            </button>
            <span className="w-7 h-7 flex items-center justify-center font-arabic text-sm text-white font-medium border-x border-[#2A2A2A]">
              {item.quantity}
            </span>
            <button
              onClick={onIncrement}
              className="w-7 h-7 flex items-center justify-center text-white/60 hover:text-accent hover:bg-[#1C1C1C] transition-all"
              aria-label="زيادة الكمية"
            >
              <Plus size={11} />
            </button>
          </div>

          {/* Subtotal */}
          <span className="font-arabic text-sm font-bold text-accent">
            {formatPrice(item.price * item.quantity, item.currency)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// =====================================================================
// Empty cart state
// =====================================================================
function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
      <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
        <ShoppingBag size={24} className="text-accent" />
      </div>
      <p className="font-arabic text-sm text-white/60">السلّة فارغة</p>
      <p className="font-arabic text-xs text-white/30 max-w-xs leading-7">
        أضف منتجات لإكمال طلبك. تختار، تختار المقاس، ثم تضغط "أضف للسلة".
      </p>
      <button
        onClick={onClose}
        className="mt-3 font-arabic text-sm text-accent hover:text-[#5FC9D9] transition-colors"
      >
        متابعة التسوّق ←
      </button>
    </div>
  );
}

// =====================================================================
// Success state
// =====================================================================
function SuccessState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 text-center py-12">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center"
      >
        <Check size={28} className="text-green-400" />
      </motion.div>
      <p className="font-arabic text-base text-white font-semibold">
        تم إرسال الطلب بنجاح
      </p>
      <p className="font-arabic text-xs text-white/40 leading-7 max-w-xs">
        فُتحت لك محادثة واتساب لتأكيد التواصل مع الفريق.
      </p>
    </div>
  );
}

// =====================================================================
// Checkout form (customer info)
// =====================================================================
interface CheckoutFormProps {
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  notes: string;
  setNotes: (v: string) => void;
  error: string;
  onBack: () => void;
}
function CheckoutForm({
  customerName,
  setCustomerName,
  customerPhone,
  setCustomerPhone,
  notes,
  setNotes,
  error,
  onBack,
}: CheckoutFormProps) {
  return (
    <div className="flex flex-col gap-4">
      <button
        onClick={onBack}
        className="self-start flex items-center gap-1.5 font-arabic text-xs text-white/50 hover:text-white transition-colors"
      >
        <ArrowLeft size={12} className="rotate-180" />
        رجوع للسلة
      </button>

      <h3 className="font-arabic text-base font-bold text-white">
        معلومات التواصل
      </h3>
      <p className="font-arabic text-xs text-white/40 leading-7">
        نحتاج بياناتك لإرسال الطلب وإتمام التأكيد عبر واتساب.
      </p>

      <Field
        label="الاسم الكامل"
        value={customerName}
        onChange={setCustomerName}
        placeholder="مثال: أحمد محمد"
        autoFocus
      />
      <Field
        label="رقم الهاتف"
        value={customerPhone}
        onChange={setCustomerPhone}
        placeholder="مثال: 0790000000"
        type="tel"
        dir="ltr"
      />
      <div className="flex flex-col gap-1.5">
        <label className="font-arabic text-xs text-white/50">
          ملاحظات (اختياري)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="أي ملاحظة عن العنوان أو وقت التسليم..."
          className="bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent/50 transition-all resize-none leading-7"
        />
      </div>

      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="font-arabic text-xs text-red-400 leading-6">{error}</p>
        </div>
      )}
    </div>
  );
}

// =====================================================================
// Reusable text field (matches admin form aesthetic)
// =====================================================================
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  dir?: "ltr" | "rtl";
  autoFocus?: boolean;
}
function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  dir,
  autoFocus,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-arabic text-xs text-white/50">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        dir={dir}
        autoFocus={autoFocus}
        className="bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-accent/50 transition-all"
      />
    </div>
  );
}
