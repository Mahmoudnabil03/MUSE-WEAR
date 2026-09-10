"use client";
import { useCart, useLang } from "@/lib/store";
import { formatEGP } from "@/lib/products";
import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { trackMetaEvent } from "@/lib/meta-pixel";
import { Suspense } from "react";

function CheckoutInner() {
  const { total, clear, items } = useCart();
  const { t } = useLang();
  const sp = useSearchParams();
  const initialCoupon = sp.get("coupon") || "";
  const [method, setMethod] = useState<"cod" | "paymob">("cod");
  const [done, setDone] = useState<{ orderId: string } | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [building, setBuilding] = useState("");
  const [floor, setFloor] = useState("");
  const [apartment, setApartment] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [gov, setGov] = useState("Cairo");
  const [coupon, setCoupon] = useState(initialCoupon);
  const [discount, setDiscount] = useState(0);
  const [couponMsg, setCouponMsg] = useState(initialCoupon ? `${initialCoupon} applied` : "");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState("");
  const [shipping, setShipping] = useState(59);
  const [loading, setLoading] = useState(false);
  const placingOrder = useRef(false);

  // Fetch shipping + recompute totals
  useEffect(() => {
    const freeThreshold = gov === "Other" ? 1499 : 999;
    const base = gov === "Other" ? 75 : 59;
    setShipping(total >= freeThreshold ? 0 : base);
  }, [gov, total]);

  useEffect(() => {
    if (!initialCoupon) return;
    fetch("/api/discounts/validate", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ code: initialCoupon, subtotal: total }) })
      .then(r=>r.json()).then(j=>{ if(j.valid) setDiscount(j.discount.amount||0); }).catch(()=>{});
  }, [initialCoupon, total]);

  const validateCoupon = async () => {
    if (!coupon.trim()) { setCouponMsg(t("Enter code","أدخل الكود")); return; }
    try {
      const r = await fetch("/api/discounts/validate", { method:"POST", headers:{ "content-type":"application/json" }, body: JSON.stringify({ code: coupon.trim(), subtotal: total }) });
      const j = await r.json();
      if (j.valid) { setDiscount(j.discount.amount||0); setCouponMsg(j.discount.free_shipping? t("Free shipping applied","شحن مجاني"): `${j.discount.code} -${formatEGP(j.discount.amount)}`); }
      else { setDiscount(0); setCouponMsg(j.error||"Invalid"); }
    } catch { setCouponMsg("Failed"); }
  };

  if (items.length === 0 && !done) {
    return (
      <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-black">{t("Your cart is empty", "عربتك فارغة")}</h1>
        <Link href="/" className="inline-block mt-4 bg-black text-white px-6 py-3 rounded-full font-bold">{t("Continue Shopping", "تابع التسوق")}</Link>
      </div>
    );
  }

  if (done) return (
    <div className="max-w-[600px] mx-auto px-4 py-16 text-center">
      <div className="text-5xl">✓</div>
      <h1 className="text-2xl font-black mt-4">{t("Order Confirmed!", "تم تأكيد الطلب!")}</h1>
      <div className="mt-2 bg-zinc-900 text-white inline-block px-4 py-2 rounded-full text-sm font-mono">{done.orderId}</div>
      <p className="text-zinc-600 mt-3 text-sm">{method === "cod" ? t("Pay on delivery. You will get an SMS. Track your order below.", "الدفع عند الاستلام. ستصلك رسالة.") : t("Paymob payment link will be sent to your phone.", "سيتم إرسال رابط Paymob.")}</p>
      <div className="mt-6 flex gap-3 justify-center">
        <Link href={`/track?orderId=${done.orderId}`} className="bg-black text-white px-6 py-3 rounded-full font-bold text-sm">{t("Track Order","تتبع الطلب")}</Link>
        <Link href="/" className="border border-black px-6 py-3 rounded-full font-bold text-sm">{t("Continue Shopping", "تابع التسوق")}</Link>
      </div>
      <div className="mt-6 text-xs text-zinc-500">{t("Need help? WhatsApp +20 1XX XXX XXXX","مساعدة؟ واتساب")}</div>
    </div>
  );

  const subtotal = total;
  const grand = Math.max(0, subtotal + shipping - discount);

  const onPlace = async () => {
    if (placingOrder.current || loading) return;
    if (!name.trim() || !phone.trim() || !address.trim()) { setErr(t("Please fill name, phone, address","يرجى ملء الاسم والهاتف والعنوان")); return; }
    if (!/^01[0-2,5][0-9]{8}$/.test(phone.replace(/\s/g, ""))) { setErr(t("Enter a valid Egyptian phone (01xxxxxxxxx)", "أدخل رقم مصري صحيح")); return; }
    if (email && !/^\S+@\S+\.\S+$/.test(email)) { setErr(t("Invalid email","بريد غير صحيح")); return; }
    placingOrder.current = true;
    setLoading(true); setErr("");
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type":"application/json" },
        body: JSON.stringify({
          customer_name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          address: address.trim(),
          building, floor, apartment, area, city, governorate: gov,
          payment_method: method,
          coupon_code: coupon.trim() || undefined,
           items: items.map((it)=>({ product_id: it.product.id, qty: it.qty, size: it.size || "", color: it.color || "" })),
          notes,
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Failed to create order");
      const eventData = { content_ids: items.map((it)=>it.product.id), content_type: "product", currency: "EGP", num_items: items.reduce((s,it)=>s+it.qty,0), value: j.total || grand };
      trackMetaEvent("AddPaymentInfo", { ...eventData, payment_method: method });
      trackMetaEvent("Purchase", { ...eventData, coupon: coupon.trim() || undefined });
      clear();
      setDone({ orderId: j.orderId });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed");
      placingOrder.current = false;
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-[900px] mx-auto px-4 mt-6 bg-[#000000] text-[#ffffff]">
      <div className="flex items-center gap-2 oryzo-label">
        <Link href="/cart" className="link-underline">{t("CART", "العربة")}</Link><span className="text-[#737373]">›</span><span className="bg-[#171717] border border-[#262626] text-[#ffffff] px-2 py-0.5 rounded-full">2. {t("DETAILS & PAYMENT", "التفاصيل والدفع")}</span><span className="text-[#737373]">›</span><span className="text-[#737373]">{t("CONFIRMATION", "التأكيد")}</span>
      </div>
      <h1 className="oryzo-heading mt-3 text-left">{t("CHECKOUT", "الدفع")}</h1>
      <div className="oryzo-label mt-2 text-[#737373]"><Link href="/" className="link-underline">{t("HOME", "الرئيسية")}</Link> › <Link href="/cart" className="link-underline">{t("CART", "العربة")}</Link> › {t("CHECKOUT", "الدفع")}</div>
      <p className="oryzo-label mt-2 text-[#737373]">{t("GUEST CHECKOUT — NO ACCOUNT REQUIRED.", "دفع كضيف — لا يلزم حساب.")}</p>

      <div className="mt-6 grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="card-oryzo grid gap-4 h-fit">
          {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{err}</div>}
          <div className="font-bold text-sm">{t("Customer", "العميل")}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="name" className="text-xs font-bold tracking-wide">{t("Full Name", "الاسم الكامل")} *</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Mahmoud Nabil", "محمود نبيل")} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" required />
            </div>
            <div>
              <label htmlFor="phone" className="text-xs font-bold tracking-wide">{t("Phone (Egypt)", "رقم الهاتف")} *</label>
              <input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01xxxxxxxxx" inputMode="numeric" className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" required />
            </div>
          </div>
          <div>
            <label htmlFor="email" className="text-xs font-bold tracking-wide">{t("Email (optional, for receipt)", "البريد (اختياري)")}</label>
            <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="you@example.com" className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" />
          </div>

          <div className="font-bold text-sm border-t pt-4">{t("Delivery Address", "عنوان التوصيل")}</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label htmlFor="gov" className="text-xs font-bold tracking-wide">{t("Governorate", "المحافظة")} *</label>
              <select id="gov" value={gov} onChange={(e) => setGov(e.target.value)} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none">
                <option value="Cairo">Cairo - القاهرة</option><option value="Alexandria">Alexandria - الإسكندرية</option><option value="Giza">Giza - الجيزة</option><option value="Other">Other - باقي المحافظات</option>
              </select>
              <div className="text-[11px] text-zinc-500 mt-1">{gov==="Other" ? "2-4 days • 75 EGP, free over 1499" : "1-2 days • 59 EGP, free over 999"}</div>
            </div>
            <div>
              <label htmlFor="city" className="text-xs font-bold tracking-wide">{t("City", "المدينة")}</label>
              <input id="city" value={city} onChange={(e)=>setCity(e.target.value)} placeholder={t("e.g. Nasr City","مثال: مدينة نصر")} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div><label className="text-xs font-bold">{t("Area", "المنطقة")}</label><input value={area} onChange={(e)=>setArea(e.target.value)} placeholder={t("Maadi","المعادي")} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" /></div>
            <div><label className="text-xs font-bold">{t("Building", "المبنى")}</label><input value={building} onChange={(e)=>setBuilding(e.target.value)} placeholder="12" className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" /></div>
            <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-bold">{t("Floor","الدور")}</label><input value={floor} onChange={(e)=>setFloor(e.target.value)} placeholder="3" className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" /></div><div><label className="text-xs font-bold">{t("Apt","الشقة")}</label><input value={apartment} onChange={(e)=>setApartment(e.target.value)} placeholder="12" className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" /></div></div>
          </div>
          <div>
            <label htmlFor="address" className="text-xs font-bold tracking-wide">{t("Street Address", "عنوان الشارع")} *</label>
            <input id="address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t("Building, street, area...", "المبنى، الشارع، المنطقة...")} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" required />
          </div>
          <div>
            <label className="text-xs font-bold">{t("Delivery Notes","ملاحظات")}</label><textarea value={notes} onChange={(e)=>setNotes(e.target.value)} placeholder={t("Leave at reception, call before delivery","اتركه في الاستقبال")} rows={2} className="mt-1 w-full border border-zinc-300 px-3 py-2.5 text-sm rounded-xl focus:border-black focus:outline-none" />
          </div>

          <div className="border-t pt-4">
            <div className="font-bold text-sm">{t("Payment Method", "طريقة الدفع")}</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <button type="button" onClick={() => setMethod("cod")} aria-pressed={method === "cod"} className={`border-2 p-4 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-black ${method === "cod" ? "border-black bg-zinc-50" : "border-zinc-200"}`}>
                <div className="font-black text-sm">💵 {t("Cash on Delivery", "الدفع عند الاستلام")}</div>
                <div className="text-xs text-zinc-500">COD - {t("Pay when you receive", "ادفع عند الاستلام")} • {t("No extra fees", "بدون رسوم")}</div>
              </button>
              <button type="button" onClick={() => setMethod("paymob")} aria-pressed={method === "paymob"} className={`border-2 p-4 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-black ${method === "paymob" ? "border-black bg-zinc-50" : "border-zinc-200"}`}>
                <div className="font-black text-sm">💳 X-Pay / Paymob</div>
                <div className="text-xs text-zinc-500">Card / Wallet / Installments • EGP</div>
              </button>
            </div>
          </div>
        </div>

        <div className="card-oryzo h-fit sticky top-[160px]">
          <h3 className="oryzo-heading-sm text-left">{t("ORDER SUMMARY","ملخص الطلب")}</h3>
          <div className="mt-3 space-y-1 text-sm max-h-[180px] overflow-y-auto">
            {items.map((it)=>(
              <div key={`${it.product.id}-${it.size}`} className="flex justify-between text-xs"><span className="truncate pr-2">{it.product.nameEn} ×{it.qty} {it.size?`(${it.size})`:""}</span><span className="font-bold shrink-0">{formatEGP(it.product.price*it.qty)}</span></div>
            ))}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={coupon} onChange={(e)=>setCoupon(e.target.value.toUpperCase())} placeholder="WELCOME10" aria-label="Coupon" className="flex-1 border border-zinc-300 rounded-full px-3 py-2 text-sm uppercase focus:border-black focus:outline-none" />
            <button onClick={validateCoupon} className="border border-black px-4 rounded-full text-sm font-bold hover:bg-black hover:text-white">{t("Apply","تطبيق")}</button>
          </div>
          {couponMsg && <div className={`text-xs mt-1 ${couponMsg.includes("Invalid")?"text-red-600":"text-green-600"}`}>{couponMsg}</div>}
          <div className="mt-4 bg-zinc-50 p-4 text-sm space-y-1 rounded-xl">
            <div className="flex justify-between"><span>{t("Subtotal", "المجموع")}</span><span>{formatEGP(subtotal)}</span></div>
            <div className="flex justify-between"><span>{t("Shipping to", "شحن إلى")} {gov}</span><span className="text-green-700 font-semibold">{shipping===0? t("FREE","مجاني"): formatEGP(shipping)}</span></div>
            {discount>0 && <div className="flex justify-between text-green-600"><span>{t("Discount","الخصم")}</span><span>-{formatEGP(discount)}</span></div>}
            <div className="border-t pt-2 flex justify-between font-black text-base"><span>{t("Total to Pay", "الإجمالي")}</span><span>{formatEGP(grand)}</span></div>
            <div className="text-xs text-zinc-500">{method === "cod" ? t("You pay in EGP on delivery.", "الدفع بالجنيه عند الاستلام.") : t("Redirect to Paymob secure checkout.", "تحويل لبوابة Paymob الآمنة.")}</div>
          </div>

          <button onClick={onPlace} disabled={loading} className="btn-pill mt-4 w-full disabled:opacity-50">{loading? t("PLACING…","جاري...") : method === "cod" ? t("PLACE ORDER - COD", "تأكيد الطلب - COD") : t("PAY WITH X-PAY", "ادفع بـ X-Pay")}</button>
          <div className="text-xs text-center text-zinc-500 mt-2">{t("By placing order you agree to 14-day returns. Ships in 1-2 days across Egypt.", "بالطلب توافق على إرجاع 14 يوم. الشحن 1-2 يوم لكل مصر.")}</div>
          <div className="mt-3 text-xs text-center"><Link href="/track" className="underline">{t("Track existing order","تتبع طلب موجود")}</Link></div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <Suspense fallback={<div className="max-w-[800px] mx-auto px-4 py-12 text-center text-zinc-500">Loading…</div>}><CheckoutInner /></Suspense>;
}
