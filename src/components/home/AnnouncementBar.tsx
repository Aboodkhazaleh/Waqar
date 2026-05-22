"use client";

import { motion } from "framer-motion";

interface AnnouncementBarProps {
  text?: string;
}

export default function AnnouncementBar({
  text = "شحن مجاني داخل الأردن — استخدم كود WAQAR10 للحصول على خصم 10%",
}: AnnouncementBarProps) {
  return (
    <div className="relative bg-white overflow-hidden h-9 flex items-center border-b border-black/5">
      <motion.div
        animate={{ x: ["100%", "-100%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute whitespace-nowrap flex gap-16 items-center"
      >
        {[text, text, text, text].map((t, i) => (
          <span key={i} className="font-arabic text-xs text-black tracking-wide flex items-center gap-3">
            <span className="w-1 h-1 rounded-full bg-accent" />
            {t}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
