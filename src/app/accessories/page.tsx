"use client";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import { products } from "@/lib/products";
import { useLang } from "@/lib/store";
import { useState, useMemo } from "react";

export default function AccessoriesPage() {
  const { t } = useLang();
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("popular");
  const filtered = useMemo(() => {
    let list = products.filter((p) => p.category === "accessories");
    if (brand !== "All") list = list.filter((p) => p.brand === brand);
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    return list;
  }, [brand, sort]);
  const catBrands = ["All", ...Array.from(new Set(products.filter((p) => p.category === "accessories").map((p) => p.brand)))];
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: "Accessories", labelAr: "إكسسوارات" }]} />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
        <h1 className="text-2xl font-black">{t("ACCESSORIES", "إكسسوارات")} <span className="text-zinc-400 font-normal text-sm">{filtered.length} {t("products", "منتج")}</span></h1>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-a" className="text-xs font-bold">{t("Sort by:", "ترتيب حسب:")}</label>
          <select id="sort-a" value={sort} onChange={(e) => setSort(e.target.value)} className="border border-zinc-300 rounded-full px-3 py-2 text-sm focus:border-black focus:outline-none">
            <option value="popular">{t("Popular", "الأكثر شعبية")}</option>
            <option value="price-low">{t("Price: Low to High", "السعر: من الأقل")}</option>
            <option value="price-high">{t("Price: High to Low", "السعر: من الأعلى")}</option>
          </select>
        </div>
      </div>
      <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">{catBrands.map((b) => <button key={b} onClick={() => setBrand(b)} className={`px-4 py-2 rounded-full border text-sm font-semibold shrink-0 focus:outline-none focus:ring-2 focus:ring-black ${brand === b ? "bg-black text-white border-black" : "bg-white border-zinc-300 hover:border-black"}`}>{b}</button>)}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
    </div>
  );
}
