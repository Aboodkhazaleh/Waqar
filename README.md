# وقار | Waqar — Jordanian Luxury Fashion

> Modern Jordanian luxury fashion e-commerce. Built with Next.js 15, TypeScript, Tailwind CSS, Framer Motion, and Firebase Firestore.

## Stack
- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS, modern luxury palette (black / white / cyan `#3DB4C4`)
- **Animation:** Framer Motion
- **Backend:** Firebase Firestore (real-time via `onSnapshot`) + Firebase Storage
- **Auth (admin):** Cookie-based JWT (jose)
- **Package manager:** [Bun](https://bun.sh)

## Quick start

```bash
# 1. Install dependencies
bun install

# 2. Copy env template and fill in your Firebase credentials
cp .env.example .env.local

# 3. Run dev server
bun run dev
# → http://localhost:3000
```

## Admin panel

- URL: http://localhost:3000/admin/login
- Default username: `admin`
- Default password: `waqar@2024` (change in `.env.local`)

After first login, open **Settings → "تهيئة Firestore بالمنتجات الافتراضية"** to seed default products.

## Project structure

```
src/
├── app/               # Next.js App Router pages
│   ├── api/admin/     # Admin REST endpoints (products, orders, settings, upload, seed)
│   ├── admin/         # Admin pages (dashboard, products, orders, settings)
│   └── products/      # Public product pages
├── components/        # Reusable UI (layout, home sections, admin, product, ui)
├── data/              # Default products + categories
├── lib/
│   ├── firebase.ts    # Firebase client init
│   ├── firestore.ts   # CRUD + onSnapshot subscriptions
│   ├── auth.ts        # JWT admin auth
│   └── utils.ts       # formatPrice, WhatsApp link helpers
└── types/             # Shared TypeScript types
public/images/         # Logo + product photos
```

## Products

- **السمو (Al-Sumo)** — flagship premium line
- **الراقي (Al-Raqi)** — modern elegance line
- **Accessories** — السروال (Sirwal), الشماغ (Shemagh), العقال (Iqal), الطواقي (Tagiyah)

All prices in **Jordanian Dinar (د.أ)**.

## Real-time sync

Every admin edit (price, stock, color, image, announcement bar, social links) propagates to the live site **without a page refresh** via Firestore `onSnapshot` listeners.

## Deploy

The project is Vercel-ready. Set the Firebase + admin env vars in your Vercel project settings, then push to your `main` branch.

### Required environment variables

**Public (browser-safe — used by the storefront for reads):**

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=waqar1-2fc58.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=waqar1-2fc58
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=waqar1-2fc58.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
```

**Server-only (NEVER prefix with `NEXT_PUBLIC_`):**

```
# Admin login (jose JWT)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=<a-strong-password>
ADMIN_JWT_SECRET=<a-long-random-string>

# Firebase Admin SDK — REQUIRED in production.
# Either one JSON blob (preferred on Vercel)…
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"…",…}'

# …or three split vars (preferred for local dev).
# FIREBASE_PROJECT_ID=waqar1-2fc58
# FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@waqar1-2fc58.iam.gserviceaccount.com
# FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n…\n-----END PRIVATE KEY-----\n"
```

Generate the service-account JSON in **Firebase Console → Project Settings → Service accounts → Generate new private key**.

## Security model

This project uses **Firestore + Storage Security Rules** that deny all client writes (and all client reads of `orders`). Every write — and every read of an order — goes through a Next.js API route running the Firebase Admin SDK on the server. That gives us:

- Customers can browse, add to cart, and place an order without ever being able to read other customers' orders, change totals, or tamper with product data.
- Admins manage everything through `/admin/*`, which is gated by a custom JWT cookie session (`src/lib/auth.ts`).
- Even if someone scrapes the public Firebase config from the bundled JS, they cannot do anything beyond reading the public catalog.

### Files
- `firestore.rules` — public read on `products` / `settings` / `sizes`; deny everything else.
- `storage.rules` — public read on `products/**`; deny all client writes.
- `firebase.json` — wires the rules files for `firebase deploy`.

### Deploying the rules

Install the CLI once and log in:

```bash
npm i -g firebase-tools
firebase login
firebase use waqar1-2fc58   # creates a .firebaserc on first run
```

Then deploy rules whenever they change:

```bash
firebase deploy --only firestore:rules,storage
```

### Why the public Firebase config is OK to ship

The values prefixed with `NEXT_PUBLIC_FIREBASE_*` are not secrets — Firebase's web SDK is designed to embed them in the client. What protects your data is the **rules** above, not the config. Never put the Admin SDK service account in a `NEXT_PUBLIC_` variable.

---

© 2025 وقار — جميع الحقوق محفوظة
