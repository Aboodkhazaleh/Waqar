"use client";

import { motion } from "framer-motion";
import SectionTitle from "@/components/ui/SectionTitle";

const values = [
  {
    icon: "◇",
    titleAr: "جودة استثنائية",
    descAr: "أقمشة مختارة بعناية من أجود المصادر العالمية، تضمن لك راحة لا مثيل لها.",
  },
  {
    icon: "◈",
    titleAr: "تصميم أصيل",
    descAr: "تصاميم تجمع بين الهوية الخليجية الأصيلة والذوق العصري الرفيع.",
  },
  {
    icon: "◉",
    titleAr: "خياطة محكمة",
    descAr: "خياطة يدوية دقيقة بأيدي حرفيين متمرسين يضمنون كمال كل تفصيل.",
  },
  {
    icon: "◐",
    titleAr: "خدمة VIP",
    descAr: "تجربة تسوق راقية بخدمة عملاء استثنائية وتوصيل سريع لباب منزلك.",
  },
];

export default function BrandValues() {
  return (
    <section className="py-24 bg-dark-2 relative overflow-hidden">
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            #3DB4C4,
            #3DB4C4 1px,
            transparent 1px,
            transparent 60px
          )`,
        }}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">
        <SectionTitle
          titleAr="لماذا وقار؟"
          subtitleAr="قيمنا"
          className="mb-16"
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {values.map((value, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.25, 0.1, 0.25, 1] }}
              className="group relative flex flex-col items-center text-center gap-4 p-6 md:p-8 rounded-2xl bg-dark-3 border border-dark-5 hover:border-gold/20 transition-all duration-500 hover:bg-dark-3/80"
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full border border-gold/20 flex items-center justify-center text-gold text-xl group-hover:bg-gold/5 transition-colors duration-300">
                {value.icon}
              </div>

              {/* Content */}
              <h3 className="font-arabic text-cream font-semibold text-base md:text-lg">
                {value.titleAr}
              </h3>
              <p className="font-arabic text-cream/50 text-xs md:text-sm leading-7">
                {value.descAr}
              </p>

              {/* Bottom accent */}
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gold-gradient group-hover:w-full transition-all duration-500 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
