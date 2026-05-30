import { NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { seedDefaultsIfEmpty, isFirebaseConfigured } from "@/lib/firestore";

/**
 * ⚠️ DESTRUCTIVE: writes default products into Firestore.
 *
 * Disabled by default — even authenticated admins cannot trigger it.
 * To enable for a one-off CLI run, set `ALLOW_SEED=true` in the environment
 * BEFORE starting the dev/prod server, then POST to this route, then UNSET it.
 *
 * This guard exists because seeding overwrites any product whose default
 * id matches (e.g. al-sumo-001) with the values from src/data/products.ts.
 * That would erase prices, colors, sizes, and any field the admin edited.
 */
export async function POST() {
  if (process.env.ALLOW_SEED !== "true") {
    return NextResponse.json(
      {
        error:
          "Seed disabled. هذه العملية معطّلة لحماية بياناتك. لإعادة تفعيلها مؤقتاً، شغّل السيرفر بـ ALLOW_SEED=true ثم نفّذ الطلب يدوياً عبر CLI.",
      },
      { status: 403 }
    );
  }

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
