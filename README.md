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

---

© 2025 وقار — جميع الحقوق محفوظة
