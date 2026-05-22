"use client";

import { useEffect, useState } from "react";
import type { SiteSettings } from "@/types";
import { subscribeSettings } from "@/lib/firestore";
import AnnouncementBar from "./AnnouncementBar";

interface LiveAnnouncementBarProps {
  initialSettings: SiteSettings;
}

/**
 * Live-syncing announcement bar — listens to Firestore settings doc.
 * Hides instantly when admin toggles it off; updates text in real-time.
 */
export default function LiveAnnouncementBar({
  initialSettings,
}: LiveAnnouncementBarProps) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);

  useEffect(() => {
    const unsub = subscribeSettings((next) => setSettings(next));
    return () => unsub();
  }, []);

  if (!settings.showAnnouncementBar) return null;
  return <AnnouncementBar text={settings.announcementBar} />;
}
