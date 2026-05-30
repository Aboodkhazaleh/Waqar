"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  getMappedSize,
  splitSizesIntoRows,
  formatSizeWithPair,
} from "@/lib/sizeMapping";

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
  const { letterRow, numberRow, others } = useMemo(
    () => splitSizesIntoRows(sizes),
    [sizes]
  );

  // The mapped pair of the user's selection — both should appear highlighted
  const pairedSize = selectedSize ? getMappedSize(selectedSize) : null;

  const isHighlighted = (size: string) =>
    size === selectedSize || size === pairedSize;

  return (
    <div className="flex flex-col gap-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="font-arabic text-sm text-cream/60">المقاس</span>
        {selectedSize && (
          <span className="font-arabic text-sm text-cream font-medium">
            مقاس {formatSizeWithPair(selectedSize)}
          </span>
        )}
      </div>

      {/* Row 1 — Letter sizes (S, M, L, XL, XXL, ...) */}
      {letterRow.length > 0 && (
        <SizeRow
          sizes={letterRow}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
        />
      )}

      {/* Row 2 — Number sizes (54, 56, 58, 60, 62, ...) */}
      {numberRow.length > 0 && (
        <SizeRow
          sizes={numberRow}
          isHighlighted={isHighlighted}
          onSelect={onSelect}
        />
      )}

      {/* Other sizes (e.g. One Size) — separate row if any */}
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
