"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "gold" | "outline" | "ghost" | "dark";
  size?: "sm" | "md" | "lg" | "xl";
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "gold", size = "md", loading, children, disabled, ...props }, ref) => {
    const base =
      "relative inline-flex items-center justify-center font-arabic tracking-wide transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden";

    const variants = {
      gold: "bg-gold-gradient text-dark font-semibold shadow-lg shadow-gold/20 hover:shadow-gold/40 hover:scale-[1.02] active:scale-[0.98]",
      outline:
        "border border-gold/60 text-gold hover:bg-gold/10 hover:border-gold active:scale-[0.98]",
      ghost: "text-cream/70 hover:text-cream hover:bg-white/5 active:scale-[0.98]",
      dark: "bg-dark-3 text-cream hover:bg-dark-4 border border-dark-5 active:scale-[0.98]",
    };

    const sizes = {
      sm: "px-4 py-2 text-sm rounded-md",
      md: "px-6 py-3 text-base rounded-lg",
      lg: "px-8 py-4 text-lg rounded-xl",
      xl: "px-10 py-5 text-xl rounded-xl",
    };

    return (
      <button
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </span>
        )}
        <span className={loading ? "opacity-0" : ""}>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
