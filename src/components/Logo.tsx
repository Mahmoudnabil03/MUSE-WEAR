import Image from "next/image";

export function MWMark({
  className = "w-10 h-10",
  invert = false,
  withText = false,
}: {
  className?: string;
  invert?: boolean;
  withText?: boolean;
}) {
  // Geometric MW mark — now pixel-perfect from the official jpg (public/mw-logo.jpg)
  // withText=false renders the square mark only; withText=true renders mark + wordmark.
  // On the dark ORYZO ground (#000000) we invert to white so the black mark reads as luxury emboss.
  const src = invert ? "/mw-logo-inverted.jpg" : "/mw-logo.jpg";
  return (
    <div
      className={`${className} relative shrink-0 overflow-hidden ${withText ? "" : "rounded-[2px]"} bg-transparent`}
      aria-hidden
    >
      <Image
        src={src}
        alt={withText ? "MUSE WEAR — Cairo, Egypt" : "MUSE WEAR mark"}
        fill
        sizes="80px"
        className={`object-contain ${withText ? "" : "scale-[1.08]"}`}
        priority={false}
      />
    </div>
  );
}

export function MuseWearLogo({
  className = "",
  light = false,
  compact = false,
}: {
  className?: string;
  light?: boolean;
  compact?: boolean;
}) {
  // light=true → white mark for use on #000000 / black grounds (header, footer, hero)
  if (compact) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <MWMark className="w-10 h-10" invert={light} withText={false} />
        <div className={`leading-none ${light ? "text-[#ffffff]" : "text-black"}`}>
          <div className="font-medium tracking-[0.22em] text-[14px] uppercase">MUSE WEAR</div>
          <div className={`text-[9px] tracking-[0.32em] font-medium uppercase ${light ? "text-[#ffffff]/70" : "text-black/60"}`}>
            CAIRO, EGYPT
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Full lockup — uses the official file so geometry, kerning, and diagonal cuts are exact */}
      <div className="relative h-[44px] w-[160px] shrink-0 sm:h-[48px] sm:w-[180px]">
        <Image
          src={light ? "/mw-logo-inverted.jpg" : "/mw-logo.jpg"}
          alt="MUSE WEAR — Cairo, Egypt"
          fill
          sizes="180px"
          className="object-contain object-left"
          priority
        />
      </div>
    </div>
  );
}
