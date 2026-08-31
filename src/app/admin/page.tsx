"use client";
import { products, formatEGP } from "@/lib/products";
import { useState } from "react";

export default function AdminPage() {
  const [tab, setTab] = useState<"overview" | "catalog" | "ads" | "orders">("overview");
  const museCount = products.filter((p) => p.isMuseMade).length;
  const brandCount = products.filter((p) => !p.isMuseMade).length;

  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">MUSE WEAR — Admin Dashboard</h1>
        <span className="text-xs bg-black text-white px-3 py-1 rounded-full font-bold">CAIRO, EGYPT • EGP</span>
      </div>

      <div className="flex gap-2 mt-6 border-b border-zinc-200 overflow-x-auto no-scrollbar">
        {[
          ["overview", "Overview"],
          ["catalog", "Products & Meta Catalog"],
          ["ads", "Marketing & Ads"],
          ["orders", "Orders"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as never)} className={`px-4 py-3 text-sm font-bold border-b-2 whitespace-nowrap ${tab === id ? "border-black" : "border-transparent text-zinc-500"}`}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            ["Total Products", products.length.toString()],
            ["MUSE Manufactured", museCount.toString()],
            ["Multibrand", brandCount.toString()],
            ["Orders Today", "— connect DB"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white border border-zinc-200 p-5">
              <div className="text-xs text-zinc-500 font-semibold">{k}</div>
              <div className="text-2xl font-black mt-1">{v}</div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 bg-white border border-zinc-200 p-6 mt-2">
            <h3 className="font-bold">How this connects to your factory</h3>
            <p className="text-sm text-zinc-600 mt-1">Tag products with <span className="bg-black text-white px-1.5 py-0.5 text-xs">MUSE Made</span> to surface them in &quot;MUSE Manufactured&quot; slots on homepage. Multibrand products get brand filters (Nike, Adidas...). All sync to Meta.</p>
          </div>
        </div>
      )}

      {tab === "catalog" && (
        <div className="mt-6 space-y-6">
          <div className="bg-white border border-zinc-200 p-6">
            <h3 className="font-black">Meta Catalog Sync (Facebook & Instagram Shop)</h3>
            <p className="text-sm text-zinc-600 mt-1">Pushes your products to Meta Commerce Catalog for IG Shop, FB Shop and Advantage+ campaigns. Mirrors Namshi&apos;s catalog feed.</p>
            <div className="mt-4 grid md:grid-cols-2 gap-3 text-sm">
              <div className="border border-zinc-200 p-3">
                <div className="font-bold">Catalog ID</div>
                <input placeholder="1234567890" className="mt-1 w-full border border-zinc-300 px-3 py-2 rounded" />
                <div className="text-xs text-zinc-500 mt-1">Find in Commerce Manager → Catalog → ID</div>
              </div>
              <div className="border border-zinc-200 p-3">
                <div className="font-bold">System User Token</div>
                <input placeholder="EAA..." type="password" className="mt-1 w-full border border-zinc-300 px-3 py-2 rounded" />
                <div className="text-xs text-zinc-500 mt-1">Graph API token with catalog_management</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm">Sync All Products → Meta Catalog</button>
              <button className="border border-zinc-300 px-5 py-2.5 rounded-full font-bold text-sm">Download CSV Feed (Namshi-format)</button>
              <button className="border border-zinc-300 px-5 py-2.5 rounded-full font-bold text-sm">Preview Pixel Events</button>
            </div>
            <div className="mt-4 bg-zinc-50 border border-zinc-200 p-3 text-xs font-mono">
              POST https://graph.facebook.com/v19.0/{"{catalog_id}"}/products<br />
              Body: {`{name, price: "899 EGP", currency: "EGP", availability: "in stock", image_url, brand, custom_label_0: "MUSE_MADE" }`}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b">
              <h3 className="font-bold">Products</h3>
              <button className="bg-black text-white px-4 py-2 rounded-full text-sm font-bold">+ Add Product</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-zinc-50 text-xs text-zinc-500">
                  <tr><th className="text-left p-3">Product</th><th className="text-left p-3">Brand</th><th className="text-left p-3">Price</th><th className="text-left p-3">Source</th></tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-t">
                      <td className="p-3 font-semibold">{p.nameEn}</td>
                      <td className="p-3">{p.brand}</td>
                      <td className="p-3">{formatEGP(p.price)}</td>
                      <td className="p-3">{p.isMuseMade ? <span className="bg-black text-white px-2 py-0.5 text-xs">MUSE Factory</span> : <span className="border px-2 py-0.5 text-xs">Multibrand</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === "ads" && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200 p-6">
            <h3 className="font-black">Create Campaign - Meta Ads</h3>
            <p className="text-sm text-zinc-600">Launch from MUSE WEAR without leaving dashboard (via Marketing API).</p>
            <div className="mt-4 space-y-3 text-sm">
              <input placeholder="Campaign Name - e.g. MUSE Summer Drop" className="w-full border border-zinc-300 px-3 py-2.5 rounded" />
              <select className="w-full border border-zinc-300 px-3 py-2.5 rounded"><option>Sales - Catalog (Advantage+)</option><option>Traffic</option><option>Engagement</option></select>
              <input placeholder="Daily Budget (EGP) - 500" className="w-full border border-zinc-300 px-3 py-2.5 rounded" />
              <button className="w-full bg-blue-600 text-white py-3 rounded-full font-bold">Create in Meta Ads Manager</button>
            </div>
          </div>
          <div className="bg-white border border-zinc-200 p-6">
            <h3 className="font-black">Automations</h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li className="border border-zinc-200 p-3 flex justify-between">Abandoned cart → IG DM <span className="text-green-600 font-bold">ON</span></li>
              <li className="border border-zinc-200 p-3 flex justify-between">New MUSE drop → Catalog update <span className="text-green-600 font-bold">ON</span></li>
              <li className="border border-zinc-200 p-3 flex justify-between">Post-purchase COD confirm SMS <span className="text-zinc-400">OFF</span></li>
            </ul>
            <div className="mt-4 text-xs text-zinc-500">Connect Pixel ID in settings to enable ROAS tracking: fbq(&apos;track&apos;, &apos;Purchase&apos;)</div>
          </div>
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-6 bg-white border border-zinc-200 p-12 text-center text-zinc-500">
          Orders table — connect Supabase/Prisma. Will show COD vs Paymob split, governorate breakdown, and MUSE vs multibrand mix.
        </div>
      )}
    </div>
  );
}
