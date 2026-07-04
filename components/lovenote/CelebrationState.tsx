import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

export function CelebrationState() {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#FFE8F0] via-[#FFD6E7] to-[#FFBDD0] px-6 py-20 text-center">
      <div className="absolute right-10 top-20">
        <StickerFloat sticker={tontonById("tobi")} variant="float-b" size={90} className="animate-dance-tonton" />
      </div>

      <h1 className="font-script text-6xl font-bold text-[#BF4060] sm:text-8xl">YAYYY!</h1>
      <p className="font-script mt-2 text-3xl font-semibold text-[#E86A92] sm:text-4xl">It&apos;s official 💗</p>
      <p className="font-note mt-4 max-w-md text-sm text-[#8B2A50]">
        Tonton approves. I can&apos;t wait to call you mine. 🥹
      </p>

      <div className="mt-8 w-full max-w-md rounded-[28px] bg-white/90 px-9 py-8 shadow-xl">
        <p className="font-script text-2xl font-bold text-[#BF4060]">Date Plan</p>
        <div className="mt-4 flex flex-col gap-3 text-left">
          <p className="font-note text-sm font-semibold text-[#5C3D2E]">☕ Coffee, dessert, and your favorite person</p>
          <hr className="border-[#D8B89A]/30" />
          <p className="font-note text-sm text-[#5C3D2E]">👗 Dress code: cute and comfy</p>
          <hr className="border-[#D8B89A]/30" />
          <p className="font-note text-sm text-[#5C3D2E]">😊 Required: your smile</p>
        </div>
      </div>
    </section>
  );
}
