"use client";

import { useEffect, useState, type ReactNode } from "react";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "./CartDrawer";
import { subscribeSettings } from "@/lib/firestore";

interface CartWrapperProps {
  children: ReactNode;
  initialWhatsappNumber?: string;
}

/**
 * Top-level cart provider + drawer mount.
 * Lives in the root layout so the cart drawer is available on every page.
 * Subscribes to settings so the WhatsApp deep-link stays in sync.
 */
export default function CartWrapper({
  children,
  initialWhatsappNumber,
}: CartWrapperProps) {
  const [whatsapp, setWhatsapp] = useState(initialWhatsappNumber ?? "");

  useEffect(() => {
    const unsub = subscribeSettings((next) => {
      if (next?.whatsappNumber) setWhatsapp(next.whatsappNumber);
    });
    return () => unsub();
  }, []);

  return (
    <CartProvider>
      {children}
      <CartDrawer whatsappNumber={whatsapp} />
    </CartProvider>
  );
}
