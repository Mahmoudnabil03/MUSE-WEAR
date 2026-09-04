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
    <div className="overflow-x-hidden bg-[#100904] text-[#ffedd7]">
      <Hero />

      <hr className="divider-dashed mx-6 md:mx-10 mt-10" />

      <div className="w-full px-6 md:px-10 mt-8 grid grid-cols-2 md:grid-cols-4 gap-[18px] text-[12px] font-medium uppercase">
        {[
          [t("CASH ON DELIVERY", "الدفع عند الاستلام"), "COD"],
          [t("PAY WITH PAYMOB", "ادفع بـ Paymob"), "X-PAY"],
          [t("14-DAY RETURNS", "إرجاع 14 يوم"), "RETURNS"],
          [t("SHIPS ACROSS EGYPT", "شحن لكل مصر"), "EGYPT"],
        ].map(([label, badge], i) => (
          <div key={badge} className="card-oryzo px-3 py-2.5 flex items-center gap-2 justify-center text-left animate-fadeInUp" style={{ animationDelay: `${i * 80}ms`, animationFillMode: "backwards" }}>
            <span className="border border-[#40372e] text-[#ffedd7] px-2 py-0.5 text-[10px] rounded-full font-medium uppercase">{badge}</span> {label}
          </div>
        ))}
      </div>

      <section className="w-full px-6 md:px-10 mt-16 min-h-[100vh]">
        <div className="card-oryzo p-6 md:p-10 flex flex-col md:flex-row items-start gap-6">
          <div className="relative flex items-center gap-4 shrink-0">
            <div className="w-16 h-16 bg-[#382416] border border-[#40372e] text-[#ffedd7] grid place-items-center font-medium text-3xl animate-float">M</div>
            <MuseWearLogo light className="hidden md:flex" />
          </div>
          <div className="relative flex-1 text-left">
            <div className="oryzo-label text-[#ffedd7]/70">EST. CAIRO — MUSE WEAR</div>
            <h3 className="oryzo-heading mt-3 text-left">NOT JUST A STORE. A MOVEMENT.</h3>
            <p className="oryzo-body mt-4 max-w-2xl text-left !text-[18px] !leading-[1.4]">
              {t("Egypt's first hybrid: curated multibrand marketplace + our own Cairo factory. The MW mark is cut for motion — sharp M above, grounded W below.", "أول هجين في مصر: سوق متعدد الماركات + مصنعنا في القاهرة. علامة MW مصممة للحركة — M حادة بالأعلى، W راسخة بالأسفل.")}
            </p>
          </div>
          <Link href="/men" className="btn-pill shrink-0">
            {t("DISCOVER MUSE", "اكتشف موس")}
          </Link>
        </div>
      </section>

      <hr className="divider-dashed mx-6 md:mx-10" />

      <section className="w-full px-6 md:px-10 py-16 min-h-[100vh]">
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="oryzo-heading text-left">{t("SHOP BY CATEGORY", "تسوق حسب الفئة")}</h2>
          <span className="oryzo-label hidden md:block text-[#6c5f51]">{t("MEN • WOMEN • ACCESSORIES — ALL IN EGP", "رجالي • نسائي • إكسسوارات — كلها بالجنيه")}</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-[18px] mt-8">
          {categories.map((c, i) => (
            <Link key={c.key} href={`/${c.key}`} className="relative overflow-hidden h-[420px] group bg-[#100904] border border-[#40372e] rounded-[12px] animate-fadeInUp" style={{ animationDelay: `${i * 100}ms`, animationFillMode: "backwards" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={c.image} alt={c.labelEn} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-[1000ms]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#100904] via-[#100904]/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-[#ffedd7] flex items-end justify-between">
                <div className="text-left">
                  <div className="oryzo-heading-sm">{lang === "ar" ? c.labelAr : c.labelEn}</div>
                  <div className="oryzo-label mt-2 opacity-80 group-hover:opacity-100 flex items-center gap-2">
                    {t("SHOP NOW", "تسوق الآن")} <span className="group-hover:translate-x-1 transition">→</span>
                  </div>
                </div>
                <span className="w-10 h-10 rounded-full bg-[#ffedd7] text-[#100904] grid place-items-center font-medium group-hover:scale-110 transition">↗</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <hr className="divider-dashed mx-6 md:mx-10" />

      <section className="w-full px-6 md:px-10 py-16">
        <div className="card-oryzo overflow-hidden">
          <div className="oryzo-label flex items-center gap-2 text-left">
            <span className="w-2 h-2 bg-[#ffedd7] animate-pulse" /> {t("SHOP BY BRAND", "تسوق حسب الماركة")}
          </div>
          <div className="flex gap-3 mt-4 overflow-x-auto no-scrollbar">
            {brands.map((b, i) => (
              <Link key={b} href={b === "MUSE WEAR" ? "/men?filter=muse" : `/search?q=${encodeURIComponent(b)}`} className={b === "MUSE WEAR" ? "btn-pill shrink-0" : "btn-ghost shrink-0"} style={{ animation: `fadeInUp 0.5s ease ${i * 50}ms both` }}>
                {b}
              </Link>
            ))}
            <Link href="/search" className="btn-ghost shrink-0">+ {t("MORE", "المزيد")}</Link>
          </div>
        </div>
      </section>

      <hr className="divider-dashed mx-6 md:mx-10" />

      <section className="w-full px-6 md:px-10 py-16 min-h-[100vh]">
        <div className="flex items-center justify-between gap-4">
          <h2 className="oryzo-heading text-left">NEW IN</h2>
          <Link href="/women" className="link-underline">
            {t("VIEW ALL", "عرض الكل")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mt-8">
          {newIn.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      <hr className="divider-dashed mx-6 md:mx-10" />

      <section className="w-full px-6 md:px-10 py-16 min-h-[100vh]">
        <div className="card-oryzo p-6 md:p-8 flex flex-col md:flex-row md:items-start justify-between gap-6 relative overflow-hidden">
          <div className="relative text-left">
            <div className="oryzo-label text-[#ffedd7]/70 flex items-center gap-2">
              <span className="w-6 h-[1px] bg-[#6c5f51]" /> MUSE WEAR • {t("OUR MANUFACTURING", "صناعتنا")}
            </div>
            <h3 className="oryzo-heading mt-3 text-left">{t("MUSE MANUFACTURED ESSENTIALS", "أساسيات من صناعة موس")}</h3>
            <p className="oryzo-body mt-4 max-w-xl text-left !text-[18px] !leading-[1.4]">{t("Heavyweight tees, cargos, sets — Made in Egypt, designed in Cairo. The MW shield is woven into every stitch.", "تيشيرتات ثقيلة، كارجو، أطقم — صنع في مصر، تصميم القاهرة. درع MW منسوج في كل غرزة.")}</p>
          </div>
          <Link href="/men" className="btn-ghost relative shrink-0 text-center">
            {t("SHOP MUSE", "تسوق موس")}
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mt-8">
          {museMade.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      <hr className="divider-dashed mx-6 md:mx-10" />

      <section className="w-full px-6 md:px-10 py-16">
        <div className="flex items-center gap-3">
          <h2 className="oryzo-heading text-left">SALE</h2>
          <span className="h-6 w-[1px] bg-[#40372e]" />
          <span className="oryzo-label">{t("UP TO 50% OFF", "حتى 50% خصم")}</span>
          <span className="ml-auto oryzo-label border border-dashed border-[#40372e] rounded-full px-3 py-1">⏰ {t("LIMITED TIME", "لفترة محدودة")}</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mt-8">
          {sale.map((p, i) => (
            <ProductCard key={p.id} p={p} index={i} />
          ))}
        </div>
      </section>

      <hr className="divider-dashed mx-6 md:mx-10" />

      <section className="w-full px-6 md:px-10 py-16">
        <h3 className="oryzo-heading-sm text-left flex items-center gap-3">
          <MuseWearLogo light /> <span className="hidden sm:inline">— {t("EGYPT'S FASHION MARKETPLACE", "سوق الموضة في مصر")}</span>
        </h3>
        <p className="mt-4 oryzo-body !text-[18px] !leading-[1.4] text-left max-w-4xl">
          {t(
            "MUSE WEAR is Egypt's answer to Namshi — a curated multibrand e-commerce + our own Cairo manufacturing. Shop Men, Women, Accessories from Nike, Adidas, Puma, Levi's and MUSE WEAR originals. All prices in EGP, COD and Paymob (X-Pay) checkout, delivery across Cairo, Alexandria, Giza and all governorates. Manage your Meta Catalog and ads directly from the MUSE dashboard.",
            "موس وير هو بديل نمشي في مصر — متجر متعدد الماركات + تصنيعنا الخاص في القاهرة. تسوق رجالي، نسائي، إكسسوارات من نايك، أديداس، بوما، ليفايز وإبداعات موس الأصلية. الأسعار بالجنيه، الدفع عند الاستلام و Paymob، شحن للقاهرة والإسكندرية والجيزة وكل المحافظات. إدارة كتالوج ميتا والإعلانات من لوحة تحكم موس."
          )}
        </p>
        <div className="mt-6 flex flex-wrap gap-[18px] oryzo-label">
          <span className="border border-[#40372e] px-3 py-1 rounded-full">EGP {formatEGP(899).replace("EGP", "")}</span>
          <span className="border border-dashed border-[#40372e] px-3 py-1 rounded-full">COD AVAILABLE</span>
          <span className="border border-dashed border-[#40372e] px-3 py-1 rounded-full">PAYMOB X-PAY</span>
          <span className="border border-dashed border-[#40372e] px-3 py-1 rounded-full">14-DAY RETURNS</span>
        </div>
        <div className="oryzo-legal mt-6 text-[#6c5f51] text-left">* PRICES INCLUDE VAT WHERE APPLICABLE</div>
      </section>
    </div>
  );
}
