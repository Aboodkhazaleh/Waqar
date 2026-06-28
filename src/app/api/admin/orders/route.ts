import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  fetchOrdersServer,
  addOrderServer,
  replaceAllOrdersServer,
  deleteOrderServer,
  deleteAllOrdersServer,
  isAdminConfigured,
} from "@/lib/firestoreServer";
import type { Order } from "@/types";

function notConfigured() {
  return NextResponse.json(
    { error: "Firebase Admin SDK غير مهيأ. أضف بيانات service account في .env.local." },
    { status: 500 }
  );
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json(await fetchOrdersServer());
}

export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isAdminConfigured()) return notConfigured();
  try {
    const order: Order = await req.json();
    await addOrderServer(order);
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
  if (!isAdminConfigured()) return notConfigured();
  try {
    const orders: Order[] = await req.json();
    await replaceAllOrdersServer(orders);
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
  if (!isAdminConfigured()) return notConfigured();
  try {
    const body = (await req.json()) as { id?: string; all?: boolean };
    if (body.all) {
      const count = await deleteAllOrdersServer();
      return NextResponse.json({ success: true, deleted: count });
    }
    if (body.id) {
      await deleteOrderServer(body.id);
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
