"use client";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { products, categories, formatEGP, brands } from "@/lib/products";
import Link from "next/link";
import { useLang } from "@/lib/store";

export default function Home() {
  const { t, lang } = useLang();
  const newIn = products.filter((p) => p.isNew);
  const museMade = products.filter((p) => p.isMuseMade).slice(0, 4);
  const sale = products.filter((p) => p.originalPrice);

  return (
    <div>
      <Hero />

      {/* Trust bar */}
      <div className="max-w-[1400px] mx-auto px-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {[
          [t("Cash on Delivery", "الدفع عند الاستلام"), "COD"],
          [t("Pay with Paymob", "ادفع بـ Paymob"), "X-PAY"],
          [t("14-Day Returns", "إرجاع 14 يوم"), "RETURNS"],
          [t("Ships across Egypt", "شحن لكل مصر"), "EGYPT"],
        ].map(([label, badge]) => (
          <div key={badge} className="bg-white border border-zinc-200 px-3 py-2 flex items-center gap-2 justify-center font-semibold">
            <span className="bg-black text-white px-2 py-0.5 text-[10px] rounded">{badge}</span> {label}
          </div>
        ))}
      </div>

      {/* Categories */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl font-black tracking-wide">{t("SHOP BY CATEGORY", "تسوق حسب الفئة")}</h2>
          <span className="text-xs text-zinc-500">{t("All categories • Men • Women • Accessories", "كل الفئات • رجالي • نسائي • إكسسوارات")}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {categories.map((c) => (
            <Link key={c.key} href={`/${c.key}`} className="relative overflow-hidden h-[220px] group bg-zinc-900">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={c.labelEn} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute bottom-4 left-4 text-white">
                <div className="text-2xl font-black">{lang === "ar" ? c.labelAr : c.labelEn}</div>
                <div className="text-sm underline underline-offset-4">{t("Shop Now", "تسوق الآن")}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands strip - Namshi style */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8">
        <div className="bg-white border border-zinc-200 p-4">
          <div className="text-xs font-bold tracking-[0.2em] text-zinc-500">{t("SHOP BY BRAND", "تسوق حسب الماركة")}</div>
          <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar">
            {brands.map((b) => (
              <div key={b} className={`shrink-0 border px-6 py-3 text-sm font-black tracking-wide ${b === "MUSE WEAR" ? "bg-black text-white border-black" : "bg-white border-zinc-300"}`}>
                {b}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* New In */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black">{t("NEW IN", "وصل حديثاً")}</h2>
          <Link href="/women" className="text-sm font-bold underline underline-offset-4">
            {t("View All", "عرض الكل")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {newIn.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* MUSE Manufactured */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8">
        <div className="bg-black text-white p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-xs tracking-[0.3em]">MUSE WEAR • {t("OUR MANUFACTURING", "صناعتنا")}</div>
            <h3 className="text-2xl font-black mt-1">{t("MUSE Manufactured Essentials", "أساسيات من صناعة موس")}</h3>
            <p className="text-zinc-400 text-sm mt-1">{t("Heavyweight tees, cargos, sets - Made in Egypt, designed in Cairo.", "تيشيرتات ثقيلة، كارجو، أطقم - صنع في مصر، تصميم القاهرة.")}</p>
          </div>
          <Link href="/men" className="bg-white text-black px-6 py-3 rounded-full font-bold text-sm shrink-0 text-center">
            {t("Shop MUSE", "تسوق موس")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {museMade.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* Sale */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8">
        <h2 className="text-xl font-black text-red-600">{t("SALE • UP TO 50% OFF", "تخفيضات • حتى 50%")}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
          {sale.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </section>

      {/* EGP / SEO */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8 bg-white border border-zinc-200 p-6 text-sm leading-relaxed text-zinc-600">
        <h3 className="font-black text-black">MUSE WEAR EGYPT - {t("Egypt’s Fashion Marketplace", "سوق الموضة في مصر")}</h3>
        <p className="mt-2">
          {t(
            "MUSE WEAR is Egypt's answer to Namshi - a curated multibrand e-commerce + our own Cairo manufacturing. Shop Men, Women, Accessories from Nike, Adidas, Puma, Levi's and MUSE WEAR originals. All prices in EGP, COD and Paymob (X-Pay) checkout, delivery across Cairo, Alexandria, Giza and all governorates. Manage your Meta Catalog and ads directly from the MUSE dashboard.",
            "موس وير هو بديل نمشي في مصر - متجر متعدد الماركات + تصنيعنا الخاص في القاهرة. تسوق رجالي، نسائي، إكسسوارات من نايك، أديداس، بوما، ليفايز وإبداعات موس الأصلية. الأسعار بالجنيه، الدفع عند الاستلام و Paymob، شحن للقاهرة والإسكندرية والجيزة وكل المحافظات. إدارة كتالوج ميتا والإعلانات من لوحة تحكم موس."
          )}
        </p>
        <div className="mt-3 text-xs text-zinc-500">Example: {formatEGP(899)} • {formatEGP(1499)} • {formatEGP(4299)}</div>
      </section>
    </div>
  );
}
