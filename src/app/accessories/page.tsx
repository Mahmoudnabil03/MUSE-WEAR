"use client";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useLang } from "@/lib/store";

export default function AccessoriesPage() {
  const { t } = useLang();
  const list = products.filter((p) => p.category === "accessories");
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <h1 className="text-2xl font-black">{t("ACCESSORIES", "إكسسوارات")} <span className="text-zinc-400 font-normal text-sm">{list.length} {t("products", "منتج")}</span></h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
