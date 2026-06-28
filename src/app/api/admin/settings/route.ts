import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import {
  fetchSettingsServer,
  saveSettingsServer,
  isAdminConfigured,
} from "@/lib/firestoreServer";
import type { SiteSettings } from "@/types";

export async function GET() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json(await fetchSettingsServer());
}

export async function PUT(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isAdminConfigured()) {
    return NextResponse.json(
      { error: "Firebase Admin SDK غير مهيأ. أضف بيانات service account في .env.local." },
      { status: 500 }
    );
  }
  try {
    const settings: SiteSettings = await req.json();
    await saveSettingsServer(settings);
    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
