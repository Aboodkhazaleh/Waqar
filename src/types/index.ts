export interface ColorVariant {
  id: string;
  nameAr: string;
  nameEn?: string;
  hex: string;
  images: string[];
  stockQuantity: number;
  isSoldOut: boolean;
}

export interface Product {
  id: string;
  slug: string;
  // Arabic content
  nameAr: string;
  subtitleAr: string;
  descriptionAr: string;
  detailsAr: string[];
  // English content
  nameEn?: string;
  subtitleEn?: string;
  descriptionEn?: string;
  detailsEn?: string[];
  // Commerce
  price: number;
  originalPrice?: number;
  currency: string; // e.g. "د.أ" (JOD)
  colors: ColorVariant[];
  sizes: string[];
  category: string;
  // Status & display
  isActive: boolean;
  isFeatured: boolean;
  displayOrder?: number;
  badges?: string[]; // e.g. ["جديد", "تخفيض", "محدود"]
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  size: string;
  quantity: number;
  totalPrice: number;
  currency?: string;
  customerName?: string;
  customerPhone?: string;
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";
  notes?: string;
  createdAt: string;
}

export interface SiteSettings {
  whatsappNumber: string;
  heroTitle: string;
  heroSubtitle: string;
  announcementBar: string;
  showAnnouncementBar: boolean;
  instagramUrl?: string;
  twitterUrl?: string;
  snapchatUrl?: string;
  tiktokUrl?: string;
}

export interface AdminStats {
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalProducts: number;
}

export interface CartItem {
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  colorHex: string;
  size: string;
  quantity: number;
  price: number;
  image: string;
}

// Predefined badges
export const AVAILABLE_BADGES = [
  { value: "جديد", labelEn: "NEW" },
  { value: "تخفيض", labelEn: "SALE" },
  { value: "محدود", labelEn: "LIMITED" },
  { value: "الأكثر مبيعاً", labelEn: "BESTSELLER" },
  { value: "حصري", labelEn: "EXCLUSIVE" },
  { value: "قريباً", labelEn: "SOON" },
] as const;

// Size — managed by admin, stored in Firestore "sizes" collection
export interface Size {
  id: string;
  label: string;        // Display label, e.g. "M", "56", "One Size"
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}
