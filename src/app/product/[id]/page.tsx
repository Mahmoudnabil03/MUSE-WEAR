import { products, formatEGP } from "@/lib/products";
import ProductClient from "./client";

export function generateStaticParams() {
  return products.map((p) => ({ id: p.id }));
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const p = products.find((x) => x.id === id);
  if (!p) return <div className="max-w-[1400px] mx-auto px-4 py-12">Not found</div>;
  return <ProductClient id={id} />;
}
