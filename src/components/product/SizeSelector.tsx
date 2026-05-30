"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { splitSizesIntoRows } from "@/lib/sizeMapping";

export type SizeRowKey = "letter" | "number" | "other";

interface SizeSelectorProps {
  sizes: string[];
  /** Selection per row — each row is independent. */
  selection: { letter: string; number: string; other: string };
  /** Fires when a button is clicked. row tells which row owns the value. */
  onChange: (row: SizeRowKey, value: string) => void;
}

export default function SizeSelector({
  sizes,
  selection,
  onChange,
}: SizeSelectorProps) {
  const { letterRow, numberRow, others } = useMemo(
    () => splitSizesIntoRows(sizes),
    [sizes]
  );

  // Build a one-line display label out of all currently chosen rows.
  // e.g. "M / 60", "M", "60", or empty when nothing selected.
  const displayLabel = [selection.letter, selection.number, selection.other]
    .filter(Boolean)
    .join(" / ");

  // Clicking an already-selected button in a row clears that row.
  // This lets the customer "remove" their letter-pick without changing the number-pick.
  const handleClick = (row: SizeRowKey, value: string) => {
    if (selection[row] === value) onChange(row, "");
    else onChange(row, value);
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Label row */}
      <div className="flex items-center justify-between">
        <span className="font-arabic text-sm text-cream/60">المقاس</span>
        {displayLabel && (
          <span className="font-arabic text-sm text-cream font-medium">
            مقاس {displayLabel}
          </span>
        )}
      </div>

      {/* Row 1 — Letter sizes */}
      {letterRow.length > 0 && (
        <SizeRow
          sizes={letterRow}
          selectedValue={selection.letter}
          onClick={(v) => handleClick("letter", v)}
        />
      )}

      {/* Row 2 — Number sizes */}
      {numberRow.length > 0 && (
        <SizeRow
          sizes={numberRow}
          selectedValue={selection.number}
          onClick={(v) => handleClick("number", v)}
        />
      )}

      {/* Other sizes (e.g. One Size) */}
      {others.length > 0 && (
        <SizeRow
          sizes={others}
          selectedValue={selection.other}
          onClick={(v) => handleClick("other", v)}
        />
      )}

      <p className="font-arabic text-xs text-cream/30">
        * يمكنك اختيار مقاس من الحروف ومقاس من الأرقام معاً
      </p>
    </div>
  );
}

// =====================================================================
// One row of size buttons — each row is independent.
// =====================================================================
interface SizeRowProps {
  sizes: string[];
  selectedValue: string;
  onClick: (value: string) => void;
}
function SizeRow({ sizes, selectedValue, onClick }: SizeRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const highlighted = size === selectedValue;
        return (
          <motion.button
            key={size}
            onClick={() => onClick(size)}
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
