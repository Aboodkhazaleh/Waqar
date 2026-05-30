"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import { splitSizesIntoRows } from "@/lib/sizeMapping";
import type { SizePair } from "@/types";

export type SizeRowKey = "letter" | "number" | "other";

interface SizeSelectorProps {
  sizes: string[];
  /** Selection per row — each row is independent. */
  selection: { letter: string; number: string; other: string };
  /** Fires when a button is clicked. row tells which row owns the value. */
  onChange: (row: SizeRowKey, value: string) => void;
  /**
   * Optional letter↔number availability matrix.
   * If provided, button highlight + click are gated by this matrix so the
   * customer can't pick a sold-out combination. Without it, behavior is
   * unchanged (any size selectable, no cross-row constraint).
   */
  sizeMatrix?: SizePair[];
}

export default function SizeSelector({
  sizes,
  selection,
  onChange,
  sizeMatrix,
}: SizeSelectorProps) {
  const { letterRow, numberRow, others } = useMemo(
    () => splitSizesIntoRows(sizes),
    [sizes]
  );

  // O(1) lookup of "letter+number" availability
  const matrixMap = useMemo(() => {
    if (!sizeMatrix) return null;
    const m = new Map<string, boolean>();
    for (const p of sizeMatrix) {
      m.set(`${p.letterSize}__${p.numberSize}`, p.inStock);
    }
    return m;
  }, [sizeMatrix]);

  /**
   * If a matrix is provided, a number is disabled when:
   *  - the user picked a letter and that pair is sold out, OR
   *  - no letter is picked yet AND every pair for that number is sold out
   * Similarly for letters.
   */
  const isNumberDisabled = (n: string) => {
    if (!matrixMap) return false;
    if (selection.letter) {
      const v = matrixMap.get(`${selection.letter}__${n}`);
      return v === false; // explicit sold out
    }
    // No letter chosen — check if any letter has this number available
    return letterRow.every((l) => matrixMap.get(`${l}__${n}`) === false);
  };
  const isLetterDisabled = (l: string) => {
    if (!matrixMap) return false;
    if (selection.number) {
      const v = matrixMap.get(`${l}__${selection.number}`);
      return v === false;
    }
    return numberRow.every((n) => matrixMap.get(`${l}__${n}`) === false);
  };

  const displayLabel = [selection.letter, selection.number, selection.other]
    .filter(Boolean)
    .join(" / ");

  const handleClick = (row: SizeRowKey, value: string) => {
    if (selection[row] === value) onChange(row, "");
    else onChange(row, value);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-arabic text-sm text-cream/60">المقاس</span>
        {displayLabel && (
          <span className="font-arabic text-sm text-cream font-medium">
            مقاس {displayLabel}
          </span>
        )}
      </div>

      {letterRow.length > 0 && (
        <SizeRow
          sizes={letterRow}
          selectedValue={selection.letter}
          isDisabled={isLetterDisabled}
          onClick={(v) => handleClick("letter", v)}
        />
      )}

      {numberRow.length > 0 && (
        <SizeRow
          sizes={numberRow}
          selectedValue={selection.number}
          isDisabled={isNumberDisabled}
          onClick={(v) => handleClick("number", v)}
        />
      )}

      {others.length > 0 && (
        <SizeRow
          sizes={others}
          selectedValue={selection.other}
          isDisabled={() => false}
          onClick={(v) => handleClick("other", v)}
        />
      )}

      <p className="font-arabic text-xs text-cream/30">
        * يمكنك اختيار مقاس من الحروف ومقاس من الأرقام معاً
      </p>
    </div>
  );
}

interface SizeRowProps {
  sizes: string[];
  selectedValue: string;
  isDisabled: (v: string) => boolean;
  onClick: (value: string) => void;
}
function SizeRow({ sizes, selectedValue, isDisabled, onClick }: SizeRowProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {sizes.map((size) => {
        const highlighted = size === selectedValue;
        const disabled = isDisabled(size);
        return (
          <motion.button
            key={size}
            onClick={() => !disabled && onClick(size)}
            whileTap={disabled ? undefined : { scale: 0.94 }}
            disabled={disabled}
            className={`relative w-12 h-12 rounded-xl font-arabic font-semibold text-sm transition-all duration-300 ${
              disabled
                ? "bg-dark-3/40 text-cream/20 border border-dark-5/50 cursor-not-allowed"
                : highlighted
                ? "bg-gold text-dark shadow-lg shadow-gold/20"
                : "bg-dark-3 text-cream/60 border border-dark-5 hover:border-gold/30 hover:text-cream"
            }`}
            aria-pressed={highlighted}
            aria-disabled={disabled}
            aria-label={`مقاس ${size}${disabled ? " (نفد المخزون)" : ""}`}
          >
            {size}
            {disabled && (
              <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="block w-8 h-px bg-cream/30 rotate-45" />
              </span>
            )}
            {highlighted && !disabled && (
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
