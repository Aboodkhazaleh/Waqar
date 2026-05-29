// Firestore data access layer — replaces the JSON-file storage
import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  type Unsubscribe,
  type DocumentData,
} from "firebase/firestore";
import {
  db,
  isFirebaseConfigured,
  COLLECTIONS,
  SETTINGS_DOC_ID,
} from "./firebase";
import type { Product, Order, SiteSettings, Size } from "@/types";
import {
  products as defaultProducts,
  mockOrders as defaultOrders,
  defaultSiteSettings,
} from "@/data/products";
import { defaultSizes } from "@/data/sizes";

// Firestore rejects `undefined`. Recursively strip it from any value going to Firestore.
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
// Read helpers (return defaults if Firestore not yet configured)
// ============================================================
export async function fetchProducts(): Promise<Product[]> {
  if (!db) return defaultProducts;
  const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  if (snap.empty) return defaultProducts;
  return snap.docs.map((d) => d.data() as Product);
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  if (!db) return defaultProducts.find((p) => p.slug === slug) ?? null;
  const snap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  if (snap.empty) {
    return defaultProducts.find((p) => p.slug === slug) ?? null;
  }
  const match = snap.docs
    .map((d) => d.data() as Product)
    .find((p) => p.slug === slug);
  return match ?? null;
}

export async function fetchOrders(): Promise<Order[]> {
  if (!db) return defaultOrders;
  const q = query(collection(db, COLLECTIONS.ORDERS), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  if (snap.empty) return [];
  return snap.docs.map((d) => d.data() as Order);
}

export async function fetchSettings(): Promise<SiteSettings> {
  if (!db) return defaultSiteSettings;
  const docRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  const snap = await getDoc(docRef);
  if (!snap.exists()) return defaultSiteSettings;
  return snap.data() as SiteSettings;
}

// ============================================================
// Write helpers (only callable when Firestore is configured)
// ============================================================
export async function upsertProduct(product: Product): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ — أضف بيانات Firebase في .env.local");
  await setDoc(
    doc(db, COLLECTIONS.PRODUCTS, product.id),
    stripUndefined({ ...product, updatedAt: new Date().toISOString() })
  );
}

export async function replaceAllProducts(products: Product[]): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  const batch = writeBatch(db);
  for (const p of products) {
    batch.set(
      doc(db, COLLECTIONS.PRODUCTS, p.id),
      stripUndefined({ ...p, updatedAt: new Date().toISOString() })
    );
  }
  await batch.commit();
}

export async function deleteProduct(id: string): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
}

export async function addOrderFs(order: Order): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), stripUndefined(order));
}

export async function replaceAllOrders(orders: Order[]): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  // For PUT-style updates we just upsert each by id; old ones not in list need explicit delete.
  // Easier: fetch all current ids, compute diff, then batch.
  const current = await getDocs(collection(db, COLLECTIONS.ORDERS));
  const newIds = new Set(orders.map((o) => o.id));
  const batch = writeBatch(db);
  current.docs.forEach((d) => {
    if (!newIds.has(d.id)) batch.delete(d.ref);
  });
  for (const o of orders) {
    batch.set(doc(db, COLLECTIONS.ORDERS, o.id), stripUndefined(o));
  }
  await batch.commit();
}

export async function deleteOrderFs(id: string): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await deleteDoc(doc(db, COLLECTIONS.ORDERS, id));
}

export async function deleteAllOrders(): Promise<number> {
  if (!db) throw new Error("Firestore غير مهيأ");
  const snap = await getDocs(collection(db, COLLECTIONS.ORDERS));
  const batch = writeBatch(db);
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();
  return snap.size;
}

export async function saveSettingsFs(settings: SiteSettings): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await setDoc(
    doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID),
    stripUndefined(settings)
  );
}

// ============================================================
// Sizes (managed by admin, real-time)
// ============================================================
export async function fetchSizes(): Promise<Size[]> {
  if (!db) return defaultSizes;
  const snap = await getDocs(
    query(collection(db, COLLECTIONS.SIZES), orderBy("displayOrder", "asc"))
  );
  if (snap.empty) return defaultSizes;
  return snap.docs.map((d) => d.data() as Size);
}

