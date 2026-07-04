import { Hero } from "@/components/Hero";
import { DioramaSection } from "@/components/diorama/DioramaSection";
import { LoveNoteFlow } from "@/components/lovenote/LoveNoteFlow";
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <DioramaSection />
      <div className="relative">
        <div className="pointer-events-none absolute left-6 top-10 z-10">
          <StickerFloat sticker={tontonById("bella")} variant="twinkle" size={56} />
        </div>
        <div className="pointer-events-none absolute right-6 top-1/2 z-10">
          <StickerFloat sticker={tontonById("tobi")} variant="float-a" size={56} />
        </div>
        <LoveNoteFlow />
      </div>
    </main>
  );
}
