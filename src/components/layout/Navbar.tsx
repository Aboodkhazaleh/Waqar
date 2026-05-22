"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/products/al-sumo", label: "السمو" },
  { href: "/products/al-raqi", label: "الراقي" },
  { href: "/#accessories", label: "الاكسسوارات" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
          scrolled
            ? "bg-dark-1/95 backdrop-blur-xl border-b border-dark-4 py-3"
            : "bg-transparent py-5"
        )}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 text-cream/70 hover:text-gold transition-colors"
              aria-label="القائمة"
            >
              <Menu size={22} />
            </button>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-arabic text-sm text-cream/70 hover:text-gold transition-colors duration-300 relative group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 right-0 w-0 h-px bg-gold group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
            </nav>

            {/* Logo — centered */}
            <Link href="/" className="absolute left-1/2 -translate-x-1/2">
              <div className="relative w-24 h-12 md:w-28 md:h-14">
                <Image
                  src="/images/logo/waqar-logo.png"
                  alt="وقار"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Right side */}
            <div className="flex items-center gap-4">
              <Link
                href="/products/al-raqi"
                className="hidden md:flex items-center gap-2 text-cream/70 hover:text-gold transition-colors duration-300"
              >
                <ShoppingBag size={18} />
                <span className="font-arabic text-sm">تسوق الآن</span>
              </Link>
              {/* Spacer for mobile */}
              <div className="md:hidden w-8" />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 right-0 bottom-0 z-[70] w-72 bg-dark-2 border-l border-dark-4 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-dark-4">
                <div className="relative w-20 h-10">
                  <Image src="/images/logo/waqar-logo.png" alt="وقار" fill className="object-contain" />
                </div>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="p-2 text-cream/60 hover:text-gold transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <nav className="flex flex-col p-6 gap-2 flex-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.1 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMenuOpen(false)}
                      className="block py-3 px-4 font-arabic text-lg text-cream/80 hover:text-gold hover:bg-gold/5 rounded-xl transition-all duration-200"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="p-6 border-t border-dark-4">
                <p className="text-center text-xs text-cream/30 font-arabic">
                  © 2025 وقار — جميع الحقوق محفوظة
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
