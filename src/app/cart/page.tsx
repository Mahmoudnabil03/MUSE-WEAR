"use client";
import { useCart, useLang, useWishlist } from "@/lib/store";
import { formatEGP, getVariantStock } from "@/lib/products";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { useState, useEffect } from "react";
import { trackMetaEvent } from "@/lib/meta-pixel";

export default function CartPage() {
  const { items, updateQty, remove, total, count } = useCart();
  const { t, lang } = useLang();
  const { toggle: wishToggle } = useWishlist();
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [discount, setDiscount] = useState(0);
  const [validating, setValidating] = useState(false);
  const shipping = total > 999 ? 0 : total ? 59 : 0;
  const grand = Math.max(0, total + shipping - discount);

  if (items.length === 0) return <div className="w-full px-6 md:px-10 py-12 text-center bg-[#000000] text-[#ffffff]"><h1 className="oryzo-heading">{t("YOUR BAG IS EMPTY", "حقيبتك فارغة")}</h1><p className="oryzo-label mt-2 text-[#737373]">{t("SAVE ITEMS TO WISHLIST OR CONTINUE SHOPPING", "احفظ في الرغبات أو تابع التسوق")}</p><Link href="/" className="btn-pill inline-block mt-4">{t("CONTINUE SHOPPING", "تابع التسوق")}</Link><div className="oryzo-legal mt-8 text-[#737373]">CASH ON DELIVERY • PAYMOB • 14-DAY RETURNS</div></div>;

  return (
    <div className="w-full px-6 md:px-10 mt-6 bg-[#000000] text-[#ffffff]">
      <Breadcrumb items={[{ labelEn: "Shopping Bag", labelAr: "حقيبة التسوق" }]} />
      <div className="flex items-center gap-2 text-xs font-bold mt-2">
        <span className="bg-black text-white px-2 py-0.5 rounded">1. {t("Bag", "العربة")}</span><span>›</span><span className="text-zinc-400">2. {t("Details & Payment", "التفاصيل")}</span><span>›</span><span className="text-zinc-400">3. {t("Done", "تم")}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-black">{t("Shopping Bag", "حقيبة التسوق")} ({count})</h1>
          <div className="mt-4 space-y-3">
            {items.map((it) => (
              <div key={`${it.product.id}-${it.size}`} className="card-oryzo p-3 flex gap-4 !rounded-[12px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.product.image} alt={lang === "ar" ? it.product.nameAr : it.product.nameEn} className="w-24 h-28 object-cover bg-zinc-100 rounded" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-zinc-500">{it.product.brand}</div>
                  <Link href={`/product/${it.product.id}`} className="text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-black rounded">{lang === "ar" ? it.product.nameAr : it.product.nameEn}</Link>
                  <div className="text-xs text-zinc-500">Size: {it.size ?? t("One Size", "مقاس واحد")}</div>
                  <div className="font-bold mt-1">{formatEGP(it.product.price)}</div>
                  {(() => { const s = getVariantStock(it.product, it.size); return s.status==="low" ? <div className="text-xs text-amber-600">{t(`Only ${s.stock} left — low stock`,`متبقي ${s.stock} فقط`)}</div> : s.status==="out" ? <div className="text-xs text-red-600 font-bold">{t("Out of stock","نفذ")}</div> : null; })()}
                  <div className="mt-2 flex items-center gap-2">
                    <button aria-label="Decrease quantity" onClick={() => updateQty(it.product.id, it.size, it.qty - 1)} className="w-8 h-8 border rounded hover:border-black focus:outline-none focus:ring-2 focus:ring-black">-</button>
                    <span className="w-8 text-center font-bold" aria-live="polite">{it.qty}</span>
                    <button aria-label="Increase quantity" onClick={() => updateQty(it.product.id, it.size, it.qty + 1)} className="w-8 h-8 border rounded hover:border-black focus:outline-none focus:ring-2 focus:ring-black">+</button>
                    <button onClick={() => { wishToggle(it.product.id); }} className="ml-2 text-xs underline hover:text-black">{t("Move to Wishlist", "نقل للرغبات")}</button>
                    <button onClick={() => remove(it.product.id, it.size)} className="ml-auto text-xs underline text-red-600 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-600 rounded">{t("Remove", "حذف")}</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link href="/" className="inline-block mt-4 text-sm font-bold underline">← {t("Continue Shopping", "تابع التسوق")}</Link>
        </div>
        <div className="card-oryzo h-fit sticky top-[160px]">
          <h3 className="oryzo-heading-sm text-left">{t("ORDER SUMMARY", "ملخص الطلب")}</h3>
          <div className="mt-3 flex gap-2">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value.toUpperCase())} placeholder={t("PROMO CODE", "كود الخصم — WELCOME10")} aria-label="Promo code" className="input-underline flex-1 uppercase" />
            <button disabled={validating} onClick={async () => {
              if (!coupon.trim()) { setCouponMsg(t("Enter code","أدخل الكود")); return; }
              setValidating(true); setCouponMsg("");
              try {
                const r = await fetch("/api/discounts/validate", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ code: coupon.trim(), subtotal: total }) });
                const j = await r.json();
                if (j.valid) { setDiscount(j.discount.amount || 0); setCouponMsg(j.discount.free_shipping ? t("Free shipping applied","شحن مجاني") : t(`Discount ${formatEGP(j.discount.amount)} applied`,`خصم ${formatEGP(j.discount.amount)}`)); }
                else { setDiscount(0); setCouponMsg(j.error || t("Invalid code","كود غير صالح")); }
              } catch { setDiscount(0); setCouponMsg(t("Failed","فشل")); }
              setValidating(false);
            }} className="border border-black px-4 rounded-full text-sm font-bold hover:bg-black hover:text-white disabled:opacity-50">{validating?"...":t("Apply", "تطبيق")}</button>
          </div>
          {couponMsg && <div className={`text-xs mt-1 ${couponMsg.includes("applied")||couponMsg.includes("شحن")?"text-green-600":"text-red-600"}`}>{couponMsg}</div>}
          {discount>0 && <div className="text-xs text-green-600 font-bold">- {formatEGP(discount)} {t("discount","خصم")}</div>}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("Subtotal", "المجموع")}</span><span className="font-bold">{formatEGP(total)}</span></div>
            <div className="flex justify-between"><span>{t("Shipping", "الشحن")}</span><span className="text-green-700 font-semibold">{shipping===0 && total>0 ? t("FREE","مجاني") : formatEGP(shipping)}</span></div>
            {discount>0 && <div className="flex justify-between text-green-600"><span>{t("Discount","الخصم")}</span><span>-{formatEGP(discount)}</span></div>}
            <div className="border-t pt-2 flex justify-between font-black text-base"><span>{t("Total", "الإجمالي")}</span><span>{formatEGP(grand)}</span></div>
            <div className="text-[11px] text-zinc-500">{total>0 && total<999 ? t(`Add ${formatEGP(999-total)} for FREE shipping` , `أضف ${formatEGP(999-total)} للشحن المجاني`) : t("Free shipping over 999 EGP — Cairo & Alexandria","شحن مجاني فوق 999")}</div>
          </div>
          <Link href={discount>0 ? `/checkout?coupon=${encodeURIComponent(coupon.trim())}` : "/checkout"} onClick={() => trackMetaEvent("InitiateCheckout", { content_ids: items.map((item) => item.product.id), content_type: "product", currency: "EGP", num_items: count, value: grand })} className="block text-center mt-6 bg-black text-white py-3.5 rounded-full font-bold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black">{t("Proceed to Checkout", "المتابعة للدفع")}</Link>
          <div className="mt-3 text-xs text-center text-zinc-500">COD • Paymob (X-Pay) • 14-day returns • {t("Secure checkout", "دفع آمن")}</div>
        </div>
      </div>
    </div>
  );
}
