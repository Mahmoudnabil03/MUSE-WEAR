import { MuseWearLogo } from "./Logo";
import Link from "next/link";

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
            <span className="w-8 h-8 rounded-full bg-white text-black grid place-items-center font-bold" aria-hidden>M</span>
            <span className="w-8 h-8 rounded-full border border-white/20 grid place-items-center text-xs hover:bg-white hover:text-black transition">IG</span>
            <span className="w-8 h-8 rounded-full border border-white/20 grid place-items-center text-xs hover:bg-white hover:text-black transition">FB</span>
            <span className="w-8 h-8 rounded-full border border-white/20 grid place-items-center text-xs hover:bg-white hover:text-black transition">TK</span>
          </div>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Shop</div>
          <ul className="space-y-2 text-zinc-400">
            <li><Link href="/women" className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-white rounded">Women</Link></li>
            <li><Link href="/men" className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-white rounded">Men</Link></li>
            <li><Link href="/accessories" className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-white rounded">Accessories</Link></li>
            <li><Link href="/women?filter=new" className="hover:text-white transition focus:outline-none focus:ring-2 focus:ring-white rounded">New In</Link></li>
            <li><Link href="/search?q=sale" className="text-red-400 hover:text-red-300">Sale</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Help</div>
          <ul className="space-y-2 text-zinc-400">
            <li><Link href="/track" className="hover:text-white">Track Order</Link></li>
            <li><Link href="/shipping" className="hover:text-white">Shipping Policy</Link></li>
            <li><Link href="/returns" className="hover:text-white">Returns & Exchange (14 days)</Link></li>
            <li><Link href="/checkout" className="hover:text-white">Paymob / COD</Link></li>
            <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
            <li><Link href="/faq" className="hover:text-white">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Meta</div>
          <p className="text-zinc-400 text-xs leading-relaxed">Catalog synced to Facebook & Instagram Shop. Manage ads from Admin → Marketing.</p>
          <div className="mt-3 flex gap-2 text-xs">
            <Link href="/admin" className="bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-white">IG Shop</Link>
            <Link href="/admin" className="bg-zinc-800 px-2 py-1 rounded hover:bg-zinc-700 transition focus:outline-none focus:ring-2 focus:ring-white">FB Catalog</Link>
          </div>
        </div>
      </div>
      <div className="relative border-t border-zinc-800 text-center text-xs py-4 text-zinc-500 flex items-center justify-center gap-2">
        <span>© 2026 MUSE WEAR EGYPT. All rights reserved.</span>
        <span className="hidden sm:inline">•</span>
        <span className="hidden sm:inline">EGP • English | العربية • <Link href="/login" className="underline">Sign In</Link></span>
      </div>
    </footer>
  );
}
