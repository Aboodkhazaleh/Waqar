"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { splitSizesIntoRows } from "@/lib/sizeMapping";

interface SizeSelectorProps {
  sizes: string[];
  selectedSize: string;
  onSelect: (size: string) => void;
}

export default function SizeSelector({
  sizes,
  selectedSize,
  onSelect,
}: SizeSelectorProps) {
  // Two-row visual layout (letters + numbers), but each button is independent.
  // Selecting a letter does NOT auto-select its number counterpart.
  const { letterRow, numberRow, others } = useMemo(
    () => splitSizesIntoRows(sizes),
    [sizes]
  );

  const isHighlighted = (size: string) => size === selectedSize;

  return (
    <div className="flex flex-col gap-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="font-arabic text-sm text-cream/60">المقاس</span>
        {selectedSize && (
          <span className="font-arabic text-sm text-cream font-medium">
            مقاس {selectedSize}
          </span>
        )}
      </div>

      {/* Row 1 — Letter sizes (XS, S, M, L, XL, XXL, XXXL ...) */}
      {letterRow.length > 0 && (
        <SizeRow
          sizes={letterRow}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
        />
      )}

      {/* Row 2 — Number sizes (52, 54, 56, 58, 60, 62, 64 ...) */}
      {numberRow.length > 0 && (
        <SizeRow
          sizes={numberRow}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
        />
      )}

      {/* Other sizes (e.g. One Size) */}
      {others.length > 0 && (
        <SizeRow
          sizes={others}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
        />
      )}

      <p className="font-arabic text-xs text-cream/30">
        * إذا كنت بين مقاسين، اختر المقاس الأكبر للراحة المثلى
      </p>
    </div>
  );
}

// =====================================================================
// One row of size buttons — shared between letter row, number row, etc.
// =====================================================================
interface SizeRowProps {
  sizes: string[];
  isHighlighted: (s: string) => boolean;
  onSelect: (s: string) => void;
}
function SizeRow({ sizes, isHighlighted, onSelect }: SizeRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const highlighted = isHighlighted(size);
        return (
          <motion.button
            key={size}
            onClick={() => onSelect(size)}
            whileTap={{ scale: 0.94 }}
            className={`relative w-12 h-12 rounded-xl font-arabic font-semibold text-sm transition-all duration-300 ${
              highlighted
                ? "bg-gold text-dark shadow-lg shadow-gold/20"
                : "bg-dark-3 text-cream/60 border border-dark-5 hover:border-gold/30 hover:text-cream"
            }`}
            aria-pressed={highlighted}
            aria-label={`مقاس ${size}`}
          >
            {size}
            {highlighted && (
              <motion.div
                layoutId={`size-indicator-${size}`}
                className="absolute inset-0 rounded-xl bg-gold-gradient -z-10"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
