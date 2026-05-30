"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Trash2,
  ChevronDown,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";
import type { DesignOption, ClosureOption, ColorVariant } from "@/types";
import ImageUploader from "./ImageUploader";

/**
 * Shared editor for "Designs" and "Closures" lists on a product.
 * Each option has: nameAr, nameEn, isActive, priceAdjustment, optional images.
 * Renders inside the ProductEditor — admin can add, edit inline, reorder,
 * toggle active, upload a dedicated gallery, and delete.
 */

export type ProductOption = DesignOption | ClosureOption;

interface ProductOptionListProps {
  /** UI label shown above the list (e.g. "التصاميم") */
  title: string;
  /** Plural noun for empty state + counter (e.g. "تصاميم") */
  pluralName: string;
  /** Singular noun for add button (e.g. "تصميم") */
  singularName: string;
  /** Product slug — used to namespace uploaded image folder */
  productSlug: string;
  /** Sub-folder under products/{slug}/ for this option type (e.g. "designs") */
  uploadSubfolder: string;
  /** Currency string for the price-adjustment field label (e.g. "د.أ") */
  currency: string;
  /** Current options — undefined means none yet */
  options: ProductOption[] | undefined;
  /** Called whenever the list changes */
  onChange: (next: ProductOption[]) => void;
  /**
   * Product's color list — used to render the "متاح للألوان" multi-select
   * inside each option. When the customer picks a color, only options whose
   * allowedColorIds contains it (or is empty) appear on the storefront.
   */
  productColors: ColorVariant[];
}

