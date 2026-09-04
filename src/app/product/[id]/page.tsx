import { products, formatEGP } from "@/lib/products";
import ProductClient from "./client";
import type { Metadata } from "next";

export function generateStaticParams() {
  if (products.length === 0) return [{ id: "placeholder" }];
  return products.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  if (!p) return { title: "Not found — MUSE WEAR" };
  const title = `${p.nameEn} — ${p.brand} | MUSE WEAR`;
  const desc = `${p.subcategory} • ${p.brand}. ${p.isMuseMade ? "Made in Cairo." : "Curated multibrand."} ${formatEGP(p.price)} EGP, COD & Paymob, 14-day returns. Ships across Egypt.`;
  const url = `https://muse-wear.pages.dev/product/${p.id}`;
  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: { title, description: desc, url, images: [{ url: p.image, width: 600, height: 800 }], type: "website" },
    twitter: { card: "summary_large_image", title, description: desc, images: [p.image] },
  };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  if (!p) return <div className="max-w-[1400px] mx-auto px-4 py-12">Not found</div>;
  return <ProductClient id={id} />;
}
