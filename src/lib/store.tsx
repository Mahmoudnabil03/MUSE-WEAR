"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Product } from "./products";

// Language
type Lang = "en" | "ar";
const LangContext = createContext<{ lang: Lang; toggle: () => void; t: (en: string, ar: string) => string }>({
  lang: "en",
  toggle: () => {},
  t: (en) => en,
});
export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("muse-lang") as Lang | null;
      if (saved === "en" || saved === "ar") return saved;
    }
    return "en";
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    localStorage.setItem("muse-lang", lang);
  }, [lang]);
  const toggle = () => setLang((l) => (l === "en" ? "ar" : "en"));
  const t = (en: string, ar: string) => (lang === "ar" ? ar : en);
  return <LangContext.Provider value={{ lang, toggle, t }}>{children}</LangContext.Provider>;
}
export const useLang = () => useContext(LangContext);

// Cart
export type CartItem = { product: Product; size?: string; qty: number };
const CartContext = createContext<{
  items: CartItem[];
  add: (p: Product, size?: string) => void;
  remove: (id: string, size?: string) => void;
  updateQty: (id: string, size: string | undefined, qty: number) => void;
  count: number;
  total: number;
  clear: () => void;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  useEffect(() => {
    const saved = localStorage.getItem("muse-cart");
    if (saved) try { setItems(JSON.parse(saved)); } catch {}
  }, []);
  useEffect(() => { localStorage.setItem("muse-cart", JSON.stringify(items)); }, [items]);

  const add = (product: Product, size?: string) => {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id && i.size === size);
      if (idx > -1) { const copy = [...prev]; copy[idx].qty += 1; return copy; }
      return [...prev, { product, size, qty: 1 }];
    });
  };
  const remove = (id: string, size?: string) => setItems((prev) => prev.filter((i) => !(i.product.id === id && i.size === size)));
  const updateQty = (id: string, size: string | undefined, qty: number) => {
    if (qty <= 0) return remove(id, size);
    setItems((prev) => prev.map((i) => (i.product.id === id && i.size === size ? { ...i, qty } : i)));
  };
  const clear = () => setItems([]);
  const count = items.reduce((a, b) => a + b.qty, 0);
  const total = items.reduce((a, b) => a + b.product.price * b.qty, 0);
  return <CartContext.Provider value={{ items, add, remove, updateQty, count, total, clear }}>{children}</CartContext.Provider>;
}
export const useCart = () => {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside provider");
  return c;
};

// Wishlist
const WishContext = createContext<{ ids: string[]; toggle: (id: string) => void; has: (id: string) => boolean; count: number } | null>(null);
export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => { const s = localStorage.getItem("muse-wish"); if (s) try { setIds(JSON.parse(s)); } catch {} }, []);
  useEffect(() => { localStorage.setItem("muse-wish", JSON.stringify(ids)); }, [ids]);
  const toggle = (id: string) => setIds((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const has = (id: string) => ids.includes(id);
  return <WishContext.Provider value={{ ids, toggle, has, count: ids.length }}>{children}</WishContext.Provider>;
}
export const useWishlist = () => {
  const c = useContext(WishContext);
  if (!c) throw new Error("useWishlist outside");
  return c;
};
