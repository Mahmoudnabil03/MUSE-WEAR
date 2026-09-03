"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/store";
import { MuseWearLogo } from "@/components/Logo";
import GoogleSignIn from "@/components/GoogleSignIn";

export default function LoginPage() {
  const { login, user } = useAuth();
  const router = useRouter();
  const { t } = useLang();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) router.replace("/account"); }, [user, router]);

  if (user) return null;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await login(email, password);
    setLoading(false);
    if (!res.ok) setErr(res.error || "Failed");
    else router.push("/account");
  };

  return (
    <div className="min-h-[80vh] grid lg:grid-cols-2">
      <div className="hidden lg:flex bg-black text-white relative overflow-hidden flex-col justify-between p-10">
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute -right-16 -top-16 w-80 h-80 border-[24px] border-white rotate-12" />
          <div className="absolute -left-16 -bottom-16 w-64 h-64 border-[20px] border-white -rotate-12" />
        </div>
        <MuseWearLogo light />
        <div className="relative">
          <h1 className="text-4xl font-black leading-none animate-fadeInUp">{t("Welcome back", "أهلاً بعودتك")}<br /><span className="bg-white text-black px-2">MUSE FAMILY</span></h1>
          <p className="text-white/60 text-sm mt-3 max-w-md">{t("Sign in to track orders, manage wishlist and checkout faster with COD & Paymob.", "سجّل الدخول لتتبع الطلبات وإدارة الرغبات والدفع أسرع بـ COD و Paymob.")}</p>
        </div>
        <div className="relative text-xs text-white/40">© MUSE WEAR CAIRO, EGYPT — EGP • COD • Paymob X-Pay</div>
      </div>

      <div className="flex items-center justify-center px-4 py-10 bg-zinc-50">
        <form onSubmit={onSubmit} className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl p-6 md:p-8 shadow-sm animate-scaleIn" noValidate>
          <div className="lg:hidden mb-6"><MuseWearLogo /></div>
          <h2 className="text-2xl font-black tracking-tight">{t("Sign in", "تسجيل الدخول")}</h2>
          <p className="text-sm text-zinc-500 mt-1">{t("New here?", "جديد؟")} <Link href="/signup" className="font-bold text-black underline underline-offset-4 focus:outline-none focus:ring-2 focus:ring-black rounded">{t("Create account", "إنشاء حساب")}</Link></p>

          {err && <div role="alert" className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{err}</div>}

          <div className="mt-6 space-y-4">
            <div>
              <label htmlFor="email" className="text-xs font-bold tracking-wide">EMAIL</label>
              <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required autoComplete="email" placeholder="you@example.com" className="mt-1 w-full border border-zinc-300 rounded-full px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition" />
            </div>
            <div>
              <div className="flex items-center justify-between"><label htmlFor="password" className="text-xs font-bold tracking-wide">PASSWORD</label><button type="button" onClick={() => setShow(!show)} className="text-xs underline font-semibold">{show ? t("Hide", "إخفاء") : t("Show", "إظهار")}</button></div>
              <input id="password" value={password} onChange={(e) => setPassword(e.target.value)} type={show ? "text" : "password"} required autoComplete="current-password" placeholder="••••••••" className="mt-1 w-full border border-zinc-300 rounded-full px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-2 focus:ring-black/10 transition" />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> {t("Remember me", "تذكرني")}</label>
              <span className="text-zinc-500 hover:underline cursor-pointer">{t("Forgot password?", "نسيت كلمة المرور؟")}</span>
            </div>
            <button disabled={loading} className="w-full bg-black text-white rounded-full py-3.5 font-black text-sm hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99] transition disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
              {loading ? t("Signing in...", "جاري الدخول...") : t("Sign In", "دخول")}
            </button>
            <GoogleSignIn mode="signin" />
            <div className="text-xs text-center text-zinc-500">{t("By signing in you agree to our Terms.", "بتسجيل الدخول توافق على الشروط.")}</div>
          </div>

        </form>
      </div>
    </div>
  );
}
