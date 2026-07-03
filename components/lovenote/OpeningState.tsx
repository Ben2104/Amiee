import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

interface OpeningStateProps {
  onOpen: () => void;
}

export function OpeningState({ onOpen }: OpeningStateProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF7EC] via-[#FFEEDD] to-[#FFE5CC] px-6 text-center">
      <div className="absolute bottom-[22vh] left-10">
        <StickerFloat sticker={tontonById("yuta")} variant="float-a" size={90} />
      </div>

      <p className="font-script text-3xl text-[#8B5E3C] sm:text-4xl">
        A tiny delivery
        <br />
        just arrived for you…
      </p>

      <button
        type="button"
        onClick={onOpen}
        aria-label="Open the envelope"
        className="animate-pulse-glow mt-8 h-32 w-44 rounded-[6px_6px_14px_14px] bg-gradient-to-br from-[#FFEAF3] to-[#FFD8EA] shadow-lg"
      >
        <span className="text-3xl">❤️</span>
      </button>

      <p className="font-note mt-6 text-sm text-[#A0785A]">Tap the envelope to open it.</p>
    </section>
  );
}
