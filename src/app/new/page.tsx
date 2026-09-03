"use client";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import { products } from "@/lib/products";
import { useLang } from "@/lib/store";

export default function NewPage() {
  const { t } = useLang();
  const list = products.filter((p) => p.isNew);
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: "New In", labelAr: "وصل حديثاً" }]} />
      <h1 className="text-2xl font-black mt-3 flex items-center gap-2"><span className="bg-black text-white px-2 py-1 text-xs">NEW</span> NEW IN <span className="text-zinc-400 font-normal text-sm">{list.length} {t("products", "منتج")}</span></h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{list.map((p,i)=><ProductCard key={p.id} p={p} index={i}/>)}</div>
    </div>
  );
}
