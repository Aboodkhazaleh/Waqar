import { NextRequest, NextResponse } from "next/server";
import { addOrderFs, isFirebaseConfigured } from "@/lib/firestore";
import type { Order, OrderItem } from "@/types";

// Public endpoint — customers submit their cart here.
// No admin auth required (anyone shopping can create an order for themselves).
export async function POST(req: NextRequest) {
  if (!isFirebaseConfigured) {
    return NextResponse.json(
      { error: "نظام الطلبات غير مهيأ حالياً." },
      { status: 500 }
    );
  }
  try {
    const body = (await req.json()) as {
      customerName: string;
      customerPhone: string;
      notes?: string;
      items: OrderItem[];
      totalPrice: number;
      currency: string;
    };

    // Validation
    if (!body.customerName?.trim() || !body.customerPhone?.trim()) {
      return NextResponse.json(
        { error: "الاسم ورقم الهاتف مطلوبان" },
        { status: 400 }
      );
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "السلة فارغة — أضف منتجاً على الأقل" },
        { status: 400 }
      );
    }
    for (const item of body.items) {
      if (!item.productName || !item.size || item.quantity < 1) {
        return NextResponse.json(
          { error: "بيانات منتج غير مكتملة في السلة" },
          { status: 400 }
        );
      }
    }

    const orderId = `ORD-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 6)
      .toUpperCase()}`;

    // First item populates the legacy single-item fields so the existing
    // admin orders table renders something sensible even before the multi-item UI ships.
    const first = body.items[0];

    const order: Order = {
      id: orderId,
      productId: first.productId,
      productName:
        body.items.length === 1
          ? first.productName
          : `${first.productName} +${body.items.length - 1}`,
      colorId: first.colorId,
      colorName: first.colorName,
      size: first.size,
      quantity: body.items.reduce((s, i) => s + i.quantity, 0),
      totalPrice: body.totalPrice,
      currency: body.currency,
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone.trim(),
      notes: body.notes?.trim() || undefined,
      status: "pending",
      items: body.items,
      createdAt: new Date().toISOString(),
    };

    await addOrderFs(order);

    return NextResponse.json({ success: true, orderId });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
