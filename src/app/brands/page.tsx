"use client";
import Link from "next/link";
import { brands } from "@/lib/products";
import Breadcrumb from "@/components/Breadcrumb";
import { useLang } from "@/lib/store";

export default function BrandsPage() {
  const { t } = useLang();
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: "Brands", labelAr: "ماركات" }]} />
      <h1 className="text-2xl font-black mt-3">BRANDS</h1>
      <p className="text-sm text-zinc-500">{t("Curated multibrand + MUSE Manufactured", "متعدد الماركات + صناعة موس")}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-6">
        {brands.map((b) => (
          <Link key={b} href={b==="MUSE WEAR" ? "/muse" : `/search?q=${encodeURIComponent(b)}`} className="bg-white border border-zinc-200 p-8 rounded-2xl hover:border-black hover:shadow-lg transition flex flex-col items-center">
            <div className="text-xl font-black">{b}</div>
            <div className="text-xs text-zinc-500 mt-1">{t("Shop collection", "تسوق التشكيلة")} →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
