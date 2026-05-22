"use client";

import { useRef, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, AlertCircle, GripVertical } from "lucide-react";

interface ImageUploaderProps {
  productSlug: string;
  colorId: string;
  images: string[];
  onChange: (newImages: string[]) => void;
  max?: number;
}

export default function ImageUploader({
  productSlug,
  colorId,
  images,
  onChange,
  max = 8,
}: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const uploadFiles = useCallback(
    async (files: FileList | File[]) => {
      if (!files.length) return;
      if (images.length + files.length > max) {
        setError(`الحد الأقصى ${max} صور لكل لون`);
        return;
      }
      setError("");
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("productSlug", productSlug);
        fd.append("colorId", colorId);
        Array.from(files).forEach((f) => fd.append("files", f));

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل الرفع");

        if (data.errors?.length) {
          setError(data.errors.join(" • "));
        }
        if (data.urls?.length) {
          onChange([...images, ...data.urls]);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "خطأ");
      } finally {
        setUploading(false);
      }
    },
    [colorId, images, max, onChange, productSlug]
  );

  const removeImage = async (index: number) => {
    const url = images[index];
    const next = images.filter((_, i) => i !== index);
    onChange(next);
    // Attempt to delete from disk only if it's an uploaded image (not SVG placeholder)
    if (url && !url.endsWith(".svg")) {
      try {
        await fetch("/api/admin/delete-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imagePath: url }),
        });
      } catch {
        // ignore — UI is already updated
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  // Reorder via drag-handle
  const handleReorderStart = (idx: number) => setDraggedIdx(idx);
  const handleReorderOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const next = [...images];
    const [moved] = next.splice(draggedIdx, 1);
    next.splice(idx, 0, moved);
    onChange(next);
    setDraggedIdx(idx);
  };
  const handleReorderEnd = () => setDraggedIdx(null);

  return (
    <div className="flex flex-col gap-3">
      {/* Existing images grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
          <AnimatePresence>
            {images.map((url, i) => (
              <motion.div
                key={`${url}-${i}`}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                draggable
                onDragStart={() => handleReorderStart(i)}
                onDragOver={(e) => handleReorderOver(e, i)}
                onDragEnd={handleReorderEnd}
                className={`relative aspect-[4/5] rounded-lg overflow-hidden bg-[#1C1C1C] border group ${
                  i === 0
                    ? "border-[#3DB4C4]/50"
                    : "border-[#2A2A2A]"
                } ${draggedIdx === i ? "opacity-50" : ""}`}
              >
                <Image
                  src={url}
                  alt={`صورة ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
                {/* Top badge */}
                {i === 0 && (
                  <div className="absolute top-1 right-1 bg-[#3DB4C4] text-black text-[9px] font-bold px-1.5 py-0.5 rounded-sm font-arabic tracking-wide">
                    رئيسية
                  </div>
                )}
                {/* Drag handle */}
                <div className="absolute top-1 left-1 bg-black/50 backdrop-blur p-1 rounded cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical size={10} className="text-white/70" />
                </div>
                {/* Remove btn */}
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute bottom-1 left-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="حذف"
                >
                  <X size={12} />
                </button>
                {/* Index */}
                <div className="absolute bottom-1 right-1 bg-black/60 text-white/70 text-[9px] font-arabic px-1.5 py-0.5 rounded">
                  {i + 1}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Drop zone */}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        disabled={uploading || images.length >= max}
        className={`relative border border-dashed rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all duration-200 ${
          dragOver
            ? "border-[#3DB4C4] bg-[#3DB4C4]/5"
            : "border-[#2A2A2A] hover:border-[#3DB4C4]/40 hover:bg-[#1C1C1C]/50"
        } ${uploading || images.length >= max ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
      >
        {uploading ? (
          <>
            <div className="w-5 h-5 border-2 border-[#3DB4C4] border-t-transparent rounded-full animate-spin" />
            <span className="font-arabic text-xs text-[#3DB4C4]">جارٍ الرفع...</span>
          </>
        ) : (
          <>
            <div className="w-9 h-9 rounded-full bg-[#3DB4C4]/10 flex items-center justify-center">
              <Upload size={16} className="text-[#3DB4C4]" />
            </div>
            <div className="text-center">
              <p className="font-arabic text-sm text-white">
                {images.length >= max ? "تم الوصول للحد الأقصى" : "اضغط أو اسحب الصور هنا"}
              </p>
              <p className="font-arabic text-xs text-white/40 mt-1">
                JPG, PNG, WebP — حتى 8MB لكل صورة • {images.length}/{max}
              </p>
            </div>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && uploadFiles(e.target.files)}
        />
      </button>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2 bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
          <AlertCircle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
          <p className="font-arabic text-xs text-red-400 leading-5">{error}</p>
        </div>
      )}
    </div>
  );
}
