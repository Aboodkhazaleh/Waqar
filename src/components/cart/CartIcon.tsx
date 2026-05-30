"use client";

import { ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";

interface CartIconProps {
  className?: string;
  iconSize?: number;
}

export default function CartIcon({ className = "", iconSize = 22 }: CartIconProps) {
  const { totalItems, setOpen } = useCart();
  return (
    <button
      onClick={() => setOpen(true)}
      className={`relative p-2 text-cream/70 hover:text-accent transition-colors ${className}`}
      aria-label={`فتح السلة (${totalItems} منتج)`}
    >
      <ShoppingBag size={iconSize} />
      <AnimatePresence>
        {totalItems > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-accent text-black font-arabic text-[10px] font-bold flex items-center justify-center"
            aria-hidden
          >
            {totalItems}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
