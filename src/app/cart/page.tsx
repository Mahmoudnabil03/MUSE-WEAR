"use client";
import { useCart, useLang } from "@/lib/store";
import { formatEGP } from "@/lib/products";
import Link from "next/link";

export default function CartPage() {
  const { items, updateQty, remove, total, count } = useCart();
  const { t, lang } = useLang();

  if (items.length === 0) return <div className="max-w-[1400px] mx-auto px-4 py-12 text-center"><h1 className="text-2xl font-black">{t("Your Bag is empty", "حقيبتك فارغة")}</h1><Link href="/" className="inline-block mt-4 bg-black text-white px-6 py-3 rounded-full font-bold">{t("Continue Shopping", "تابع التسوق")}</Link></div>;

  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <h1 className="text-2xl font-black">{t("Shopping Bag", "حقيبة التسوق")} ({count})</h1>
        <div className="mt-4 space-y-3">
          {items.map((it) => (
            <div key={`${it.product.id}-${it.size}`} className="bg-white border border-zinc-200 p-3 flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={it.product.image} alt="" className="w-24 h-28 object-cover bg-zinc-100" />
              <div className="flex-1">
                <div className="text-xs font-bold text-zinc-500">{it.product.brand}</div>
                <div className="text-sm font-semibold">{lang === "ar" ? it.product.nameAr : it.product.nameEn}</div>
                <div className="text-xs text-zinc-500">Size: {it.size ?? "One Size"}</div>
                <div className="font-bold mt-1">{formatEGP(it.product.price)}</div>
                <div className="mt-2 flex items-center gap-2">
                  <button onClick={() => updateQty(it.product.id, it.qty - 1)} className="w-8 h-8 border rounded">-</button>
                  <span className="w-8 text-center font-bold">{it.qty}</span>
                  <button onClick={() => updateQty(it.product.id, it.qty + 1)} className="w-8 h-8 border rounded">+</button>
                  <button onClick={() => remove(it.product.id)} className="ml-auto text-xs underline text-red-600">{t("Remove", "حذف")}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-white border border-zinc-200 p-6 h-fit">
        <h3 className="font-black">Order Summary</h3>
        <div className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span className="font-bold">{formatEGP(total)}</span></div>
          <div className="flex justify-between"><span>Shipping</span><span className="text-green-700 font-semibold">{total > 999 ? t("FREE", "مجاني") : formatEGP(59)}</span></div>
          <div className="border-t pt-2 flex justify-between font-black text-base"><span>Total</span><span>{formatEGP(total > 999 ? total : total + 59)}</span></div>
        </div>
        <Link href="/checkout" className="block text-center mt-6 bg-black text-white py-3.5 rounded-full font-bold">{t("Proceed to Checkout", "المتابعة للدفع")}</Link>
        <div className="mt-3 text-xs text-center text-zinc-500">COD • Paymob (X-Pay) • 14-day returns</div>
      </div>
    </div>
  );
}
