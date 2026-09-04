export type Category = "men" | "women" | "accessories";
export type Product = {
  id: string;
  nameEn: string;
  nameAr: string;
  brand: string;
  category: Category;
  subcategory: string;
  price: number;
  originalPrice?: number;
  image: string;
  images: string[];
  colors: string[];
  sizes?: string[];
  isNew?: boolean;
  isMuseMade?: boolean; // our manufacturing
  stockQty?: number;
  material?: string;
  care?: string;
  fit?: string;
  sku?: string;
  tags?: string[];
  variants?: ProductVariant[];
};

export type ProductVariant = {
  id?: string;
  size: string;
  color?: string;
  sku?: string;
  taagerProductId?: string;
  taagerSku?: string;
  stock?: number;
  price?: number;
};

export function getVariantStock(p: Product, size?: string): { stock: number; status: "in" | "low" | "out" } {
  const variant = p.variants?.find((v) => !size || v.size === size);
  if (variant?.stock != null) {
    const stock = Math.max(0, Number(variant.stock));
    return { stock, status: stock <= 0 ? "out" : stock <= 3 ? "low" : "in" };
  }
  const base = p.stockQty ?? 100;
  // simple heuristic: if size-specific stock not tracked, use base
  if (base <= 0) return { stock: 0, status: "out" };
  if (base <= 3) return { stock: base, status: "low" };
  return { stock: base, status: "in" };
}

export const products: Product[] = [];

export const brands: string[] = [];
export const categories = [
  { key: "women", labelEn: "Women", labelAr: "نسائي", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60" },
  { key: "men", labelEn: "Men", labelAr: "رجالي", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=60" },
  { key: "accessories", labelEn: "Accessories", labelAr: "إكسسوارات", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60" },
] as const;

export function formatEGP(price: number) {
  return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(price).replace("EGP", "EGP ");
}
