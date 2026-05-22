"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/types";
import { subscribeProducts } from "@/lib/firestore";
import CollectionSection from "./CollectionSection";
import AccessoriesSection from "./AccessoriesSection";

interface HomeSectionsProps {
  initialProducts: Product[];
}

/**
 * Client-side real-time wrapper. Subscribes to Firestore for products
 * so any admin edit appears LIVE without a page refresh.
 */
export default function HomeSections({ initialProducts }: HomeSectionsProps) {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  useEffect(() => {
    const unsub = subscribeProducts((next) => setProducts(next));
    return () => unsub();
  }, []);

  const sortFn = (a: Product, b: Product) =>
    (a.displayOrder ?? 999) - (b.displayOrder ?? 999) || a.id.localeCompare(b.id);

  const mainCollection = products
    .filter((p) => p.isActive && p.category === "fashion")
    .sort(sortFn);
  const accessories = products
    .filter((p) => p.isActive && p.category === "accessories")
    .sort(sortFn);

  return (
    <>
      {mainCollection.map((product, idx) => (
        <CollectionSection
          key={product.id}
          product={product}
          reverse={idx % 2 === 1}
        />
      ))}
      <AccessoriesSection products={accessories} />
    </>
  );
}
