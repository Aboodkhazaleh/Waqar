import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "وقار | أزياء أردنية فاخرة",
  description: "وقار — علامة أردنية للأزياء الفاخرة. تشكيلة السمو والراقي والاكسسوارات.",
  keywords: "وقار, waqar, أزياء أردنية, فاشن أردني, السمو, الراقي, الشماغ, العقال, السروال, الطواقي",
  authors: [{ name: "Waqar" }],
  robots: "index, follow",
  openGraph: {
    title: "وقار | أزياء أردنية فاخرة",
    description: "تشكيلة السمو والراقي من الفاشن الأردني الفاخر",
    type: "website",
    locale: "ar_JO",
    siteName: "وقار",
  },
  twitter: {
    card: "summary_large_image",
    title: "وقار | أزياء أردنية فاخرة",
    description: "تشكيلة السمو والراقي من الفاشن الأردني الفاخر",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@300;400;500;600;700;800;900&family=Amiri:wght@400;700&family=Noto+Naskh+Arabic:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="grain-overlay">{children}</body>
    </html>
  );
}
