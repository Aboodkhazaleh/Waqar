import type { Size } from "@/types";

/**
 * Default sizes seeded into Firestore on first run.
 * Admin can edit, disable, reorder, or add new sizes from the dashboard.
 * displayOrder is spaced (10s/100s) so new sizes can be inserted in between
 * without renumbering everything.
 */
const now = "2025-01-01T00:00:00Z";

export const defaultSizes: Size[] = [
  // Letter sizes
  { id: "size-xs", label: "XS", isActive: true, displayOrder: 10, createdAt: now, updatedAt: now },
  { id: "size-s", label: "S", isActive: true, displayOrder: 20, createdAt: now, updatedAt: now },
  { id: "size-m", label: "M", isActive: true, displayOrder: 30, createdAt: now, updatedAt: now },
  { id: "size-l", label: "L", isActive: true, displayOrder: 40, createdAt: now, updatedAt: now },
  { id: "size-xl", label: "XL", isActive: true, displayOrder: 50, createdAt: now, updatedAt: now },
  { id: "size-xxl", label: "XXL", isActive: true, displayOrder: 60, createdAt: now, updatedAt: now },
  { id: "size-xxxl", label: "XXXL", isActive: true, displayOrder: 70, createdAt: now, updatedAt: now },

  // Numeric (thobe) sizes — requested by user
  { id: "size-52", label: "52", isActive: true, displayOrder: 120, createdAt: now, updatedAt: now },
  { id: "size-54", label: "54", isActive: true, displayOrder: 130, createdAt: now, updatedAt: now },
  { id: "size-56", label: "56", isActive: true, displayOrder: 140, createdAt: now, updatedAt: now },
  { id: "size-58", label: "58", isActive: true, displayOrder: 150, createdAt: now, updatedAt: now },
  { id: "size-60", label: "60", isActive: true, displayOrder: 160, createdAt: now, updatedAt: now },
  { id: "size-62", label: "62", isActive: true, displayOrder: 170, createdAt: now, updatedAt: now },
  { id: "size-64", label: "64", isActive: true, displayOrder: 180, createdAt: now, updatedAt: now },

  // Special
  { id: "size-one", label: "One Size", isActive: true, displayOrder: 900, createdAt: now, updatedAt: now },
];
