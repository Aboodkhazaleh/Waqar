import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import WhatsAppButton from "@/components/layout/WhatsAppButton";
import HeroSection from "@/components/home/HeroSection";
import HomeSections from "@/components/home/HomeSections";
import LiveAnnouncementBar from "@/components/home/LiveAnnouncementBar";
import LiveFinalCTA from "@/components/home/LiveFinalCTA";
import BrandValues from "@/components/home/BrandValues";
import { fetchProductsServer, fetchSettingsServer } from "@/lib/firestoreServer";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  // Initial server-side fetch from Firestore (SSR/SEO + first paint)
  const [products, settings] = await Promise.all([
    fetchProductsServer(),
    fetchSettingsServer(),
  ]);

  return (
    <main className="min-h-screen bg-black">
      {/* Announcement bar — live-synced */}
      <LiveAnnouncementBar initialSettings={settings} />

      <Navbar />
      <HeroSection />

      {/* Products (live-synced via Firestore onSnapshot) */}
      <HomeSections initialProducts={products} />

      <BrandValues />

      {/* Final CTA (live-synced) */}
      <LiveFinalCTA initialProducts={products} />

      <Footer
        whatsappNumber={settings.whatsappNumber}
        socials={{ instagram: settings.instagramUrl }}
      />
      <WhatsAppButton phone={settings.whatsappNumber} />
    </main>
  );
}
