"use client";

import { motion } from "framer-motion";
import type { ColorVariant } from "@/types";
import { Check } from "lucide-react";

interface ColorSelectorProps {
  colors: ColorVariant[];
  selectedColorId: string;
  onSelect: (colorId: string) => void;
}

export default function ColorSelector({
  colors,
  selectedColorId,
  onSelect,
}: ColorSelectorProps) {
  const selected = colors.find((c) => c.id === selectedColorId);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="font-arabic text-sm text-cream/60">اللون</span>
        <span className="font-arabic text-sm text-cream font-medium">
          {selected?.nameAr}
          {selected?.isSoldOut && (
            <span className="mr-2 text-xs text-red-400">— نفد المخزون</span>
          )}
        </span>
      </div>

      <div className="flex gap-3 flex-wrap">
        {colors.map((color) => {
          const isSelected = color.id === selectedColorId;
          const needsBorder = color.hex === "#FFFFFF" || color.hex === "#F8F8F8";

          return (
            <motion.button
              key={color.id}
              onClick={() => onSelect(color.id)}
              whileTap={{ scale: 0.92 }}
              className={`relative w-10 h-10 rounded-full transition-all duration-300 ${
                isSelected
                  ? "ring-2 ring-gold ring-offset-2 ring-offset-dark-2 scale-110"
                  : "hover:scale-110 hover:ring-1 hover:ring-gold/40 hover:ring-offset-1 hover:ring-offset-dark-2"
              } ${color.isSoldOut ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
              style={{
                backgroundColor: color.hex,
                border: needsBorder ? "1px solid rgba(255,255,255,0.15)" : undefined,
              }}
              disabled={color.isSoldOut}
              title={color.nameAr}
            >
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Check
                    size={14}
                    className={
                      isLightColor(color.hex) ? "text-dark" : "text-white"
                    }
                  />
                </motion.div>
              )}
              {color.isSoldOut && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full overflow-hidden">
                  <div className="w-full h-px bg-red-400/60 rotate-45" />
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function isLightColor(hex: string): boolean {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return false;
  const r = parseInt(result[1], 16);
  const g = parseInt(result[2], 16);
  const b = parseInt(result[3], 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6;
}
