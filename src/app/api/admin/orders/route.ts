import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  fetchOrders,
  addOrderFs,
  replaceAllOrders,
  deleteOrderFs,
  deleteAllOrders,
  isFirebaseConfigured,
} from "@/lib/firestore";
import type { Order } from "@/types";

function notConfigured() {
  return NextResponse.json(
    { error: "Firestore غير مهيأ. أضف بيانات Firebase في .env.local." },
    { status: 500 }
  );
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json(await fetchOrders());
}

export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) return notConfigured();
  try {
    const order: Order = await req.json();
    await addOrderFs(order);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) return notConfigured();
  try {
    const orders: Order[] = await req.json();
    await replaceAllOrders(orders);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// DELETE: { id?: string, all?: boolean }
export async function DELETE(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) return notConfigured();
  try {
    const body = (await req.json()) as { id?: string; all?: boolean };
    if (body.all) {
      const count = await deleteAllOrders();
      return NextResponse.json({ success: true, deleted: count });
    }
    if (body.id) {
      await deleteOrderFs(body.id);
      return NextResponse.json({ success: true, deleted: body.id });
    }
    return NextResponse.json({ error: "حدد ID أو all" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
