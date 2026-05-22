import Link from "next/link";

export default function NotFound() {
  return (
    <div
      className="min-h-screen bg-dark flex items-center justify-center text-center px-4"
      dir="rtl"
    >
      <div className="flex flex-col items-center gap-6">
        <h1 className="font-display text-8xl font-bold text-gold opacity-30">٤٠٤</h1>
        <h2 className="font-arabic text-2xl text-cream">الصفحة غير موجودة</h2>
        <p className="font-arabic text-cream/50">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها
        </p>
        <Link
          href="/"
          className="px-8 py-3 bg-gold-gradient text-dark font-arabic font-bold rounded-xl hover:opacity-90 transition-all"
        >
          العودة للرئيسية
        </Link>
      </div>
    </div>
  );
}
