"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { ArrowLeft, ImageOff } from "lucide-react";

interface AccessoriesSectionProps {
  products: Product[];
}

export default function AccessoriesSection({ products }: AccessoriesSectionProps) {
  if (!products.length) return null;

  return (
    <section id="accessories" className="py-20 md:py-28 bg-[#0A0A0A] relative overflow-hidden scroll-mt-20">
      {/* Subtle background glow */}
      <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-14"
        >
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="w-8 h-px bg-accent" />
            <span className="font-arabic text-xs text-accent tracking-[0.4em] uppercase">
              ACCESSORIES
            </span>
            <span className="w-8 h-px bg-accent" />
          </div>
          <h2 className="font-arabic text-4xl md:text-5xl font-bold text-white mb-3">
            الاكسسوارات
          </h2>
          <p className="font-arabic text-white/50 text-sm md:text-base max-w-xl mx-auto">
            تفاصيل تكمّل إطلالتك بوقار وأناقة
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((product, i) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.08 }}
            >
              <AccessoryCard product={product} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AccessoryCard({ product }: { product: Product }) {
  const firstColor = product.colors[0];
  const heroImage = firstColor?.images?.[0];
  const hasImage = Boolean(heroImage);

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group flex flex-col bg-[#111111] border border-[#1C1C1C] hover:border-accent/40 transition-all duration-500"
    >
      {/* Image area */}
      <div className="relative aspect-[4/5] bg-[#0E0E0E] overflow-hidden">
        {hasImage ? (
          <Image
            src={heroImage!}
            alt={product.nameAr}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <EmptyImageState nameEn={product.nameEn} />
        )}

        {/* Badges */}
        {product.badges && product.badges.length > 0 && (
          <div className="absolute top-3 right-3 flex flex-col gap-1.5">
            {product.badges.map((b) => (
              <span
                key={b}
                className="bg-accent text-black font-arabic text-[10px] font-bold px-2.5 py-1 tracking-wide"
              >
                {b}
              </span>
            ))}
          </div>
        )}

        {/* Hover arrow */}
        <div className="absolute bottom-3 left-3 w-9 h-9 bg-white text-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-2 group-hover:translate-x-0">
          <ArrowLeft size={16} />
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col gap-2 border-t border-[#1C1C1C]">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-arabic text-xl font-bold text-white group-hover:text-accent transition-colors">
              {product.nameAr}
            </h3>
            <p className="font-arabic text-xs text-white/40 mt-0.5">
              {product.nameEn || product.subtitleAr}
            </p>
          </div>
          {product.colors.length > 1 && (
            <div className="flex items-center gap-1">
              {product.colors.slice(0, 4).map((c) => (
                <div
                  key={c.id}
                  className="w-3 h-3 rounded-full border border-white/15"
                  style={{ backgroundColor: c.hex }}
                  title={c.nameAr}
                />
              ))}
            </div>
          )}
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <span className="font-arabic text-lg font-bold text-accent">
            {formatPrice(product.price, product.currency)}
          </span>
          {product.originalPrice && (
            <span className="font-arabic text-xs text-white/25 line-through">
              {formatPrice(product.originalPrice, product.currency)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function EmptyImageState({ nameEn }: { nameEn?: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20">
      <div className="w-14 h-14 rounded-full border border-accent/20 flex items-center justify-center">
        <ImageOff size={20} className="text-accent/60" />
      </div>
      <span className="font-arabic text-xs tracking-[0.3em] uppercase text-accent/40">
        {nameEn || "COMING SOON"}
      </span>
      <span className="font-arabic text-[10px] text-white/30">صورة المنتج قريباً</span>
    </div>
  );
}
