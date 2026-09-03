import type { Metadata } from "next";
export const metadata: Metadata = { title: "Returns & Exchanges — MUSE WEAR", description: "14-day returns across Egypt." };
export default function ReturnsPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-black">Returns & Exchanges</h1>
      <p className="text-xs text-zinc-500 mt-1">14-day policy — <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Placeholder — pending legal review</span></p>
      <div className="mt-6 text-sm leading-relaxed space-y-3">
        <p>14 days from delivery for returns/exchange if unworn, unwashed, tags attached.</p>
        <ul className="list-disc pl-5"><li>Customer pays return shipping unless defect</li><li>Refunds to original method within 7 days</li><li>Track via <a href="/track" className="underline">Order Tracking</a></li></ul>
      </div>
    </div>
  );
}
