"use client";
import { products, formatEGP, getVariantStock } from "@/lib/products";
import { useLang, useCart, useWishlist } from "@/lib/store";
import Breadcrumb from "@/components/Breadcrumb";
import SizeGuide from "@/components/SizeGuide";
import ProductCard from "@/components/ProductCard";
import { useEffect, useState } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";
import Link from "next/link";

export default function ProductClient({ id }: { id: string }) {
  const p = products.find((x) => x.id === id);
  const { lang, t } = useLang();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const [size, setSize] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>(p?.colors?.[0]);
  const [added, setAdded] = useState(false);
  const [activeImg, setActiveImg] = useState(0);

  useEffect(() => {
    if (!p) return;
    trackMetaEvent("ViewContent", {
      content_ids: [p.id],
      content_name: p.nameEn,
      content_type: "product",
      currency: "EGP",
      value: p.price,
    });
    // recently viewed
    try {
      const rv = JSON.parse(localStorage.getItem("muse-recent") || "[]");
      const next = [p.id, ...rv.filter((x: string) => x !== p.id)].slice(0, 8);
      localStorage.setItem("muse-recent", JSON.stringify(next));
    } catch {}
  }, [p]);

  if (!p) return <div className="max-w-[1400px] mx-auto px-4 py-12 text-center"><h1 className="text-xl font-bold">Not found</h1><Link href="/" className="underline">Home</Link></div>;
  const name = lang === "ar" ? p.nameAr : p.nameEn;
  const categoryHref = p.category === "accessories" ? "/accessories" : `/${p.category}`;
  const requiresSize = !!p.sizes?.length;
  const canAdd = !requiresSize || !!size;
  const stockInfo = getVariantStock(p, size);
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  const handleAdd = () => {
    if (!canAdd) return;
    add(p, size, color);
    trackMetaEvent("AddToCart", { content_ids: [p.id], content_name: p.nameEn, content_type: "product", currency: "EGP", value: p.price });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };
  const handleWishlist = () => {
    if (!has(p.id)) trackMetaEvent("AddToWishlist", { content_ids: [p.id], content_name: p.nameEn, content_type: "product", currency: "EGP", value: p.price });
    toggle(p.id);
  };
  const related = products.filter((x) => x.category === p.category && x.id !== p.id).slice(0, 4);
  const recentIds: string[] = (() => { try { return JSON.parse(localStorage.getItem("muse-recent") || "[]"); } catch { return []; } })();
  const recent = products.filter((x) => recentIds.includes(x.id) && x.id !== p.id).slice(0, 4);

  return (
    <div className="w-full px-6 md:px-10 mt-6 pb-24 lg:pb-0 bg-[#100904] text-[#ffedd7]">
      <Breadcrumb items={[{ labelEn: p.category === "men" ? "Men" : p.category === "women" ? "Women" : "Accessories", labelAr: p.category === "men" ? "رجالي" : p.category === "women" ? "نسائي" : "إكسسوارات", href: categoryHref }, { labelEn: p.subcategory, labelAr: p.subcategory }, { labelEn: p.nameEn, labelAr: p.nameAr }]} />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        <div>
          <div className="bg-[#100904] border border-[#40372e] aspect-[4/5] overflow-hidden rounded-[12px] relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.images[activeImg] || p.image} alt={name} className="w-full h-full object-cover" />
            {discount > 0 && <span className="absolute top-3 left-3 text-[12px] font-medium uppercase text-[#dc5000]">-{discount}%</span>}
            <span className="absolute top-3 right-3 text-[12px] font-medium uppercase px-2 py-1 rounded-full border border-[#40372e] bg-[#100904]/80 text-[#ffedd7]">{stockInfo.status==="out"? t("OUT OF STOCK","نفذ") : stockInfo.status==="low"? t(`LOW STOCK — ${stockInfo.stock} LEFT`,`كمية قليلة — ${stockInfo.stock} متبقي`) : t("IN STOCK","متوفر")}</span>
          </div>
          {p.images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
              {p.images.map((src, i) => (
                <button key={i} onClick={() => setActiveImg(i)} className={`w-20 h-20 rounded-xl overflow-hidden border-2 shrink-0 ${activeImg===i?"border-black":"border-transparent"}`} aria-label={`View image ${i+1}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
        <div>
          <div className="oryzo-label text-[#6c5f51] flex items-center gap-2">{p.brand} {p.isMuseMade && <span className="bg-[#382416] border border-[#40372e] text-[#ffedd7] px-2 py-0.5 text-[10px] rounded-full uppercase">MUSE MANUFACTURED</span>} {p.isNew && <span className="bg-[#ffedd7] text-[#100904] px-2 py-0.5 text-[10px] rounded-full uppercase">NEW</span>}</div>
          <h1 className="oryzo-heading !text-[41px] mt-3 text-left uppercase">{name}</h1>
          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-2xl font-medium uppercase">{formatEGP(p.price)}</span>
            {p.originalPrice && <span className="line-through text-[#6c5f51]">{formatEGP(p.originalPrice)}</span>}
          </div>
          <div className="oryzo-label mt-2 flex flex-wrap gap-2 text-[#ffedd7]/80"><span>✓ {t("CASH ON DELIVERY","الدفع عند الاستلام")}</span><span className="text-[#6c5f51]">•</span><span>{t("PAYMOB X-PAY","Paymob")}</span><span className="text-[#6c5f51]">•</span><span>{t("14-DAY RETURNS","إرجاع 14 يوم")}</span></div>

          {/* Colors */}
          <div className="mt-6">
            <div className="text-sm font-bold flex justify-between">{t("Color","اللون")} <span className="text-xs font-normal text-zinc-500">{color}</span></div>
            <div className="flex gap-2 mt-2">
              {p.colors.map((c) => (
                <button key={c} aria-label={`Color ${c}`} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full border-2 ${color===c?"border-black ring-2 ring-black ring-offset-2":"border-zinc-200"}`} style={{ background: c }} />
              ))}
            </div>
          </div>

          {/* Sizes + SizeGuide */}
          {p.sizes && (
            <div className="mt-6">
              <div className="flex items-center justify-between"><div className="text-sm font-bold">{t("Size","المقاس")} {requiresSize && !size && <span className="text-red-600 text-xs">*</span>}</div><SizeGuide category={p.category} subcategory={p.subcategory} /></div>
              <div className="flex flex-wrap gap-2 mt-3" role="group" aria-label="Sizes">
                {p.sizes.map((s) => {
                  const st = getVariantStock(p, s);
                  const disabled = st.status==="out";
                  return (
                    <button key={s} aria-pressed={size === s} disabled={disabled} onClick={() => setSize(s)} className={`px-5 py-2 border text-sm font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-black ${disabled?"bg-zinc-100 text-zinc-400 border-zinc-200 cursor-not-allowed line-through": size === s ? "bg-black text-white border-black" : "bg-white border-zinc-300 hover:border-black"}`}>{s}</button>
                  );
                })}
              </div>
              {requiresSize && !size && <div className="text-xs text-amber-600 mt-2">{t("Please select a size","يرجى اختيار المقاس")}</div>}
            </div>
          )}

          <div className="mt-6 flex gap-[18px]">
            <button onClick={handleAdd} disabled={!canAdd || stockInfo.status==="out"} className="btn-pill flex-1 disabled:opacity-50 disabled:cursor-not-allowed" aria-disabled={!canAdd || stockInfo.status==="out"}>
              {stockInfo.status==="out" ? t("OUT OF STOCK","نفذ") : added ? t("ADDED ✓","تمت الإضافة ✓") : t("ADD TO BAG","أضف للحقيبة")}
            </button>
            <button aria-label={has(p.id) ? "Remove from wishlist" : "Add to wishlist"} onClick={handleWishlist} className="btn-ghost px-6"><span aria-hidden>{has(p.id) ? "♥" : "♡"}</span></button>
          </div>
          <Link href="/checkout" onClick={handleAdd} className={`btn-ghost mt-3 block text-center ${!canAdd || stockInfo.status==="out" ? "pointer-events-none opacity-50" : ""}`}>{t("BUY NOW","اشتر الآن")}</Link>
          {added && <div role="status" className="mt-3 text-sm text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded flex justify-between">{t("Added to bag","تمت الإضافة للعربة")} <Link href="/cart" className="underline font-bold">{t("View Bag","عرض العربة")}</Link></div>}

          <div className="mt-6 card-oryzo text-sm leading-relaxed">
            <div className="font-bold">Product Details</div>
            <p className="text-zinc-600 mt-1 text-sm">{p.subcategory} • {p.brand} • Ships across Egypt • 14-day returns. {p.isMuseMade ? "Proudly manufactured by MUSE WEAR in Cairo." : "Curated multibrand selection."}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
              <div><span className="text-zinc-500">Material:</span> {p.material || "Cotton blend"}</div>
              <div><span className="text-zinc-500">Fit:</span> {p.fit || "Regular"}</div>
              <div className="col-span-2"><span className="text-zinc-500">Care:</span> {p.care || "Machine wash cold"}</div>
            </div>
            <div className="mt-3 flex gap-2">
              {p.colors.map((c) => <span key={c} aria-label={`Color ${c}`} className="w-6 h-6 rounded-full border" style={{ background: c }} />)}
            </div>
          </div>
          <div className="mt-3 text-xs text-zinc-500 flex gap-2 flex-wrap"><span>SKU: {p.sku || p.id}</span><span>•</span><span>{t("All prices in EGP","كل الأسعار بالجنيه")}</span><span>•</span><span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full"/> {t("Ships in 1-2 days","شحن 1-2 يوم")}</span></div>

          {/* Structured data */}
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context":"https://schema.org","@type":"Product", name, brand:{ "@type":"Brand", name:p.brand}, offers:{ "@type":"Offer", price:p.price, priceCurrency:"EGP", availability: stockInfo.status==="out"?"https://schema.org/OutOfStock":"https://schema.org/InStock", url:`https://muse-wear.pages.dev/product/${p.id}`}, image:p.image }) }} />
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-10">
          <h3 className="font-black text-lg">{t("Complete the look","أكمل المظهر")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">{related.map((rp,i)=><ProductCard key={rp.id} p={rp} index={i}/>)}</div>
        </section>
      )}
      {recent.length > 0 && (
        <section className="mt-8">
          <h3 className="font-bold">{t("Recently Viewed","شوهد مؤخراً")}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">{recent.map((rp,i)=><ProductCard key={rp.id} p={rp} index={i}/>)}</div>
        </section>
      )}

      {/* Sticky mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex gap-3 z-40">
        <button onClick={handleAdd} disabled={!canAdd || stockInfo.status==="out"} className="flex-1 bg-black text-white py-3 rounded-full font-bold disabled:bg-zinc-300">{stockInfo.status==="out"? t("Out of Stock","نفذ") : t("Add to Bag — ","أضف ") + formatEGP(p.price)}</button>
        <button onClick={handleWishlist} className="w-12 h-12 border rounded-full grid place-items-center">{has(p.id)?"♥":"♡"}</button>
      </div>
    </div>
  );
}
