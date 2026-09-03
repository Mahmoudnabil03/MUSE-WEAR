"use client";
import { useState } from "react";
import { useLang } from "@/lib/store";
import { formatEGP } from "@/lib/products";
import Link from "next/link";

const STEPS = ["pending","confirmed","processing","shipped","out_for_delivery","delivered"] as const;

export default function TrackPage() {
  const { t } = useLang();
  const [orderId, setOrderId] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [data, setData] = useState<{ order: Record<string, unknown>; items: Record<string, unknown>[] } | null>(null);

  const onTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const res = await fetch(`/api/orders/track?orderId=${encodeURIComponent(orderId.trim())}&phone=${encodeURIComponent(phone.trim())}`);
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Not found");
      setData(j);
    } catch (e: unknown) { setErr(e instanceof Error ? e.message : "Failed"); setData(null); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-[600px] mx-auto px-4 mt-6">
      <h1 className="text-2xl font-black">{t("Track Order", "تتبع الطلب")}</h1>
      <p className="text-sm text-zinc-500">{t("Enter order number and phone", "أدخل رقم الطلب والهاتف")}</p>
      <form onSubmit={onTrack} className="mt-6 bg-white border border-zinc-200 rounded-2xl p-6 space-y-3">
        <div>
          <label className="text-xs font-bold">{t("Order Number", "رقم الطلب")} *</label>
          <input value={orderId} onChange={(e)=>setOrderId(e.target.value)} placeholder="MW-..." className="mt-1 w-full border border-zinc-300 rounded-xl px-3 py-3 text-sm focus:border-black focus:outline-none" required />
        </div>
        <div>
          <label className="text-xs font-bold">{t("Phone", "الهاتف")} *</label>
          <input value={phone} onChange={(e)=>setPhone(e.target.value)} placeholder="01xxxxxxxxx" className="mt-1 w-full border border-zinc-300 rounded-xl px-3 py-3 text-sm focus:border-black focus:outline-none" required />
        </div>
        {err && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded">{err}</div>}
        <button disabled={loading} className="w-full bg-black text-white rounded-full py-3 font-bold hover:bg-zinc-800 disabled:opacity-50">{loading? "...": t("Track", "تتبع")}</button>
      </form>

      {data && (
        <div className="mt-6 bg-white border border-zinc-200 rounded-2xl p-6">
          <div className="flex justify-between items-start">
            <div><div className="text-xs text-zinc-500">Order</div><div className="font-black">{String(data.order.id)}</div><div className="text-xs text-zinc-500">{new Date(String(data.order.created_at)).toLocaleDateString()}</div></div>
            <span className="bg-black text-white px-3 py-1 rounded-full text-xs font-bold capitalize">{String(data.order.status).replaceAll("_"," ")}</span>
          </div>
          <div className="mt-4 flex justify-between text-xs">
            {STEPS.map((s, idx) => {
              const currentIdx = STEPS.indexOf(String(data.order.status) as typeof STEPS[number]);
              const done = idx <= currentIdx;
              return <div key={s} className="flex flex-col items-center gap-1 flex-1"><div className={`w-8 h-8 rounded-full grid place-items-center text-xs ${done ? "bg-black text-white" : "bg-zinc-100 text-zinc-400"}`}>{done?"✓":"○"}</div><span className={`text-[10px] text-center capitalize ${done?"font-bold":"text-zinc-400"}`}>{s.replaceAll("_"," ")}</span></div>;
            })}
          </div>
          <div className="mt-4 space-y-2 text-sm">
            {data.items.map((it: Record<string,unknown>) => (
              <div key={String(it.id)} className="flex justify-between border-b py-2"><span>{String(it.title)} ×{String(it.quantity)} {String(it.size||"")}</span><span className="font-bold">{formatEGP(Number(it.unit_price))}</span></div>
            ))}
            <div className="flex justify-between font-black pt-2"><span>Total</span><span>{formatEGP(Number(data.order.total))}</span></div>
          </div>
          <Link href="/" className="block text-center mt-4 border border-black rounded-full py-2 text-sm font-bold hover:bg-black hover:text-white">Continue Shopping</Link>
        </div>
      )}
    </div>
  );
}