export default function ProductOptionList({
  title,
  pluralName,
  singularName,
  productSlug,
  uploadSubfolder,
  currency,
  options,
  onChange,
  productColors,
}: ProductOptionListProps) {
  const list = options ?? [];
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  const addOption = () => {
    const newOpt: ProductOption = {
      id: `opt-${Date.now().toString(36)}`,
      nameAr: "خيار جديد",
      nameEn: "",
      isActive: true,
      priceAdjustment: 0,
      images: [],
      displayOrder: (list[list.length - 1]?.displayOrder ?? 0) + 10,
    };
    onChange([...list, newOpt]);
    setOpenIdx(list.length);
  };

  const updateAt = (idx: number, patch: Partial<ProductOption>) => {
    const next = [...list];
    next[idx] = { ...next[idx], ...patch };
    onChange(next);
  };

  const removeAt = (idx: number) => {
    if (!confirm(`حذف "${list[idx].nameAr}"؟`)) return;
    onChange(list.filter((_, i) => i !== idx));
    if (openIdx === idx) setOpenIdx(null);
  };

  const move = (idx: number, dir: "up" | "down") => {
    const j = dir === "up" ? idx - 1 : idx + 1;
    if (j < 0 || j >= list.length) return;
    const next = [...list];
    const a = next[idx];
    const b = next[j];
    const aOrder = a.displayOrder ?? idx;
    const bOrder = b.displayOrder ?? j;
    next[idx] = { ...a, displayOrder: bOrder };
    next[j] = { ...b, displayOrder: aOrder };
    next.sort((x, y) => (x.displayOrder ?? 0) - (y.displayOrder ?? 0));
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-1">
        <p className="font-arabic text-sm text-white/60">
          {list.length} {pluralName}
        </p>
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-1.5 font-arabic text-xs text-[#3DB4C4] bg-[#3DB4C4]/10 hover:bg-[#3DB4C4]/20 px-3 py-2 rounded-lg transition-all"
        >
          <Plus size={12} />
          إضافة {singularName}
        </button>
      </div>

      {list.length === 0 && (
        <p className="font-arabic text-xs text-white/40 text-center py-6 leading-7">
          لا توجد {pluralName} مُعرّفة بعد. اضغط "إضافة {singularName}" للبدء.
        </p>
      )}

      {list.map((opt, idx) => (
        <div
          key={opt.id}
          className="bg-[#111111] border border-[#1C1C1C] rounded-xl overflow-hidden"
        >
          {/* Collapsed header */}
          <button
            type="button"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="w-full p-3 flex items-center gap-3 hover:bg-[#1C1C1C]/50 transition-colors"
          >
            {/* Order arrows */}
            <div className="flex flex-col gap-0.5">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(idx, "up");
                }}
                disabled={idx === 0}
                className="w-5 h-4 flex items-center justify-center text-white/40 hover:text-[#3DB4C4] disabled:opacity-25 transition-colors"
                title="نقل للأعلى"
              >
                <ArrowUp size={11} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  move(idx, "down");
                }}
                disabled={idx === list.length - 1}
                className="w-5 h-4 flex items-center justify-center text-white/40 hover:text-[#3DB4C4] disabled:opacity-25 transition-colors"
                title="نقل للأسفل"
              >
                <ArrowDown size={11} />
              </button>
            </div>

            <div className="flex-1 text-right">
              <p className="font-arabic text-sm text-white">{opt.nameAr}</p>
              <p className="font-arabic text-xs text-white/40 mt-0.5">
                {opt.nameEn || "—"} •{" "}
                {opt.images?.length ?? 0} صور
                {opt.priceAdjustment ? (
                  <>
                    {" "}
                    •{" "}
                    <span className="text-[#3DB4C4]">
                      {opt.priceAdjustment > 0 ? "+" : ""}
                      {opt.priceAdjustment} {currency}
                    </span>
                  </>
                ) : null}
                {!opt.isActive && <span className="text-red-400 mr-2">• معطّل</span>}
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                updateAt(idx, { isActive: !opt.isActive });
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                opt.isActive
                  ? "bg-[#3DB4C4]/15 text-[#3DB4C4]"
                  : "bg-[#1C1C1C] text-white/40 hover:text-white"
              }`}
              title={opt.isActive ? "تعطيل" : "تفعيل"}
            >
              {opt.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>

            <ChevronDown
              size={14}
              className={`text-white/40 transition-transform ${
                openIdx === idx ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Expanded body */}
          <AnimatePresence>
            {openIdx === idx && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="p-4 pt-0 flex flex-col gap-4 border-t border-[#1C1C1C]">
                  <div className="grid grid-cols-2 gap-3">
                    <Field
                      label="الاسم (عربي)"
                      value={opt.nameAr}
                      onChange={(v) => updateAt(idx, { nameAr: v })}
                    />
                    <Field
                      label="Name (English)"
                      value={opt.nameEn ?? ""}
                      onChange={(v) => updateAt(idx, { nameEn: v })}
                      dir="ltr"
                    />
                  </div>

                  <Field
                    label={`تعديل السعر (${currency}) — يمكن سالب`}
                    type="number"
                    value={String(opt.priceAdjustment ?? 0)}
                    onChange={(v) =>
                      updateAt(idx, { priceAdjustment: Number(v) || 0 })
                    }
                    hint='مثال: "5" يضيف 5 د.أ على السعر الأساسي، "-2" يخصم 2.'
                  />

                  {/* Color-scope: when non-empty, this option appears only if the customer picks one of these colors */}
                  <ColorScopePicker
                    productColors={productColors}
                    allowedColorIds={opt.allowedColorIds ?? []}
                    onChange={(ids) =>
                      updateAt(idx, {
                        allowedColorIds: ids.length === 0 ? undefined : ids,
                      })
                    }
                  />

                  <div className="flex flex-col gap-2">
                    <label className="font-arabic text-xs text-white/50">
                      صور هذا الخيار (اختياري — إذا فُرغ، تظهر صور اللون الاعتيادية)
                    </label>
                    <ImageUploader
                      productSlug={`${productSlug}-${uploadSubfolder}-${opt.id}`}
                      colorId="default"
                      images={opt.images ?? []}
                      onChange={(imgs) => updateAt(idx, { images: imgs })}
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => removeAt(idx)}
                    className="self-end flex items-center gap-1.5 font-arabic text-xs text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all"
                  >
                    <Trash2 size={12} />
                    حذف هذا الخيار
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ============================================================
// Color-scope picker — chooses which colors this option is valid for.
// Empty = all colors. One or more = limited to those colors.
// ============================================================
interface ColorScopePickerProps {
  productColors: ColorVariant[];
  allowedColorIds: string[];
  onChange: (next: string[]) => void;
}
function ColorScopePicker({
  productColors,
  allowedColorIds,
  onChange,
}: ColorScopePickerProps) {
  if (productColors.length === 0) return null;
  const allOn = allowedColorIds.length === 0;
  const toggleColor = (id: string) => {
    const has = allowedColorIds.includes(id);
    if (has) onChange(allowedColorIds.filter((x) => x !== id));
    else onChange([...allowedColorIds, id]);
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label className="font-arabic text-xs text-white/50">
          متاح للألوان
        </label>
        {!allOn && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="font-arabic text-[11px] text-white/40 hover:text-white"
          >
            إعادة تعيين (الكل)
          </button>
        )}
      </div>
      <p className="font-arabic text-[11px] text-white/30 leading-6">
        {allOn
          ? "هذا الخيار يظهر للزبون مع كل الألوان (افتراضي)."
          : `هذا الخيار يظهر فقط مع: ${productColors
              .filter((c) => allowedColorIds.includes(c.id))
              .map((c) => c.nameAr)
              .join(" • ")}`}
      </p>
      <div className="flex flex-wrap gap-2">
        {productColors.map((c) => {
          const selected = allowedColorIds.includes(c.id);
          const needsBorder = c.hex === "#FFFFFF" || c.hex === "#F8F8F8";
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => toggleColor(c.id)}
              className={`flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-lg font-arabic text-xs transition-all border ${
                selected || allOn
                  ? "border-[#3DB4C4]/40 bg-[#3DB4C4]/10 text-white"
                  : "border-[#2A2A2A] bg-[#1C1C1C] text-white/40 hover:text-white"
              }`}
              aria-pressed={selected}
              title={selected ? "اضغط لإزالة هذا اللون" : "اضغط لتقييد بهذا اللون"}
            >
              <span
                className="w-4 h-4 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: c.hex,
                  border: needsBorder ? "1px solid rgba(255,255,255,0.2)" : undefined,
                }}
              />
              <span>{c.nameAr}</span>
              {selected && <span className="text-[#3DB4C4]">✓</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================
// Tiny inline field
// ============================================================
interface FieldProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  dir?: "ltr" | "rtl";
  hint?: string;
}
function Field({ label, value, onChange, type = "text", dir, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-arabic text-xs text-white/50">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        dir={dir}
        className="bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#3DB4C4]/50 transition-all"
      />
      {hint && <p className="font-arabic text-[11px] text-white/30 leading-6">{hint}</p>}
    </div>
  );
}
