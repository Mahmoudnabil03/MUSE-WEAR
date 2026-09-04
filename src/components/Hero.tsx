"use client";
import Link from "next/link";
import { useLang } from "@/lib/store";

export default function Hero() {
  const { t } = useLang();
  return (
    <section className="relative w-full min-h-[100vh] bg-[#100904] text-[#ffedd7] overflow-hidden flex flex-col">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1600&auto=format&fit=crop&q=60" alt="MUSE WEAR editorial" className="absolute inset-0 w-full h-full object-cover opacity-40" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#100904] via-[#100904]/40 to-transparent" />

      <aside aria-hidden className="hidden md:block absolute right-4 top-1/2 -translate-y-1/2 rotate-90 origin-right text-[10px] font-medium uppercase tracking-normal text-[#ffedd7]">
        MUSE WEAR 1-MODEL
      </aside>

      <div className="relative flex-1 w-full px-6 md:px-10 pt-44 pb-10 flex flex-col justify-end">
        <div className="text-[12px] font-medium uppercase text-[#ffedd7]">{t("MADE FOR MOTION, BUILT IN CAIRO.", "صُنع للحركة، بُني في القاهرة.")}</div>
        <h1 className="oryzo-display mt-4 max-w-4xl text-left">
          MUSE
          <br />
          WEAR
        </h1>
        <p className="oryzo-body mt-6 max-w-2xl text-left text-[#ffedd7]">
          {t("Designed to move, cut, and drape in all the right ways. Muse makes the everyday uniform feel considered.", "مصمم ليتحرك ويُقص ويُنسدل بالطريقة الصحيحة. موس يجعل الزي اليومي مدروسًا.")}
        </p>
        <div className="flex flex-wrap items-center gap-[18px] mt-8">
          <Link href="/women" className="btn-pill">{t("SHOP WOMEN", "تسوقي نسائي")}</Link>
          <Link href="/men" className="btn-ghost !py-3">{t("SHOP MEN", "تسوق رجالي")}</Link>
        </div>

        <div className="mt-10 grid md:grid-cols-[320px_1fr_220px] gap-[18px] items-end">
          <div className="card-oryzo bg-[#100904]/60">
            <div className="oryzo-label text-left">DESIGNED IN CAIRO, THE HYBRID HOUSE.</div>
            <hr className="divider-dashed my-3" />
            <p className="text-[14px] leading-relaxed font-medium uppercase text-left text-[#ffedd7]/90">
              {t("MULTIBRAND MARKETPLACE + OUR OWN FACTORY.", "سوق متعدد الماركات + مصنعنا الخاص.")}
            </p>
          </div>
          <div className="hidden md:block" />
          <Link href="/muse" className="card-oryzo text-left hover:border-[#ffedd7] transition">
            <div className="oryzo-label">MUSE MANUFACTURED ▶</div>
            <div className="oryzo-legal mt-2 text-[#6c5f51]">* CAIRO FACTORY DROP 2026</div>
          </Link>
        </div>
      </div>
    </section>
  );
}
