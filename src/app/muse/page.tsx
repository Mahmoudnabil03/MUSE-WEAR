"use client";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import { products } from "@/lib/products";
import { useLang } from "@/lib/store";

export default function MusePage() {
  const { t } = useLang();
  const list = products.filter((p) => p.isMuseMade);
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: "MUSE", labelAr: "موس" }]} />
      <div className="bg-black text-white rounded-2xl p-6 md:p-10 mt-3 flex flex-col md:flex-row gap-6 items-start">
        <div>
          <div className="text-xs tracking-[0.3em] text-white/60">CURATED FASHION. MADE IN CAIRO.</div>
          <h1 className="text-3xl font-black mt-2">MUSE</h1>
          <p className="text-white/70 text-sm mt-2 max-w-xl">{t("MUSE Originals — Designed in Cairo, Made for everywhere. Heavyweight tees, cargos, co-ords and essentials from our factory.", "إبداعات موس الأصلية — مصممة في القاهرة، مصنوعة لكل مكان.")}</p>
        </div>
        <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-black shrink-0">{list.length} {t("products", "منتج")}</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{list.map((p,i)=><ProductCard key={p.id} p={p} index={i}/>)}</div>
    </div>
  );
}