export async function upsertSize(size: Size): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await setDoc(
    doc(db, COLLECTIONS.SIZES, size.id),
    stripUndefined({ ...size, updatedAt: new Date().toISOString() })
  );
}

export async function deleteSize(id: string): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await deleteDoc(doc(db, COLLECTIONS.SIZES, id));
}

export async function replaceAllSizes(sizes: Size[]): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  const batch = writeBatch(db);
  for (const s of sizes) {
    batch.set(
      doc(db, COLLECTIONS.SIZES, s.id),
      stripUndefined({ ...s, updatedAt: new Date().toISOString() })
    );
  }
  await batch.commit();
}

// ============================================================
// Real-time subscriptions (for client components)
// ============================================================
export function subscribeProducts(
  callback: (products: Product[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    callback(defaultProducts);
    return () => {};
  }
  return onSnapshot(
    collection(db, COLLECTIONS.PRODUCTS),
    (snap) => {
      const products = snap.docs.map((d) => d.data() as Product);
      callback(products.length > 0 ? products : defaultProducts);
    },
    (err) => onError?.(err)
  );
}

export function subscribeOrders(
  callback: (orders: Order[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    callback([]);
    return () => {};
  }
  const q = query(collection(db, COLLECTIONS.ORDERS), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as Order)),
    (err) => onError?.(err)
  );
}

export function subscribeSettings(
  callback: (settings: SiteSettings) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    callback(defaultSiteSettings);
    return () => {};
  }
  return onSnapshot(
    doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID),
    (snap) => {
      if (snap.exists()) {
        callback(snap.data() as SiteSettings);
      } else {
        callback(defaultSiteSettings);
      }
    },
    (err) => onError?.(err)
  );
}

export function subscribeSizes(
  callback: (sizes: Size[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  if (!db) {
    callback(defaultSizes);
    return () => {};
  }
  return onSnapshot(
    query(collection(db, COLLECTIONS.SIZES), orderBy("displayOrder", "asc")),
    (snap) => {
      const sizes = snap.docs.map((d) => d.data() as Size);
      callback(sizes.length > 0 ? sizes : defaultSizes);
    },
    (err) => onError?.(err)
  );
}

// ============================================================
// Seed: ensure all default products + settings exist in Firestore.
// Idempotent — uses fixed document IDs so re-running is safe.
// ============================================================
export async function seedDefaultsIfEmpty(): Promise<{
  seededProducts: number;
  seededOrders: number;
  seededSettings: boolean;
  seededSizes: number;
  totalProducts: number;
  totalSizes: number;
}> {
  if (!db) throw new Error("Firestore غير مهيأ");

  // Always upsert all default products (idempotent via fixed IDs)
  const productBatch = writeBatch(db);
  for (const p of defaultProducts) {
    productBatch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), stripUndefined(p));
  }
  await productBatch.commit();
  const psnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));

  // Settings — only create if missing (don't overwrite admin's edits)
  const setRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  const setSnap = await getDoc(setRef);
  let seededSettings = false;
  if (!setSnap.exists()) {
    await setDoc(setRef, stripUndefined(defaultSiteSettings));
    seededSettings = true;
  }

  // Sizes — seed only ones that don't already exist (preserve admin edits)
  const sizesSnap = await getDocs(collection(db, COLLECTIONS.SIZES));
  const existingSizeIds = new Set(sizesSnap.docs.map((d) => d.id));
  let seededSizes = 0;
  if (existingSizeIds.size < defaultSizes.length) {
    const sizeBatch = writeBatch(db);
    for (const s of defaultSizes) {
      if (!existingSizeIds.has(s.id)) {
        sizeBatch.set(doc(db, COLLECTIONS.SIZES, s.id), stripUndefined(s));
        seededSizes++;
      }
    }
    if (seededSizes > 0) await sizeBatch.commit();
  }
  const finalSizesSnap = await getDocs(collection(db, COLLECTIONS.SIZES));

  return {
    seededProducts: defaultProducts.length,
    seededOrders: 0,
    seededSettings,
    seededSizes,
    totalProducts: psnap.size,
    totalSizes: finalSizesSnap.size,
  };
}

export { isFirebaseConfigured };
