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
  // Per-product extensions — all optional. Only Al-Raqi populates these today.
  // Other products keep their existing behavior unchanged when these are absent.
  designs?: DesignOption[];
  closures?: ClosureOption[];
  sizeMatrix?: SizePair[];
  /**
   * Some products (e.g. مسابح / prayer beads) don't have sizes.
   * When false, the size selector + size validation are skipped entirely.
   * Default: true (backward-compatible).
   */
  requiresSize?: boolean;
  /**
   * When set, the storefront renders a single free-text input the customer
   * fills (e.g. an engraving name on a rosary). Optional — only products
   * that need this define it.
   */
  customField?: CustomFieldConfig;
  createdAt: string;
  updatedAt: string;
}

/** A single line item inside a multi-product order. */
export interface OrderItem {
  productId: string;
  productSlug?: string;
  productName: string;
  colorId: string;
  colorName: string;
  colorHex?: string;
  size: string;
  quantity: number;
  price: number;
  currency: string;
  image?: string;
  // Optional — only present when the product has these extras (e.g. Al-Raqi)
  designId?: string;
  designName?: string;
  closureId?: string;
  closureName?: string;
  /** Free-text the customer typed (e.g. engraving name on مسابح) */
  customText?: string;
}

export interface Order {
  id: string;
  // Legacy single-product fields — kept so old orders + the existing admin
  // table render without changes. For multi-item orders, `productName` is set
  // to "<first> +N" so the row still reads cleanly.
  productId: string;
  productName: string;
  colorId: string;
  colorName: string;
  size: string;
  quantity: number;
  totalPrice: number;
  currency?: string;
  // New multi-item shape. Always present on orders created through the cart.
  items?: OrderItem[];
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

/**
 * Per-product design variant (e.g. "الراقي", "مونس" on the Al-Raqi product).
 * Optional — products without designs render as before.
 */
export interface DesignOption {
  id: string;
  nameAr: string;
  nameEn?: string;
  isActive: boolean;
  /** Δ added to the base product price when this design is selected (can be negative) */
  priceAdjustment?: number;
  /** Optional dedicated image gallery. Empty = fall back to color images. */
  images?: string[];
  displayOrder?: number;
  /**
   * Restrict this option to specific colors (refers to ColorVariant.id).
   * Empty / undefined = available for all colors.
   */
  allowedColorIds?: string[];
}

/**
 * Per-product closure variant (e.g. "أزرار", "سحاب مخفي" on Al-Raqi).
 * Optional — products without closures render as before.
 */
export interface ClosureOption {
  id: string;
  nameAr: string;
  nameEn?: string;
  isActive: boolean;
  priceAdjustment?: number;
  images?: string[];
  displayOrder?: number;
  /** Same semantics as DesignOption.allowedColorIds. */
  allowedColorIds?: string[];
}

/**
 * Free-text input the customer fills (e.g. name to engrave on prayer beads).
 * Set on the product itself when the admin wants a custom-text field.
 */
export interface CustomFieldConfig {
  label: string;             // e.g. "الاسم للنقش"
  placeholder?: string;      // e.g. "مثال: محمد"
  required?: boolean;        // default false
  maxLength?: number;        // default 50
  helperText?: string;       // small hint shown below
}

/**
 * One available letter+number size combination. Lets the admin allow
 * (S, 56) and (S, 60) while disabling (S, 58).
 * Optional — if `sizeMatrix` is absent, the existing independent rows behavior is used.
 */
export interface SizePair {
  letterSize: string;    // e.g. "S", "M"
  numberSize: string;    // e.g. "56", "58"
  inStock: boolean;
}
