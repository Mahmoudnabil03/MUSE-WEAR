export default function Footer() {
  return (
    <footer className="bg-black text-zinc-300 mt-12">
      <div className="max-w-[1400px] mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
        <div>
          <div className="text-white font-black tracking-[0.2em]">MUSE WEAR</div>
          <div className="text-xs tracking-[0.3em] text-zinc-500">CAIRO, EGYPT</div>
          <p className="mt-3 text-zinc-400 leading-relaxed">Egypt&apos;s curated multibrand destination + our own manufacturing. Men, Women, Accessories. COD & Paymob.</p>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Shop</div>
          <ul className="space-y-2 text-zinc-400">
            <li>Women</li><li>Men</li><li>Accessories</li><li>New In</li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Help</div>
          <ul className="space-y-2 text-zinc-400">
            <li>Shipping to all Egypt</li><li>Returns & Exchange</li><li>Paymob / COD</li><li>Contact us</li>
          </ul>
        </div>
        <div>
          <div className="text-white font-bold mb-3">Meta</div>
          <p className="text-zinc-400 text-xs leading-relaxed">Catalog synced to Facebook & Instagram Shop. Manage ads from Admin → Marketing.</p>
          <div className="mt-3 flex gap-2 text-xs"> <span className="bg-zinc-800 px-2 py-1 rounded">IG Shop</span> <span className="bg-zinc-800 px-2 py-1 rounded">FB Catalog</span> </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 text-center text-xs py-4 text-zinc-500">© {new Date().getFullYear()} MUSE WEAR EGYPT. All rights reserved. EGP • English | العربية</div>
    </footer>
  );
}
