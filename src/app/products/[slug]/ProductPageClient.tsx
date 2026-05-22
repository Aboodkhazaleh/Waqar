"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { Product } from "@/types";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import ProductGallery from "@/components/product/ProductGallery";
import ProductInfo from "@/components/product/ProductInfo";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface Props {
  product: Product;
}

export default function ProductPageClient({ product }: Props) {
  const [selectedColorId, setSelectedColorId] = useState(product.colors[0]?.id ?? "");

  const selectedColor = product.colors.find((c) => c.id === selectedColorId);
  const currentImages = selectedColor?.images ?? product.colors[0]?.images ?? [];

  return (
    <main className="min-h-screen bg-dark">
      <Navbar />

      {/* Breadcrumb */}
      <div className="pt-24 pb-2 px-4 md:px-8 max-w-7xl mx-auto">
        <nav className="flex items-center gap-2 text-sm font-arabic text-cream/40">
          <Link href="/" className="hover:text-gold transition-colors">الرئيسية</Link>
          <ChevronLeft size={14} />
          <span className="text-cream/70">{product.nameAr}</span>
        </nav>
      </div>

      {/* Product Section */}
      <section className="py-8 md:py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
            {/* Gallery */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <ProductGallery images={currentImages} productName={product.nameAr} />
            </motion.div>

            {/* Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1], delay: 0.1 }}
            >
              <ProductInfo
                product={product}
                selectedColorId={selectedColorId}
                onColorChange={setSelectedColorId}
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mobile sticky order bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 lg:hidden">
        <div className="bg-dark-2/95 backdrop-blur-xl border-t border-dark-4 p-4 flex items-center gap-3">
          <div className="flex-1">
            <p className="font-arabic text-xs text-cream/50">السعر</p>
            <p className="font-arabic text-lg font-bold text-gold">
              {formatPrice(product.price, product.currency)}
            </p>
          </div>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "966500000000"}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-gold-gradient text-dark font-arabic font-bold text-base py-3 px-6 rounded-xl shadow-lg shadow-gold/20"
          >
            اطلب الآن
          </a>
        </div>
      </div>
      <div className="h-20 lg:hidden" />

      {/* Related products */}
      <section className="py-16 bg-dark-1">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <h3 className="font-arabic text-xl font-semibold text-cream mb-8 text-center">
            قد يعجبك أيضاً
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {product.colors.map((color) => (
              <motion.div
                key={color.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className={`relative rounded-xl overflow-hidden cursor-pointer group ${
                  color.id === selectedColorId ? "ring-2 ring-gold" : ""
                }`}
                onClick={() => setSelectedColorId(color.id)}
              >
                <div className="aspect-[3/4] relative bg-dark-2">
                  <Image
                    src={color.images[0] ?? "/images/placeholder.svg"}
                    alt={color.nameAr}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 50vw, 25vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark/70 to-transparent" />
                  {color.isSoldOut && (
                    <div className="absolute inset-0 bg-dark/60 flex items-center justify-center">
                      <span className="font-arabic text-xs text-red-400 bg-dark/80 px-2 py-1 rounded-full">
                        نفد
                      </span>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <p className="font-arabic text-xs text-cream/80">{color.nameAr}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  );
}
