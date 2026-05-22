"use client";

import { motion } from "framer-motion";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelect: (size: string) => void;
}

export default function SizeSelector({ sizes, selectedSize, onSelect }: SizeSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-arabic text-sm text-cream/60">المقاس</span>
        {selectedSize && (
          <span className="font-arabic text-sm text-cream font-medium">
            مقاس {selectedSize}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {sizes.map((size) => {
          const isSelected = size === selectedSize;
          return (
            <motion.button
              key={size}
              onClick={() => onSelect(size)}
              whileTap={{ scale: 0.94 }}
              className={`relative w-12 h-12 rounded-xl font-arabic font-semibold text-sm transition-all duration-300 ${
                isSelected
                  ? "bg-gold text-dark shadow-lg shadow-gold/20"
                  : "bg-dark-3 text-cream/60 border border-dark-5 hover:border-gold/30 hover:text-cream"
              }`}
            >
              {size}
              {isSelected && (
                <motion.div
                  layoutId="size-indicator"
                  className="absolute inset-0 rounded-xl bg-gold-gradient -z-10"
                />
              )}
            </motion.button>
          );
        })}
      </div>

      <p className="font-arabic text-xs text-cream/30">
        * إذا كنت بين مقاسين، اختر المقاس الأكبر للراحة المثلى
      </p>
    </div>
  );
}
