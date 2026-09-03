"use client";
import { useState } from "react";
import { useLang } from "@/lib/store";

type Measurement = { size: string; chest: string; waist: string; hip?: string; length?: string };

const SIZE_TABLES: Record<string, Measurement[]> = {
  "T-Shirts": [
    { size: "S", chest: "48", waist: "46", length: "68" },
    { size: "M", chest: "51", waist: "49", length: "70" },
    { size: "L", chest: "54", waist: "52", length: "72" },
    { size: "XL", chest: "57", waist: "55", length: "74" },
    { size: "XXL", chest: "60", waist: "58", length: "76" },
  ],
  "Pants": [
    { size: "30", chest: "-", waist: "76", hip: "100", length: "102" },
    { size: "32", chest: "-", waist: "81", hip: "105", length: "104" },
    { size: "34", chest: "-", waist: "86", hip: "110", length: "106" },
    { size: "36", chest: "-", waist: "91", hip: "115", length: "108" },
  ],
  default: [
    { size: "XS", chest: "44", waist: "42" },
    { size: "S", chest: "48", waist: "46" },
    { size: "M", chest: "51", waist: "49" },
    { size: "L", chest: "54", waist: "52" },
    { size: "XL", chest: "57", waist: "55" },
  ],
};

export default function SizeGuide({ category, subcategory }: { category?: string; subcategory?: string }) {
  const [open, setOpen] = useState(false);
  const { t } = useLang();
  const table = (subcategory && SIZE_TABLES[subcategory]) || SIZE_TABLES[category || ""] || SIZE_TABLES.default;
  return (
    <>
      <button onClick={() => setOpen(!open)} className="text-xs underline font-semibold focus:outline-none focus:ring-2 focus:ring-black rounded px-1" aria-expanded={open}>
        {t("Size Guide", "دليل المقاسات")} {open ? "▴" : "▾"}
      </button>
      {open && (
        <div className="mt-3 bg-zinc-50 border border-zinc-200 p-3 text-xs rounded animate-fadeInUp">
          <div className="font-bold flex justify-between">{t("Size Chart (cm)", "جدول المقاسات (سم)")} <span className="font-normal text-zinc-500">{t("Not sure about your size?", "غير متأكد من مقاسك؟")}</span></div>
          <div className="mt-2 overflow-x-auto">
            <table className="w-full text-center border-collapse">
              <thead><tr className="bg-zinc-900 text-white"><th className="p-2 text-xs">Size</th><th className="p-2">Chest</th><th className="p-2">Waist</th><th className="p-2">Length</th></tr></thead>
              <tbody>{table.map((r) => (<tr key={r.size} className="border-b last:border-0"><td className="p-2 font-bold">{r.size}</td><td className="p-2">{r.chest}</td><td className="p-2">{r.waist}</td><td className="p-2">{r.length || "-"}</td></tr>))}</tbody>
            </table>
          </div>
          <div className="text-[11px] text-zinc-500 mt-2">{t("Measurements are garment, not body. For recommendation, contact support via WhatsApp.", "المقاسات للقطعة. للمساعدة تواصل واتساب.")}</div>
        </div>
      )}
    </>
  );
}
