/**
 * Server-side Firestore data access — uses the Admin SDK so it bypasses
 * Firestore Security Rules. ONLY callable from API routes and Server Components.
 *
 * Mirrors the read+write surface of the old src/lib/firestore.ts but routes
 * everything through src/lib/firebaseAdmin.ts. The old firestore.ts now exists
 * purely for browser-side onSnapshot subscriptions to PUBLIC collections.
 */

import "server-only";
import { adminDb, isAdminConfigured } from "./firebaseAdmin";
import { COLLECTIONS, SETTINGS_DOC_ID } from "@/firebase";
import type { Product, Order, SiteSettings, Size } from "@/types";
import {
  products as defaultProducts,
  defaultSiteSettings,
} from "@/data/products";
import { defaultSizes } from "@/data/sizes";

// Firestore rejects undefined — strip recursively from any payload going into it.
function stripUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map((v) => stripUndefined(v)) as unknown as T;
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v !== undefined) out[k] = stripUndefined(v as unknown);
    }
    return out as T;
  }
  return value;
}

// ============================================================
// Products
// ============================================================
export async function fetchProductsServer(): Promise<Product[]> {
  if (!isAdminConfigured()) return defaultProducts;
  const snap = await adminDb().collection(COLLECTIONS.PRODUCTS).get();
  if (snap.empty) return defaultProducts;
  return snap.docs.map((d) => d.data() as Product);
}

export async function fetchProductBySlugServer(slug: string): Promise<Product | null> {
  if (!isAdminConfigured()) {
    return defaultProducts.find((p) => p.slug === slug) ?? null;
  }
  const snap = await adminDb()
    .collection(COLLECTIONS.PRODUCTS)
    .where("slug", "==", slug)
    .limit(1)
    .get();
  if (snap.empty) return null;
  return snap.docs[0].data() as Product;
}

export async function upsertProductServer(product: Product): Promise<void> {
  await adminDb()
    .collection(COLLECTIONS.PRODUCTS)
    .doc(product.id)
    .set(stripUndefined({ ...product, updatedAt: new Date().toISOString() }));
}

export async function replaceAllProductsServer(products: Product[]): Promise<void> {
  const batch = adminDb().batch();
  for (const p of products) {
    batch.set(
      adminDb().collection(COLLECTIONS.PRODUCTS).doc(p.id),
      stripUndefined({ ...p, updatedAt: new Date().toISOString() })
    );
  }
  await batch.commit();
}

export async function deleteProductServer(id: string): Promise<void> {
  await adminDb().collection(COLLECTIONS.PRODUCTS).doc(id).delete();
}

// ============================================================
// Orders
// ============================================================
export async function fetchOrdersServer(): Promise<Order[]> {
  if (!isAdminConfigured()) return [];
  const snap = await adminDb()
    .collection(COLLECTIONS.ORDERS)
    .orderBy("createdAt", "desc")
    .get();
  return snap.docs.map((d) => d.data() as Order);
}

export async function addOrderServer(order: Order): Promise<void> {
  await adminDb()
    .collection(COLLECTIONS.ORDERS)
    .doc(order.id)
    .set(stripUndefined(order));
}

export async function replaceAllOrdersServer(orders: Order[]): Promise<void> {
  // Compute diff so docs not in the new list are removed.
  const current = await adminDb().collection(COLLECTIONS.ORDERS).get();
  const newIds = new Set(orders.map((o) => o.id));
  const batch = adminDb().batch();
  current.docs.forEach((d) => {
    if (!newIds.has(d.id)) batch.delete(d.ref);
  });
  for (const o of orders) {
    batch.set(adminDb().collection(COLLECTIONS.ORDERS).doc(o.id), stripUndefined(o));
  }
  await batch.commit();
}

export async function deleteOrderServer(id: string): Promise<void> {
  await adminDb().collection(COLLECTIONS.ORDERS).doc(id).delete();
}

