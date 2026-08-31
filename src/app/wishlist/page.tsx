"use client";
import { useWishlist, useLang } from "@/lib/store";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";
import Breadcrumb from "@/components/Breadcrumb";
import Link from "next/link";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const { t } = useLang();
  const list = products.filter((p) => ids.includes(p.id));
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <Breadcrumb items={[{ labelEn: "Wishlist", labelAr: "قائمة الرغبات" }]} />
      <h1 className="text-2xl font-black mt-3">{t("Wishlist", "قائمة الرغبات")} ({list.length})</h1>
      {list.length === 0 ? <div className="text-center py-16"><p className="text-zinc-500">{t("No items yet. Tap ♡ on any product.", "لا يوجد عناصر. اضغط ♡ على أي منتج.")}</p><Link href="/" className="inline-block mt-4 bg-black text-white px-6 py-3 rounded-full font-bold focus:outline-none focus:ring-2 focus:ring-black">{t("Discover Products", "اكتشف المنتجات")}</Link></div> : <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{list.map((p, i) => <ProductCard key={p.id} p={p} index={i} />)}</div>}
    </div>
  );
}
