export interface Category {
  slug: string;
  nameAr: string;
  nameEn: string;
  descriptionAr?: string;
}

export const categories: Category[] = [
  {
    slug: "fashion",
    nameAr: "المجموعة الرئيسية",
    nameEn: "Main Collection",
    descriptionAr: "تشكيلة الفاشن الفاخر من وقار",
  },
  {
    slug: "accessories",
    nameAr: "الاكسسوارات",
    nameEn: "Accessories",
    descriptionAr: "إكسسوارات وقار الفاخرة — تكمل إطلالتك",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryNameAr(slug: string): string {
  return categories.find((c) => c.slug === slug)?.nameAr ?? slug;
}
