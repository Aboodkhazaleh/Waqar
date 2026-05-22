import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number, currency = "د.أ"): string {
  return `${price.toLocaleString("ar-SA")} ${currency}`;
}

export function buildWhatsAppMessage({
  productName,
  colorName,
  size,
  quantity,
  price,
  currency = "د.أ",
}: {
  productName: string;
  colorName: string;
  size: string;
  quantity: number;
  price: number;
  currency?: string;
}): string {
  return `السلام عليكم،

أرغب في طلب المنتج التالي:

🛍️ المنتج: ${productName}
🎨 اللون: ${colorName}
📏 المقاس: ${size}
🔢 الكمية: ${quantity}
💰 الإجمالي: ${formatPrice(price * quantity, currency)}

أرجو التأكيد والمتابعة، شكراً.`;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encoded}`;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getDiscountPercentage(
  price: number,
  originalPrice: number
): number {
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}
