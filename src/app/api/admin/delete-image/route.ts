import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const { imagePath } = (await req.json()) as { imagePath: string };
    if (!imagePath || !imagePath.startsWith("/images/products/")) {
      return NextResponse.json({ error: "مسار غير صالح" }, { status: 400 });
    }

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
  } catch (err) {
    return NextResponse.json(
      { error: "فشل الحذف: " + (err instanceof Error ? err.message : "خطأ") },
      { status: 500 }
    );
  }
}
