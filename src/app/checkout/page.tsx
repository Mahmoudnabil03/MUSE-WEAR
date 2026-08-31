"use client";
import { useCart, useLang } from "@/lib/store";
import { formatEGP } from "@/lib/products";
import { useState } from "react";

export default function CheckoutPage() {
  const { total, clear } = useCart();
  const { t } = useLang();
  const [method, setMethod] = useState<"cod" | "paymob">("cod");
  const [done, setDone] = useState(false);
  if (done) return <div className="max-w-[600px] mx-auto px-4 py-16 text-center"><div className="text-5xl">✓</div><h1 className="text-2xl font-black mt-4">{t("Order Confirmed!", "تم تأكيد الطلب!")}</h1><p className="text-zinc-600 mt-2">{method === "cod" ? t("Pay on delivery across Egypt. You will get an SMS.", "الدفع عند الاستلام في كل مصر. ستصلك رسالة.") : t("Paymob payment link sent.", "تم إرسال رابط Paymob.")}</p></div>;

  const grand = total > 999 ? total : total + 59;
  return (
    <div className="max-w-[800px] mx-auto px-4 mt-6">
      <h1 className="text-2xl font-black">{t("Checkout", "الدفع")}</h1>
      <div className="mt-6 bg-white border border-zinc-200 p-6 grid gap-4">
        <div className="grid grid-cols-2 gap-3">
          <input placeholder={t("Full Name", "الاسم الكامل")} className="border border-zinc-300 px-3 py-2.5 text-sm rounded" />
          <input placeholder={t("Phone (Egypt)", "رقم الهاتف")} className="border border-zinc-300 px-3 py-2.5 text-sm rounded" />
        </div>
        <input placeholder={t("Address - Cairo / Alexandria / ...", "العنوان - القاهرة / الإسكندرية / ...")} className="border border-zinc-300 px-3 py-2.5 text-sm rounded" />
        <select className="border border-zinc-300 px-3 py-2.5 text-sm rounded"><option>Cairo - القاهرة</option><option>Alexandria - الإسكندرية</option><option>Giza - الجيزة</option><option>All Governorates - كل المحافظات</option></select>

        <div className="border-t pt-4">
          <div className="font-bold text-sm">{t("Payment Method", "طريقة الدفع")}</div>
          <div className="grid grid-cols-2 gap-3 mt-3">
            <button onClick={() => setMethod("cod")} className={`border-2 p-4 rounded text-left ${method === "cod" ? "border-black bg-zinc-50" : "border-zinc-200"}`}>
              <div className="font-black text-sm">💵 {t("Cash on Delivery", "الدفع عند الاستلام")}</div>
              <div className="text-xs text-zinc-500">COD - {t("Pay when you receive", "ادفع عند الاستلام")}</div>
            </button>
            <button onClick={() => setMethod("paymob")} className={`border-2 p-4 rounded text-left ${method === "paymob" ? "border-black bg-zinc-50" : "border-zinc-200"}`}>
              <div className="font-black text-sm">💳 X-Pay / Paymob</div>
              <div className="text-xs text-zinc-500">Card / Wallet / Installments</div>
            </button>
          </div>
        </div>

        <div className="bg-zinc-50 p-4 text-sm space-y-1">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatEGP(total)}</span></div>
          <div className="flex justify-between font-black text-base border-t pt-2"><span>{t("Total to Pay", "الإجمالي")}</span><span>{formatEGP(grand)}</span></div>
          <div className="text-xs text-zinc-500">{method === "cod" ? t("You pay in EGP on delivery. No extra fees.", "الدفع بالجنيه عند الاستلام بدون رسوم.") : t("Redirect to Paymob secure checkout.", "تحويل لبوابة Paymob الآمنة.")}</div>
        </div>

        <button onClick={() => { clear(); setDone(true); }} className="bg-black text-white py-3.5 rounded-full font-bold">{method === "cod" ? t("Place Order - COD", "تأكيد الطلب - COD") : t("Pay with X-Pay", "ادفع بـ X-Pay")}</button>
        <div className="text-xs text-center text-zinc-500">By placing order you agree to 14-day returns. Ships in 1-2 days across Egypt.</div>
      </div>
    </div>
  );
}
