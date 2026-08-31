"use client";
import { useAuth } from "@/lib/auth";
import { useLang } from "@/lib/store";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";

export default function AccountPage() {
  const { user, logout } = useAuth();
  const { t } = useLang();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      const timer = setTimeout(() => router.replace("/login"), 600);
      return () => clearTimeout(timer);
    }
  }, [user, router]);

  if (!user) return <div className="max-w-[600px] mx-auto px-4 py-16 text-center"><p className="text-zinc-500">{t("Redirecting to login...", "جاري التحويل لتسجيل الدخول...")}</p></div>;

  return (
    <div className="max-w-[800px] mx-auto px-4 py-10">
      <div className="bg-black text-white rounded-2xl p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeInUp">
        <div>
          <div className="text-xs tracking-[0.2em] text-white/60">MUSE WEAR • ACCOUNT</div>
          <h1 className="text-2xl font-black mt-1">{t("Hi", "أهلاً")} {user.name} 👋</h1>
          <div className="text-sm text-white/70 mt-1">{user.email} • {t("Member since", "عضو منذ")} {new Date(user.createdAt).toLocaleDateString()}</div>
        </div>
        <button onClick={() => { logout(); router.push("/"); }} className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm hover:scale-105 transition">{t("Sign Out", "تسجيل خروج")}</button>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mt-6">
        {[
          ["Orders", "طلباتي", "/cart", "🛒"],
          ["Wishlist", "رغباتي", "/wishlist", "♡"],
          ["Admin", "لوحة التحكم", "/admin", "⚙"],
        ].map(([en, ar, href, icon]) => (
          <Link key={href} href={href} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:border-black hover-lift transition">
            <div className="text-2xl">{icon}</div>
            <div className="font-black mt-2">{t(en as string, ar as string)}</div>
            <div className="text-xs text-zinc-500">{t("Manage", "إدارة")}</div>
          </Link>
        ))}
      </div>

      <div className="mt-6 bg-white border border-zinc-200 rounded-2xl p-6">
        <h3 className="font-bold">Account Details</h3>
        <div className="mt-3 text-sm space-y-1">
          <div><span className="text-zinc-500">Name:</span> <span className="font-semibold">{user.name}</span></div>
          <div><span className="text-zinc-500">Email:</span> <span className="font-semibold">{user.email}</span></div>
          <div><span className="text-zinc-500">Currency:</span> <span className="font-semibold">EGP • Egypt</span></div>
          <div><span className="text-zinc-500">Payments:</span> <span className="font-semibold">COD + Paymob X-Pay</span></div>
        </div>
      </div>
    </div>
  );
}
