"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, ArrowLeft } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      {/* Subtle background — clean black with a faint cyan glow */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />
      </div>

      {/* Vertical text accent — fashion brand style */}
      <div className="absolute top-1/2 -translate-y-1/2 right-6 hidden md:flex flex-col items-center gap-3 text-white/30 z-10">
        <div className="w-px h-16 bg-white/20" />
        <span className="font-arabic text-xs tracking-[0.3em] [writing-mode:vertical-rl] rotate-180">
          ٢٠٢٥ — مجموعة
        </span>
        <div className="w-px h-16 bg-white/20" />
      </div>

      {/* Year — minimal corner detail */}
      <div className="absolute top-28 left-6 hidden md:flex items-center gap-2 z-10">
        <div className="w-8 h-px bg-accent" />
        <span className="font-arabic text-xs text-white/40 tracking-widest">JORDAN</span>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-5xl mx-auto">
        {/* Small tag */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-8 inline-flex items-center gap-3"
        >
          <span className="w-8 h-px bg-accent" />
          <span className="font-arabic text-xs text-accent tracking-[0.4em] uppercase">
            ‎LUXURY FASHION
          </span>
          <span className="w-8 h-px bg-accent" />
        </motion.div>

        {/* Logo as hero centerpiece */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="mb-8 flex justify-center"
        >
          <div className="relative w-72 md:w-96 lg:w-[28rem] h-40 md:h-48">
            <Image
              src="/images/logo/waqar-logo.png"
              alt="وقار"
              fill
              className="object-contain"
              priority
            />
          </div>
        </motion.div>

        {/* Subtitle — clean modern */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="font-arabic text-white/80 text-lg md:text-xl mb-3 leading-relaxed max-w-2xl mx-auto"
        >
          فاشن أردني فاخر، حيث يلتقي التصميم الحديث بالحرفية الراقية
        </motion.p>

        {/* English subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.85 }}
          className="font-sans text-white/30 text-xs md:text-sm tracking-[0.25em] mb-12 uppercase"
          style={{ direction: "ltr" }}
        >
          Modern Jordanian Luxury • Est. 2025
        </motion.p>

        {/* CTA Buttons — clean modern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="flex flex-col sm:flex-row gap-3 justify-center items-center"
        >
          <Link
            href="/products/al-sumo"
            className="group relative inline-flex items-center justify-center gap-2 px-10 py-4 bg-white text-black font-arabic font-semibold text-base rounded-none w-full sm:w-auto sm:min-w-[200px] hover:bg-accent transition-colors duration-300"
          >
            <span>اكتشف المجموعة</span>
            <ArrowLeft size={16} className="transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
          <Link
            href="/products/al-raqi"
            className="group inline-flex items-center justify-center gap-2 px-10 py-4 border border-white/30 text-white font-arabic font-semibold text-base rounded-none w-full sm:w-auto sm:min-w-[200px] hover:border-accent hover:text-accent transition-all duration-300"
          >
            <span>تسوّق الآن</span>
          </Link>
        </motion.div>

        {/* Bottom stats — minimal */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="mt-20 grid grid-cols-3 gap-4 md:gap-12 max-w-2xl mx-auto"
        >
          {[
            { value: "100%", label: "أصلي" },
            { value: "48ساعة", label: "توصيل" },
            { value: "VIP", label: "خدمة" },
          ].map((stat) => (
            <div key={stat.label} className="text-center border-t border-white/10 pt-4">
              <div className="font-arabic text-xl md:text-2xl font-light text-white tracking-wider">
                {stat.value}
              </div>
              <div className="font-arabic text-[10px] md:text-xs text-white/40 mt-1 tracking-[0.3em] uppercase">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.8 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="font-arabic text-[10px] text-white/30 tracking-[0.4em] uppercase">SCROLL</span>
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <ChevronDown size={16} className="text-accent" />
        </motion.div>
      </motion.div>
    </section>
  );
}
