"use client";
import ProductCard from "@/components/ProductCard";
import { products } from "@/lib/products";
import { useLang } from "@/lib/store";
import { useState } from "react";

export default function WomenPage() {
  const { t } = useLang();
  const [brand, setBrand] = useState("All");
  const list = products.filter((p) => p.category === "women").filter((p) => (brand === "All" ? true : p.brand === brand));
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <h1 className="text-2xl font-black">{t("WOMEN", "نسائي")} <span className="text-zinc-400 font-normal text-sm">{list.length} {t("products", "منتج")}</span></h1>
      <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar">
        {["All", "MUSE WEAR", "Adidas"].map((b) => (
          <button key={b} onClick={() => setBrand(b)} className={`px-4 py-2 rounded-full border text-sm font-semibold shrink-0 ${brand === b ? "bg-black text-white border-black" : "bg-white border-zinc-300"}`}>{b}</button>
        ))}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
        {list.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </div>
  );
}
