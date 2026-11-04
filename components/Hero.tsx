import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

export function Hero() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-amie-cream px-6 text-center">
      <p className="font-body text-xs uppercase tracking-[0.3em] text-amie-green/70">a little something for</p>
      <h1 className="font-display mt-4 text-5xl font-semibold text-[#3A2418] sm:text-6xl">For You, Amiee</h1>
      <p className="font-body mt-4 max-w-md text-sm text-amie-green/80">
        Scroll down. There&apos;s a café, a note, and a question waiting for you.
      </p>

      <div className="absolute bottom-10 right-8">
        <StickerFloat sticker={tontonById("yuta")} variant="float-a" size={72} />
      </div>

      <div className="absolute bottom-6 flex flex-col items-center gap-1 text-amie-green/50 animate-scroll-bounce">
        <span className="font-body text-[10px] uppercase tracking-[0.2em]">scroll</span>
        <span>↓</span>
      </div>
    </section>
  );
}
