import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { seedDefaultsIfEmpty, isFirebaseConfigured } from "@/lib/firestore";

export async function POST() {
  const authed = await isAdminAuthenticated();
  if (!authed) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  if (!isFirebaseConfigured) {
    return NextResponse.json(
      {
        error:
          "Firestore غير مهيأ. تأكد من ضبط متغيرات NEXT_PUBLIC_FIREBASE_* في .env.local.",
      },
      { status: 500 }
    );
  }
  try {
    const result = await seedDefaultsIfEmpty();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "خطأ في الخادم" },
      { status: 500 }
    );
  }
}
