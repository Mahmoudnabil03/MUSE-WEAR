"use client";
import { products, formatEGP } from "@/lib/products";
import { useLang, useCart, useWishlist } from "@/lib/store";
import Breadcrumb from "@/components/Breadcrumb";
import { useState } from "react";

export default function ProductClient({ id }: { id: string }) {
  const p = products.find((x) => x.id === id);
  const { lang, t } = useLang();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [size, setSize] = useState<string | undefined>(p?.sizes?.[0]);
  const [showGuide, setShowGuide] = useState(false);
  const [added, setAdded] = useState(false);
  if (!p) return <div className="max-w-[1400px] mx-auto px-4 py-12 text-center"><h1 className="text-xl font-bold">Not found</h1><a href="/" className="underline">Home</a></div>;
  const name = lang === "ar" ? p.nameAr : p.nameEn;
  const categoryHref = p.category === "accessories" ? "/accessories" : `/${p.category}`;
  const handleAdd = () => { add(p, size); setAdded(true); setTimeout(() => setAdded(false), 1500); };
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: p.category === "men" ? "Men" : p.category === "women" ? "Women" : "Accessories", labelAr: p.category === "men" ? "رجالي" : p.category === "women" ? "نسائي" : "إكسسوارات", href: categoryHref }, { labelEn: p.subcategory, labelAr: p.subcategory }, { labelEn: p.nameEn, labelAr: p.nameAr }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div className="bg-zinc-100 aspect-[4/5] overflow-hidden rounded">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image} alt={name} className="w-full h-full object-cover" />
        </div>
        <div>
          <div className="text-xs font-bold tracking-wide text-zinc-500">{p.brand} {p.isMuseMade && <span className="bg-black text-white px-2 py-0.5 ml-2 text-xs">MUSE MANUFACTURED</span>}</div>
          <h1 className="text-2xl font-bold mt-2">{name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-black">{formatEGP(p.price)}</span>
            {p.originalPrice && <span className="line-through text-zinc-400">{formatEGP(p.originalPrice)}</span>}
          </div>
          <div className="text-xs text-green-700 font-semibold mt-1">✓ {t("Cash on Delivery available", "الدفع عند الاستلام متاح")} • {t("Pay with Paymob (X-Pay)", "ادفع بـ Paymob")} • {t("14-day returns", "إرجاع 14 يوم")}</div>
          {p.sizes && (
            <div className="mt-6">
              <div className="flex items-center justify-between"><div className="text-sm font-bold">{t("Size", "المقاس")}</div><button onClick={() => setShowGuide(!showGuide)} className="text-xs underline font-semibold focus:outline-none focus:ring-2 focus:ring-black rounded px-1">{t("Size Guide", "دليل المقاسات")}</button></div>
              {showGuide && <div className="mt-2 bg-zinc-50 border border-zinc-200 p-3 text-xs rounded"><div className="font-bold">Size Chart (cm)</div><div className="mt-1 grid grid-cols-4 gap-1 text-center"><span>S: 38</span><span>M: 40</span><span>L: 42</span><span>XL: 44</span></div></div>}
              <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Sizes">
                {p.sizes.map((s) => (
                  <button key={s} aria-pressed={size === s} onClick={() => setSize(s)} className={`px-4 py-2 border text-sm font-semibold rounded focus:outline-none focus:ring-2 focus:ring-black ${size === s ? "bg-black text-white border-black" : "bg-white border-zinc-300 hover:border-black"}`}>{s}</button>
                ))}
              </div>
            </div>
          )}
          <div className="mt-6 flex gap-3">
            <button onClick={handleAdd} className="flex-1 bg-black text-white py-3.5 rounded-full font-bold hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">{added ? t("Added ✓", "تمت الإضافة ✓") : t("Add to Bag", "أضف للحقيبة")}</button>
            <button aria-label={has(p.id) ? "Remove from wishlist" : "Add to wishlist"} onClick={() => toggle(p.id)} className={`px-6 border rounded-full font-bold focus:outline-none focus:ring-2 focus:ring-black ${has(p.id) ? "bg-black text-white border-black" : "bg-white border-zinc-300"}`}><span aria-hidden>{has(p.id) ? "♥" : "♡"}</span></button>
          </div>
          {added && <div role="status" className="mt-2 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded">{t("Added to bag", "تمت الإضافة للعربة")} — <a href="/cart" className="underline font-bold">{t("View Bag", "عرض العربة")}</a></div>}
          <div className="mt-6 bg-white border border-zinc-200 p-4 text-sm leading-relaxed rounded">
            <div className="font-bold">Product Details</div>
            <p className="text-zinc-600 mt-1">{p.subcategory} • {p.brand} • Ships across Egypt • 14-day returns. {p.isMuseMade ? "Proudly manufactured by MUSE WEAR in Cairo." : "Curated multibrand selection."}</p>
            <div className="mt-3 flex gap-2">
              {p.colors.map((c) => <span key={c} aria-label={`Color ${c}`} className="w-6 h-6 rounded-full border" style={{ background: c }} />)}
            </div>
          </div>
          <div className="mt-4 text-xs text-zinc-500">SKU: {p.id} • {t("All prices in EGP", "كل الأسعار بالجنيه")} • {t("Delivery 1-2 days", "توصيل 1-2 يوم")}</div>
        </div>
      </div>
    </div>
  );
}
