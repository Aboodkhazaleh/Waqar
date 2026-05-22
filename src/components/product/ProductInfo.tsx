"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/types";
import ColorSelector from "./ColorSelector";
import SizeSelector from "./SizeSelector";
import QuantitySelector from "./QuantitySelector";
import Button from "@/components/ui/Button";
import { formatPrice, getDiscountPercentage, buildWhatsAppMessage, buildWhatsAppUrl } from "@/lib/utils";
import { ShoppingBag, Shield, Truck, RefreshCw, Star, ChevronDown } from "lucide-react";

interface ProductInfoProps {
  product: Product;
  onColorChange: (colorId: string) => void;
  selectedColorId: string;
}

export default function ProductInfo({ product, onColorChange, selectedColorId }: ProductInfoProps) {
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [showDetails, setShowDetails] = useState(false);
  const [error, setError] = useState("");

  const selectedColor = product.colors.find((c) => c.id === selectedColorId);
  const isSoldOut = selectedColor?.isSoldOut ?? false;
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "966500000000";

  const handleOrder = () => {
    setError("");
    if (!selectedSize) {
      setError("الرجاء اختيار المقاس أولاً");
      return;
    }
    const msg = buildWhatsAppMessage({
      productName: product.nameAr,
      colorName: selectedColor?.nameAr ?? "",
      size: selectedSize,
      quantity,
      price: product.price,
      currency: product.currency,
    });
    window.open(buildWhatsAppUrl(whatsappNumber, msg), "_blank");
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
          {formatPrice(product.price, product.currency)}
        </span>
        {product.originalPrice && (
          <>
            <span className="font-arabic text-xl text-cream/30 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
            <span className="bg-gold/15 text-gold font-arabic text-xs font-bold px-2 py-1 rounded-full">
              وفّر {getDiscountPercentage(product.price, product.originalPrice)}%
            </span>
          </>
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

      {/* Size */}
      <SizeSelector
        sizes={product.sizes}
        selectedSize={selectedSize}
        onSelect={setSelectedSize}
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

      {/* Order Button */}
      {isSoldOut ? (
        <div className="p-4 rounded-xl border border-red-400/20 bg-red-400/5 text-center">
          <p className="font-arabic text-red-400 font-medium">نفد المخزون — سيتوفر قريباً</p>
        </div>
      ) : (
        <Button
          onClick={handleOrder}
          size="xl"
          variant="gold"
          className="w-full gap-3 font-bold text-lg"
        >
          <ShoppingBag size={20} />
          اطلب عبر واتساب
        </Button>
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
