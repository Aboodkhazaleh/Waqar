import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { fetchSettings, saveSettingsFs, isFirebaseConfigured } from "@/lib/firestore";
import type { SiteSettings } from "@/types";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json(await fetchSettings());
}

export async function PUT(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) {
    return NextResponse.json(
      { error: "Firestore غير مهيأ. أضف بيانات Firebase في .env.local." },
      { status: 500 }
    );
  }
  try {
    const settings: SiteSettings = await req.json();
    await saveSettingsFs(settings);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
