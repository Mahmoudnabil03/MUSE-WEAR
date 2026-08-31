"use client";
import Link from "next/link";
import { useLang, useCart, useWishlist } from "@/lib/store";

export default function Navbar() {
  const { lang, toggle, t } = useLang();
  const { count } = useCart();
  const { count: wishCount } = useWishlist();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-black/10">
      {/* Top bar */}
      <div className="bg-black text-white text-xs text-center py-2 tracking-wide">
        {t(
          "Free delivery in Cairo & Alexandria on orders over 999 EGP  •  Cash on Delivery available",
          "شحن مجاني داخل القاهرة والإسكندرية للطلبات فوق 999 جنيه  •  الدفع عند الاستلام متاح"
        )}
      </div>

      {/* Main header */}
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="flex items-center gap-4 py-3">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 bg-black text-white grid place-items-center font-black text-xl leading-none">M</div>
            <div className="leading-none hidden sm:block">
              <div className="font-black tracking-[0.2em] text-sm">MUSE WEAR</div>
              <div className="text-[10px] tracking-[0.3em] text-zinc-500 font-semibold">CAIRO, EGYPT</div>
            </div>
          </Link>

          {/* Search - Namshi style */}
          <div className="flex-1 max-w-2xl hidden md:flex">
            <div className="flex w-full border border-zinc-300 rounded-full overflow-hidden focus-within:border-black">
              <input
                placeholder={t("Search for products, brands and more", "ابحث عن منتجات، ماركات وأكثر")}
                className="flex-1 px-5 py-2.5 text-sm outline-none"
              />
              <button className="px-6 bg-black text-white text-sm font-semibold"> {t("Search", "بحث")}</button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 sm:gap-3 ml-auto text-sm">
            <button onClick={toggle} className="hidden sm:inline-flex border border-zinc-300 rounded-full px-3 py-1.5 font-semibold">
              {lang === "en" ? "العربية" : "English"}
            </button>
            <Link href="/wishlist" className="relative p-2">
              <span className="text-xl">♡</span>
              {wishCount > 0 && <span className="absolute -top-0 -right-0 bg-black text-white text-[10px] w-4 h-4 grid place-items-center rounded-full">{wishCount}</span>}
            </Link>
            <Link href="/cart" className="relative p-2">
              <span className="text-xl">🛒</span>
              {count > 0 && <span className="absolute -top-0 -right-0 bg-black text-white text-[10px] w-5 h-5 grid place-items-center rounded-full">{count}</span>}
            </Link>
            <Link href="/admin" className="hidden lg:inline-flex bg-black text-white px-4 py-2 rounded-full font-semibold text-xs">
              {t("Dashboard", "لوحة التحكم")}
            </Link>
            <div className="hidden sm:flex items-center gap-1 text-xs font-semibold border-l pl-3 ml-1">
              <span>EGP</span>
              <span className="text-zinc-400">|</span>
              <span>{t("EGYPT", "مصر")}</span>
            </div>
          </div>
        </div>

        {/* Mega menu */}
        <nav className="flex gap-6 text-sm font-bold tracking-wide overflow-x-auto no-scrollbar border-t border-zinc-100 py-3">
          <Link href="/women" className="whitespace-nowrap hover:underline underline-offset-8 decoration-2">
            {t("WOMEN", "نسائي")}
          </Link>
          <Link href="/men" className="whitespace-nowrap hover:underline underline-offset-8 decoration-2">
            {t("MEN", "رجالي")}
          </Link>
          <Link href="/accessories" className="whitespace-nowrap hover:underline underline-offset-8 decoration-2">
            {t("ACCESSORIES", "إكسسوارات")}
          </Link>
          <span className="text-zinc-300">|</span>
          <Link href="/women" className="whitespace-nowrap text-zinc-600 font-semibold">
            {t("New In", "وصل حديثاً")}
          </Link>
          <Link href="/men" className="whitespace-nowrap text-zinc-600 font-semibold">
            {t("MUSE Manufactured", "صناعة موس")}
          </Link>
          <Link href="/accessories" className="whitespace-nowrap text-zinc-600 font-semibold">
            {t("Brands", "ماركات")}
          </Link>
          <span className="bg-red-600 text-white px-2 py-0.5 rounded text-xs whitespace-nowrap">{t("SALE", "تخفيضات")}</span>
        </nav>
      </div>
    </header>
  );
}
