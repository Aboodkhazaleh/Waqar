"use client";

import { useState, useEffect, useRef } from "react";
import type { SiteSettings } from "@/types";
import { Save, MessageCircle, Globe, Image, Database, AlertCircle } from "lucide-react";
import { subscribeSettings } from "@/lib/firestore";

interface Props {
  initialSettings: SiteSettings;
}

export default function SettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [seeding, setSeeding] = useState(false);
  const [seedMsg, setSeedMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const isLocalEdit = useRef(false);

  const handleSeed = async () => {
    if (!confirm("سيتم نسخ المنتجات الافتراضية إلى Firestore (لن يحذف أي شيء موجود). المتابعة؟")) return;
    setSeeding(true);
    setSeedMsg(null);
    try {
      const res = await fetch("/api/admin/seed", { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        setSeedMsg({
          type: "ok",
          text: `تم: ${data.seededProducts} منتج، ${data.seededSettings ? "تم إنشاء الإعدادات" : "الإعدادات موجودة مسبقاً"}`,
        });
      } else {
        setSeedMsg({ type: "err", text: data.error ?? "فشل" });
      }
      setTimeout(() => setSeedMsg(null), 5000);
    } finally {
      setSeeding(false);
    }
  };

  // Subscribe to Firestore but ignore the update we just sent ourselves
  useEffect(() => {
    const unsub = subscribeSettings((next) => {
      if (isLocalEdit.current) {
        isLocalEdit.current = false;
        return;
      }
      setSettings(next);
    });
    return () => unsub();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    isLocalEdit.current = true;
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setMsg("تم حفظ الإعدادات بنجاح ✓ — الموقع يتحدّث الآن");
      } else {
        const data = await res.json();
        setMsg(`فشل الحفظ: ${data.error ?? "خطأ"}`);
      }
      setTimeout(() => setMsg(""), 3500);
    } finally {
      setSaving(false);
    }
  };

  const Field = ({
    label, value, onChange, type = "text", placeholder = "",
  }: {
    label: string; value: string; onChange: (v: string) => void;
    type?: string; placeholder?: string;
  }) => (
    <div className="flex flex-col gap-2">
      <label className="font-arabic text-xs text-white/50">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-xl px-4 py-3 placeholder:text-white/20 focus:outline-none focus:border-[#3DB4C4]/50 transition-all"
        dir="rtl"
      />
    </div>
  );

  return (
    <div className="max-w-2xl flex flex-col gap-6">
      {msg && (
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
          <p className="font-arabic text-sm text-green-400">{msg}</p>
        </div>
      )}

      {/* WhatsApp */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <MessageCircle size={16} className="text-[#25D366]" />
          <h3 className="font-arabic text-sm font-semibold text-white">إعدادات واتساب</h3>
        </div>
        <Field
          label="رقم واتساب (مع رمز الدولة)"
          value={settings.whatsappNumber}
          onChange={(v) => setSettings({ ...settings, whatsappNumber: v })}
          placeholder="966500000000"
        />
      </div>

      {/* Hero */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <Globe size={16} className="text-[#3DB4C4]" />
          <h3 className="font-arabic text-sm font-semibold text-white">إعدادات الصفحة الرئيسية</h3>
        </div>
        <Field
          label="نص شريط الإعلان"
          value={settings.announcementBar}
          onChange={(v) => setSettings({ ...settings, announcementBar: v })}
        />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSettings({ ...settings, showAnnouncementBar: !settings.showAnnouncementBar })}
            className={`relative w-10 h-5 rounded-full transition-all ${
              settings.showAnnouncementBar ? "bg-[#3DB4C4]" : "bg-[#2A2A2A]"
            }`}
          >
            <span
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${
                settings.showAnnouncementBar ? "right-0.5" : "left-0.5"
              }`}
            />
          </button>
          <span className="font-arabic text-sm text-white/50">إظهار شريط الإعلان</span>
        </div>
      </div>

      {/* Social */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 mb-1">
          <Image size={16} className="text-[#3DB4C4]" />
          <h3 className="font-arabic text-sm font-semibold text-white">روابط التواصل الاجتماعي</h3>
        </div>
        <Field
          label="إنستغرام"
          value={settings.instagramUrl ?? ""}
          onChange={(v) => setSettings({ ...settings, instagramUrl: v })}
          placeholder="https://instagram.com/..."
        />
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-[#3DB4C4] to-[#5FC9D9] text-dark font-arabic font-bold text-base rounded-xl hover:opacity-90 transition-all disabled:opacity-60"
      >
        {saving ? (
          <span className="w-4 h-4 border-2 border-dark border-t-transparent rounded-full animate-spin" />
        ) : (
          <Save size={18} />
        )}
        حفظ الإعدادات
      </button>

      {/* Firestore setup */}
      <div className="bg-[#111111] border border-[#1C1C1C] rounded-2xl p-5 flex flex-col gap-4 mt-4">
        <div className="flex items-center gap-2 mb-1">
          <Database size={16} className="text-[#3DB4C4]" />
          <h3 className="font-arabic text-sm font-semibold text-white">إعداد Firestore</h3>
        </div>
        <p className="font-arabic text-xs text-white/50 leading-7">
          عند تشغيل المشروع لأول مرة على Firebase، اضغط الزر التالي لنسخ المنتجات الافتراضية
          (السمو، الراقي، الاكسسوارات) إلى Firestore. لا يحذف هذا الزر شيئاً — فقط يضيف ما لم يكن موجوداً.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="flex items-center justify-center gap-2 py-3 bg-[#1C1C1C] border border-[#2A2A2A] text-white/80 hover:text-white hover:border-[#3DB4C4]/40 font-arabic font-semibold text-sm rounded-xl transition-all disabled:opacity-60"
        >
          {seeding ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <Database size={14} />
          )}
          تهيئة Firestore بالمنتجات الافتراضية
        </button>
        {seedMsg && (
          <div
            className={`flex items-center gap-2 rounded-lg p-2.5 ${
              seedMsg.type === "ok"
                ? "bg-green-500/10 border border-green-500/20 text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-400"
            }`}
          >
            <AlertCircle size={14} />
            <p className="font-arabic text-xs">{seedMsg.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}
