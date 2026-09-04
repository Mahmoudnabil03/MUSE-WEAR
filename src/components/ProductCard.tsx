"use client";
import Link from "next/link";
import { Product, formatEGP } from "@/lib/products";
import { useLang, useCart, useWishlist } from "@/lib/store";
import { trackMetaEvent } from "@/lib/meta-pixel";

export default function ProductCard({ p, index = 0 }: { p: Product; index?: number }) {
  const { lang, t } = useLang();
  const { add } = useCart();
  const { toggle, has } = useWishlist();
  const name = lang === "ar" ? p.nameAr : p.nameEn;
  const discount = p.originalPrice ? Math.round((1 - p.price / p.originalPrice) * 100) : 0;

  return (
    <div
      className="group bg-transparent border border-[#40372e] rounded-[12px] overflow-hidden flex flex-col hover-lift hover:border-[#ffedd7]/60 transition-colors duration-300"
      style={{ animation: `fadeInUp 0.6s ease ${index * 60}ms both` }}
    >
      <Link href={`/product/${p.id}`} className="relative block aspect-[3/4] overflow-hidden bg-[#100904]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image} alt={name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]" />
        {p.isNew && <span className="absolute top-2 left-2 bg-[#ffedd7] text-[#100904] text-[10px] font-medium uppercase px-2 py-1 tracking-normal"> {t("NEW IN", "جديد")} </span>}
        {p.isMuseMade && <span className="absolute top-2 right-2 bg-[#382416] text-[#ffedd7] border border-[#40372e] text-[10px] font-medium uppercase px-2 py-1 tracking-normal">MUSE</span>}
        {discount > 0 && <span className="absolute bottom-2 left-2 text-[12px] font-medium uppercase text-[#dc5000]">-{discount}%</span>}
        <button
          aria-label={has(p.id) ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.preventDefault();
            if (!has(p.id)) {
              trackMetaEvent("AddToWishlist", {
                content_ids: [p.id],
                content_name: p.nameEn,
                content_type: "product",
                currency: "EGP",
                value: p.price,
              });
            }
            toggle(p.id);
          }}
          className={`absolute top-2 w-8 h-8 grid place-items-center rounded-full bg-[#100904]/80 backdrop-blur border border-[#40372e] hover:scale-110 transition text-lg focus:outline-none focus:ring-2 focus:ring-[#ffedd7] text-[#ffedd7] ${p.isMuseMade ? "right-2 top-8" : "right-2"}`}
        >
          <span aria-hidden>{has(p.id) ? "♥" : "♡"}</span>
        </button>
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition duration-300 bg-[#ffedd7] text-[#100904] text-[12px] font-medium uppercase text-center py-2"> {t("QUICK VIEW", "نظرة سريعة")} </div>
      </Link>
      <div className="p-[24px] flex flex-col flex-1 text-left">
        <div className="text-[12px] font-medium uppercase tracking-normal text-[#6c5f51]">{p.brand}</div>
        <Link href={`/product/${p.id}`} className="link-underline !text-[14px] leading-snug line-clamp-2 min-h-[2.5rem] mt-2 text-left">
          {name}
        </Link>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-medium uppercase text-[14px] text-[#ffedd7]">{formatEGP(p.price)}</span>
          {p.originalPrice && <span className="text-xs line-through text-[#6c5f51]">{formatEGP(p.originalPrice)}</span>}
        </div>
        <div className="mt-2 flex gap-1.5">
          {p.colors.slice(0, 4).map((c) => (
            <span key={c} className="w-4 h-4 rounded-full border border-[#40372e]" style={{ background: c }} />
          ))}
        </div>
        <button onClick={() => {
          add(p, p.sizes?.[0]);
          trackMetaEvent("AddToCart", {
            content_ids: [p.id],
            content_name: p.nameEn,
            content_type: "product",
            currency: "EGP",
            value: p.price,
          });
        }} aria-label={`Add ${name} to bag`} className="btn-ghost mt-4 w-full text-center">
          {t("ADD TO BAG", "أضف للحقيبة")}
        </button>
      </div>
    </div>
  );
}
