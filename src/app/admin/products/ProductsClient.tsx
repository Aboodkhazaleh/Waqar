"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/types";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import {
  Edit3, Eye, EyeOff, AlertCircle, Star, ArrowUpDown,
  Search, Plus, ImageOff,
} from "lucide-react";
import ProductEditor from "@/components/admin/ProductEditor";
import TypedConfirmModal from "@/components/admin/TypedConfirmModal";
import { categories } from "@/data/categories";
import { subscribeProducts } from "@/lib/firestore";

interface Props {
  initialProducts: Product[];
}

type CategoryFilter = "all" | string;

export default function ProductsClient({ initialProducts }: Props) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [msg, setMsg] = useState("");
  const [productPendingDelete, setProductPendingDelete] = useState<Product | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  // Real-time Firestore subscription
  useEffect(() => {
    const unsub = subscribeProducts((next) => setProducts(next));
    return () => unsub();
  }, []);

  const sorted = useMemo(() => {
    const filtered = products.filter((p) => {
      const matchSearch =
        !search ||
        p.nameAr.includes(search) ||
        (p.nameEn?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
        p.id.includes(search) ||
        p.slug.includes(search);
      const matchCategory =
        categoryFilter === "all" || p.category === categoryFilter;
      return matchSearch && matchCategory;
    });
    return [...filtered].sort(
      (a, b) =>
        (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
        a.id.localeCompare(b.id)
    );
  }, [products, search, categoryFilter]);

  const persist = async (next: Product[]) => {
    await fetch("/api/admin/products", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
  };

  const handleToggleActive = async (product: Product) => {
    const next = products.map((p) =>
      p.id === product.id ? { ...p, isActive: !p.isActive } : p
    );
    setProducts(next);
    await persist(next);
  };

  const handleToggleFeatured = async (product: Product) => {
    const next = products.map((p) =>
      p.id === product.id ? { ...p, isFeatured: !p.isFeatured } : p
    );
    setProducts(next);
    await persist(next);
  };

  const handleSaveProduct = async (updated: Product) => {
    // If product doesn't exist yet — it's a new one
    const exists = products.some((p) => p.id === updated.id);
    if (!exists) {
      const res = await fetch("/api/admin/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "فشل الإنشاء");
      }
      setProducts([...products, updated]);
      showMsg("تم إنشاء المنتج الجديد");
    } else {
      const next = products.map((p) => (p.id === updated.id ? updated : p));
      setProducts(next);
      await persist(next);
      showMsg("تم حفظ المنتج");
    }
  };

  // Step 1: When the editor asks to delete, open the typed-confirm modal first.
  const handleDeleteProduct = async (id: string) => {
    const target = products.find((p) => p.id === id) ?? null;
    if (target) setProductPendingDelete(target);
  };

  // Step 2: Called from the TypedConfirmModal — only fires after the admin
  // typed the product's nameAr exactly. This is the only path that actually
  // removes the doc from Firestore.
  const handleConfirmedDelete = async () => {
    if (!productPendingDelete) return;
    setDeletingBusy(true);
    try {
      const res = await fetch("/api/admin/products", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productPendingDelete.id }),
      });
      if (res.ok) {
        setProducts(products.filter((p) => p.id !== productPendingDelete.id));
        setEditing(null);
        showMsg(`تم حذف المنتج "${productPendingDelete.nameAr}"`);
        setProductPendingDelete(null);
      } else {
        showMsg("فشل الحذف");
      }
    } finally {
      setDeletingBusy(false);
    }
  };

  const handleCreateNew = () => {
    const ts = Date.now();
    const slug = `product-${ts}`;
    const newProduct: Product = {
      id: `new-${ts}`,
      slug,
      nameAr: "منتج جديد",
      subtitleAr: "",
      descriptionAr: "",
      detailsAr: [],
      nameEn: "New Product",
      subtitleEn: "",
      descriptionEn: "",
      detailsEn: [],
      price: 0,
      currency: "د.أ",
      colors: [
        {
          id: "default",
          nameAr: "افتراضي",
          nameEn: "Default",
          hex: "#888888",
          images: [],
          stockQuantity: 0,
          isSoldOut: false,
        },
      ],
      sizes: ["M", "L", "XL"],
      category: categoryFilter !== "all" ? categoryFilter : "accessories",
      isActive: false,
      isFeatured: false,
      displayOrder: products.length + 10,
      badges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setEditing(newProduct);
  };

  const showMsg = (text: string) => {
    setMsg(text);
    setTimeout(() => setMsg(""), 2500);
  };

  const stats = useMemo(() => {
    const totalStock = products.reduce(
      (sum, p) => sum + p.colors.reduce((s, c) => s + c.stockQuantity, 0),
      0
    );
    const totalValue = products.reduce(
      (sum, p) =>
        sum + p.colors.reduce((s, c) => s + c.stockQuantity * p.price, 0),
      0
    );
    return {
      total: products.length,
      active: products.filter((p) => p.isActive).length,
      totalStock,
      totalValue,
    };
  }, [products]);

  // Build category filter options
  const categoryFilterOptions = useMemo(() => {
    const presentCategories = Array.from(
      new Set(products.map((p) => p.category))
    );
    const opts: { value: CategoryFilter; label: string; count: number }[] = [
      { value: "all", label: "الكل", count: products.length },
    ];
    for (const c of categories) {
      if (presentCategories.includes(c.slug)) {
        opts.push({
          value: c.slug,
          label: c.nameAr,
          count: products.filter((p) => p.category === c.slug).length,
        });
      }
    }
    // Categories not in registry
    for (const c of presentCategories) {
      if (!categories.find((cat) => cat.slug === c)) {
        opts.push({
          value: c,
          label: c,
          count: products.filter((p) => p.category === c).length,
        });
      }
    }
    return opts;
  }, [products]);

  return (
    <div className="flex flex-col gap-5">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="إجمالي المنتجات" value={stats.total.toLocaleString("ar-SA")} />
        <StatCard label="نشطة" value={stats.active.toLocaleString("ar-SA")} accent />
        <StatCard label="المخزون الكلي" value={`${stats.totalStock} قطعة`} />
        <StatCard label="قيمة المخزون" value={formatPrice(stats.totalValue)} accent />
      </div>

      {/* Toolbar — search + add */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث عن منتج..."
            className="w-full bg-[#111111] border border-[#1C1C1C] text-white font-arabic text-sm rounded-xl px-4 py-2.5 pr-10 placeholder:text-white/20 focus:outline-none focus:border-[#3DB4C4]/40"
          />
          <Search size={15} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/25" />
        </div>
        <button
          onClick={handleCreateNew}
          className="flex items-center justify-center gap-2 bg-[#3DB4C4] text-black font-arabic font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#5FC9D9] active:scale-95 transition-all"
        >
          <Plus size={14} />
          إضافة منتج
        </button>
      </div>

      {/* Category filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="font-arabic text-xs text-white/40 ml-1">الفئة:</span>
        {categoryFilterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setCategoryFilter(opt.value)}
            className={`font-arabic text-xs px-3 py-1.5 rounded-lg transition-all border flex items-center gap-2 ${
              categoryFilter === opt.value
                ? "border-[#3DB4C4]/40 bg-[#3DB4C4]/10 text-[#3DB4C4]"
                : "border-[#1C1C1C] bg-[#111111] text-white/40 hover:text-white"
            }`}
          >
            {opt.label}
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded ${
                categoryFilter === opt.value
                  ? "bg-[#3DB4C4]/20"
                  : "bg-white/5"
              }`}
            >
              {opt.count}
            </span>
          </button>
        ))}
        <div className="flex items-center gap-1.5 font-arabic text-[11px] text-white/30 mr-auto">
          <ArrowUpDown size={11} />
          مُرتَّب حسب الترتيب
        </div>
      </div>

      {/* Success toast */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2"
          >
            <AlertCircle size={16} className="text-green-400" />
            <p className="font-arabic text-sm text-green-400">{msg}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Products Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {sorted.map((product) => {
          const totalStock = product.colors.reduce((s, c) => s + c.stockQuantity, 0);
          const heroImage = product.colors[0]?.images[0];
          const hasImage = Boolean(heroImage);
          const categoryName =
            categories.find((c) => c.slug === product.category)?.nameAr ?? product.category;

          return (
            <motion.div
              key={product.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111111] border border-[#1C1C1C] rounded-2xl overflow-hidden flex flex-col group hover:border-[#3DB4C4]/30 transition-colors"
            >
              <div className="flex">
                {/* Thumbnail */}
                <div className="relative w-32 sm:w-40 aspect-[4/5] flex-shrink-0 bg-[#0E0E0E]">
                  {hasImage ? (
                    <Image
                      src={heroImage!}
                      alt={product.nameAr}
                      fill
                      className="object-cover"
                      sizes="160px"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 text-white/20">
                      <ImageOff size={20} className="text-[#3DB4C4]/40" />
                      <span className="font-arabic text-[9px] text-white/30 tracking-wider">
                        لا توجد صور
                      </span>
                    </div>
                  )}
                  {product.badges && product.badges.length > 0 && (
                    <div className="absolute top-2 right-2 flex flex-col gap-1">
                      {product.badges.slice(0, 2).map((b) => (
                        <span
                          key={b}
                          className="bg-[#3DB4C4] text-black font-arabic text-[9px] font-bold px-2 py-0.5 tracking-wide"
                        >
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <span className="font-arabic text-xs text-white bg-black/80 px-2 py-1 rounded">
                        مخفي
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 p-4 flex flex-col gap-2.5 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-[#3DB4C4] font-mono text-[10px] tracking-wider">
                          #{product.displayOrder ?? "—"}
                        </span>
                        <span className="bg-white/5 text-white/50 font-arabic text-[10px] px-1.5 py-0.5 rounded">
                          {categoryName}
                        </span>
                        {product.isFeatured && (
                          <Star size={11} className="text-[#3DB4C4] fill-[#3DB4C4]" />
                        )}
                      </div>
                      <h3 className="font-arabic text-lg font-bold text-white truncate">
                        {product.nameAr}
                      </h3>
                      <p className="font-arabic text-xs text-white/40 truncate">
                        {product.nameEn ?? product.subtitleAr}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="font-arabic text-lg font-bold text-[#3DB4C4]">
                      {formatPrice(product.price, product.currency)}
                    </span>
                    {product.originalPrice && (
                      <>
                        <span className="font-arabic text-xs text-white/25 line-through">
                          {formatPrice(product.originalPrice, product.currency)}
                        </span>
                        <span className="font-arabic text-[10px] text-[#3DB4C4] bg-[#3DB4C4]/10 px-1.5 py-0.5 rounded">
                          -{getDiscountPercentage(product.price, product.originalPrice)}%
                        </span>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {product.colors.slice(0, 6).map((c) => (
                      <div
                        key={c.id}
                        title={`${c.nameAr}: ${c.isSoldOut ? "نفد" : c.stockQuantity}`}
                        className={`w-5 h-5 rounded-full border ${
                          c.isSoldOut
                            ? "border-red-500/40 opacity-50"
                            : "border-white/15"
                        }`}
                        style={{ backgroundColor: c.hex }}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-[#1C1C1C]">
                    <div className="font-arabic text-xs text-white/40">
                      <span className={totalStock === 0 ? "text-red-400" : ""}>
                        {totalStock} قطعة
                      </span>
                      <span className="mx-1.5">•</span>
                      {product.sizes.length} مقاس
                    </div>
                    <div className="flex items-center gap-1.5">
                      <ActionButton
                        active={product.isFeatured}
                        onClick={() => handleToggleFeatured(product)}
                        title={product.isFeatured ? "إلغاء التمييز" : "تمييز"}
                      >
                        <Star size={13} className={product.isFeatured ? "fill-[#3DB4C4]" : ""} />
                      </ActionButton>
                      <ActionButton
                        active={product.isActive}
                        onClick={() => handleToggleActive(product)}
                        title={product.isActive ? "إخفاء" : "إظهار"}
                      >
                        {product.isActive ? <Eye size={13} /> : <EyeOff size={13} />}
                      </ActionButton>
                      <button
                        onClick={() => setEditing(product)}
                        className="flex items-center gap-1.5 bg-[#3DB4C4] text-black font-arabic text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-[#5FC9D9] active:scale-95 transition-all"
                      >
                        <Edit3 size={12} />
                        تعديل
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {sorted.length === 0 && (
        <div className="text-center py-12 flex flex-col items-center gap-3">
          <p className="font-arabic text-sm text-white/30">
            {search || categoryFilter !== "all"
              ? "لا توجد منتجات تطابق البحث"
              : "لا توجد منتجات بعد"}
          </p>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-2 bg-[#3DB4C4] text-black font-arabic font-bold text-sm px-5 py-2.5 rounded-xl hover:bg-[#5FC9D9] transition-all"
          >
            <Plus size={14} />
            إضافة أول منتج
          </button>
        </div>
      )}

      {/* Editor */}
      <AnimatePresence>
        {editing && (
          <ProductEditor
            product={editing}
            onSave={async (updated) => {
              await handleSaveProduct(updated);
              setEditing(updated);
            }}
            onClose={() => setEditing(null)}
            onDelete={handleDeleteProduct}
          />
        )}
      </AnimatePresence>

      {/* Typed delete confirmation — admin must type the product's Arabic name */}
      <TypedConfirmModal
        open={productPendingDelete !== null}
        onClose={() => !deletingBusy && setProductPendingDelete(null)}
        onConfirm={handleConfirmedDelete}
        busy={deletingBusy}
        title={`حذف "${productPendingDelete?.nameAr ?? ""}" نهائياً؟`}
        message="سيتم حذف المنتج وكل ألوانه/مقاساته/صوره من Firestore. لا يمكن التراجع. تأكد قبل المتابعة."
        confirmWord={productPendingDelete?.nameAr ?? "DELETE"}
        confirmLabel="حذف المنتج"
      />
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string;
  accent?: boolean;
}
function StatCard({ label, value, accent }: StatCardProps) {
  return (
    <div
      className={`bg-[#111111] border rounded-xl p-4 ${
        accent ? "border-[#3DB4C4]/20" : "border-[#1C1C1C]"
      }`}
    >
      <p className="font-arabic text-xs text-white/40">{label}</p>
      <p
        className={`font-arabic text-lg font-bold mt-1 ${
          accent ? "text-[#3DB4C4]" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

interface ActionButtonProps {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}
function ActionButton({ active, onClick, title, children }: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
        active
          ? "bg-[#3DB4C4]/15 text-[#3DB4C4]"
          : "bg-[#1C1C1C] text-white/40 hover:text-white hover:bg-[#252525]"
      }`}
    >
      {children}
    </button>
  );
}
