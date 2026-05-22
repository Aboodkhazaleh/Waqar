"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import type { Product } from "@/types";
import { formatPrice, getDiscountPercentage } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface CollectionSectionProps {
  product: Product;
  reverse?: boolean;
}

export default function CollectionSection({ product, reverse = false }: CollectionSectionProps) {
  const firstColor = product.colors[0];
  const heroImage = firstColor?.images[0] ?? "/images/placeholder.svg";

  return (
    <section className={`py-20 md:py-28 ${reverse ? "bg-dark-1" : "bg-dark"}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div
          className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${
            reverse ? "lg:flex-row-reverse" : ""
          }`}
          style={reverse ? { direction: "ltr" } : {}}
        >
          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? 40 : -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
            className={`relative group ${reverse ? "order-2 lg:order-1" : ""}`}
          >
            {/* Color swatches preview */}
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-dark-2">
              <Image
                src={heroImage}
                alt={product.nameAr}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/60 via-transparent to-transparent" />

              {/* Color dots at bottom */}
              <div className="absolute bottom-5 right-5 flex gap-2">
                {product.colors.slice(0, 4).map((color) => (
                  <div
                    key={color.id}
                    className="w-5 h-5 rounded-full border-2 border-white/60 shadow-lg transition-transform hover:scale-110"
                    style={{ backgroundColor: color.hex }}
                    title={color.nameAr}
                  />
                ))}
              </div>

              {/* Product badges (top right) */}
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-5 right-5 flex flex-col gap-1.5">
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

              {/* Discount badge (top left) */}
              {product.originalPrice && (
                <div className="absolute top-5 left-5 bg-white text-black font-arabic text-[10px] font-bold px-2.5 py-1 tracking-wide">
                  -{getDiscountPercentage(product.price, product.originalPrice)}%
                </div>
              )}
            </div>

            {/* Decorative element */}
            <div className="absolute -bottom-4 -left-4 w-32 h-32 border border-gold/10 rounded-2xl -z-10" />
            <div className="absolute -top-4 -right-4 w-24 h-24 border border-gold/5 rounded-2xl -z-10" />
          </motion.div>

          {/* Text side */}
          <motion.div
            initial={{ opacity: 0, x: reverse ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.25, 0.1, 0.25, 1], delay: 0.15 }}
            className={`flex flex-col gap-6 ${reverse ? "order-1 lg:order-2" : ""}`}
            style={{ direction: "rtl" }}
          >
            {/* Label */}
            <span className="text-gold/70 font-arabic text-sm tracking-[0.25em]">
              تشكيلة وقار الفاخرة
            </span>

            {/* Title */}
            <h2 className="font-display text-6xl md:text-7xl font-bold text-cream leading-tight">
              {product.nameAr}
            </h2>
            <p className="font-arabic text-gold text-xl">{product.subtitleAr}</p>

            {/* Divider */}
            <div className="w-20 h-0.5 bg-gold-gradient rounded-full" />

            {/* Description */}
            <p className="font-arabic text-cream/60 text-base leading-8">
              {product.descriptionAr}
            </p>

            {/* Features */}
            <ul className="flex flex-col gap-3">
              {product.detailsAr.slice(0, 3).map((detail, i) => (
                <li key={i} className="flex items-center gap-3 font-arabic text-sm text-cream/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-gold flex-shrink-0" />
                  {detail}
                </li>
              ))}
            </ul>

            {/* Price */}
            <div className="flex items-baseline gap-3 mt-2">
              <span className="font-arabic text-3xl font-bold text-gold">
                {formatPrice(product.price, product.currency)}
              </span>
              {product.originalPrice && (
                <span className="font-arabic text-lg text-cream/30 line-through">
                  {formatPrice(product.originalPrice, product.currency)}
                </span>
              )}
            </div>

            {/* Colors available */}
            <div className="flex items-center gap-3">
              <span className="font-arabic text-sm text-cream/40">الألوان المتاحة:</span>
              <div className="flex gap-2">
                {product.colors.map((color) => (
                  <div
                    key={color.id}
                    className="w-6 h-6 rounded-full border-2 border-dark-5 hover:border-gold/60 transition-all cursor-pointer shadow-md"
                    style={{ backgroundColor: color.hex }}
                    title={color.nameAr}
                  />
                ))}
              </div>
            </div>

            {/* CTA */}
            <Link href={`/products/${product.slug}`} className="mt-2">
              <motion.div
                whileHover={{ gap: "16px" }}
                className="inline-flex items-center gap-3 text-gold font-arabic font-semibold text-lg group"
              >
                <span>تسوق الآن</span>
                <ArrowLeft
                  size={20}
                  className="transition-transform duration-300 group-hover:-translate-x-2"
                />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
