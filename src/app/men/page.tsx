"use client";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
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
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: "Men", labelAr: "رجالي" }]} />
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3 mt-3">
        <h1 className="text-2xl font-black">{t("MEN", "رجالي")} <span className="text-zinc-400 font-normal text-sm">{filtered.length} {t("products", "منتج")}</span></h1>
        <div className="flex items-center gap-2">
          <label htmlFor="sort-m" className="text-xs font-bold">{t("Sort by:", "ترتيب حسب:")}</label>
          <select id="sort-m" value={sort} onChange={(e) => setSort(e.target.value)} className="border border-zinc-300 rounded-full px-3 py-2 text-sm focus:border-black focus:outline-none">
            <option value="popular">{t("Popular", "الأكثر شعبية")}</option>
            <option value="new">{t("New In", "الأحدث")}</option>
            <option value="price-low">{t("Price: Low to High", "السعر: من الأقل")}</option>
            <option value="price-high">{t("Price: High to Low", "السعر: من الأعلى")}</option>
          </select>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-6">
        <aside className="bg-white border border-zinc-200 rounded p-4 h-fit">
          <h3 className="font-bold text-sm">{t("Filters", "الفلاتر")}</h3>
          <div className="mt-3 text-xs font-bold tracking-wide">{t("Brand", "الماركة")}</div>
          <div className="mt-2 space-y-1">{catBrands.map((b) => <button key={b} onClick={() => setBrand(b)} className={`w-full text-left px-2 py-1 rounded text-sm ${brand === b ? "bg-black text-white" : "hover:bg-zinc-100"}`}>{b}</button>)}</div>
          <label className="mt-4 block text-xs font-bold tracking-wide">{t("Price", "السعر")}</label>
          <select value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 w-full border border-zinc-300 rounded px-2 py-2 text-sm"><option value="all">{t("All prices", "كل الأسعار")}</option><option value="under1000">{t("Under 1000 EGP", "أقل من 1000")}</option><option value="1000-2000">1000 - 2000 EGP</option><option value="over2000">{t("Over 2000 EGP", "أكثر من 2000")}</option></select>
          <button onClick={() => { setBrand("All"); setPrice("all"); setSort("popular"); }} className="mt-4 w-full border border-zinc-300 rounded-full py-2 text-sm font-semibold hover:border-black">{t("Clear filters", "مسح الفلاتر")}</button>
        </aside>
        <div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">{catBrands.map((b) => <button key={b} onClick={() => setBrand(b)} className={`px-4 py-2 rounded-full border text-sm font-semibold shrink-0 focus:outline-none focus:ring-2 focus:ring-black ${brand === b ? "bg-black text-white border-black" : "bg-white border-zinc-300 hover:border-black"}`}>{b}</button>)}</div>
          {filtered.length === 0 ? <div className="text-center py-16 text-zinc-500">{t("No products", "لا يوجد منتجات")}</div> : <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-4">{filtered.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>}
        </div>
      </div>
    </div>
  );
}
