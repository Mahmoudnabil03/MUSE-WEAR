"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/store";
import { MuseWearLogo } from "@/components/Logo";

export default function SignupPage() {
  const { signup, user } = useAuth();
  const router = useRouter();
  const { t } = useLang();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) {
    if (typeof window !== "undefined") router.replace("/account");
    return null;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    setTimeout(() => {
      const res = signup(name, email, password);
      setLoading(false);
      if (!res.ok) setErr(res.error || "Failed");
      else router.push("/account");
    }, 400);
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-10 bg-zinc-50 order-2 lg:order-1">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm animate-scaleIn">
          <div className="lg:hidden mb-6"><MuseWearLogo /></div>
          <h2 className="text-2xl font-black tracking-tight">{t("Create account", "إنشاء حساب")}</h2>
          <p className="text-sm text-zinc-500 mt-1">{t("Already have an account?", "لديك حساب؟")} <Link href="/login" className="font-bold text-black underline underline-offset-4">{t("Sign in", "تسجيل الدخول")}</Link></p>

          {err && <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{err}</div>}

          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs font-bold tracking-wide">{t("FULL NAME", "الاسم الكامل")}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Mahmoud Nabil" className="mt-1 w-full border border-zinc-300 rounded-full px-4 py-3 text-sm focus:border-black focus:outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide">EMAIL</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required placeholder="you@example.com" className="mt-1 w-full border border-zinc-300 rounded-full px-4 py-3 text-sm focus:border-black focus:outline-none transition" />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wide">PASSWORD</label>
              <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required placeholder="••••••••" className="mt-1 w-full border border-zinc-300 rounded-full px-4 py-3 text-sm focus:border-black focus:outline-none transition" />
              <div className="text-xs text-zinc-400 mt-1">{t("Min 6 characters", "6 أحرف على الأقل")}</div>
            </div>
            <button disabled={loading} className="w-full bg-black text-white rounded-full py-3.5 font-black text-sm hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60">
              {loading ? t("Creating...", "جاري الإنشاء...") : t("Create Account", "إنشاء حساب")}
            </button>
            <div className="text-xs text-center text-zinc-500">{t("All data stored locally (demo) — ready to swap to Supabase Auth.", "البيانات محلياً (تجريبي) — جاهز للربط بـ Supabase.")}</div>
          </div>
        </form>
      </div>

      <div className="hidden lg:flex bg-zinc-900 text-white relative overflow-hidden flex-col justify-between p-10 order-1 lg:order-2">
        <div className="absolute inset-0 opacity-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=60" alt="" className="w-full h-full object-cover" />
        </div>
        <MuseWearLogo light />
        <div className="relative">
          <h1 className="text-4xl font-black leading-none">JOIN<br /><span className="bg-white text-black px-2">MUSE WEAR</span></h1>
          <p className="text-white/70 text-sm mt-3 max-w-md">{t("Multibrand + factory. 14-day returns, COD across Egypt, Paymob secure checkout.", "متعدد الماركات + مصنع. إرجاع 14 يوم، COD لكل مصر، Paymob آمن.")}</p>
          <div className="mt-4 flex gap-2 text-xs font-bold"><span className="bg-white text-black px-3 py-1 rounded-full">EGP</span><span className="border border-white/30 px-3 py-1 rounded-full">COD</span><span className="border border-white/30 px-3 py-1 rounded-full">X-Pay</span></div>
        </div>
        <div className="relative text-xs text-white/40">Trusted across Cairo • Alexandria • Giza • All Governorates</div>
      </div>
    </div>
  );
}
