export function MWMark({ className = "w-10 h-10", invert = false }: { className?: string; invert?: boolean }) {
  return (
    <div className={`${className} grid place-items-center ${invert ? "bg-white text-black" : "bg-black text-white"} relative overflow-hidden`}>
      {/* Geometric MW Mark - CSS recreation for perfect scaling */}
      <svg viewBox="0 0 100 85" className="w-[85%] h-[85%]">
        {/* Outer shield */}
        <path d="M5 5 L50 32 L95 5 L95 58 L88 62 L88 18 L50 42 L12 18 L12 62 L5 58 Z" fill="currentColor" />
        <path d="M5 62 L12 66 L18 69 L24 58 L38 50 L38 72 L50 82 L62 72 L62 50 L76 58 L82 69 L88 66 L95 62 L95 68 L82 76 L50 92 L18 76 L5 68 Z" fill="currentColor" />
        {/* Inner white cut - use background color */}
        <path d="M22 22 L22 64 L28 67 L32 42 L50 32 L68 42 L72 67 L78 64 L78 22 L50 36 Z" fill={invert ? "black" : "white"} />
        {/* Center notch */}
        <path d="M42 45 L50 38 L58 45 L50 52 Z" fill={invert ? "black" : "white"} />
      </svg>
    </div>
  );
}

export function MuseWearLogo({ className = "", light = false }: { className?: string; light?: boolean }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <MWMark className="w-10 h-10 shrink-0" invert={light} />
      <div className={`leading-none ${light ? "text-white" : "text-black"}`}>
        <div className="font-black tracking-[0.22em] text-[14px]">MUSE WEAR</div>
        <div className={`text-[9px] tracking-[0.32em] font-semibold ${light ? "text-white/70" : "text-zinc-500"}`}>CAIRO, EGYPT</div>
      </div>
    </div>
  );
}
