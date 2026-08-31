"use client";
import { useCart, useLang } from "@/lib/store";
import { formatEGP } from "@/lib/products";
import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const { total, clear, items } = useCart();
  const { t } = useLang();
  const [method, setMethod] = useState<"cod" | "paymob">("cod");
  const [done, setDone] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [gov, setGov] = useState("Cairo");
  const [err, setErr] = useState("");

  if (items.length === 0 && !done) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black">{t("Your cart is empty", "عربتك فارغة")}</h1>
        <Link href="/" className="inline-block mt-4 bg-black text-white px-6 py-3 rounded-full font-bold">{t("Continue Shopping", "تابع التسوق")}</Link>
      </div>
    );
  }

  if (done) return <div className="max-w-[600px] mx-auto px-4 py-16 text-center"><div className="text-5xl">✓</div><h1 className="text-2xl font-black mt-4">{t("Order Confirmed!", "تم تأكيد الطلب!")}</h1><p className="text-zinc-600 mt-2">{method === "cod" ? t("Pay on delivery across Egypt. You will get an SMS.", "الدفع عند الاستلام في كل مصر. ستصلك رسالة.") : t("Paymob payment link sent.", "تم إرسال رابط Paymob.")}</p><Link href="/" className="inline-block mt-6 border border-black px-6 py-2 rounded-full font-bold text-sm">{t("Continue Shopping", "تابع التسوق")}</Link></div>;

  const grand = total > 999 ? total : total + 59;

  const onPlace = () => {
    if (!name.trim() || !phone.trim() || !address.trim()) { setErr(t("Please fill all delivery fields", "يرجى ملء جميع حقول التوصيل")); return; }
    if (!/^01[0-2,5][0-9]{8}$/.test(phone.replace(/\s/g, ""))) { setErr(t("Enter a valid Egyptian phone (01xxxxxxxxx)", "أدخل رقم مصري صحيح")); return; }
    setErr("");
    clear();
    setDone(true);
  };

  return (
    <div className="max-w-[800px] mx-auto px-4 mt-6">
      {/* Stepper - Jakob: familiar checkout progress */}
      <div className="flex items-center gap-2 text-xs font-bold">
        <Link href="/cart" className="text-zinc-400 hover:text-black">{t("Cart", "العربة")}</Link><span>›</span><span className="bg-black text-white px-2 py-0.5 rounded">2. {t("Details & Payment", "التفاصيل والدفع")}</span><span>›</span><span className="text-zinc-400">{t("Confirmation", "التأكيد")}</span>
      </div>
      <h1 className="text-2xl font-black mt-3">{t("Checkout", "الدفع")}</h1>
      {/* Breadcrumb */}
      <div className="text-xs text-zinc-500 mt-1"><Link href="/" className="hover:underline">{t("Home", "الرئيسية")}</Link> › <Link href="/cart" className="hover:underline">{t("Cart", "العربة")}</Link> › {t("Checkout", "الدفع")}</div>

      <div className="mt-6 bg-white border border-zinc-200 p-6 grid gap-4 rounded-2xl">
        {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{err}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label htmlFor="name" className="text-xs font-bold tracking-wide">{t("Full Name", "الاسم الكامل")} *</label>
            <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Mahmoud Nabil", "محمود نبيل")} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded focus:border-black focus:outline-none" required aria-required="true" />
          </div>
          <div>
            <label htmlFor="phone" className="text-xs font-bold tracking-wide">{t("Phone (Egypt)", "رقم الهاتف")} *</label>
            <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded focus:border-black focus:outline-none" required />
          </div>
        </div>
        <div>
          <label htmlFor="address" className="text-xs font-bold tracking-wide">{t("Street Address", "عنوان الشارع")} *</label>
          <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("Building, street, area...", "المبنى، الشارع، المنطقة...")} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded focus:border-black focus:outline-none" required />
        </div>
        <div>
          <label htmlFor="gov" className="text-xs font-bold tracking-wide">{t("Governorate", "المحافظة")}</label>
          <select id="gov" value={gov} onChange={(e) => setGov(e.target.value)} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded focus:border-black focus:outline-none">
            <option value="Cairo">Cairo - القاهرة</option><option value="Alexandria">Alexandria - الإسكندرية</option><option value="Giza">Giza - الجيزة</option><option value="Other">Other - باقي المحافظات</option>
          </select>
        </div>

        <div className="border-t pt-4">
          <div className="font-bold text-sm">{t("Payment Method", "طريقة الدفع")}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            <button type="button" onClick={() => setMethod("cod")} aria-pressed={method === "cod"} className={`border-2 p-4 rounded text-left focus:outline-none focus:ring-2 focus:ring-black ${method === "cod" ? "border-black bg-zinc-50" : "border-zinc-200"}`}>
              <div className="font-black text-sm">💵 {t("Cash on Delivery", "الدفع عند الاستلام")}</div>
              <div className="text-xs text-zinc-500">COD - {t("Pay when you receive", "ادفع عند الاستلام")} • {t("No extra fees", "بدون رسوم")}</div>
            </button>
            <button type="button" onClick={() => setMethod("paymob")} aria-pressed={method === "paymob"} className={`border-2 p-4 rounded text-left focus:outline-none focus:ring-2 focus:ring-black ${method === "paymob" ? "border-black bg-zinc-50" : "border-zinc-200"}`}>
              <div className="font-black text-sm">💳 X-Pay / Paymob</div>
              <div className="text-xs text-zinc-500">Card / Wallet / Installments • EGP</div>
            </button>
          </div>
        </div>

        <div className="bg-zinc-50 p-4 text-sm space-y-1 rounded">
          <div className="flex justify-between"><span>{t("Subtotal", "المجموع")}</span><span>{formatEGP(total)}</span></div>
          <div className="flex justify-between"><span>{t("Shipping to", "شحن إلى")} {gov}</span><span className="text-green-700 font-semibold">{total > 999 ? t("FREE", "مجاني") : formatEGP(59)}</span></div>
          <div className="border-t pt-2 flex justify-between font-black text-base"><span>{t("Total to Pay", "الإجمالي")}</span><span>{formatEGP(grand)}</span></div>
          <div className="text-xs text-zinc-500">{method === "cod" ? t("You pay in EGP on delivery.", "الدفع بالجنيه عند الاستلام.") : t("Redirect to Paymob secure checkout.", "تحويل لبوابة Paymob الآمنة.")}</div>
        </div>

        <button onClick={onPlace} className="bg-black text-white py-3.5 rounded-full font-bold hover:bg-zinc-800 transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">{method === "cod" ? t("Place Order - COD", "تأكيد الطلب - COD") : t("Pay with X-Pay", "ادفع بـ X-Pay")}</button>
        <div className="text-xs text-center text-zinc-500">{t("By placing order you agree to 14-day returns. Ships in 1-2 days across Egypt.", "بالطلب توافق على إرجاع 14 يوم. الشحن 1-2 يوم لكل مصر.")}</div>
      </div>
    </div>
  );
}
