"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Size } from "@/types";
import ColorSelector from "./ColorSelector";
import SizeSelector, { type SizeRowKey } from "./SizeSelector";
import OptionPicker from "./OptionPicker";
import QuantitySelector from "./QuantitySelector";
import Button from "@/components/ui/Button";
import { formatPrice, getDiscountPercentage, buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/utils";
import { ShoppingBag, Shield, Truck, RefreshCw, Star, ChevronDown } from "lucide-react";
import { subscribeSizes } from "@/lib/firestore";
import { useCart } from "@/context/CartContext";

interface ProductInfoProps {
  product: Product;
  onColorChange: (colorId: string) => void;
  selectedColorId: string;
  /** Optional — when set, parent gets notified so it can swap the gallery */
  onDesignChange?: (designId: string) => void;
  onClosureChange?: (closureId: string) => void;
}

export default function ProductInfo({
  product,
  onColorChange,
  selectedColorId,
  onDesignChange,
  onClosureChange,
}: ProductInfoProps) {
  // Independent selection per row — customer can pick a letter AND a number simultaneously
  const [sizeSelection, setSizeSelection] = useState({
    letter: "",
    number: "",
    other: "",
  });
  const [selectedDesignId, setSelectedDesignId] = useState("");
  const [selectedClosureId, setSelectedClosureId] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");
  const [allSizes, setAllSizes] = useState<Size[]>([]);

  // Look up selected design / closure objects (live derived from current selection)
  const selectedDesign = useMemo(
    () => product.designs?.find((d) => d.id === selectedDesignId && d.isActive),
    [product.designs, selectedDesignId]
  );
  const selectedClosure = useMemo(
    () => product.closures?.find((c) => c.id === selectedClosureId && c.isActive),
    [product.closures, selectedClosureId]
  );

  // Effective price = base + design adjustment + closure adjustment
  const effectivePrice = useMemo(
    () =>
      product.price +
      (selectedDesign?.priceAdjustment ?? 0) +
      (selectedClosure?.priceAdjustment ?? 0),
    [product.price, selectedDesign, selectedClosure]
  );

  // Real-time subscribe to sizes — so disabling a size in admin hides it instantly
  useEffect(() => {
    const unsub = subscribeSizes((next) => setAllSizes(next));
    return () => unsub();
  }, []);

  // Only show product sizes that are still active in the admin-managed sizes list.
  // (If a size hasn't loaded yet, fall back to product.sizes as-is.)
  const visibleSizes = useMemo(() => {
    if (allSizes.length === 0) return product.sizes;
    const activeLabels = new Set(
      allSizes.filter((s) => s.isActive).map((s) => s.label)
    );
    return product.sizes.filter((label) => activeLabels.has(label));
  }, [product.sizes, allSizes]);

  const selectedColor = product.colors.find((c) => c.id === selectedColorId);
  const isSoldOut = selectedColor?.isSoldOut ?? false;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966500000000";

  // Combined size string for orders/WhatsApp — joins whatever rows the customer picked.
  // E.g. "M / 60", "M", "60", or "" if nothing chosen yet.
  const combinedSize = [
    sizeSelection.letter,
    sizeSelection.number,
    sizeSelection.other,
  ]
    .filter(Boolean)
    .join(" / ");

  const handleOrder = () => {
    setError("");
    if (!combinedSize) {
      setError("الرجاء اختيار المقاس أولاً");
      return;
    }
    // Include optional design/closure in the WhatsApp message so the shop
    // sees the exact variant when the customer goes direct.
    const variantSuffix = [
      selectedDesign && `تصميم: ${selectedDesign.nameAr}`,
      selectedClosure && `إغلاق: ${selectedClosure.nameAr}`,
    ]
      .filter(Boolean)
      .join(" • ");
    const productLabel = variantSuffix
      ? `${product.nameAr} (${variantSuffix})`
      : product.nameAr;

    const msg = buildWhatsAppMessage({
      productName: productLabel,
      colorName: selectedColor?.nameAr ?? "",
      size: combinedSize,
      quantity,
      price: effectivePrice,
      currency: product.currency,
    });
    window.open(buildWhatsAppUrl(whatsappNumber, msg), "_blank");
  };

  const handleSizeChange = (row: SizeRowKey, value: string) => {
    setSizeSelection((prev) => ({ ...prev, [row]: value }));
  };

  const { addItem } = useCart();
  const handleAddToCart = () => {
    setError("");
    if (!combinedSize) {
      setError("الرجاء اختيار المقاس أولاً");
      return;
    }
    if (!selectedColor) {
      setError("الرجاء اختيار اللون أولاً");
      return;
    }
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.nameAr,
      colorId: selectedColor.id,
      colorName: selectedColor.nameAr,
      colorHex: selectedColor.hex,
      size: combinedSize,
      quantity,
      price: effectivePrice,
      currency: product.currency,
      image:
        selectedDesign?.images?.[0] ??
        selectedClosure?.images?.[0] ??
        selectedColor.images?.[0] ??
        "",
      designId: selectedDesign?.id,
      designName: selectedDesign?.nameAr,
      closureId: selectedClosure?.id,
      closureName: selectedClosure?.nameAr,
    });
  };

  return (
    <div className="flex flex-col gap-7">
      {/* Header */}
      <div>
        <span className="text-gold/60 font-arabic text-sm tracking-widest">
          تشكيلة وقار الفاخرة
        </span>
        <h1 className="font-display text-5xl md:text-6xl font-bold text-cream mt-2 leading-tight">
          {product.nameAr}
        </h1>
        <p className="font-arabic text-gold text-lg mt-2">{product.subtitleAr}</p>

        {/* Stars */}
        <div className="flex items-center gap-2 mt-3">
          {Array(5).fill(0).map((_, i) => (
            <Star
              key={i}
              size={14}
              className={i < 5 ? "text-gold fill-gold" : "text-dark-5"}
            />
          ))}
          <span className="font-arabic text-xs text-cream/40 mr-1">(+١٢٠ تقييم)</span>
        </div>
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-4">
        <span className="font-arabic text-4xl font-bold text-gold">
          {formatPrice(effectivePrice, product.currency)}
        </span>
        {product.originalPrice && product.originalPrice > effectivePrice && (
          <>
            <span className="font-arabic text-xl text-cream/30 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
            <span className="bg-gold/15 text-gold font-arabic text-xs font-bold px-2 py-1 rounded-full">
              وفّر {getDiscountPercentage(effectivePrice, product.originalPrice)}%
            </span>
          </>
        )}
        {effectivePrice !== product.price && (
          <span className="font-arabic text-xs text-cream/40">
            (السعر الأساسي {formatPrice(product.price, product.currency)})
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="h-px bg-dark-4" />

      {/* Description */}
      <p className="font-arabic text-cream/60 text-sm leading-8">{product.descriptionAr}</p>

      {/* Color */}
      <ColorSelector
        colors={product.colors}
        selectedColorId={selectedColorId}
        onSelect={onColorChange}
      />

      {/* Design — only when the product defines it (e.g. الراقي) */}
      {product.designs && product.designs.some((d) => d.isActive) && (
        <OptionPicker
          label="التصميم"
          options={product.designs}
          selectedId={selectedDesignId}
          currency={product.currency}
          onSelect={(id) => {
            setSelectedDesignId(id);
            onDesignChange?.(id);
          }}
        />
      )}

      {/* Closure — only when the product defines it (e.g. الراقي) */}
      {product.closures && product.closures.some((c) => c.isActive) && (
        <OptionPicker
          label="نوع الإغلاق"
          options={product.closures}
          selectedId={selectedClosureId}
          currency={product.currency}
          onSelect={(id) => {
            setSelectedClosureId(id);
            onClosureChange?.(id);
          }}
        />
      )}

      {/* Size — letter row + number row are independent (or matrix-gated for al-raqi) */}
      <SizeSelector
        sizes={visibleSizes}
        selection={sizeSelection}
        onChange={handleSizeChange}
        sizeMatrix={product.sizeMatrix}
      />

      {/* Quantity */}
      <QuantitySelector
        value={quantity}
        onChange={setQuantity}
        max={selectedColor?.stockQuantity ?? 10}
      />

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="font-arabic text-sm text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Order Buttons */}
      {isSoldOut ? (
        <div className="p-4 rounded-xl border border-red-400/20 bg-red-400/5 text-center">
          <p className="font-arabic text-red-400 font-medium">نفد المخزون — سيتوفر قريباً</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <Button
            onClick={handleAddToCart}
            size="xl"
            variant="gold"
            className="w-full gap-3 font-bold text-lg"
          >
            <ShoppingBag size={20} />
            أضف للسلة
          </Button>
          <button
            onClick={handleOrder}
            className="w-full flex items-center justify-center gap-3 py-3 border border-cream/20 text-cream/80 hover:text-cream hover:border-cream/40 font-arabic font-semibold text-sm rounded-xl transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-[#25D366]">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347" />
            </svg>
            اطلب فوراً عبر واتساب
          </button>
        </div>
      )}

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Truck, label: "شحن سريع" },
          { icon: Shield, label: "جودة مضمونة" },
          { icon: RefreshCw, label: "إرجاع مجاني" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex flex-col items-center gap-2 p-3 bg-dark-2 rounded-xl border border-dark-4"
          >
            <Icon size={16} className="text-gold" />
            <span className="font-arabic text-xs text-cream/50">{label}</span>
          </div>
        ))}
      </div>

      {/* Product Details Accordion */}
      <div className="border border-dark-4 rounded-xl overflow-hidden">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="w-full flex items-center justify-between p-4 text-right hover:bg-dark-2 transition-colors"
        >
          <span className="font-arabic text-sm text-cream/80 font-medium">تفاصيل المنتج</span>
          <ChevronDown
            size={16}
            className={`text-cream/40 transition-transform duration-300 ${showDetails ? "rotate-180" : ""}`}
          />
        </button>
        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <ul className="p-4 pt-0 flex flex-col gap-3 border-t border-dark-4">
                {product.detailsAr.map((detail, i) => (
                  <li key={i} className="flex items-start gap-3 font-arabic text-sm text-cream/60">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0 mt-1.5" />
                    {detail}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
