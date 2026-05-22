"use client";

import { motion } from "framer-motion";
import GoldDivider from "./GoldDivider";
import { cn } from "@/lib/utils";

interface SectionTitleProps {
  titleAr: string;
  subtitleAr?: string;
  center?: boolean;
  className?: string;
  light?: boolean;
}

export default function SectionTitle({
  titleAr,
  subtitleAr,
  center = true,
  className,
  light = false,
}: SectionTitleProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn("flex flex-col gap-4", center ? "items-center text-center" : "", className)}
    >
      {subtitleAr && (
        <span className="text-gold text-sm font-arabic tracking-[0.2em] uppercase">
          {subtitleAr}
        </span>
      )}
      <h2
        className={cn(
          "font-arabic text-3xl md:text-4xl lg:text-5xl font-bold",
          light ? "text-dark" : "text-cream"
        )}
      >
        {titleAr}
      </h2>
      <GoldDivider center={center} className="w-40" />
    </motion.div>
  );
}
