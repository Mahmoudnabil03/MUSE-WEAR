"use client";
import Link from "next/link";
import { Product, formatEGP } from "@/lib/products";
import { useLang, useCart, useWishlist } from "@/lib/store";

export default function ProductCard({ p }: { p: Product }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const name = lang === "ar" ? p.nameAr : p.nameEn;
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  return (
    <div className="group bg-white border border-zinc-100 hover:border-zinc-300 transition overflow-hidden flex flex-col">
      <Link href={`/product/${p.id}`} className="relative block aspect-[3/4] overflow-hidden bg-zinc-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
        {p.isNew && <span className="absolute top-2 left-2 bg-white text-black text-[10px] font-bold px-2 py-1 tracking-wide">{t("NEW IN", "جديد")}</span>}
        {p.isMuseMade && <span className="absolute top-2 right-2 bg-black text-white text-[10px] font-bold px-2 py-1">MUSE</span>}
        {discount > 0 && <span className="absolute bottom-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1">-{discount}%</span>}
        <button
          onClick={(e) => { e.preventDefault(); toggle(p.id); }}
          className={`absolute top-2 right-2 ${p.isMuseMade ? "top-8" : ""} w-8 h-8 grid place-items-center rounded-full bg-white/90 backdrop-blur border text-lg ${has(p.id) ? "text-red-600" : "text-zinc-700"}`}
        >
          {has(p.id) ? "♥" : "♡"}
        </button>
      </Link>
      <div className="p-3 flex flex-col flex-1">
        <div className="text-[11px] font-bold tracking-wide text-zinc-500">{p.brand}</div>
        <Link href={`/product/${p.id}`} className="text-sm leading-snug line-clamp-2 min-h-[2.5rem] hover:underline">
          {name}
        </Link>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="font-bold text-sm">{formatEGP(p.price)}</span>
          {p.originalPrice && <span className="text-xs line-through text-zinc-400">{formatEGP(p.originalPrice)}</span>}
        </div>
        <div className="mt-2 flex gap-1.5">
          {p.colors.slice(0, 4).map((c) => (
            <span key={c} className="w-4 h-4 rounded-full border border-zinc-200" style={{ background: c }} />
          ))}
        </div>
        <button onClick={() => add(p, p.sizes?.[0])} className="mt-3 w-full bg-black text-white text-sm font-semibold py-2 rounded-full hover:bg-zinc-800">
          {t("Add to Bag", "أضف للحقيبة")}
        </button>
      </div>
    </div>
  );
}
