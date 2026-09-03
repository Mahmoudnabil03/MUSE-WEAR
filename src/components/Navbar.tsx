"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang, useCart, useWishlist } from "@/lib/store";
import { useAuth } from "@/lib/auth";
import { MuseWearLogo } from "./Logo";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { lang, toggle, t } = useLang();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();
  const { user } = useAuth();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [q, setQ] = useState("");
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) router.push(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className={`sticky top-0 z-50 bg-white border-b transition-shadow ${scrolled ? "shadow-[0_2px_20px_rgba(0,0,0,0.06)] border-black/10" : "border-black/10"}`}>
      <div className="bg-black text-white text-xs overflow-hidden py-2 relative">
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {Array(4).fill(0).map((_, i) => (
            <span key={i} className="mx-8 tracking-wide flex items-center gap-8">
              <span>★ {t("Free delivery in Cairo & Alexandria on orders over 999 EGP", "شحن مجاني داخل القاهرة والإسكندرية للطلبات فوق 999 جنيه")}</span>
              <span className="opacity-30">•</span>
              <span>{t("Cash on Delivery available", "الدفع عند الاستلام متاح")}</span>
              <span className="opacity-30">•</span>
              <span className="font-bold">MUSE WEAR — CAIRO, EGYPT</span>
              <span className="opacity-30">•</span>
              <span>{t("Pay with Paymob (X-Pay)", "ادفع بـ Paymob")}</span>
            </span>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-4 py-3">
          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="MUSE WEAR Home">
            <div className="transition-transform group-hover:scale-105 duration-300">
              <MuseWearLogo />
            </div>
          </Link>

          <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full border border-zinc-300 rounded-full overflow-hidden focus-within:border-black transition-colors bg-zinc-50 focus-within:bg-white">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Search for products, brands and more", "ابحث عن منتجات، ماركات وأكثر")} aria-label={t("Search", "بحث")} className="flex-1 px-5 py-2.5 text-sm outline-none bg-transparent" />
              <button type="submit" className="px-6 bg-black text-white text-sm font-semibold hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-black"> {t("Search", "بحث")}</button>
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-3 ml-auto text-sm">
            <button onClick={toggle} aria-label="Toggle language" className="hidden sm:inline-flex border border-zinc-300 rounded-full px-3 py-1.5 font-semibold hover:border-black hover:bg-black hover:text-white transition">
              {lang === "en" ? "العربية" : "English"}
            </button>
            <Link href="/wishlist" aria-label={`Wishlist ${wishCount} items`} className="relative p-2 hover:scale-110 transition focus:outline-none focus:ring-2 focus:ring-black rounded-full">
              <span aria-hidden>♡</span>
              {wishCount > 0 && <span className="absolute -top-0 -right-0 bg-black text-white text-[10px] w-4 h-4 grid place-items-center rounded-full animate-scaleIn">{wishCount}</span>}
            </Link>
            <Link href="/cart" aria-label={`Cart ${count} items`} className="relative p-2 hover:scale-110 transition focus:outline-none focus:ring-2 focus:ring-black rounded-full">
              <span aria-hidden>🛒</span>
              {count > 0 && <span className="absolute -top-0 -right-0 bg-black text-white text-[10px] w-5 h-5 grid place-items-center rounded-full animate-scaleIn">{count}</span>}
            </Link>
            {user ? (
              <Link href="/account" className="hidden sm:inline-flex bg-black text-white px-4 py-2 rounded-full font-semibold text-xs hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-black">
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:inline-flex border border-zinc-300 px-4 py-2 rounded-full font-semibold text-xs hover:border-black hover:bg-black hover:text-white transition focus:outline-none focus:ring-2 focus:ring-black">
                  {t("Sign In", "دخول")}
                </Link>
                <Link href="/signup" className="hidden lg:inline-flex bg-black text-white px-4 py-2 rounded-full font-semibold text-xs hover:bg-zinc-800 hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-black">
                  {t("Sign Up", "تسجيل")}
                </Link>
              </>
            )}
            {user?.role === "admin" && <Link href="/admin" className="hidden lg:inline-flex border border-black px-3 py-2 rounded-full font-semibold text-xs hover:bg-black hover:text-white transition focus:outline-none focus:ring-2 focus:ring-black">
              {t("Dashboard", "لوحة التحكم")}
            </Link>}
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold border-l pl-3 ml-1" aria-label="Currency">
              <span>EGP</span>
              <span className="text-zinc-400">|</span>
              <span>{t("EGYPT", "مصر")}</span>
            </div>
          </div>
        </div>

        <nav aria-label="Main categories" className="flex gap-5 text-sm font-bold tracking-wide overflow-x-auto no-scrollbar border-t border-zinc-100 py-3">
          <Link href="/women" className="whitespace-nowrap hover:text-black text-zinc-700 relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-black after:transition-all focus:outline-none focus:ring-2 focus:ring-black rounded"> {t("WOMEN", "نسائي")} </Link>
          <Link href="/men" className="whitespace-nowrap hover:text-black text-zinc-700 relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-black after:transition-all focus:outline-none focus:ring-2 focus:ring-black rounded"> {t("MEN", "رجالي")} </Link>
          <Link href="/muse" className="whitespace-nowrap hover:text-black text-zinc-700 border border-black px-2 py-0.5 rounded-full text-xs tracking-widest focus:outline-none focus:ring-2 focus:ring-black"> {t("MUSE", "موس")} </Link>
          <Link href="/brands" className="whitespace-nowrap hover:text-black text-zinc-700 focus:outline-none focus:ring-2 focus:ring-black rounded"> {t("BRANDS", "ماركات")} </Link>
          <Link href="/accessories" className="whitespace-nowrap hover:text-black text-zinc-700 relative after:absolute after:left-0 after:-bottom-1 after:h-[2px] after:w-0 hover:after:w-full after:bg-black after:transition-all focus:outline-none focus:ring-2 focus:ring-black rounded"> {t("ACCESSORIES", "إكسسوارات")} </Link>
          <Link href="/new" className="whitespace-nowrap text-zinc-600 font-semibold hover:text-black focus:outline-none focus:ring-2 focus:ring-black rounded"> {t("NEW IN", "وصل حديثاً")} </Link>
          <Link href="/sale" className="bg-red-600 text-white px-2.5 py-0.5 rounded text-xs whitespace-nowrap animate-pulse hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600"> {t("SALE", "تخفيضات")} </Link>
        </nav>
      </div>
    </header>
  );
}
