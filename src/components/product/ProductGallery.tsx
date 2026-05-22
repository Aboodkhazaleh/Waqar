"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronLeft, ZoomIn, X } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const galleryImages = images.length > 0 ? images : ["/images/placeholder.svg"];

  // Reset to first when images change
  useEffect(() => {
    setActiveIndex(0);
  }, [images]);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i === 0 ? galleryImages.length - 1 : i - 1));
  }, [galleryImages.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i === galleryImages.length - 1 ? 0 : i + 1));
  }, [galleryImages.length]);

  // Touch swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchEnd(null);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const delta = touchStart - touchEnd;
    if (Math.abs(delta) > 50) {
      delta > 0 ? next() : prev();
    }
  };

  // Keyboard nav
  useEffect(() => {
    if (!zoomed) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") next();
      if (e.key === "ArrowRight") prev();
      if (e.key === "Escape") setZoomed(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomed, next, prev]);

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main image */}
        <div
          className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-dark-2 group cursor-zoom-in"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => setZoomed(true)}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <Image
                src={galleryImages[activeIndex]}
                alt={`${productName} - ${activeIndex + 1}`}
                fill
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={activeIndex === 0}
              />
            </motion.div>
          </AnimatePresence>

          {/* Zoom hint */}
          <div className="absolute top-4 left-4 bg-dark/60 backdrop-blur-sm text-cream/60 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={16} />
          </div>

          {/* Navigation arrows */}
          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); prev(); }}
                className="absolute top-1/2 right-3 -translate-y-1/2 w-9 h-9 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center text-cream/70 hover:text-gold hover:bg-dark/80 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronRight size={18} />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); next(); }}
                className="absolute top-1/2 left-3 -translate-y-1/2 w-9 h-9 rounded-full bg-dark/60 backdrop-blur-sm flex items-center justify-center text-cream/70 hover:text-gold hover:bg-dark/80 transition-all opacity-0 group-hover:opacity-100"
              >
                <ChevronLeft size={18} />
              </button>
            </>
          )}

          {/* Dots */}
          {galleryImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {galleryImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setActiveIndex(i); }}
                  className={`rounded-full transition-all duration-300 ${
                    i === activeIndex
                      ? "w-4 h-1.5 bg-gold"
                      : "w-1.5 h-1.5 bg-white/40 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {galleryImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 transition-all duration-300 ${
                  i === activeIndex ? "border-gold shadow-gold/20 shadow-lg" : "border-transparent opacity-60 hover:opacity-90"
                }`}
              >
                <Image
                  src={img}
                  alt={`${productName} - ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox zoom */}
      <AnimatePresence>
        {zoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[90] bg-black/95 flex items-center justify-center p-4"
            onClick={() => setZoomed(false)}
          >
            <button
              className="absolute top-5 right-5 text-white/60 hover:text-white p-2"
              onClick={() => setZoomed(false)}
            >
              <X size={24} />
            </button>
            <button
              className="absolute top-1/2 right-4 -translate-y-1/2 text-white/60 hover:text-gold p-3"
              onClick={(e) => { e.stopPropagation(); prev(); }}
            >
              <ChevronRight size={28} />
            </button>
            <button
              className="absolute top-1/2 left-4 -translate-y-1/2 text-white/60 hover:text-gold p-3"
              onClick={(e) => { e.stopPropagation(); next(); }}
            >
              <ChevronLeft size={28} />
            </button>

            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="relative w-full max-w-2xl aspect-[3/4]"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={galleryImages[activeIndex]}
                alt={productName}
                fill
                className="object-contain"
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
