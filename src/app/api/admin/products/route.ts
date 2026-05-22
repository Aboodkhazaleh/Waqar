import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  fetchProducts,
  upsertProduct,
  replaceAllProducts,
  deleteProduct,
  isFirebaseConfigured,
} from "@/lib/firestore";
import type { Product } from "@/types";

function notConfigured() {
  return NextResponse.json(
    {
      error:
        "Firestore غير مهيأ. أضف بيانات Firebase في .env.local وأعد تشغيل السيرفر.",
    },
    { status: 500 }
  );
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const products = await fetchProducts();
  return NextResponse.json(products);
}

// Replace entire products list
export async function PUT(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) return notConfigured();
  try {
    const products: Product[] = await req.json();
    await replaceAllProducts(products);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// Create / upsert a single product
export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) return notConfigured();
  try {
    const newProduct: Product = await req.json();
    const existing = await fetchProducts();
    if (existing.some((p) => p.slug === newProduct.slug && p.id !== newProduct.id)) {
      return NextResponse.json(
        { error: "يوجد منتج بنفس الرابط (slug) — اختر slug مختلف" },
        { status: 400 }
      );
    }
    await upsertProduct(newProduct);
    return NextResponse.json({ success: true, product: newProduct });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// Delete a single product
export async function DELETE(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) return notConfigured();
  try {
    const { id } = (await req.json()) as { id: string };
    await deleteProduct(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
