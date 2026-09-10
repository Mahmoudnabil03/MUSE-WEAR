"use client";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useLang } from "@/lib/store";
import { useState, useMemo } from "react";

export default function MenPage() {
  const { t } = useLang();
  const [brand, setBrand] = useState("All");
  const [sort, setSort] = useState("popular");
  const [price, setPrice] = useState("all");
  const filtered = useMemo(() => {
    let list = products.filter((p) => p.category === "men");
    if (brand !== "All") list = list.filter((p) => p.brand === brand);
    if (price === "under1000") list = list.filter((p) => p.price < 1000);
    else if (price === "1000-2000") list = list.filter((p) => p.price >= 1000 && p.price <= 2000);
    else if (price === "over2000") list = list.filter((p) => p.price > 2000);
    if (sort === "price-low") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price-high") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "new") list = [...list].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    return list;
  }, [brand, sort, price]);
  const catBrands = ["All", ...Array.from(new Set(products.filter((p) => p.category === "men").map((p) => p.brand)))];
  return (
    <div className="w-full px-6 md:px-10 mt-6 bg-[#000000] text-[#ffffff]">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
        <h1 className="oryzo-heading text-left">{t("MEN", "رجالي")} <span className="text-[#737373] text-sm font-medium">{filtered.length} {t("PRODUCTS", "منتج")}</span></h1>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-m" className="oryzo-label text-[#737373]">{t("SORT BY:", "ترتيب حسب:")}</label>
          <select id="sort-m" value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent border border-[#262626] rounded-[12px] px-3 py-2 text-sm uppercase font-medium text-[#ffffff] focus:border-[#ffffff] focus:outline-none [&>option]:bg-[#000000]">
            <option value="popular">{t("POPULAR", "الأكثر شعبية")}</option>
            <option value="new">{t("NEW IN", "الأحدث")}</option>
            <option value="price-low">{t("PRICE: LOW TO HIGH", "السعر: من الأقل")}</option>
            <option value="price-high">{t("PRICE: HIGH TO LOW", "السعر: من الأعلى")}</option>
          </select>
        </div>
      </div>
      <hr className="divider-dashed mt-4" />
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-[18px]">
        <aside className="card-oryzo h-fit text-left">
          <h3 className="oryzo-label">{t("FILTERS", "الفلاتر")}</h3>
          <hr className="divider-dashed my-3" />
          <div className="mt-3 oryzo-label text-[#737373]">{t("BRAND", "الماركة")}</div>
          <div className="mt-2 space-y-1">{catBrands.map((b) => <button key={b} onClick={() => setBrand(b)} className={`w-full text-left px-2 py-1 rounded-[12px] oryzo-label ${brand === b ? "bg-[#171717] text-[#ffffff]" : "text-[#ffffff]/70 hover:text-[#ffffff] hover:bg-[#171717]/50"}`}>{b}</button>)}</div>
          <label className="mt-4 block oryzo-label text-[#737373]">{t("PRICE", "السعر")}</label>
          <select value={price} onChange={(e) => setPrice(e.target.value)} className="mt-2 w-full bg-transparent border border-[#262626] rounded-[12px] px-2 py-2 text-sm uppercase font-medium text-[#ffffff] focus:border-[#ffffff] focus:outline-none [&>option]:bg-[#000000]"><option value="all">{t("ALL PRICES", "كل الأسعار")}</option><option value="under1000">{t("UNDER 1000 EGP", "أقل من 1000")}</option><option value="1000-2000">1000 - 2000 EGP</option><option value="over2000">{t("OVER 2000 EGP", "أكثر من 2000")}</option></select>
          <button onClick={() => { setBrand("All"); setPrice("all"); setSort("popular"); }} className="btn-ghost mt-4 w-full text-center">{t("CLEAR FILTERS", "مسح الفلاتر")}</button>
        </aside>
        <div>
          <div className="flex gap-[18px] overflow-x-auto no-scrollbar pb-2">{catBrands.map((b) => <button key={b} onClick={() => setBrand(b)} className={brand === b ? "btn-pill !py-2 shrink-0" : "btn-ghost shrink-0"}>{b}</button>)}</div>
          {filtered.length === 0 ? <div className="text-center py-16 oryzo-label text-[#737373]">{t("NO PRODUCTS", "لا يوجد منتجات")}</div> : <div className="grid grid-cols-2 md:grid-cols-3 gap-[18px] mt-4">{filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>}
        </div>
      </div>
    </div>
  );
}
