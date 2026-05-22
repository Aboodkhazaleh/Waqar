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
import type { Product, Order, SiteSettings } from "@/types";
import {
  products as defaultProducts,
  mockOrders as defaultOrders,
  defaultSiteSettings,
} from "@/data/products";

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
  await setDoc(doc(db, COLLECTIONS.PRODUCTS, product.id), {
    ...product,
    updatedAt: new Date().toISOString(),
  });
}

export async function replaceAllProducts(products: Product[]): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  const batch = writeBatch(db);
  // Note: in batch we cannot delete-all-then-create — but upsert each by id is enough for our use case.
  for (const p of products) {
    batch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), {
      ...p,
      updatedAt: new Date().toISOString(),
    });
  }
  await batch.commit();
}

export async function deleteProduct(id: string): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await deleteDoc(doc(db, COLLECTIONS.PRODUCTS, id));
}

export async function addOrderFs(order: Order): Promise<void> {
  if (!db) throw new Error("Firestore غير مهيأ");
  await setDoc(doc(db, COLLECTIONS.ORDERS, order.id), order);
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
    batch.set(doc(db, COLLECTIONS.ORDERS, o.id), o);
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
  await setDoc(doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID), settings);
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

// ============================================================
// Seed: push defaults if collection is empty (one-time bootstrap)
// ============================================================
export async function seedDefaultsIfEmpty(): Promise<{
  seededProducts: number;
  seededOrders: number;
  seededSettings: boolean;
}> {
  if (!db) throw new Error("Firestore غير مهيأ");
  const result = { seededProducts: 0, seededOrders: 0, seededSettings: false };

  // Products
  const psnap = await getDocs(collection(db, COLLECTIONS.PRODUCTS));
  if (psnap.empty) {
    const batch = writeBatch(db);
    for (const p of defaultProducts) {
      batch.set(doc(db, COLLECTIONS.PRODUCTS, p.id), p);
    }
    await batch.commit();
    result.seededProducts = defaultProducts.length;
  }

  // Orders (only seed if explicitly requested — keep empty by default)
  // Skipped intentionally — admin starts with a clean orders board.

  // Settings
  const setRef = doc(db, COLLECTIONS.SETTINGS, SETTINGS_DOC_ID);
  const setSnap = await getDoc(setRef);
  if (!setSnap.exists()) {
    await setDoc(setRef, defaultSiteSettings);
    result.seededSettings = true;
  }

  return result;
}

export { isFirebaseConfigured };
