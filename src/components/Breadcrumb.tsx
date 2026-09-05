"use client";
import Link from "next/link";
import { useLang } from "@/lib/store";

export default function Breadcrumb({ items }: { items: { labelEn: string; labelAr: string; href?: string }[] }) {
  const { lang } = useLang();
  return (
    <nav aria-label="Breadcrumb" className="oryzo-label !text-[11px] text-[#6c5f51]">
      <ol className="flex items-center gap-1 flex-wrap">
        <li><Link href="/" className="hover:text-[#ffedd7] hover:underline focus:outline-none focus:ring-2 focus:ring-[#ffedd7] rounded uppercase">{lang === "ar" ? "الرئيسية" : "HOME"}</Link></li>
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1">
            <span aria-hidden>›</span>
            {it.href ? <Link href={it.href} className="hover:text-[#ffedd7] hover:underline focus:outline-none focus:ring-2 focus:ring-[#ffedd7] rounded uppercase">{lang === "ar" ? it.labelAr : it.labelEn}</Link> : <span className="text-[#ffedd7] font-medium uppercase">{lang === "ar" ? it.labelAr : it.labelEn}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}
