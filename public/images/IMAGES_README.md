# مجلد صور وقار

## الشعار (الرسمي)
ضع شعار وقار الرسمي في:
- `logo/waqar-logo.png` — يُستخدم في الـ Navbar، Hero، Footer، ولوحة الإدارة

## منتجات السمو (al-sumo) — المجموعة الفاخرة
الصور التي رفعها العميل تستخدم لـ السمو:
- `products/al-sumo/cream-1.jpg` — كريمي (الزاوية الأولى)
- `products/al-sumo/cream-2.jpg` (اختياري — حالياً SVG placeholder)
- `products/al-sumo/cream-3.jpg` (اختياري — حالياً SVG placeholder)
- `products/al-sumo/blue-1.jpg` — أزرق سماوي
- `products/al-sumo/blue-2.jpg` (اختياري)
- `products/al-sumo/blue-3.jpg` (اختياري)
- `products/al-sumo/white-1.jpg` — أبيض
- `products/al-sumo/white-2.jpg` (اختياري)
- `products/al-sumo/white-3.jpg` (اختياري)
- `products/al-sumo/gray-1.jpg` — رمادي
- `products/al-sumo/gray-2.jpg` (اختياري)
- `products/al-sumo/gray-3.jpg` (اختياري)

> 💡 إذا أضفت أكثر من صورة لكل لون، عدّل امتدادات الملفات في
> `src/data/products.ts` من `.svg` إلى `.jpg` للصور الإضافية.

## منتجات الراقي (al-raqi)
حالياً تستخدم صور مؤقتة (SVG). عند تجهيز صور الراقي الحقيقية، ضعها في:
- `products/al-raqi/cream-1.jpg`, `cream-2.jpg`, `cream-3.jpg`
- `products/al-raqi/blue-1.jpg`, `blue-2.jpg`, `blue-3.jpg`
- `products/al-raqi/white-1.jpg`, `white-2.jpg`, `white-3.jpg`
- `products/al-raqi/gray-1.jpg`, `gray-2.jpg`, `gray-3.jpg`

ثم عدّل `src/data/products.ts` لاستخدام `.jpg` بدل `.svg`.

## مواصفات الصور الموصى بها
- نسبة الأبعاد: 4:5 (مثل 800×1000)
- التنسيق: JPG (الأمثل للصور) أو WebP
- الحجم: أقل من 500KB لكل صورة (استخدم أداة ضغط)
- الجودة: عالية مع تشذيب نظيف وخلفية متسقة
