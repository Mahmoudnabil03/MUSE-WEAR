import { MuseWearLogo } from "./Logo";

export default function Footer() {
  return (
    <footer className="bg-black text-zinc-300 mt-12 relative overflow-hidden">
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute right-10 top-10 w-64 h-64 border-[24px] border-white rotate-12" />
      </div>
      <div className="relative max-w-[1400px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <MuseWearLogo light />
          <p className="mt-3 text-zinc-400 leading-relaxed text-xs">Egypt&apos;s curated multibrand destination + our own Cairo factory. The MW shield. Men, Women, Accessories. COD & Paymob.</p>
          <div className="mt-4 flex gap-2">
            <span className="w-8 h-8 rounded-full bg-white text-black grid place-items-center font-bold">M</span>
            <span className="w-8 h-8 rounded-full border border-white/20 grid place-items-center text-xs">IG</span>
            <span className="w-8 h-8 rounded-full border border-white/20 grid place-items-center text-xs">FB</span>
            <span className="w-8 h-8 rounded-full border border-white/20 grid place-items-center text-xs">TK</span>
          </div>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Shop</div>
          <ul className="space-y-2 text-zinc-400">
            <li className="hover:text-white transition cursor-pointer">Women</li>
            <li className="hover:text-white transition cursor-pointer">Men</li>
            <li className="hover:text-white transition cursor-pointer">Accessories</li>
            <li className="hover:text-white transition cursor-pointer">New In</li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Help</div>
          <ul className="space-y-2 text-zinc-400">
            <li>Shipping to all Egypt</li>
            <li>Returns & Exchange</li>
            <li>Paymob / COD</li>
            <li>Contact us</li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Meta</div>
          <p className="text-zinc-400 text-xs leading-relaxed">Catalog synced to Facebook & Instagram Shop. Manage ads from Admin → Marketing.</p>
          <div className="mt-3 flex gap-2 text-xs">
            <span className="bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition">IG Shop</span>
            <span className="bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition">FB Catalog</span>
          </div>
        </div>
      </div>
      <div className="relative border-t border-zinc-800 text-center text-xs py-4 text-zinc-500 flex items-center justify-center gap-2">
        <span>© {new Date().getFullYear()} MUSE WEAR EGYPT. All rights reserved.</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">EGP • English | العربية</span>
      </div>
    </footer>
  );
}
