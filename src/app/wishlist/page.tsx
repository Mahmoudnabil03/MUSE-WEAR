"use client";
import { useWishlist, useLang } from "@/lib/store";
import { products } from "@/lib/products";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { ids } = useWishlist();
  const { t } = useLang();
  const list = products.filter((p) => ids.includes(p.id));
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-6">
      <h1 className="text-2xl font-black">{t("Wishlist", "قائمة الرغبات")} ({list.length})</h1>
      {list.length === 0 ? <p className="mt-4 text-zinc-500">{t("No items yet. Tap ♡ on any product.", "لا يوجد عناصر. اضغط ♡ على أي منتج.")}</p> : <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">{list.map((p) => <ProductCard key={p.id} p={p} />)}</div>}
    </div>
  );
}
