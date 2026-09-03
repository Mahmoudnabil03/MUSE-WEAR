import type { Metadata } from "next";
export const metadata: Metadata = { title: "Shipping Policy — MUSE WEAR", description: "Shipping across Egypt: Cairo, Alexandria, Giza and all governorates. COD & Paymob." };
export default function ShippingPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-black">Shipping Policy</h1>
      <p className="text-xs text-zinc-500 mt-1">Last updated: Sep 2026 — <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded">Placeholder — pending legal review</span></p>
      <div className="mt-6 prose prose-zinc text-sm leading-relaxed">
        <p>We deliver across Egypt. Cairo, Alexandria & Giza: 1–2 days. Other governorates: 2–4 days.</p>
        <ul className="list-disc pl-5 mt-3"><li>59 EGP to Cairo/Alex/Giza, free over 999 EGP</li><li>75 EGP to other governorates, free over 1499 EGP</li><li>Configurable in Admin → Shipping (shipping_zones table)</li></ul>
        <p className="mt-4 text-zinc-600">For support: WhatsApp +20 1XX XXX XXXX or <a href="/contact" className="underline">Contact us</a>.</p>
      </div>
    </div>
  );
}
