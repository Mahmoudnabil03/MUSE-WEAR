"use client";
import { useCart, useLang, useWishlist } from "@/lib/store";
import { formatEGP } from "@/lib/products";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { useState } from "react";

export default function CartPage() {
  const { items, updateQty, remove, total, count } = useCart();
  const { t, lang } = useLang();
  const { toggle: wishToggle } = useWishlist();
  const [coupon, setCoupon] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  if (items.length === 0) return <div className="max-w-[1400px] mx-auto px-4 py-12 text-center"><h1 className="text-2xl font-black">{t("Your Bag is empty", "حقيبتك فارغة")}</h1><p className="text-sm text-zinc-500 mt-2">{t("Save items to wishlist or continue shopping", "احفظ في الرغبات أو تابع التسوق")}</p><Link href="/" className="inline-block mt-4 bg-black text-white px-6 py-3 rounded-full font-bold focus:outline-none focus:ring-2 focus:ring-black">{t("Continue Shopping", "تابع التسوق")}</Link></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: "Shopping Bag", labelAr: "حقيبة التسوق" }]} />
      <div className="flex items-center gap-2 text-xs font-bold mt-2">
        <span className="bg-black text-white px-2 py-0.5 rounded">1. {t("Bag", "العربة")}</span><span>›</span><span className="text-zinc-400">2. {t("Details & Payment", "التفاصيل")}</span><span>›</span><span className="text-zinc-400">3. {t("Done", "تم")}</span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-black">{t("Shopping Bag", "حقيبة التسوق")} ({count})</h1>
          <div className="mt-4 space-y-3">
            {items.map((it) => (
              <div key={`${it.product.id}-${it.size}`} className="bg-white border border-zinc-200 p-3 flex gap-4 rounded">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={it.product.image} alt={lang === "ar" ? it.product.nameAr : it.product.nameEn} className="w-24 h-28 object-cover bg-zinc-100 rounded" />
                <div className="flex-1">
                  <div className="text-xs font-bold text-zinc-500">{it.product.brand}</div>
                  <Link href={`/product/${it.product.id}`} className="text-sm font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-black rounded">{lang === "ar" ? it.product.nameAr : it.product.nameEn}</Link>
                  <div className="text-xs text-zinc-500">Size: {it.size ?? t("One Size", "مقاس واحد")}</div>
                  <div className="font-bold mt-1">{formatEGP(it.product.price)}</div>
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
        <div className="bg-white border border-zinc-200 p-6 h-fit rounded-2xl sticky top-[120px]">
          <h3 className="font-black">{t("Order Summary", "ملخص الطلب")}</h3>
          <div className="mt-3 flex gap-2">
            <input value={coupon} onChange={(e) => setCoupon(e.target.value)} placeholder={t("Promo code", "كود الخصم")} aria-label="Promo code" className="flex-1 border border-zinc-300 rounded-full px-3 py-2 text-sm focus:border-black focus:outline-none" />
            <button onClick={() => setCouponMsg(coupon ? t("Invalid code", "كود غير صالح") : "")} className="border border-black px-4 rounded-full text-sm font-bold hover:bg-black hover:text-white">{t("Apply", "تطبيق")}</button>
          </div>
          {couponMsg && <div className="text-xs text-red-600 mt-1">{couponMsg}</div>}
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>{t("Subtotal", "المجموع")}</span><span className="font-bold">{formatEGP(total)}</span></div>
            <div className="flex justify-between"><span>{t("Shipping", "الشحن")}</span><span className="text-green-700 font-semibold">{total > 999 ? t("FREE", "مجاني") : formatEGP(59)}</span></div>
            <div className="border-t pt-2 flex justify-between font-black text-base"><span>{t("Total", "الإجمالي")}</span><span>{formatEGP(total > 999 ? total : total + 59)}</span></div>
          </div>
          <Link href="/checkout" className="block text-center mt-6 bg-black text-white py-3.5 rounded-full font-bold hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-black">{t("Proceed to Checkout", "المتابعة للدفع")}</Link>
          <div className="mt-3 text-xs text-center text-zinc-500">COD • Paymob (X-Pay) • 14-day returns • {t("Secure checkout", "دفع آمن")}</div>
        </div>
      </div>
    </div>
  );
}
