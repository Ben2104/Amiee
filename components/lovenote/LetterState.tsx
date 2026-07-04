import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

interface LetterStateProps {
  onYes: () => void;
}

export function LetterState({ onYes }: LetterStateProps) {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFF2E8] via-[#FFE8D5] to-[#FFD8C0] px-6 py-20 text-center">
      <div className="absolute bottom-32 right-10">
        <StickerFloat sticker={tontonById("bella")} variant="float-b" size={80} />
      </div>

      <div className="relative z-10 w-full max-w-xl rounded-[28px] bg-white px-8 py-10 shadow-xl">
        <p className="font-note text-base italic leading-relaxed text-[#5C3D2E]">
          Hi beautiful,
          <br />
          I wanted to ask you this in a cute way because you deserve cute things.
          <br />
          So I have one very important question…
        </p>

        <p className="font-script mt-6 text-3xl font-bold leading-tight text-[#E86A92] sm:text-4xl">
          Will you go on a date with me
          <br />— and be my girlfriend?
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={onYes}
            className="animate-bounce-btn rounded-full bg-gradient-to-br from-[#E86A92] to-[#D45880] px-9 py-3 font-note font-bold text-white shadow-lg"
          >
            Yes 💕
          </button>
          <button
            type="button"
            onClick={onYes}
            className="animate-bounce-btn rounded-full bg-gradient-to-br from-[#8B5E3C] to-[#7A5030] px-9 py-3 font-note font-bold text-[#FFE8D5] shadow-lg"
          >
            Obviously yes ☕
          </button>
        </div>

        <span className="mt-4 block cursor-default font-note text-xs italic text-[#C4A080] underline decoration-dotted underline-offset-4">
          maybe... no? →
        </span>
      </div>
    </section>
  );
}
