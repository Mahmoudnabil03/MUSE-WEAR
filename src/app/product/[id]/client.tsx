"use client";
import { products, formatEGP } from "@/lib/products";
import { useLang, useCart, useWishlist } from "@/lib/store";
import Link from "next/link";
import { useState } from "react";

export default function ProductClient({ id }: { id: string }) {
  const p = products.find((x) => x.id === id)!;
  const { lang, t } = useLang();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [size, setSize] = useState<string | undefined>(p.sizes?.[0]);
  const name = lang === "ar" ? p.nameAr : p.nameEn;
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-zinc-100 aspect-[4/5] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={name} className="w-full h-full object-cover" />
      </div>
      <div>
        <div className="text-xs font-bold tracking-wide text-zinc-500">{p.brand} {p.isMuseMade && <span className="bg-black text-white px-2 py-0.5 ml-2">MUSE MANUFACTURED</span>}</div>
        <h1 className="text-2xl font-bold mt-2">{name}</h1>
        <div className="mt-3 flex items-baseline gap-3">
          <span className="text-2xl font-black">{formatEGP(p.price)}</span>
          {p.originalPrice && <span className="line-through text-zinc-400">{formatEGP(p.originalPrice)}</span>}
        </div>
        <div className="text-xs text-green-700 font-semibold mt-1">✓ {t("Cash on Delivery available", "الدفع عند الاستلام متاح")} • {t("Pay with Paymob (X-Pay)", "ادفع بـ Paymob")}</div>
        {p.sizes && (
          <div className="mt-6">
            <div className="text-sm font-bold">{t("Size", "المقاس")}</div>
            <div className="flex flex-wrap gap-2 mt-2">
              {p.sizes.map((s) => (
                <button key={s} onClick={() => setSize(s)} className={`px-4 py-2 border text-sm font-semibold rounded ${size === s ? "bg-black text-white border-black" : "bg-white border-zinc-300"}`}>{s}</button>
              ))}
            </div>
            <Link href="#" className="text-xs underline mt-2 inline-block">{t("Size Guide", "دليل المقاسات")}</Link>
          </div>
        )}
        <div className="mt-6 flex gap-3">
          <button onClick={() => add(p, size)} className="flex-1 bg-black text-white py-3.5 rounded-full font-bold">{t("Add to Bag", "أضف للحقيبة")}</button>
          <button onClick={() => toggle(p.id)} className={`px-6 border rounded-full font-bold ${has(p.id) ? "bg-black text-white border-black" : "bg-white border-zinc-300"}`}>{has(p.id) ? "♥" : "♡"}</button>
        </div>
        <div className="mt-6 bg-white border border-zinc-200 p-4 text-sm leading-relaxed">
          <div className="font-bold">Product Details</div>
          <p className="text-zinc-600 mt-1">{p.subcategory} • {p.brand} • Ships across Egypt • 14-day returns. {p.isMuseMade ? "Proudly manufactured by MUSE WEAR in Cairo." : "Curated multibrand selection."}</p>
          <div className="mt-3 flex gap-2">
            {p.colors.map((c) => <span key={c} className="w-6 h-6 rounded-full border" style={{ background: c }} />)}
          </div>
        </div>
        <div className="mt-4 text-xs text-zinc-500">SKU: {p.id} • {t("All prices in EGP", "كل الأسعار بالجنيه")}</div>
      </div>
    </div>
  );
}
