"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Save, Trash2, Plus, Globe, Palette, Package, Tag,
  Layers, AlertCircle, Check, Languages, ChevronDown, Shirt, Lock, Grid3x3,
} from "lucide-react";
import type {
  Product, ColorVariant, Size, DesignOption, ClosureOption, SizePair,
} from "@/types";
import { AVAILABLE_BADGES } from "@/types";
import ImageUploader from "./ImageUploader";
import { formatPrice } from "@/lib/utils";
import { categories } from "@/data/categories";
import { subscribeSizes } from "@/lib/firestore";
import ProductOptionList, { type ProductOption } from "./ProductOptionList";
import SizeMatrixEditor from "./SizeMatrixEditor";

// Per-product extensions are scoped to specific products by slug.
// If you want to enable these tabs for another product later, add its slug here.
const SLUGS_WITH_EXTENSIONS = new Set(["al-raqi"]);

interface ProductEditorProps {
  product: Product;
  onSave: (updated: Product) => Promise<void>;
  onClose: () => void;
  onDelete?: (id: string) => Promise<void>;
}

type Tab =
  | "basic"
  | "colors"
  | "inventory"
  | "meta"
  | "designs"
  | "closures"
  | "matrix";

const BASE_TABS: { id: Tab; labelAr: string; icon: typeof Globe }[] = [
  { id: "basic", labelAr: "أساسي", icon: Globe },
  { id: "colors", labelAr: "الألوان والصور", icon: Palette },
  { id: "inventory", labelAr: "المخزون والمقاسات", icon: Package },
  { id: "meta", labelAr: "الشارات والترتيب", icon: Tag },
];

// Extra tabs for products that have design/closure/matrix options
const EXTENSION_TABS: { id: Tab; labelAr: string; icon: typeof Globe }[] = [
  { id: "designs", labelAr: "التصاميم", icon: Shirt },
  { id: "closures", labelAr: "نوع الإغلاق", icon: Lock },
  { id: "matrix", labelAr: "توفّر المقاسات", icon: Grid3x3 },
];

