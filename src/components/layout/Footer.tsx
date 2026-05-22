import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter } from "lucide-react";
import GoldDivider from "@/components/ui/GoldDivider";

interface FooterProps {
  whatsappNumber?: string;
  socials?: {
    instagram?: string;
    twitter?: string;
    snapchat?: string;
    tiktok?: string;
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
            <div className="flex gap-3">
              {socials?.instagram && (
                <a
                  href={socials.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-dark-5 text-cream/40 hover:text-accent hover:border-accent/40 transition-all duration-300"
                >
                  <Instagram size={16} />
                </a>
              )}
              {socials?.twitter && (
                <a
                  href={socials.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-dark-5 text-cream/40 hover:text-accent hover:border-accent/40 transition-all duration-300"
                >
                  <Twitter size={16} />
                </a>
              )}
              {socials?.snapchat && (
                <a
                  href={socials.snapchat}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-dark-5 text-cream/40 hover:text-accent hover:border-accent/40 transition-all duration-300"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.206.793c.99 0 4.347.276 5.93 3.821.55 1.198.44 3.236.396 4.521v.06c0 .08.057.14.14.153.418.1 1.395.48 1.395 1.62 0 1.3-1.49 1.51-1.715 1.55-.12.02-.23.11-.2.25.157.67.88 2.31 3.2 2.36.11.01.22.11.22.2 0 .16-.1.3-.28.43-.4.28-1.01.5-1.83.66-.1.02-.19.11-.19.22 0 .07.03.14.07.2.1.13.2.36.2.56 0 .53-.38.88-.87.88-.15 0-.3-.03-.43-.08-.44-.17-.87-.26-1.29-.26-.62 0-1.24.19-1.86.62-1.18.8-2.34.97-2.95.97h-.2c-.63 0-1.77-.17-2.95-.97-.62-.43-1.24-.62-1.86-.62-.42 0-.85.09-1.29.26-.13.05-.28.08-.43.08-.49 0-.87-.35-.87-.88 0-.2.1-.43.2-.56.04-.06.07-.13.07-.2 0-.11-.09-.2-.19-.22-.82-.16-1.43-.38-1.83-.66-.18-.13-.28-.27-.28-.43 0-.09.11-.19.22-.2 2.32-.05 3.04-1.69 3.2-2.36.03-.14-.08-.23-.2-.25C5.49 13.3 4 13.09 4 11.79c0-1.14.977-1.52 1.395-1.62.083-.013.14-.073.14-.153v-.06c-.044-1.285-.154-3.323.396-4.521C7.859 1.069 11.216.793 12.206.793z" />
                  </svg>
                </a>
              )}
              {socials?.tiktok && (
                <a
                  href={socials.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 flex items-center justify-center rounded-full border border-dark-5 text-cream/40 hover:text-accent hover:border-accent/40 transition-all duration-300"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>
                  </svg>
                </a>
              )}
            </div>
          </div>

          {/* Navigation */}
          <div className="text-center md:text-right">
            <h4 className="font-arabic text-accent text-sm font-semibold mb-5 tracking-wide">
              التنقل
            </h4>
            <ul className="flex flex-col gap-3">
              {[
                { href: "/", label: "الرئيسية" },
                { href: "/products/al-sumo", label: "السمو" },
                { href: "/products/al-raqi", label: "الراقي" },
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
              <p className="font-arabic text-xs text-cream/30 leading-6">
                أوقات العمل:
                <br />
                الأحد — الخميس: 9 صباحاً — 10 مساءً
              </p>
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
