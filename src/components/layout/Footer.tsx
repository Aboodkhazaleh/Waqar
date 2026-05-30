import Link from "next/link";
import Image from "next/image";
import { Instagram } from "lucide-react";
import GoldDivider from "@/components/ui/GoldDivider";

interface FooterProps {
  whatsappNumber?: string;
  socials?: {
    instagram?: string;
  };
}

export default function Footer({ whatsappNumber, socials }: FooterProps = {}) {
  const wa = whatsappNumber || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "";
  return (
    <footer className="bg-dark-1 border-t border-dark-4 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          {/* Brand */}
          <div className="flex flex-col items-center md:items-start gap-5">
            <div className="relative w-32 h-16">
              <Image
                src="/images/logo/waqar-logo.png"
                alt="وقار"
                fill
                className="object-contain"
              />
            </div>
            <p className="font-arabic text-cream/50 text-sm leading-7 text-center md:text-right">
              وقار — علامة تجارية فاخرة للأزياء الأردنية الراقية،
              <br />
              حيث تلتقي الأصالة بالأناقة الحديثة.
            </p>
            {socials?.instagram && (
              <div className="flex gap-3">
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-dark-5 text-cream/40 hover:text-accent hover:border-accent/40 transition-all duration-300"
                >
                  <Instagram size={16} />
                </a>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="text-center md:text-right">
            <h4 className="font-arabic text-accent text-sm font-semibold mb-5 tracking-wide">
              التنقل
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/products/al-raqi", label: "الراقي" },
                { href: "/products/al-sumo", label: "السمو" },
                { href: "/#accessories", label: "الاكسسوارات" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-arabic text-sm text-cream/50 hover:text-accent transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="text-center md:text-right">
            <h4 className="font-arabic text-accent text-sm font-semibold mb-5 tracking-wide">
              تواصل معنا
            </h4>
            <div className="flex flex-col gap-3">
              {wa && (
                <a
                  href={`https://wa.me/${wa.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-arabic text-sm text-cream/50 hover:text-accent transition-colors duration-200"
                >
                  واتساب: اضغط للتواصل
                </a>
              )}
            </div>
          </div>
        </div>

        <GoldDivider />

        {/* Bottom */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="font-arabic text-xs text-cream/25 text-center">
            © 2025 وقار للأزياء الفاخرة — جميع الحقوق محفوظة
          </p>
          <div className="flex gap-4">
            {["سياسة الخصوصية", "الشروط والأحكام", "سياسة الإرجاع"].map((item) => (
              <Link
                key={item}
                href="#"
                className="font-arabic text-xs text-cream/25 hover:text-cream/50 transition-colors"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
