"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { subscribeProducts } from "@/lib/firestore";

export default function LiveFinalCTA({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const unsub = subscribeProducts((next) => setProducts(next));
    return () => unsub();
  }, []);

  const mainCollection = products
    .filter((p) => p.isActive && p.category === "fashion")
    .sort(
      (a, b) =>
        (a.displayOrder ?? 999) - (b.displayOrder ?? 999) ||
        a.id.localeCompare(b.id)
    );

  return (
    <section className="py-24 bg-[#0A0A0A] relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/8 rounded-full blur-[160px]" />
      <div className="relative max-w-3xl mx-auto px-4 text-center">
        <div className="inline-flex items-center gap-3 mb-6">
          <span className="w-8 h-px bg-accent" />
          <span className="font-arabic text-xs text-accent tracking-[0.4em] uppercase">
            JOIN WAQAR
          </span>
          <span className="w-8 h-px bg-accent" />
        </div>
        <h2 className="font-arabic text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
          مجموعة محدودة،
          <br />
          <span className="text-accent">ذوق لا يُقلَّد</span>
        </h2>
        <p className="font-arabic text-white/50 text-base leading-8 mb-10 max-w-xl mx-auto">
          اكتشف عالم وقار الكامل، حيث كل قطعة قصة وكل تفصيل بيان
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {mainCollection.slice(0, 2).map((p, i) => (
            <a
              key={p.id}
              href={`/products/${p.slug}`}
              className={`inline-flex items-center justify-center px-10 py-4 font-arabic font-semibold text-base transition-all duration-300 ${
                i === 0
                  ? "bg-white text-black hover:bg-accent"
                  : "border border-white/30 text-white hover:border-accent hover:text-accent"
              }`}
            >
              تسوّق {p.nameAr}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