export default function ProductEditor({ product, onSave, onClose, onDelete }: ProductEditorProps) {
  const [draft, setDraft] = useState<Product>(product);
  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Reset draft when product changes
  useEffect(() => setDraft(product), [product]);

  const set = <K extends keyof Product>(key: K, value: Product[K]) =>
    setDraft((d) => ({ ...d, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    setMsg(null);
    try {
      await onSave({ ...draft, updatedAt: new Date().toISOString() });
      setMsg({ type: "ok", text: "تم حفظ التغييرات بنجاح" });
      setTimeout(() => setMsg(null), 2500);
    } catch (err) {
      setMsg({
        type: "err",
        text: err instanceof Error ? err.message : "فشل الحفظ",
      });
    } finally {
      setSaving(false);
    }
  };

  // ----- COLOR MANAGEMENT -----
  const updateColor = (idx: number, patch: Partial<ColorVariant>) => {
    const colors = [...draft.colors];
    colors[idx] = { ...colors[idx], ...patch };
    set("colors", colors);
  };
  const addColor = () => {
    const newColor: ColorVariant = {
      id: `color-${Date.now()}`,
      nameAr: "لون جديد",
      nameEn: "New color",
      hex: "#888888",
      images: [],
      stockQuantity: 0,
      isSoldOut: false,
    };
    set("colors", [...draft.colors, newColor]);
  };
  const removeColor = (idx: number) => {
    if (!confirm("حذف هذا اللون؟ سيتم فقد صوره من المنتج.")) return;
    set("colors", draft.colors.filter((_, i) => i !== idx));
  };

  // ----- SIZES -----
  const toggleSize = (size: string) => {
    const has = draft.sizes.includes(size);
    set("sizes", has ? draft.sizes.filter((s) => s !== size) : [...draft.sizes, size]);
  };

  // ----- BADGES -----
  const toggleBadge = (badge: string) => {
    const badges = draft.badges ?? [];
    const has = badges.includes(badge);
    set("badges", has ? badges.filter((b) => b !== badge) : [...badges, badge]);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        className="fixed top-0 bottom-0 left-0 w-full md:w-[640px] lg:w-[760px] z-50 bg-[#0A0A0A] border-r border-[#1C1C1C] flex flex-col shadow-2xl"
        style={{ direction: "rtl" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#1C1C1C] flex-shrink-0">
          <div>
            <h2 className="font-arabic text-lg font-bold text-white flex items-center gap-2">
              <span className="text-[#3DB4C4]">تعديل:</span>
              {draft.nameAr}
            </h2>
            <p className="font-arabic text-xs text-white/40 mt-0.5">
              {draft.nameEn ?? "—"} • {draft.id}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center text-white/60 hover:text-white hover:bg-[#1C1C1C] rounded-lg transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tabs — extension tabs appear only for products in SLUGS_WITH_EXTENSIONS */}
        <div className="flex border-b border-[#1C1C1C] px-2 flex-shrink-0 overflow-x-auto scrollbar-hide">
          {(SLUGS_WITH_EXTENSIONS.has(draft.slug)
            ? [...BASE_TABS, ...EXTENSION_TABS]
            : BASE_TABS
          ).map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`relative px-4 py-3 flex items-center gap-2 font-arabic text-sm whitespace-nowrap transition-colors ${
                  isActive ? "text-[#3DB4C4]" : "text-white/40 hover:text-white"
                }`}
              >
                <tab.icon size={14} />
                {tab.labelAr}
                {isActive && (
                  <motion.div
                    layoutId="active-tab"
                    className="absolute bottom-0 inset-x-2 h-px bg-[#3DB4C4]"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {activeTab === "basic" && <BasicTab draft={draft} set={set} />}
          {activeTab === "colors" && (
            <ColorsTab
              draft={draft}
              updateColor={updateColor}
              addColor={addColor}
              removeColor={removeColor}
            />
          )}
          {activeTab === "inventory" && (
            <InventoryTab draft={draft} set={set} toggleSize={toggleSize} />
          )}
          {activeTab === "meta" && (
            <MetaTab draft={draft} set={set} toggleBadge={toggleBadge} />
          )}
          {activeTab === "designs" && (
            <ProductOptionList
              title="التصاميم"
              pluralName="تصاميم"
              singularName="تصميم"
              productSlug={draft.slug}
              uploadSubfolder="designs"
              currency={draft.currency}
              options={draft.designs}
              productColors={draft.colors}
              onChange={(next) => set("designs", next as DesignOption[])}
            />
          )}
          {activeTab === "closures" && (
            <ProductOptionList
              title="نوع الإغلاق"
              pluralName="أنواع"
              singularName="نوع إغلاق"
              productSlug={draft.slug}
              uploadSubfolder="closures"
              currency={draft.currency}
              options={draft.closures}
              productColors={draft.colors}
              onChange={(next) => set("closures", next as ClosureOption[])}
            />
          )}
          {activeTab === "matrix" && (
            <SizeMatrixEditor
              sizes={draft.sizes}
              matrix={draft.sizeMatrix}
              onChange={(next) => set("sizeMatrix", next)}
            />
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1C1C1C] p-4 flex items-center gap-3 flex-shrink-0 bg-[#0A0A0A]">
          {msg && (
            <div
              className={`flex items-center gap-2 font-arabic text-xs px-3 py-2 rounded-lg ${
                msg.type === "ok"
                  ? "bg-green-500/10 text-green-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {msg.type === "ok" ? <Check size={14} /> : <AlertCircle size={14} />}
              {msg.text}
            </div>
          )}
          <div className="flex-1" />
          {onDelete && (
            <button
              type="button"
              onClick={() => {
                if (confirmDelete) {
                  onDelete(draft.id);
                } else {
                  setConfirmDelete(true);
                  setTimeout(() => setConfirmDelete(false), 4000);
                }
              }}
              className={`font-arabic text-sm px-4 py-2.5 rounded-lg transition-all flex items-center gap-2 ${
                confirmDelete
                  ? "bg-red-500 text-white"
                  : "text-red-400 bg-red-500/10 hover:bg-red-500/20"
              }`}
            >
              <Trash2 size={14} />
              {confirmDelete ? "تأكيد الحذف؟" : "حذف"}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="font-arabic text-sm px-4 py-2.5 text-white/60 hover:text-white transition-colors"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-[#3DB4C4] text-black font-arabic font-bold text-sm px-6 py-2.5 rounded-lg hover:bg-[#5FC9D9] active:scale-95 transition-all disabled:opacity-60"
          >
            {saving ? (
              <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save size={14} />
            )}
            حفظ التغييرات
          </button>
        </div>
      </motion.div>
    </>
  );
}

// =================================================================
// ----- TAB: BASIC INFO (Arabic + English) -----
// =================================================================
interface BasicTabProps {
  draft: Product;
  set: <K extends keyof Product>(key: K, value: Product[K]) => void;
}
function BasicTab({ draft, set }: BasicTabProps) {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  return (
    <div className="flex flex-col gap-5">
      {/* Lang toggle */}
      <div className="inline-flex p-1 bg-[#1C1C1C] rounded-lg w-fit">
        {(["ar", "en"] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-4 py-1.5 text-xs font-arabic rounded-md transition-all flex items-center gap-1.5 ${
              lang === l
                ? "bg-[#3DB4C4] text-black font-semibold"
                : "text-white/50 hover:text-white"
            }`}
          >
            <Languages size={12} />
            {l === "ar" ? "العربية" : "English"}
          </button>
        ))}
      </div>

      {lang === "ar" ? (
        <>
          <Input
            label="اسم المنتج (عربي)"
            value={draft.nameAr}
            onChange={(v) => set("nameAr", v)}
          />
          <Input
            label="العنوان الفرعي (عربي)"
            value={draft.subtitleAr}
            onChange={(v) => set("subtitleAr", v)}
          />
          <Textarea
            label="الوصف (عربي)"
            value={draft.descriptionAr}
            onChange={(v) => set("descriptionAr", v)}
            rows={5}
          />
          <ListEditor
            label="تفاصيل المنتج (عربي)"
            items={draft.detailsAr}
            onChange={(items) => set("detailsAr", items)}
            placeholder="مثال: خامة قطن بريميوم"
            dir="rtl"
          />
        </>
      ) : (
        <>
          <Input
            label="Product name (English)"
            value={draft.nameEn ?? ""}
            onChange={(v) => set("nameEn", v)}
            dir="ltr"
          />
          <Input
            label="Subtitle (English)"
            value={draft.subtitleEn ?? ""}
            onChange={(v) => set("subtitleEn", v)}
            dir="ltr"
          />
          <Textarea
            label="Description (English)"
            value={draft.descriptionEn ?? ""}
            onChange={(v) => set("descriptionEn", v)}
            rows={5}
            dir="ltr"
          />
          <ListEditor
            label="Product details (English)"
            items={draft.detailsEn ?? []}
            onChange={(items) => set("detailsEn", items)}
            placeholder="Example: Premium cotton fabric"
            dir="ltr"
          />
        </>
      )}

      {/* Slug */}
      <Input
        label="رابط المنتج (slug)"
        value={draft.slug}
        onChange={(v) => set("slug", v.replace(/[^a-z0-9-]/gi, "-").toLowerCase())}
        dir="ltr"
        hint="يُستخدم في الرابط: /products/<slug>"
      />
    </div>
  );
}

// =================================================================
// ----- TAB: COLORS & IMAGES -----
// =================================================================
interface ColorsTabProps {
  draft: Product;
  updateColor: (idx: number, patch: Partial<ColorVariant>) => void;
  addColor: () => void;
  removeColor: (idx: number) => void;
}
function ColorsTab({ draft, updateColor, addColor, removeColor }: ColorsTabProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between mb-2">
        <p className="font-arabic text-sm text-white/60">
          {draft.colors.length} {draft.colors.length === 1 ? "لون" : "ألوان"}
        </p>
        <button
          onClick={addColor}
          className="flex items-center gap-1.5 font-arabic text-xs text-[#3DB4C4] bg-[#3DB4C4]/10 hover:bg-[#3DB4C4]/20 px-3 py-2 rounded-lg transition-all"
        >
          <Plus size={12} />
          إضافة لون
        </button>
      </div>

      {draft.colors.map((color, idx) => (
        <div
          key={color.id}
          className="bg-[#111111] border border-[#1C1C1C] rounded-xl overflow-hidden"
        >
          {/* Color header — clickable */}
          <button
            type="button"
            onClick={() => setOpenIdx(openIdx === idx ? null : idx)}
            className="w-full p-4 flex items-center gap-3 hover:bg-[#1C1C1C]/50 transition-colors"
          >
            <div
              className="w-8 h-8 rounded-full border border-white/15 flex-shrink-0"
              style={{ backgroundColor: color.hex }}
            />
            <div className="flex-1 text-right">
              <p className="font-arabic text-sm text-white">{color.nameAr}</p>
              <p className="font-arabic text-xs text-white/40 mt-0.5">
                {color.nameEn || "—"} • {color.images.length} صور • {color.stockQuantity} قطعة
                {color.isSoldOut && <span className="text-red-400 mr-2">• نفد</span>}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`text-white/40 transition-transform ${
                openIdx === idx ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Expanded content */}
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
                    <Input
                      label="اسم اللون (عربي)"
                      value={color.nameAr}
                      onChange={(v) => updateColor(idx, { nameAr: v })}
                    />
                    <Input
                      label="Color name (English)"
                      value={color.nameEn ?? ""}
                      onChange={(v) => updateColor(idx, { nameEn: v })}
                      dir="ltr"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="font-arabic text-xs text-white/50">كود اللون</label>
                      <div className="relative flex items-center gap-2">
                        <input
                          type="color"
                          value={color.hex}
                          onChange={(e) => updateColor(idx, { hex: e.target.value })}
                          className="w-10 h-10 bg-[#1C1C1C] border border-[#2A2A2A] rounded-lg cursor-pointer p-0.5"
                        />
                        <input
                          type="text"
                          value={color.hex}
                          onChange={(e) => updateColor(idx, { hex: e.target.value })}
                          className="flex-1 bg-[#1C1C1C] border border-[#2A2A2A] text-white text-xs font-mono rounded-lg px-2 py-2 focus:outline-none focus:border-[#3DB4C4]/50"
                          dir="ltr"
                        />
                      </div>
                    </div>
                    <Input
                      label="المخزون"
                      type="number"
                      value={String(color.stockQuantity)}
                      onChange={(v) =>
                        updateColor(idx, {
                          stockQuantity: Number(v) || 0,
                          isSoldOut: Number(v) === 0,
                        })
                      }
                    />
                    <div className="flex flex-col gap-1.5">
                      <label className="font-arabic text-xs text-white/50">الحالة</label>
                      <button
                        type="button"
                        onClick={() =>
                          updateColor(idx, { isSoldOut: !color.isSoldOut })
                        }
                        className={`h-10 rounded-lg font-arabic text-xs transition-all ${
                          color.isSoldOut
                            ? "bg-red-500/15 text-red-400 border border-red-500/30"
                            : "bg-green-500/10 text-green-400 border border-green-500/30"
                        }`}
                      >
                        {color.isSoldOut ? "نفد" : "متاح"}
                      </button>
                    </div>
                  </div>

                  {/* Images */}
                  <div className="flex flex-col gap-2">
                    <label className="font-arabic text-xs text-white/50">
                      الصور (الصورة الأولى هي الرئيسية)
                    </label>
                    <ImageUploader
                      productSlug={draft.slug}
                      colorId={color.id}
                      images={color.images}
                      onChange={(newImages) => updateColor(idx, { images: newImages })}
                    />
                  </div>

                  {/* Delete color */}
                  <button
                    type="button"
                    onClick={() => removeColor(idx)}
                    className="self-end flex items-center gap-1.5 font-arabic text-xs text-red-400 hover:bg-red-500/10 px-3 py-2 rounded-lg transition-all"
                  >
                    <Trash2 size={12} />
                    حذف هذا اللون
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}

      {draft.colors.length === 0 && (
        <p className="text-center font-arabic text-sm text-white/30 py-8">
          لا توجد ألوان. أضف لوناً للبدء.
        </p>
      )}
    </div>
  );
}

// =================================================================
// ----- TAB: INVENTORY (price, sizes) -----
// =================================================================
interface InventoryTabProps {
  draft: Product;
  set: <K extends keyof Product>(key: K, value: Product[K]) => void;
  toggleSize: (s: string) => void;
}
function InventoryTab({ draft, set, toggleSize }: InventoryTabProps) {
  const totalStock = draft.colors.reduce((sum, c) => sum + c.stockQuantity, 0);

  // Sizes from Firestore (live-synced — admin can add/edit/disable from /admin/sizes)
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  useEffect(() => {
    const unsub = subscribeSizes((next) => setAvailableSizes(next));
    return () => unsub();
  }, []);

  // Active sizes only, sorted by displayOrder. Also include any custom legacy
  // sizes the product already has (so they stay visible even if removed from admin).
  const sizeOptions = [
    ...availableSizes
      .filter((s) => s.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((s) => s.label),
    ...draft.sizes.filter(
      (label) => !availableSizes.some((s) => s.label === label && s.isActive)
    ),
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Pricing */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#3DB4C4]/10 rounded-lg flex items-center justify-center">
            <Package size={14} className="text-[#3DB4C4]" />
          </div>
          <h3 className="font-arabic text-sm font-semibold text-white">التسعير</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={`السعر (${draft.currency})`}
            type="number"
            value={String(draft.price)}
            onChange={(v) => set("price", Number(v) || 0)}
          />
          <Input
            label={`السعر الأصلي (${draft.currency})`}
            type="number"
            value={String(draft.originalPrice ?? "")}
            onChange={(v) => set("originalPrice", v ? Number(v) : undefined)}
            hint="اتركه فارغاً إن لم يكن هناك تخفيض"
          />
        </div>
        {draft.originalPrice && draft.originalPrice > draft.price && (
          <div className="bg-[#3DB4C4]/5 border border-[#3DB4C4]/15 rounded-lg p-3">
            <p className="font-arabic text-xs text-[#3DB4C4]">
              نسبة الخصم:{" "}
              {Math.round(((draft.originalPrice - draft.price) / draft.originalPrice) * 100)}%
              • التوفير: {formatPrice(draft.originalPrice - draft.price, draft.currency)}
            </p>
          </div>
        )}
      </div>

      {/* Sizes */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#3DB4C4]/10 rounded-lg flex items-center justify-center">
              <Layers size={14} className="text-[#3DB4C4]" />
            </div>
            <h3 className="font-arabic text-sm font-semibold text-white">المقاسات المتوفرة</h3>
          </div>
          <span className="font-arabic text-xs text-white/40">
            {draft.sizes.length} مقاس
          </span>
        </div>
        {availableSizes.length === 0 ? (
          <p className="font-arabic text-xs text-white/40 leading-7">
            لا توجد مقاسات مُعرّفة بعد.{" "}
            <a
              href="/admin/sizes"
              className="text-[#3DB4C4] hover:text-[#5FC9D9] underline"
            >
              أضف مقاسات من صفحة "إدارة المقاسات"
            </a>
          </p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {sizeOptions.map((s) => {
              const isOn = draft.sizes.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSize(s)}
                  className={`px-4 py-2 rounded-lg font-arabic font-semibold text-xs transition-all ${
                    isOn
                      ? "bg-[#3DB4C4] text-black"
                      : "bg-[#1C1C1C] text-white/40 border border-[#2A2A2A] hover:text-white"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        )}
        <p className="font-arabic text-[11px] text-white/30">
          المقاسات تُدار من{" "}
          <a href="/admin/sizes" className="text-[#3DB4C4] hover:underline">
            صفحة "إدارة المقاسات"
          </a>
          . المُعطّلة لا تظهر هنا.
        </p>
      </div>

      {/* Order behavior — requiresSize + customField */}
      <OrderBehaviorSection draft={draft} set={set} />

      {/* Stock summary */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex items-center justify-between">
        <div>
          <p className="font-arabic text-xs text-white/50">إجمالي المخزون</p>
          <p className="font-arabic text-2xl font-bold text-white mt-1">
            {totalStock} <span className="text-sm font-normal text-white/40">قطعة</span>
          </p>
        </div>
        <div className="text-left">
          <p className="font-arabic text-xs text-white/50">القيمة المخزنة</p>
          <p className="font-arabic text-2xl font-bold text-[#3DB4C4] mt-1">
            {formatPrice(totalStock * draft.price, draft.currency)}
          </p>
        </div>
      </div>
    </div>
  );
}

// =================================================================
// ----- Order behavior section: requiresSize + customField config -----
// Lives inside Inventory tab. Universal — any product can opt in.
// =================================================================
interface OrderBehaviorProps {
  draft: Product;
  set: <K extends keyof Product>(key: K, value: Product[K]) => void;
}
function OrderBehaviorSection({ draft, set }: OrderBehaviorProps) {
  const requiresSize = draft.requiresSize !== false; // default true
  const cf = draft.customField;

  return (
    <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-[#3DB4C4]/10 rounded-lg flex items-center justify-center">
          <Tag size={14} className="text-[#3DB4C4]" />
        </div>
        <h3 className="font-arabic text-sm font-semibold text-white">سلوك الطلب</h3>
      </div>

      {/* Toggle: requires size */}
      <button
        type="button"
        onClick={() => set("requiresSize", !requiresSize)}
        className="w-full flex items-center justify-between py-2 px-2 hover:bg-[#1C1C1C]/50 rounded-lg transition-colors"
      >
        <div className="text-right">
          <span className="font-arabic text-sm text-white/80 block">
            يتطلب اختيار مقاس
          </span>
          <span className="font-arabic text-[11px] text-white/40 block mt-0.5">
            عطّله للمنتجات مثل المسابح/الإكسسوارات التي لا تحتاج مقاس
          </span>
        </div>
        <div
          className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${
            requiresSize ? "bg-[#3DB4C4]" : "bg-[#2A2A2A]"
          }`}
        >
          <span
            className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
              requiresSize ? "right-0.5" : "left-0.5"
            }`}
          />
        </div>
      </button>

      {/* Custom field config */}
      <div className="flex flex-col gap-3 border-t border-[#1C1C1C] pt-4">
        <div className="flex items-center justify-between">
          <span className="font-arabic text-sm text-white/80">
            حقل نص مخصص (اختياري)
          </span>
          <button
            type="button"
            onClick={() => {
              if (cf) {
                set("customField", undefined);
              } else {
                set("customField", {
                  label: "الاسم للنقش",
                  placeholder: "مثال: محمد",
                  required: false,
                  maxLength: 50,
                });
              }
            }}
            className={`relative w-10 h-5 rounded-full transition-all flex-shrink-0 ${
              cf ? "bg-[#3DB4C4]" : "bg-[#2A2A2A]"
            }`}
            aria-pressed={!!cf}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                cf ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
        </div>
        <p className="font-arabic text-[11px] text-white/40 leading-7">
          فعّله ليظهر للزبون مربع نص يكتب فيه (مثال: اسم النقش على المسبحة).
        </p>
        {cf && (
          <div className="flex flex-col gap-3 bg-[#0A0A0A] border border-[#1C1C1C] rounded-lg p-3">
            <Input
              label="عنوان الحقل (يظهر للزبون)"
              value={cf.label}
              onChange={(v) => set("customField", { ...cf, label: v })}
            />
            <Input
              label="Placeholder (نص توضيحي داخل المربع)"
              value={cf.placeholder ?? ""}
              onChange={(v) => set("customField", { ...cf, placeholder: v })}
            />
            <Input
              label="نص مساعد (يظهر تحت المربع)"
              value={cf.helperText ?? ""}
              onChange={(v) => set("customField", { ...cf, helperText: v })}
              hint="مثال: الحد الأقصى 5 أحرف للنقش الواضح"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="الحد الأقصى للأحرف"
                type="number"
                value={String(cf.maxLength ?? 50)}
                onChange={(v) =>
                  set("customField", { ...cf, maxLength: Number(v) || 50 })
                }
              />
              <button
                type="button"
                onClick={() =>
                  set("customField", { ...cf, required: !cf.required })
                }
                className={`flex flex-col items-center justify-center gap-1 rounded-lg border transition-all ${
                  cf.required
                    ? "bg-[#3DB4C4]/15 border-[#3DB4C4]/30 text-[#3DB4C4]"
                    : "bg-[#1C1C1C] border-[#2A2A2A] text-white/50"
                }`}
              >
                <span className="font-arabic text-xs">
                  {cf.required ? "✓ مطلوب" : "اختياري"}
                </span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// =================================================================
// ----- TAB: META (badges, order, status) -----
// =================================================================
interface MetaTabProps {
  draft: Product;
  set: <K extends keyof Product>(key: K, value: Product[K]) => void;
  toggleBadge: (b: string) => void;
}
function MetaTab({ draft, set, toggleBadge }: MetaTabProps) {
  return (
    <div className="flex flex-col gap-5">
      {/* Status */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex flex-col gap-3">
        <h3 className="font-arabic text-sm font-semibold text-white flex items-center gap-2">
          <div className="w-7 h-7 bg-[#3DB4C4]/10 rounded-lg flex items-center justify-center">
            <Tag size={14} className="text-[#3DB4C4]" />
          </div>
          الحالة والظهور
        </h3>

        <ToggleRow
          label="نشط (مرئي على الموقع)"
          value={draft.isActive}
          onChange={(v) => set("isActive", v)}
        />
        <ToggleRow
          label="مميّز (يظهر في الصفحة الرئيسية)"
          value={draft.isFeatured}
          onChange={(v) => set("isFeatured", v)}
        />
      </div>

      {/* Order */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex flex-col gap-3">
        <h3 className="font-arabic text-sm font-semibold text-white">ترتيب العرض</h3>
        <Input
          label="رقم الترتيب (الأصغر يظهر أولاً)"
          type="number"
          value={String(draft.displayOrder ?? 0)}
          onChange={(v) => set("displayOrder", Number(v) || 0)}
          hint="مثال: 1 = أول منتج، 2 = ثاني..."
        />
      </div>

      {/* Badges */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h3 className="font-arabic text-sm font-semibold text-white">الشارات</h3>
          <span className="font-arabic text-xs text-white/40">
            {(draft.badges ?? []).length} مُحدد
          </span>
        </div>
        <p className="font-arabic text-xs text-white/40">
          الشارات تظهر على كرت المنتج في الموقع.
        </p>
        <div className="flex flex-wrap gap-2">
          {AVAILABLE_BADGES.map((b) => {
            const isOn = (draft.badges ?? []).includes(b.value);
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => toggleBadge(b.value)}
                className={`px-3 py-2 rounded-lg font-arabic text-xs font-semibold transition-all flex items-center gap-2 ${
                  isOn
                    ? "bg-[#3DB4C4] text-black"
                    : "bg-[#1C1C1C] text-white/50 border border-[#2A2A2A] hover:text-white"
                }`}
              >
                {b.value}
                <span className="opacity-50 text-[10px] font-mono">{b.labelEn}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Category */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-xl p-4 flex flex-col gap-3">
        <h3 className="font-arabic text-sm font-semibold text-white">الفئة</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => {
            const isOn = draft.category === cat.slug;
            return (
              <button
                key={cat.slug}
                type="button"
                onClick={() => set("category", cat.slug)}
                className={`px-3 py-2 rounded-lg font-arabic text-xs font-semibold transition-all flex items-center gap-2 ${
                  isOn
                    ? "bg-[#3DB4C4] text-black"
                    : "bg-[#1C1C1C] text-white/50 border border-[#2A2A2A] hover:text-white"
                }`}
              >
                {cat.nameAr}
                <span className="opacity-50 text-[10px] font-mono">{cat.nameEn}</span>
              </button>
            );
          })}
        </div>
        {/* Custom category fallback */}
        <Input
          label="أو فئة مخصّصة (slug)"
          value={
            categories.find((c) => c.slug === draft.category) ? "" : draft.category
          }
          onChange={(v) =>
            v ? set("category", v.replace(/[^a-z0-9-]/gi, "-").toLowerCase()) : null
          }
          hint="اتركه فارغاً لاستخدام الفئات المسجّلة أعلاه"
          dir="ltr"
        />
      </div>
    </div>
  );
}

// =================================================================
// ----- REUSABLE FIELDS -----
// =================================================================
interface InputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  hint?: string;
  dir?: "ltr" | "rtl";
}
function Input({ label, value, onChange, type = "text", hint, dir }: InputProps) {
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
      {hint && <p className="font-arabic text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

interface TextareaProps extends Omit<InputProps, "type"> {
  rows?: number;
}
function Textarea({ label, value, onChange, rows = 4, hint, dir }: TextareaProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-arabic text-xs text-white/50">{label}</label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        dir={dir}
        className="bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#3DB4C4]/50 transition-all resize-none leading-7"
      />
      {hint && <p className="font-arabic text-[11px] text-white/30">{hint}</p>}
    </div>
  );
}

interface ListEditorProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
  dir?: "ltr" | "rtl";
}
function ListEditor({ label, items, onChange, placeholder, dir }: ListEditorProps) {
  const update = (i: number, v: string) => {
    const next = [...items];
    next[i] = v;
    onChange(next);
  };
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));
  const add = () => onChange([...items, ""]);

  return (
    <div className="flex flex-col gap-2">
      <label className="font-arabic text-xs text-white/50">{label}</label>
      <div className="flex flex-col gap-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            <input
              type="text"
              value={item}
              onChange={(e) => update(i, e.target.value)}
              placeholder={placeholder}
              dir={dir}
              className="flex-1 bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#3DB4C4]/50"
            />
            <button
              type="button"
              onClick={() => remove(i)}
              className="w-9 h-9 flex items-center justify-center text-red-400/60 hover:bg-red-500/10 hover:text-red-400 rounded-lg transition-all"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="flex items-center gap-1.5 font-arabic text-xs text-[#3DB4C4] hover:bg-[#3DB4C4]/10 px-3 py-2 rounded-lg w-fit transition-all"
      >
        <Plus size={12} />
        إضافة سطر
      </button>
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}
function ToggleRow({ label, value, onChange }: ToggleRowProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between py-2 px-2 hover:bg-[#1C1C1C]/50 rounded-lg transition-colors"
    >
      <span className="font-arabic text-sm text-white/70">{label}</span>
      <div
        className={`relative w-10 h-5 rounded-full transition-all ${
          value ? "bg-[#3DB4C4]" : "bg-[#2A2A2A]"
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
            value ? "right-0.5" : "left-0.5"
          }`}
        />
      </div>
    </button>
  );
}
