"use client";
import Link from "next/link";
import { useLang } from "@/lib/store";
import { MuseWearLogo } from "./Logo";

export default function Hero() {
  const { t } = useLang();
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Main hero with animations */}
      <Link href="/women" className="lg:col-span-2 relative overflow-hidden bg-zinc-900 min-h-[420px] group rounded-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&auto=format&fit=crop&q=60" alt="Women" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-[1.03] transition duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Animated watermark logo */}
        <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition duration-700">
          <div className="w-24 h-24 bg-white/20 backdrop-blur grid place-items-center rounded">
            <span className="font-black text-white text-4xl tracking-widest">MW</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <div className="inline-flex items-center gap-2 bg-white text-black px-3 py-1 rounded-full text-xs font-bold tracking-wide animate-fadeInUp">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> {t("NEW COLLECTION LIVE", "تشكيلة جديدة الآن")}
          </div>
          <div className="text-xs tracking-[0.3em] text-white/70 animate-fadeInUp">NEW SEASON / 2026</div>
          <h2 className="text-4xl md:text-5xl font-black mt-2 leading-none animate-fadeInUp delay-100" style={{ animationFillMode: "backwards" }}>
            MUSE<br />
            <span className="bg-white text-black px-2">AFTER DARK</span>
          </h2>
          <p className="text-white/80 text-sm mt-3 max-w-md animate-fadeInUp delay-200" style={{ animationFillMode: "backwards" }}>
            {t("Designed in Cairo. Made for everywhere.", "صمم في القاهرة. صنع لكل مكان.")}
          </p>
          <div className="flex gap-3 mt-4 animate-fadeInUp delay-300" style={{ animationFillMode: "backwards" }}>
            <Link href="/women" className="bg-white text-black px-7 py-3 rounded-full text-sm font-bold hover:scale-105 transition">{t("SHOP WOMEN", "تسوقي نسائي")}</Link>
            <Link href="/men" className="border border-white text-white px-7 py-3 rounded-full text-sm font-bold hover:bg-white hover:text-black transition">{t("SHOP MEN", "تسوق رجالي")}</Link>
          </div>
        </div>
      </Link>

      <div className="grid gap-4">
        <Link href="/men" className="relative overflow-hidden bg-zinc-900 min-h-[200px] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=60" alt="Men" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.05] transition duration-[1000ms]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-90 group-hover:opacity-100 transition" />
          <div className="absolute bottom-4 left-4 right-4 text-white flex items-end justify-between">
            <div>
              <div className="text-xs tracking-[0.2em] opacity-80">MUSE WEAR</div>
              <h3 className="text-2xl font-black">{t("MEN", "رجالي")}</h3>
            </div>
            <span className="bg-white text-black px-4 py-2 rounded-full text-xs font-bold group-hover:translate-x-1 transition">→</span>
          </div>
        </Link>
        <Link href="/accessories" className="relative overflow-hidden bg-black min-h-[200px] group border border-zinc-900">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60" alt="Accessories" className="absolute inset-0 w-full h-full object-cover opacity-80 group-hover:scale-[1.05] transition duration-[1000ms]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            <div className="border border-white/30 backdrop-blur px-6 py-3 text-white text-center group-hover:bg-white group-hover:text-black transition duration-500">
              <div className="text-xs tracking-[0.3em]">SHOP</div>
              <div className="text-xl font-black tracking-wide">{t("ACCESSORIES", "إكسسوارات")}</div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
