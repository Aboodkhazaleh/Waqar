import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchProductBySlugServer } from "@/lib/firestoreServer";
import ProductPageClient from "./ProductPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProductBySlugServer(slug);
  if (!product) return { title: "المنتج غير موجود" };
  return {
    title: `${product.nameAr} — وقار`,
    description: product.descriptionAr,
    openGraph: {
      title: `${product.nameAr} — وقار`,
      description: product.descriptionAr,
      images: product.colors[0]?.images?.[0],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await fetchProductBySlugServer(slug);
  if (!product || !product.isActive) notFound();
  return <ProductPageClient product={product} />;
}
