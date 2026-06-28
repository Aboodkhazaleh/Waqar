import { NextRequest, NextResponse } from "next/server";
import { isAdminAuthenticated } from "@/lib/auth";
import { adminBucket, isAdminConfigured } from "@/lib/firebaseAdmin";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
];
const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB per file

export async function POST(req: NextRequest) {
  const authed = await isAdminAuthenticated();
  if (!authed) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const productSlug = ((formData.get("productSlug") as string) || "general")
      .replace(/[^a-z0-9-]/gi, "")
      .toLowerCase() || "product";
    const colorId = ((formData.get("colorId") as string) || "default")
      .replace(/[^a-z0-9-]/gi, "")
      .toLowerCase() || "color";
    const files = formData.getAll("files") as File[];

    if (!files.length) {
      return NextResponse.json({ error: "لم يتم اختيار أي ملف" }, { status: 400 });
    }

    const urls: string[] = [];
    const errors: string[] = [];

    // Branch: Firebase Storage (via Admin SDK) if configured, else local disk.
    const useFirebaseStorage = isAdminConfigured();

    let localDir: string | null = null;
    if (!useFirebaseStorage) {
      localDir = path.join(
        process.cwd(),
        "public",
        "images",
        "products",
        productSlug
      );
      if (!fs.existsSync(localDir)) fs.mkdirSync(localDir, { recursive: true });
    }

    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`${file.name}: نوع غير مسموح (${file.type})`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: الحجم أكبر من 8MB`);
        continue;
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const ext = (
        file.name.split(".").pop() ||
        file.type.split("/")[1].replace("jpeg", "jpg")
      ).toLowerCase();
      const timestamp = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const filename = `${colorId}-${timestamp}-${rand}.${ext}`;

      if (useFirebaseStorage) {
        // Upload via Admin SDK — bypasses Storage Rules.
        // Generate a download token so the URL is publicly fetchable without
        // needing a signed URL or relaxed Storage rules.
        const objectPath = `products/${productSlug}/${filename}`;
        const token = crypto.randomUUID();
        const bucket = adminBucket();
        const fileRef = bucket.file(objectPath);
        await fileRef.save(buffer, {
          contentType: file.type,
          resumable: false,
          metadata: {
            metadata: {
              firebaseStorageDownloadTokens: token,
            },
          },
        });
        const encodedPath = encodeURIComponent(objectPath);
        const url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodedPath}?alt=media&token=${token}`;
        urls.push(url);
      } else if (localDir) {
        // Fallback: save to local /public — fine for local dev
        const filepath = path.join(localDir, filename);
        fs.writeFileSync(filepath, buffer);
        urls.push(`/images/products/${productSlug}/${filename}`);
      }
    }

    return NextResponse.json({
      urls,
      errors,
      storage: useFirebaseStorage ? "firebase" : "local",
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      {
        error:
          "فشل رفع الملفات: " +
          (err instanceof Error ? err.message : "خطأ غير معروف"),
      },
      { status: 500 }
    );
  }
}
