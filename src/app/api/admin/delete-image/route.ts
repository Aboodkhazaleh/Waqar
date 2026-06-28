import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { adminBucket, isAdminConfigured } from "@/lib/firebaseAdmin";
import fs from "fs";
import path from "path";

/**
 * Deletes a product image either from local `/public/images/products/...`
 * (dev mode, no Firebase Storage) or from Firebase Storage (production).
 *
 * Accepts either:
 *   - `imagePath`: local-style path like "/images/products/al-raqi/foo.jpg"
 *   - A full Firebase Storage download URL
 *     (https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?alt=media&token=...)
 */
export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { imagePath } = (await req.json()) as { imagePath: string };
    if (!imagePath || typeof imagePath !== "string") {
      return NextResponse.json({ error: "مسار غير صالح" }, { status: 400 });
    }

    // Branch 1: Firebase Storage download URL
    if (
      imagePath.startsWith("https://firebasestorage.googleapis.com/") ||
      imagePath.startsWith("https://storage.googleapis.com/")
    ) {
      if (!isAdminConfigured()) {
        return NextResponse.json(
          { error: "Firebase Admin SDK غير مهيأ — لا يمكن حذف صور التخزين السحابي." },
          { status: 500 }
        );
      }
      // Extract object path from the URL. Firebase URLs look like:
      // https://firebasestorage.googleapis.com/v0/b/<bucket>/o/<encoded-path>?alt=media&token=...
      const match = imagePath.match(/\/o\/([^?]+)/);
      if (!match) {
        return NextResponse.json(
          { error: "تعذّر استخراج مسار الكائن من الرابط" },
          { status: 400 }
        );
      }
      const objectPath = decodeURIComponent(match[1]);
      // Safety: only allow deletion under products/
      if (!objectPath.startsWith("products/")) {
        return NextResponse.json(
          { error: "مسموح فقط حذف الصور تحت products/" },
          { status: 400 }
        );
      }
      try {
        await adminBucket().file(objectPath).delete();
        return NextResponse.json({ success: true });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "خطأ غير معروف";
        // 404 is acceptable — file may have already been deleted
        if (msg.includes("No such object") || msg.includes("404")) {
          return NextResponse.json({ success: true, note: "الملف غير موجود" });
        }
        throw err;
      }
    }

    // Branch 2: legacy local path under /public
    if (imagePath.startsWith("/images/products/")) {
      const filepath = path.join(process.cwd(), "public", imagePath);
      // Guard: must be inside /public/images/products/
      const rootDir = path.join(process.cwd(), "public", "images", "products");
      if (!filepath.startsWith(rootDir)) {
        return NextResponse.json({ error: "مسار غير مسموح" }, { status: 400 });
      }
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ success: true, note: "الملف غير موجود" });
    }

    return NextResponse.json({ error: "مسار غير مدعوم" }, { status: 400 });
  } catch (err) {
    return NextResponse.json(
      { error: "فشل الحذف: " + (err instanceof Error ? err.message : "خطأ") },
      { status: 500 }
    );
  }
}
