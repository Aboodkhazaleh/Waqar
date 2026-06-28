import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  fetchSizesServer,
  upsertSizeServer,
  deleteSizeServer,
  replaceAllSizesServer,
  isAdminConfigured,
} from "@/lib/firestoreServer";
import type { Size } from "@/types";

function notConfigured() {
  return NextResponse.json(
    { error: "Firebase Admin SDK غير مهيأ. أضف بيانات service account في .env.local." },
    { status: 500 }
  );
}

function validateSize(size: Partial<Size>): string | null {
  if (!size.id || typeof size.id !== "string") return "id مطلوب";
  if (!size.label || typeof size.label !== "string") return "label مطلوب";
  if (size.label.length > 20) return "label طويل جداً (الحد الأقصى 20 حرف)";
  if (typeof size.displayOrder !== "number") return "displayOrder رقمي مطلوب";
  if (typeof size.isActive !== "boolean") return "isActive boolean مطلوب";
  return null;
}

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json(await fetchSizesServer());
}

// Create or update a single size
export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isAdminConfigured()) return notConfigured();
  try {
    const size: Size = await req.json();
    const err = validateSize(size);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    // Ensure no duplicate labels (case-insensitive) among ACTIVE sizes
    const existing = await fetchSizesServer();
    const duplicate = existing.find(
      (s) =>
        s.id !== size.id &&
        s.label.trim().toLowerCase() === size.label.trim().toLowerCase()
    );
    if (duplicate) {
      return NextResponse.json(
        { error: `يوجد مقاس آخر بنفس الاسم: "${duplicate.label}"` },
        { status: 400 }
      );
    }
    await upsertSizeServer(size);
    return NextResponse.json({ success: true, size });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

// Replace the entire list (used for bulk reorder)
export async function PUT(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isAdminConfigured()) return notConfigured();
  try {
    const sizes: Size[] = await req.json();
    for (const s of sizes) {
      const err = validateSize(s);
      if (err) return NextResponse.json({ error: `${s.id}: ${err}` }, { status: 400 });
    }
    await replaceAllSizesServer(sizes);
    return NextResponse.json({ success: true, count: sizes.length });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isAdminConfigured()) return notConfigured();
  try {
    const { id } = (await req.json()) as { id: string };
    if (!id) return NextResponse.json({ error: "id مطلوب" }, { status: 400 });
    await deleteSizeServer(id);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
