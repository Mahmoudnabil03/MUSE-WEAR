"use client";
import ProductCard from "@/components/ProductCard";
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
    <div className="w-full px-6 md:px-10 mt-6 bg-[#000000] text-[#ffffff]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
        <h1 className="oryzo-heading text-left">{t("ACCESSORIES", "إكسسوارات")} <span className="text-[#737373] text-sm font-medium">{filtered.length} {t("PRODUCTS", "منتج")}</span></h1>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-a" className="oryzo-label text-[#737373]">{t("SORT BY:", "ترتيب حسب:")}</label>
          <select id="sort-a" value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent border border-[#262626] rounded-[12px] px-3 py-2 text-sm uppercase font-medium text-[#ffffff] focus:border-[#ffffff] focus:outline-none [&>option]:bg-[#000000]">
            <option value="popular">{t("POPULAR", "الأكثر شعبية")}</option>
            <option value="price-low">{t("PRICE: LOW TO HIGH", "السعر: من الأقل")}</option>
            <option value="price-high">{t("PRICE: HIGH TO LOW", "السعر: من الأعلى")}</option>
          </select>
        </div>
      </div>
      <hr className="divider-dashed mt-4" />
      <div className="flex gap-[18px] mt-6 overflow-x-auto no-scrollbar">{catBrands.map((b) => <button key={b} onClick={() => setBrand(b)} className={brand === b ? "btn-pill !py-2 shrink-0" : "btn-ghost shrink-0"}>{b}</button>)}</div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[18px] mt-6">{filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>
    </div>
  );
}
