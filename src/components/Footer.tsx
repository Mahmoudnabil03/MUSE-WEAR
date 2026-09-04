import { MuseWearLogo } from "./Logo";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#100904] text-[#ffedd7] mt-12 relative overflow-hidden border-t border-dashed border-[#40372e]">
      <div className="relative w-full px-6 md:px-10 py-10 grid grid-cols-2 md:grid-cols-4 gap-[18px] text-sm">
        <div className="text-left">
          <MuseWearLogo light />
          <p className="mt-3 text-[#ffedd7]/70 leading-relaxed text-[14px] font-medium uppercase">EGYPT&apos;S CURATED MULTIBRAND DESTINATION + OUR OWN CAIRO FACTORY.</p>
          <div className="mt-4 flex gap-2">
            <span className="w-8 h-8 rounded-full bg-[#382416] border border-[#40372e] text-[#ffedd7] grid place-items-center font-medium text-[12px]" aria-hidden>M</span>
            <span className="w-8 h-8 rounded-full border border-[#40372e] grid place-items-center text-[12px] hover:bg-[#ffedd7] hover:text-[#100904] transition">IG</span>
            <span className="w-8 h-8 rounded-full border border-[#40372e] grid place-items-center text-[12px] hover:bg-[#ffedd7] hover:text-[#100904] transition">FB</span>
            <span className="w-8 h-8 rounded-full border border-[#40372e] grid place-items-center text-[12px] hover:bg-[#ffedd7] hover:text-[#100904] transition">TK</span>
          </div>
        </div>
        <div className="text-left">
          <div className="oryzo-label mb-3">SHOP</div>
          <ul className="space-y-2">
            <li><Link href="/women" className="link-underline">Women</Link></li>
            <li><Link href="/men" className="link-underline">Men</Link></li>
            <li><Link href="/accessories" className="link-underline">Accessories</Link></li>
            <li><Link href="/women?filter=new" className="link-underline">New In</Link></li>
            <li><Link href="/search?q=sale" className="link-underline">Sale</Link></li>
          </ul>
        </div>
        <div className="text-left">
          <div className="oryzo-label mb-3">HELP</div>
          <ul className="space-y-2">
            <li><Link href="/track" className="link-underline">Track Order</Link></li>
            <li><Link href="/shipping" className="link-underline">Shipping Policy</Link></li>
            <li><Link href="/returns" className="link-underline">Returns & Exchange</Link></li>
            <li><Link href="/checkout" className="link-underline">Paymob / COD</Link></li>
            <li><Link href="/contact" className="link-underline">Contact us</Link></li>
            <li><Link href="/faq" className="link-underline">FAQ</Link></li>
          </ul>
        </div>
        <div className="text-left">
          <div className="oryzo-label mb-3">META</div>
          <p className="text-[#ffedd7]/70 text-[12px] font-medium uppercase leading-relaxed">CATALOG SYNCED TO FACEBOOK & INSTAGRAM SHOP.</p>
          <div className="mt-3 flex gap-2 oryzo-label">
            <Link href="/admin" className="btn-ghost !text-[10px]">IG SHOP</Link>
            <Link href="/admin" className="btn-ghost !text-[10px]">FB CATALOG</Link>
          </div>
          <div className="oryzo-legal mt-4 text-[#6c5f51]">* META COMMERCE SYNC</div>
        </div>
      </div>
      <div className="relative border-t border-dashed border-[#40372e] text-center oryzo-label py-4 text-[#ffedd7]/70 flex items-center justify-center gap-2 px-4">
        <span>© 2026 MUSE WEAR EGYPT. ALL RIGHTS RESERVED.</span>
        <span className="hidden sm:inline text-[#6c5f51]">•</span>
        <span className="hidden sm:inline">EGP • ENGLISH | العربية • <Link href="/login" className="ember-credit underline">SIGN IN</Link></span>
      </div>
    </footer>
  );
}
