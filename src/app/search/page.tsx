"use client";
import { useSearchParams } from "next/navigation";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import { useLang } from "@/lib/store";
import { Suspense } from "react";

function SearchInner() {
  const sp = useSearchParams();
  const q = (sp.get("q") || "").toLowerCase();
  const { t } = useLang();
  const results = q ? products.filter((p) => `${p.nameEn} ${p.nameAr} ${p.brand} ${p.subcategory}`.toLowerCase().includes(q)) : [];
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: `Search: ${q}`, labelAr: `بحث: ${q}` }]} />
      <h1 className="text-2xl font-black mt-3">{t("Search", "بحث")} {q && <span className="text-zinc-500 font-normal text-base">“{q}” — {results.length} {t("results", "نتيجة")}</span>}</h1>
      {!q ? <p className="mt-4 text-zinc-500">{t("Type a search above", "اكتب بحثاً بالأعلى")}</p> : results.length === 0 ? <p className="mt-4 text-zinc-500">{t("No results", "لا نتائج")} — {t("Try brand or category", "جرب ماركة أو فئة")}</p> : <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{results.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>}
    </div>
  );
}
export default function SearchPage() {
  return <Suspense><SearchInner /></Suspense>;
}
