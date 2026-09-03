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
};

export function getVariantStock(p: Product, size?: string): { stock: number; status: "in" | "low" | "out" } {
  const base = p.stockQty ?? 100;
  // simple heuristic: if size-specific stock not tracked, use base
  if (base <= 0) return { stock: 0, status: "out" };
  if (base <= 3) return { stock: base, status: "low" };
  return { stock: base, status: "in" };
}

export const products: Product[] = [
  {
    id: "mw-001",
    nameEn: "MUSE Oversized Heavy Tee - Black",
    nameAr: "تيشيرت موس أوفرسايز - أسود",
    brand: "MUSE WEAR",
    category: "men",
    subcategory: "T-Shirts",
    price: 899,
    originalPrice: 1199,
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&auto=format&fit=crop&q=60"],
    colors: ["#000000", "#FFFFFF", "#6B7280"],
    sizes: ["S", "M", "L", "XL", "XXL"],
    isNew: true,
    isMuseMade: true,
  },
  {
    id: "mw-002",
    nameEn: "MUSE Tailored Cargo Pants",
    nameAr: "بنطلون كارغو مفصل من موس",
    brand: "MUSE WEAR",
    category: "men",
    subcategory: "Pants",
    price: 1499,
    image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60"],
    colors: ["#1F2937", "#A8A29E"],
    sizes: ["30", "32", "34", "36"],
    isMuseMade: true,
  },
  {
    id: "mw-003",
    nameEn: "Satin Wrap Dress - Emerald",
    nameAr: "فستان ساتان - زمردي",
    brand: "MUSE WEAR",
    category: "women",
    subcategory: "Dresses",
    price: 1899,
    originalPrice: 2499,
    image: "https://images.unsplash.com/photo-1515372039744-f1fd71e2d06a?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1515372039744-f1fd71e2d06a?w=600&auto=format&fit=crop&q=60"],
    colors: ["#065F46", "#000000"],
    sizes: ["XS", "S", "M", "L"],
    isNew: true,
    isMuseMade: true,
  },
  {
    id: "mw-004",
    nameEn: "Cropped Bomber Jacket",
    nameAr: "جاكيت بومبر قصير",
    brand: "MUSE WEAR",
    category: "women",
    subcategory: "Jackets",
    price: 2199,
    image: "https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1550928431-ee0ec6db30d3?w=600&auto=format&fit=crop&q=60"],
    colors: ["#111827", "#F5F5DC"],
    sizes: ["S", "M", "L"],
    isMuseMade: true,
  },
  {
    id: "br-001",
    nameEn: "Nike Air Max 270 - White/Black",
    nameAr: "نايك اير ماكس 270",
    brand: "Nike",
    category: "men",
    subcategory: "Shoes",
    price: 4299,
    originalPrice: 5499,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60"],
    colors: ["#FFFFFF", "#000000"],
    sizes: ["40", "41", "42", "43", "44"],
  },
  {
    id: "br-002",
    nameEn: "Adidas Originals Hoodie",
    nameAr: "هودي أديداس أوريجينالز",
    brand: "Adidas",
    category: "women",
    subcategory: "Hoodies",
    price: 1799,
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=600&auto=format&fit=crop&q=60"],
    colors: ["#E5E7EB", "#000000", "#DC2626"],
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "acc-001",
    nameEn: "MUSE Leather Crossbody Bag",
    nameAr: "حقيبة موس الجلدية",
    brand: "MUSE WEAR",
    category: "accessories",
    subcategory: "Bags",
    price: 1299,
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60"],
    colors: ["#000000", "#78350F"],
    isMuseMade: true,
  },
  {
    id: "acc-002",
    nameEn: "Chunky Gold Hoops Set",
    nameAr: "طقم أقراط ذهبية",
    brand: "MUSE WEAR",
    category: "accessories",
    subcategory: "Jewelry",
    price: 499,
    originalPrice: 699,
    image: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=600&auto=format&fit=crop&q=60"],
    colors: ["#D4AF37"],
    isMuseMade: true,
  },
  {
    id: "br-003",
    nameEn: "Puma RS-X - Multicolor",
    nameAr: "بوما RS-X - متعدد الألوان",
    brand: "Puma",
    category: "men",
    subcategory: "Shoes",
    price: 3599,
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60"],
    colors: ["#FFFFFF"],
    sizes: ["41", "42", "43", "44"],
  },
  {
    id: "mw-005",
    nameEn: "MUSE Linen Co-ord Set - Sand",
    nameAr: "طقم كتان موس - رملي",
    brand: "MUSE WEAR",
    category: "women",
    subcategory: "Co-ords",
    price: 2499,
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60"],
    colors: ["#D6C7B8", "#000000"],
    sizes: ["S", "M", "L"],
    isMuseMade: true,
    isNew: true,
  },
  {
    id: "acc-003",
    nameEn: "Unisex Cap - MW Embroidery",
    nameAr: "كاب موس - تطريز MW",
    brand: "MUSE WEAR",
    category: "accessories",
    subcategory: "Caps",
    price: 399,
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=600&auto=format&fit=crop&q=60"],
    colors: ["#000000", "#FFFFFF"],
    isMuseMade: true,
  },
  {
    id: "br-004",
    nameEn: "Levi's 501 Straight Jeans",
    nameAr: "جينز ليفايز 501",
    brand: "Levi's",
    category: "men",
    subcategory: "Jeans",
    price: 1999,
    image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60",
    images: ["https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60"],
    colors: ["#1E3A8A"],
    sizes: ["30", "32", "34", "36"],
  },
];

export const brands = ["MUSE WEAR", "Nike", "Adidas", "Puma", "Levi's", "Zara", "H&M"];
export const categories = [
  { key: "women", labelEn: "Women", labelAr: "نسائي", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=600&auto=format&fit=crop&q=60" },
  { key: "men", labelEn: "Men", labelAr: "رجالي", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=60" },
  { key: "accessories", labelEn: "Accessories", labelAr: "إكسسوارات", image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=600&auto=format&fit=crop&q=60" },
] as const;

export function formatEGP(price: number) {
  return new Intl.NumberFormat("en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(price).replace("EGP", "EGP ");
}