export async function deleteAllOrdersServer(): Promise<number> {
  const snap = await adminDb().collection(COLLECTIONS.ORDERS).get();
  // Firestore batch limit is 500 — split into chunks for safety.
  let i = 0;
  while (i < snap.docs.length) {
    const chunk = snap.docs.slice(i, i + 400);
    const batch = adminDb().batch();
    for (const d of chunk) batch.delete(d.ref);
    await batch.commit();
    i += chunk.length;
  }
  return snap.size;
}

// ============================================================
// Settings (singleton doc)
// ============================================================
export async function fetchSettingsServer(): Promise<SiteSettings> {
  if (!isAdminConfigured()) return defaultSiteSettings;
  const snap = await adminDb()
    .collection(COLLECTIONS.SETTINGS)
    .doc(SETTINGS_DOC_ID)
    .get();
  if (!snap.exists) return defaultSiteSettings;
  return snap.data() as SiteSettings;
}

export async function saveSettingsServer(settings: SiteSettings): Promise<void> {
  await adminDb()
    .collection(COLLECTIONS.SETTINGS)
    .doc(SETTINGS_DOC_ID)
    .set(stripUndefined(settings));
}

// ============================================================
// Sizes
// ============================================================
export async function fetchSizesServer(): Promise<Size[]> {
  if (!isAdminConfigured()) return defaultSizes;
  const snap = await adminDb()
    .collection(COLLECTIONS.SIZES)
    .orderBy("displayOrder", "asc")
    .get();
  if (snap.empty) return defaultSizes;
  return snap.docs.map((d) => d.data() as Size);
}

export async function upsertSizeServer(size: Size): Promise<void> {
  await adminDb()
    .collection(COLLECTIONS.SIZES)
    .doc(size.id)
    .set(stripUndefined({ ...size, updatedAt: new Date().toISOString() }));
}

export async function deleteSizeServer(id: string): Promise<void> {
  await adminDb().collection(COLLECTIONS.SIZES).doc(id).delete();
}

export async function replaceAllSizesServer(sizes: Size[]): Promise<void> {
  const batch = adminDb().batch();
  for (const s of sizes) {
    batch.set(
      adminDb().collection(COLLECTIONS.SIZES).doc(s.id),
      stripUndefined({ ...s, updatedAt: new Date().toISOString() })
    );
  }
  await batch.commit();
}

// ============================================================
// Seed (admin one-off bootstrap, behind ALLOW_SEED env flag in the route)
// ============================================================
export async function seedDefaultsServer(): Promise<{
  seededProducts: number;
  seededSizes: number;
  seededSettings: boolean;
  totalProducts: number;
  totalSizes: number;
}> {
  // Upsert all default products (idempotent — fixed IDs overwrite/create).
  const pBatch = adminDb().batch();
  for (const p of defaultProducts) {
    pBatch.set(adminDb().collection(COLLECTIONS.PRODUCTS).doc(p.id), stripUndefined(p));
  }
  await pBatch.commit();
  const pSnap = await adminDb().collection(COLLECTIONS.PRODUCTS).get();

  // Settings — only create if missing
  const setRef = adminDb().collection(COLLECTIONS.SETTINGS).doc(SETTINGS_DOC_ID);
  const setSnap = await setRef.get();
  let seededSettings = false;
  if (!setSnap.exists) {
    await setRef.set(stripUndefined(defaultSiteSettings));
    seededSettings = true;
  }

  // Sizes — only fill in missing ones
  const sSnap = await adminDb().collection(COLLECTIONS.SIZES).get();
  const have = new Set(sSnap.docs.map((d) => d.id));
  let seededSizes = 0;
  if (have.size < defaultSizes.length) {
    const sBatch = adminDb().batch();
    for (const s of defaultSizes) {
      if (!have.has(s.id)) {
        sBatch.set(adminDb().collection(COLLECTIONS.SIZES).doc(s.id), stripUndefined(s));
        seededSizes++;
      }
    }
    if (seededSizes > 0) await sBatch.commit();
  }
  const finalS = await adminDb().collection(COLLECTIONS.SIZES).get();

  return {
    seededProducts: defaultProducts.length,
    seededSizes,
    seededSettings,
    totalProducts: pSnap.size,
    totalSizes: finalS.size,
  };
}

export { isAdminConfigured };
