"use client";

import { motion } from "framer-motion";
import type { DesignOption, ClosureOption } from "@/types";

interface OptionPickerProps {
  /** Label above the picker, e.g. "التصميم" */
  label: string;
  /** Available options (the component filters out isActive=false) */
  options: (DesignOption | ClosureOption)[];
  /** Currently-selected option id, or "" for none */
  selectedId: string;
  /** Currency suffix for the price-adjustment chip ("د.أ" by default) */
  currency: string;
  /** Click handler — selecting the same option again clears it */
  onSelect: (id: string) => void;
}

export default function OptionPicker({
  label,
  options,
  selectedId,
  currency,
  onSelect,
}: OptionPickerProps) {
  const visible = options.filter((o) => o.isActive);
  if (visible.length === 0) return null;

  const selected = visible.find((o) => o.id === selectedId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-arabic text-sm text-cream/60">{label}</span>
        {selected && (
          <span className="font-arabic text-sm text-cream font-medium">
            {selected.nameAr}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {visible.map((opt) => {
          const isSelected = opt.id === selectedId;
          const delta = opt.priceAdjustment ?? 0;
          return (
            <motion.button
              key={opt.id}
              type="button"
              whileTap={{ scale: 0.96 }}
              onClick={() => onSelect(isSelected ? "" : opt.id)}
              className={`group inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-arabic font-semibold text-sm transition-all duration-300 ${
                isSelected
                  ? "bg-gold text-dark shadow-lg shadow-gold/20"
                  : "bg-dark-3 text-cream/70 border border-dark-5 hover:border-gold/30 hover:text-cream"
              }`}
              aria-pressed={isSelected}
            >
              <span>{opt.nameAr}</span>
              {delta !== 0 && (
                <span
                  className={`text-[10px] font-normal ${
                    isSelected ? "text-dark/70" : "text-cream/40"
                  }`}
                  dir="ltr"
                >
                  {delta > 0 ? "+" : ""}
                  {delta} {currency}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
