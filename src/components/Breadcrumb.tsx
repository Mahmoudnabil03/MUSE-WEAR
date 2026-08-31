"use client";
import Link from "next/link";
import { useLang } from "@/lib/store";

export default function Breadcrumb({ items }: { items: { labelEn: string; labelAr: string; href?: string }[] }) {
  const { lang } = useLang();
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-zinc-500">
      <ol className="flex items-center gap-1 flex-wrap">
        <li><Link href="/" className="hover:text-black hover:underline focus:outline-none focus:ring-2 focus:ring-black rounded">{lang === "ar" ? "الرئيسية" : "Home"}</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            <span aria-hidden>›</span>
            {it.href ? <Link href={it.href} className="hover:text-black hover:underline focus:outline-none focus:ring-2 focus:ring-black rounded">{lang === "ar" ? it.labelAr : it.labelEn}</Link> : <span className="text-black font-semibold">{lang === "ar" ? it.labelAr : it.labelEn}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
