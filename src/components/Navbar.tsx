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
    <header className={`fixed top-0 left-0 right-0 z-50 bg-[#100904]/95 backdrop-blur border-b border-dashed border-[#40372e] transition-colors ${scrolled ? "bg-[#100904]" : "bg-transparent"}`}>
      <div className="text-[#ffedd7] text-[12px] font-medium uppercase overflow-hidden py-2 border-b border-dashed border-[#40372e] relative">
        <div className="flex animate-marquee whitespace-nowrap will-change-transform">
          {Array(4).fill(0).map((_, i) => (
            <span key={i} className="mx-8 tracking-normal flex items-center gap-8 uppercase">
              <span>{t("Free delivery in Cairo & Alexandria on orders over 999 EGP", "شحن مجاني داخل القاهرة والإسكندرية للطلبات فوق 999 جنيه")}</span>
              <span className="text-[#6c5f51]">•</span>
              <span>{t("Cash on Delivery available", "الدفع عند الاستلام متاح")}</span>
              <span className="text-[#6c5f51]">•</span>
              <span className="font-medium">MUSE WEAR — CAIRO, EGYPT</span>
            </span>
          ))}
        </div>
      </div>

      <div className="w-full px-6 md:px-10">
        <div className="flex items-center gap-4 py-3">
          <Link href="/" className="flex items-center gap-3 shrink-0 group" aria-label="MUSE WEAR Home">
            <div className="transition-transform group-hover:scale-105 duration-300">
              <MuseWearLogo light />
            </div>
          </Link>

          <form onSubmit={onSearch} className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full items-center gap-3">
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("SEARCH PRODUCTS, BRANDS", "ابحث عن منتجات، ماركات")} aria-label={t("Search", "بحث")} className="input-underline flex-1 uppercase placeholder:text-[#6c5f51]" />
              <button type="submit" className="link-underline"> {t("SEARCH", "بحث")}</button>
            </div>
          </form>

          <div className="flex items-center gap-1 sm:gap-3 ml-auto text-sm">
            <button onClick={toggle} aria-label="Toggle language" className="btn-ghost hidden sm:inline-flex !py-[7.5px]">
              {lang === "en" ? "العربية" : "English"}
            </button>
            <Link href="/wishlist" aria-label={`Wishlist ${wishCount} items`} className="relative p-2 text-[#ffedd7] hover:scale-110 transition focus:outline-none focus:ring-2 focus:ring-[#ffedd7] rounded-full">
              <span aria-hidden>♡</span>
              {wishCount > 0 && <span className="absolute -top-0 -right-0 bg-[#382416] text-[#ffedd7] border border-[#40372e] text-[10px] w-4 h-4 grid place-items-center rounded-full animate-scaleIn">{wishCount}</span>}
            </Link>
            <Link href="/cart" aria-label={`Cart ${count} items`} className="relative p-2 text-[#ffedd7] hover:scale-110 transition focus:outline-none focus:ring-2 focus:ring-[#ffedd7] rounded-full">
              <span aria-hidden>🛒</span>
              {count > 0 && <span className="absolute -top-0 -right-0 bg-[#382416] text-[#ffedd7] border border-[#40372e] text-[10px] w-5 h-5 grid place-items-center rounded-full animate-scaleIn">{count}</span>}
            </Link>
            {user ? (
              <Link href="/account" className="btn-ghost hidden sm:inline-flex">
                {user.name.split(" ")[0]}
              </Link>
            ) : (
              <>
                <Link href="/login" className="link-underline hidden sm:inline-flex">
                  {t("SIGN IN", "دخول")}
                </Link>
                <Link href="/signup" className="btn-ghost hidden lg:inline-flex">
                  {t("SIGN UP", "تسجيل")}
                </Link>
              </>
            )}
            {user?.role === "admin" && <Link href="/admin" className="btn-ghost hidden lg:inline-flex">
              {t("DASHBOARD", "لوحة التحكم")}
            </Link>}
            <div className="hidden sm:flex items-center gap-1 text-[12px] font-medium uppercase border-l border-dashed border-[#40372e] pl-3 ml-1 text-[#ffedd7]" aria-label="Currency">
              <span>EGP</span>
              <span className="text-[#6c5f51]">|</span>
              <span>{t("EGYPT", "مصر")}</span>
            </div>
          </div>
        </div>

        <nav aria-label="Main categories" className="flex gap-6 text-[12px] font-medium uppercase overflow-x-auto no-scrollbar py-3 text-[#ffedd7]">
          <Link href="/women" className="whitespace-nowrap underline decoration-dashed decoration-[#40372e] underline-offset-8 hover:decoration-[#ffedd7] focus:outline-none focus:ring-2 focus:ring-[#ffedd7] rounded"> {t("WOMEN", "نسائي")} </Link>
          <Link href="/men" className="whitespace-nowrap underline decoration-dashed decoration-[#40372e] underline-offset-8 hover:decoration-[#ffedd7] focus:outline-none focus:ring-2 focus:ring-[#ffedd7] rounded"> {t("MEN", "رجالي")} </Link>
          <Link href="/muse" className="whitespace-nowrap btn-ghost !py-1"> {t("MUSE", "موس")} </Link>
          <Link href="/contact" className="whitespace-nowrap underline decoration-dashed decoration-[#40372e] underline-offset-8 hover:decoration-[#ffedd7] focus:outline-none focus:ring-2 focus:ring-[#ffedd7] rounded"> {t("CONTACT", "تواصل")} </Link>
        </nav>
      </div>
    </header>
  );
}
