"use client";
import Link from "next/link";
import { useLang } from "@/lib/store";

export default function Hero() {
  const { t } = useLang();
  return (
    <div className="max-w-[1400px] mx-auto px-4 mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
      <Link href="/women" className="lg:col-span-2 relative overflow-hidden bg-zinc-900 min-h-[380px] group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1200&auto=format&fit=crop&q=60" alt="Women" className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:scale-105 transition duration-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <div className="text-xs tracking-[0.3em] font-semibold">MUSE WEAR • {t("NEW COLLECTION", "تشكيلة جديدة")}</div>
          <h2 className="text-4xl font-black mt-1">{t("WOMEN UP TO 50% OFF", "نسائي حتى 50% خصم")}</h2>
          <span className="inline-block mt-3 bg-white text-black px-6 py-2 rounded-full text-sm font-bold">{t("Shop Women", "تسوقي نسائي")}</span>
        </div>
      </Link>
      <div className="grid gap-4">
        <Link href="/men" className="relative overflow-hidden bg-zinc-900 min-h-[180px] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=800&auto=format&fit=crop&q=60" alt="Men" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-black">{t("MEN", "رجالي")}</h3>
            <span className="text-sm underline underline-offset-4">{t("Shop Now", "تسوق الآن")}</span>
          </div>
        </Link>
        <Link href="/accessories" className="relative overflow-hidden bg-zinc-900 min-h-[180px] group">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=60" alt="Accessories" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-700" />
          <div className="absolute inset-0 bg-black/30" />
          <div className="absolute bottom-4 left-4 text-white">
            <h3 className="text-2xl font-black">{t("ACCESSORIES", "إكسسوارات")}</h3>
            <span className="text-sm underline underline-offset-4">{t("Shop Now", "تسوق الآن")}</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
