import type { Metadata } from "next";
export const metadata: Metadata = { title: "Contact — MUSE WEAR", description: "Contact MUSE WEAR Cairo, Egypt." };
export default function ContactPage() {
  return (
    <div className="max-w-[800px] mx-auto px-4 py-10">
      <h1 className="text-2xl font-black">Contact</h1>
      <p className="text-sm text-zinc-500">We’d love to help — COD, Paymob, sizing, orders.</p>
      <div className="mt-6 grid gap-4">
        <a href="https://wa.me/201000000000" target="_blank" className="bg-green-600 text-white p-4 rounded-2xl flex justify-between items-center hover:bg-green-700"><span className="font-bold">WhatsApp — Customer Support</span><span className="bg-white text-green-600 px-3 py-1 rounded-full text-xs font-black">Chat</span></a>
        <div className="bg-white border border-zinc-200 p-6 rounded-2xl">
          <div className="font-bold">MUSE WEAR — Cairo, Egypt</div>
          <div className="text-sm text-zinc-600 mt-1">Email: support@muse-wear.pages.dev (placeholder — update with real)</div>
          <div className="text-sm text-zinc-600">Hours: 10am–10pm EET</div>
        </div>
      </div>
    </div>
  );
}
