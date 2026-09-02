"use client";
import { products as demoProducts, formatEGP } from "@/lib/products";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

type DbProduct = {
  id: string;
  nameEn: string;
  brand: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  isNew?: boolean;
  isMuseMade?: boolean;
  sku?: string;
  stockQty?: number;
};

export default function AdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "catalog" | "ads" | "orders">("catalog");
  const [dbProducts, setDbProducts] = useState<DbProduct[] | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // form state
  const [title, setTitle] = useState("");
  const [brand, setBrand] = useState("MUSE WEAR");
  const [category, setCategory] = useState("men");
  const [price, setPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [sku, setSku] = useState("");
  const [stock, setStock] = useState("10");
  const [isMuse, setIsMuse] = useState(true);
  const [images, setImages] = useState<string[]>([]);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { if (!loading && user?.role !== "admin") router.replace(user ? "/account" : "/login"); }, [loading, user, router]);
  if (loading || user?.role !== "admin") return <div className="max-w-[600px] mx-auto px-4 py-16 text-center text-zinc-500">Checking admin access…</div>;

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) setDbProducts(data.products);
      else setDbProducts(null);
    } catch { setDbProducts(null); }
  };
  useEffect(() => { fetchProducts(); }, []);

  const displayProducts: DbProduct[] = dbProducts ?? (demoProducts as unknown as DbProduct[]);
  const museCount = displayProducts.filter((p) => p.isMuseMade).length;
  const brandCount = displayProducts.filter((p) => !p.isMuseMade).length;

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (result) setImages((prev) => [...prev, result].slice(0, 6));
      };
      reader.readAsDataURL(file);
    });
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeImage = (idx: number) => setImages((prev) => prev.filter((_, i) => i !== idx));

  const resetForm = () => {
    setTitle(""); setBrand("MUSE WEAR"); setCategory("men"); setPrice(""); setSalePrice(""); setSku(""); setStock("10"); setIsMuse(true); setImages([]); setFormError("");
  };

  const handleAdd = async () => {
    setFormError("");
    if (!title.trim()) return setFormError("Product name is required");
    if (!price || Number(price) <= 0) return setFormError("Valid price is required");
    if (!sku.trim()) return setFormError("SKU is required");
    if (images.length === 0) return setFormError("Upload at least one photo");
    setSaving(true);
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          brand,
          categoryId: null,
          price: Number(price),
          salePrice: salePrice ? Number(salePrice) : null,
          sku: sku.trim(),
          stockQty: Number(stock) || 0,
          images,
          colors: [],
          sizes: [],
          isNew: false,
          isMuseMade: isMuse,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save");
      setShowAdd(false);
      resetForm();
      fetchProducts();
    } catch (e: any) {
      setFormError(e.message || "Failed to save product");
    } finally { setSaving(false); }
  };

  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black tracking-tight">MUSE WEAR — Admin</h1>
        <span className="text-xs bg-black text-white px-3 py-1.5 rounded-full font-bold">CAIRO • EGP • {displayProducts.length} PRODUCTS</span>
      </div>

      <div className="flex gap-2 mt-6 border-b border-zinc-200 overflow-x-auto no-scrollbar">
        {[
          ["overview", "Overview"],
          ["catalog", "Products"],
          ["orders", "Orders"],
          ["ads", "Marketing"],
        ].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id as never)} className={`px-5 py-3 text-sm font-bold border-b-2 whitespace-nowrap transition ${tab === id ? "border-black text-black" : "border-transparent text-zinc-500 hover:text-black"}`}>{label}</button>
        ))}
      </div>

      {tab === "overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            ["Total Products", displayProducts.length.toString()],
            ["MUSE Manufactured", museCount.toString()],
            ["Multibrand", brandCount.toString()],
            ["Orders Today", "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
              <div className="text-xs text-zinc-500 font-semibold uppercase tracking-wide">{k}</div>
              <div className="text-2xl font-black mt-1">{v}</div>
            </div>
          ))}
          <div className="col-span-2 md:col-span-4 bg-white border border-zinc-200 rounded-2xl p-6 mt-2">
            <h3 className="font-bold">How this connects to your factory</h3>
            <p className="text-sm text-zinc-600 mt-1">Tag products with <span className="bg-black text-white px-1.5 py-0.5 text-xs rounded">MUSE Made</span> to surface them. Floating cards update instantly on the storefront.</p>
          </div>
        </div>
      )}

      {tab === "catalog" && (
        <div className="mt-6">
          {/* header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm">
            <div>
              <h3 className="font-black text-lg">Products</h3>
              <p className="text-sm text-zinc-500">Floating cards • click to edit • drag to reorder photos</p>
            </div>
            <button onClick={() => setShowAdd(true)} className="bg-black text-white px-5 py-3 rounded-full text-sm font-black hover:bg-zinc-800 hover:scale-[1.02] transition flex items-center gap-2 self-start sm:self-auto">
              <span className="text-lg leading-none">+</span> Add Product
            </button>
          </div>

          {/* floating cards grid */}
          {displayProducts.length === 0 ? (
            <div className="mt-8 bg-white border border-dashed border-zinc-300 rounded-2xl p-12 text-center">
              <div className="mx-auto w-14 h-14 rounded-2xl bg-zinc-100 grid place-items-center text-xl">🛍️</div>
              <h4 className="font-bold mt-4">No products yet</h4>
              <p className="text-sm text-zinc-500 mt-1">Add your first product — upload photos, set price in EGP.</p>
              <button onClick={() => setShowAdd(true)} className="mt-4 bg-black text-white px-6 py-2.5 rounded-full text-sm font-bold">Add Product</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 mt-6">
              {displayProducts.map((p) => (
                <div key={p.id} className="group bg-white rounded-2xl border border-zinc-100 shadow-[0_2px_14px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] hover:-translate-y-1.5 transition-all duration-300 overflow-hidden flex flex-col">
                  <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.image} alt={p.nameEn} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {p.isMuseMade && <span className="bg-black text-white text-[10px] font-black px-2.5 py-1 rounded-full tracking-wide">MUSE Factory</span>}
                      {p.isNew && <span className="bg-white text-black text-[10px] font-black px-2.5 py-1 rounded-full shadow">NEW</span>}
                    </div>
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                      <span className="bg-white/90 backdrop-blur text-xs font-bold px-2.5 py-1 rounded-full border">{p.brand}</span>
                      <span className="bg-black text-white text-xs font-black px-2.5 py-1 rounded-full">{formatEGP(p.price)}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h4 className="font-bold leading-snug line-clamp-2">{p.nameEn}</h4>
                    <div className="text-xs text-zinc-500 mt-1">{p.category || "—"} • SKU: {p.sku || p.id.slice(0, 6)}</div>
                    {p.originalPrice && <div className="text-xs line-through text-zinc-400 mt-1">{formatEGP(p.originalPrice)}</div>}
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setShowAdd(true)} className="flex-1 border border-zinc-200 rounded-full py-2 text-xs font-bold hover:border-black hover:bg-black hover:text-white transition">Edit</button>
                      <button className="px-3 border border-zinc-200 rounded-full text-xs font-bold hover:border-red-300 hover:text-red-600 transition">⋯</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Meta sync card */}
          <div className="mt-8 bg-white border border-zinc-200 rounded-2xl p-6">
            <h3 className="font-black">Meta Catalog Sync</h3>
            <p className="text-sm text-zinc-600 mt-1">Push floating catalog to Facebook & Instagram Shop. Prices in EGP, availability from stock.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button className="bg-black text-white px-5 py-2.5 rounded-full font-bold text-sm">Sync → Meta Catalog</button>
              <button className="border border-zinc-300 px-5 py-2.5 rounded-full font-bold text-sm">Download CSV</button>
            </div>
          </div>

          {/* Add Product Modal */}
          {showAdd && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
              <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !saving && setShowAdd(false)} />
              <div className="relative bg-white w-full sm:max-w-2xl max-h-[92vh] sm:rounded-2xl rounded-t-2xl overflow-hidden shadow-2xl flex flex-col animate-[scaleIn_0.2s_ease]">
                <div className="px-6 py-5 border-b flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-black">Add Product</h3>
                    <p className="text-xs text-zinc-500">Floating card will appear instantly • Upload up to 6 photos</p>
                  </div>
                  <button onClick={() => !saving && setShowAdd(false)} className="w-9 h-9 grid place-items-center rounded-full border hover:bg-zinc-50">✕</button>
                </div>

                <div className="overflow-y-auto p-6 space-y-5">
                  {formError && <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2.5 rounded-xl">{formError}</div>}

                  {/* Upload zone */}
                  <div>
                    <div className="text-xs font-black tracking-wide">PHOTOS *</div>
                    <div
                      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={onDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`mt-2 border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition ${dragOver ? "border-black bg-zinc-50" : "border-zinc-300 hover:border-black hover:bg-zinc-50/50"}`}
                    >
                      <div className="mx-auto w-12 h-12 rounded-full bg-black text-white grid place-items-center text-xl">↑</div>
                      <div className="font-bold mt-3">Click to upload or drag & drop</div>
                      <div className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP • up to 6 • first = cover</div>
                      <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />
                    </div>

                    {images.length > 0 && (
                      <div className="grid grid-cols-3 gap-3 mt-4">
                        {images.map((src, idx) => (
                          <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden border bg-zinc-100">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={src} alt={`upload ${idx}`} className="w-full h-full object-cover" />
                            {idx === 0 && <span className="absolute top-2 left-2 bg-black text-white text-[10px] font-black px-2 py-1 rounded-full">COVER</span>}
                            <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 w-7 h-7 bg-white/90 backdrop-blur rounded-full grid place-items-center text-xs hover:bg-red-500 hover:text-white transition">✕</button>
                          </div>
                        ))}
                        <button onClick={() => fileRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-zinc-300 grid place-items-center hover:border-black transition">
                          <span className="text-2xl">+</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-xs font-black tracking-wide">PRODUCT NAME *</label>
                      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="MUSE Oversized Heavy Tee - Black" className="mt-1 w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:border-black focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-black tracking-wide">BRAND</label>
                      <select value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-1 w-full border border-zinc-300 rounded-xl px-3 py-3 text-sm"><option>MUSE WEAR</option><option>Nike</option><option>Adidas</option><option>Puma</option><option>Levi&apos;s</option><option>Zara</option></select>
                    </div>
                    <div>
                      <label className="text-xs font-black tracking-wide">CATEGORY</label>
                      <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1 w-full border border-zinc-300 rounded-xl px-3 py-3 text-sm"><option value="men">Men</option><option value="women">Women</option><option value="accessories">Accessories</option></select>
                    </div>
                    <div>
                      <label className="text-xs font-black tracking-wide">PRICE (EGP) *</label>
                      <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="899" className="mt-1 w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:border-black focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-black tracking-wide">SALE PRICE (optional)</label>
                      <input value={salePrice} onChange={(e) => setSalePrice(e.target.value)} type="number" placeholder="1199" className="mt-1 w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:border-black focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-black tracking-wide">SKU *</label>
                      <input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="MW-001" className="mt-1 w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:border-black focus:outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-black tracking-wide">STOCK QTY</label>
                      <input value={stock} onChange={(e) => setStock(e.target.value)} type="number" className="mt-1 w-full border border-zinc-300 rounded-xl px-4 py-3 text-sm focus:border-black focus:outline-none" />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 p-3 border rounded-xl cursor-pointer hover:bg-zinc-50">
                    <input type="checkbox" checked={isMuse} onChange={(e) => setIsMuse(e.target.checked)} className="w-4 h-4" />
                    <span className="text-sm font-bold">MUSE Factory (show MUSE badge on card)</span>
                  </label>
                </div>

                <div className="p-4 border-t bg-zinc-50 flex gap-3">
                  <button onClick={() => { if (!saving) { setShowAdd(false); resetForm(); } }} disabled={saving} className="flex-1 border border-zinc-300 bg-white rounded-full py-3 font-bold hover:border-black disabled:opacity-50">Cancel</button>
                  <button onClick={handleAdd} disabled={saving} className="flex-[1.3] bg-black text-white rounded-full py-3 font-black hover:bg-zinc-800 disabled:opacity-60">{saving ? "Saving…" : "Save Product"}</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="mt-6 bg-white border border-zinc-200 rounded-2xl p-12 text-center text-zinc-500">
          Orders • COD vs Paymob • governorate breakdown — connect D1 orders
        </div>
      )}

      {tab === "ads" && (
        <div className="mt-6 grid md:grid-cols-2 gap-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h3 className="font-black">Create Campaign</h3>
            <div className="mt-4 space-y-3">
              <input placeholder="Campaign — MUSE Summer Drop" className="w-full border border-zinc-300 rounded-xl px-3 py-3 text-sm" />
              <button className="w-full bg-blue-600 text-white py-3 rounded-full font-bold">Create in Meta Ads Manager</button>
            </div>
          </div>
          <div className="bg-white border border-zinc-200 rounded-2xl p-6">
            <h3 className="font-black">Automations</h3>
            <ul className="mt-3 space-y-2 text-sm"><li className="border rounded-xl p-3 flex justify-between">Abandoned cart → IG DM <span className="text-green-600 font-bold">ON</span></li></ul>
          </div>
        </div>
      )}
    </div>
  );
}
