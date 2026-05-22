"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError(data.error || "بيانات الدخول غير صحيحة");
      }
    } catch {
      setError("حدث خطأ في الاتصال، يرجى المحاولة مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-[#0A0A0A] flex items-center justify-center p-4"
      style={{ direction: "rtl" }}
    >
      {/* Background */}
      <div className="fixed inset-0 bg-[#0A0A0A]">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#3DB4C4]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#141414] border border-[#3DB4C4]/20 mb-4 relative">
            <Image
              src="/images/logo/waqar-logo.png"
              alt="وقار"
              fill
              className="object-contain p-3"
            />
          </div>
          <h1 className="font-arabic text-2xl font-bold text-white mt-2">لوحة تحكم وقار</h1>
          <p className="font-arabic text-sm text-white/40 mt-1">تسجيل الدخول الإداري</p>
        </div>

        {/* Card */}
        <div className="bg-[#111111] border border-[#252525] rounded-2xl p-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheck size={16} className="text-[#3DB4C4]" />
            <span className="font-arabic text-sm text-white/50">منطقة مؤمّنة</span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div className="flex flex-col gap-2">
              <label className="font-arabic text-sm text-white/60">اسم المستخدم</label>
              <div className="relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder="أدخل اسم المستخدم"
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-xl px-4 py-3 pr-10 placeholder:text-white/20 focus:outline-none focus:border-[#3DB4C4]/50 focus:bg-[#1C1C1C] transition-all"
                />
                <User size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/25 pointer-events-none" />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="font-arabic text-sm text-white/60">كلمة المرور</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="أدخل كلمة المرور"
                  className="w-full bg-[#1C1C1C] border border-[#2A2A2A] text-white font-arabic text-sm rounded-xl px-4 py-3 pr-10 pl-10 placeholder:text-white/20 focus:outline-none focus:border-[#3DB4C4]/50 transition-all"
                />
                <Lock size={16} className="absolute top-1/2 right-3 -translate-y-1/2 text-white/25 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute top-1/2 left-3 -translate-y-1/2 text-white/25 hover:text-white/50 transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                <p className="font-arabic text-sm text-red-400">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-[#3DB4C4] via-[#5FC9D9] to-[#3DB4C4] text-[#0A0A0A] font-arabic font-bold text-base rounded-xl shadow-lg shadow-[#3DB4C4]/20 hover:shadow-[#3DB4C4]/40 hover:scale-[1.01] active:scale-[0.99] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  جارٍ التحقق...
                </span>
              ) : (
                "دخول"
              )}
            </button>
          </form>
        </div>

        <p className="text-center font-arabic text-xs text-white/20 mt-6">
          © {new Date().getFullYear()} وقار — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
