"use client";

import { Minus, Plus } from "lucide-react";

interface QuantitySelectorProps {
  value: number;
  onChange: (qty: number) => void;
  max?: number;
}

export default function QuantitySelector({ value, onChange, max = 10 }: QuantitySelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="font-arabic text-sm text-cream/60">الكمية</span>
      <div className="flex items-center gap-0 w-fit border border-dark-5 rounded-xl overflow-hidden">
        <button
          onClick={() => onChange(Math.max(1, value - 1))}
          className="w-11 h-11 flex items-center justify-center text-cream/60 hover:text-gold hover:bg-gold/5 transition-all duration-200 disabled:opacity-30"
          disabled={value <= 1}
        >
          <Minus size={16} />
        </button>
        <span className="w-12 h-11 flex items-center justify-center font-arabic text-lg text-cream font-medium border-x border-dark-5">
          {value}
        </span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-11 h-11 flex items-center justify-center text-cream/60 hover:text-gold hover:bg-gold/5 transition-all duration-200 disabled:opacity-30"
          disabled={value >= max}
        >
          <Plus size={16} />
        </button>
      </div>
    </div>
  );
}
