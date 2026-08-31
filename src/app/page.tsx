"use client";
import Hero from "@/components/Hero";
import ProductCard from "@/components/ProductCard";
import { products, categories, formatEGP, brands } from "@/lib/products";
import Link from "next/link";
import { useLang } from "@/lib/store";
import { MuseWearLogo } from "@/components/Logo";

export default function Home() {
  const { t, lang } = useLang();
  const newIn = products.filter((p) => p.isNew);
  const museMade = products.filter((p) => p.isMuseMade).slice(0, 4);
  const sale = products.filter((p) => p.originalPrice);

  return (
    <div className="overflow-x-hidden">
      <Hero />

      {/* Animated trust bar */}
      <div className="max-w-[1400px] mx-auto px-4 mt-4 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
        {[
          [t("Cash on Delivery", "الدفع عند الاستلام"), "COD"],
          [t("Pay with Paymob", "ادفع بـ Paymob"), "X-PAY"],
          [t("14-Day Returns", "إرجاع 14 يوم"), "RETURNS"],
          [t("Ships across Egypt", "شحن لكل مصر"), "EGYPT"],
        ].map(([label, badge], i) => (
          <div key={badge} className="bg-white border border-zinc-200 px-3 py-2.5 flex items-center gap-2 justify-center font-semibold hover:border-black transition animate-fadeInUp" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}>
            <span className="bg-black text-white px-2 py-0.5 text-[10px] rounded font-black">{badge}</span> {label}
          </div>
        ))}
      </div>

      {/* Brand story - logo heritage */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8">
        <div className="bg-black text-white relative overflow-hidden rounded-2xl p-6 md:p-10 flex flex-col md:flex-row items-center gap-6 hover-lift">
          <div className="absolute inset-0 opacity-[0.04]">
            <div className="absolute -right-10 -top-10 w-64 h-64 border-[20px] border-white rotate-12" />
            <div className="absolute -left-10 -bottom-10 w-48 h-48 border-[16px] border-white -rotate-12" />
          </div>
          <div className="relative flex items-center gap-4 shrink-0">
            <div className="w-16 h-16 bg-white text-black grid place-items-center font-black text-3xl animate-float">M</div>
            <MuseWearLogo light className="hidden md:flex" />
          </div>
          <div className="relative flex-1 text-center md:text-left">
            <div className="text-xs tracking-[0.3em] text-white/60">EST. CAIRO — MUSE WEAR</div>
            <h3 className="text-2xl md:text-3xl font-black mt-1">{t("Not just a store. A movement.", "ليس مجرد متجر. حركة.")}</h3>
            <p className="text-white/70 text-sm mt-2 max-w-2xl">{t("Egypt’s first hybrid: curated multibrand marketplace + our own Cairo factory. The MW mark is cut for motion — sharp M above, grounded W below.", "أول هجين في مصر: سوق متعدد الماركات + مصنعنا في القاهرة. علامة MW مصممة للحركة — M حادة بالأعلى، W راسخة بالأسفل.")}</p>
          </div>
          <Link href="/men" className="relative bg-white text-black px-6 py-3 rounded-full font-black text-sm shrink-0 hover:scale-105 transition">
            {t("Discover MUSE", "اكتشف موس")}
          </Link>
        </div>
      </section>

      {/* Categories with animation */}
      <section className="max-w-[1400px] mx-auto px-4 mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-3">
            <span className="w-1 h-6 bg-black" /> {t("SHOP BY CATEGORY", "تسوق حسب الفئة")}
          </h2>
          <span className="text-xs text-zinc-500 hidden md:block">{t("Men • Women • Accessories — All in EGP", "رجالي • نسائي • إكسسوارات — كلها بالجنيه")}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {categories.map((c, i) => (
            <Link key={c.key} href={`/${c.key}`} className="relative overflow-hidden h-[260px] group bg-zinc-900 animate-fadeInUp" style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={c.labelEn} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-[1000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent group-hover:from-black/80 transition" />
              <div className="absolute bottom-5 left-5 right-5 text-white flex items-end justify-between">
                <div>
                  <div className="text-2xl font-black">{lang === "ar" ? c.labelAr : c.labelEn}</div>
                  <div className="text-sm opacity-80 group-hover:opacity-100 flex items-center gap-2">
                    {t("Shop Now", "تسوق الآن")} <span className="group-hover:translate-x-1 transition">→</span>
                  </div>
                </div>
                <span className="w-10 h-10 rounded-full bg-white text-black grid place-items-center font-bold group-hover:scale-110 transition">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Brands strip - infinite */}
      <section className="max-w-[1400px] mx-auto px-4 mt-8">
        <div className="bg-white border border-zinc-200 p-4 overflow-hidden">
          <div className="text-xs font-black tracking-[0.2em] text-zinc-500 flex items-center gap-2">
            <span className="w-2 h-2 bg-black animate-pulse" /> {t("SHOP BY BRAND", "تسوق حسب الماركة")}
          </div>
          <div className="flex gap-3 mt-3 overflow-x-auto no-scrollbar">
            {brands.map((b, i) => (
              <div key={b} className={`shrink-0 border px-6 py-3 text-sm font-black tracking-wide transition hover:scale-105 ${b === "MUSE WEAR" ? "bg-black text-white border-black shadow" : "bg-white border-zinc-300 hover:border-black"}`} style={{ animation: `fadeInUp 0.5s ease ${i * 50}ms both` }}>
                {b}
              </div>
            ))}
            <div className="shrink-0 bg-zinc-900 text-white px-6 py-3 text-sm font-bold">+ {t("More", "المزيد")}</div>
          </div>
        </div>
      </section>

      {/* New In */}
      <section className="max-w-[1400px] mx-auto px-4 mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-black flex items-center gap-3">
            <span className="bg-black text-white px-2 py-1 text-xs tracking-widest">NEW</span> {t("NEW IN", "وصل حديثاً")}
          </h2>
          <Link href="/women" className="text-sm font-bold underline underline-offset-4 hover:bg-black hover:text-white px-3 py-1 rounded-full transition">
            {t("View All", "عرض الكل")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {newIn.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* MUSE Manufactured - premium */}
      <section className="max-w-[1400px] mx-auto px-4 mt-10">
        <div className="bg-gradient-to-br from-zinc-900 to-black text-white p-6 md:p-8 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-10 hidden md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=60" alt="" className="w-full h-full object-cover" />
          </div>
          <div className="relative">
            <div className="text-xs tracking-[0.3em] text-white/60 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-white/60" /> MUSE WEAR • {t("OUR MANUFACTURING", "صناعتنا")}
            </div>
            <h3 className="text-2xl md:text-3xl font-black mt-2">{t("MUSE Manufactured Essentials", "أساسيات من صناعة موس")}</h3>
            <p className="text-white/60 text-sm mt-2 max-w-xl">{t("Heavyweight tees, cargos, sets — Made in Egypt, designed in Cairo. The MW shield is woven into every stitch.", "تيشيرتات ثقيلة، كارجو، أطقم — صنع في مصر، تصميم القاهرة. درع MW منسوج في كل غرزة.")}</p>
          </div>
          <Link href="/men" className="relative bg-white text-black px-8 py-3 rounded-full font-black text-sm shrink-0 text-center hover:scale-105 transition">
            {t("Shop MUSE", "تسوق موس")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {museMade.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* Sale - animated */}
      <section className="max-w-[1400px] mx-auto px-4 mt-10">
        <div className="flex items-center gap-3">
          <h2 className="text-xl md:text-2xl font-black text-red-600 animate-pulse">{t("SALE", "تخفيضات")}</h2>
          <span className="h-6 w-[1px] bg-zinc-200" />
          <span className="text-sm font-bold tracking-wide">{t("UP TO 50% OFF", "حتى 50% خصم")}</span>
          <span className="ml-auto text-xs bg-red-600 text-white px-3 py-1 rounded-full font-bold">⏰ {t("Limited time", "لفترة محدودة")}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
          {sale.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      {/* SEO */}
      <section className="max-w-[1400px] mx-auto px-4 mt-10 bg-white border border-zinc-200 p-6 md:p-8 rounded-2xl">
        <h3 className="font-black text-black flex items-center gap-3">
          <MuseWearLogo /> <span className="hidden sm:inline">— {t("Egypt’s Fashion Marketplace", "سوق الموضة في مصر")}</span>
        </h3>
        <p className="mt-4 text-sm leading-relaxed text-zinc-600">
          {t(
            "MUSE WEAR is Egypt's answer to Namshi — a curated multibrand e-commerce + our own Cairo manufacturing. Shop Men, Women, Accessories from Nike, Adidas, Puma, Levi's and MUSE WEAR originals. All prices in EGP, COD and Paymob (X-Pay) checkout, delivery across Cairo, Alexandria, Giza and all governorates. Manage your Meta Catalog and ads directly from the MUSE dashboard.",
            "موس وير هو بديل نمشي في مصر — متجر متعدد الماركات + تصنيعنا الخاص في القاهرة. تسوق رجالي، نسائي، إكسسوارات من نايك، أديداس، بوما، ليفايز وإبداعات موس الأصلية. الأسعار بالجنيه، الدفع عند الاستلام و Paymob، شحن للقاهرة والإسكندرية والجيزة وكل المحافظات. إدارة كتالوج ميتا والإعلانات من لوحة تحكم موس."
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs">
          <span className="bg-zinc-900 text-white px-3 py-1 rounded-full">EGP {formatEGP(899).replace("EGP", "")}</span>
          <span className="bg-zinc-100 px-3 py-1 rounded-full">COD Available</span>
          <span className="bg-zinc-100 px-3 py-1 rounded-full">Paymob X-Pay</span>
          <span className="bg-zinc-100 px-3 py-1 rounded-full">14-Day Returns</span>
        </div>
      </section>
    </div>
  );
}
