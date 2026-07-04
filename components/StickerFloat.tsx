import type { TontonSticker } from "@/lib/tonton";

type FloatVariant = "float-a" | "float-b" | "twinkle";

const VARIANT_CLASS: Record<FloatVariant, string> = {
  "float-a": "animate-float-a",
  "float-b": "animate-float-b",
  twinkle: "animate-twinkle",
};

interface StickerFloatProps {
  sticker: TontonSticker;
  variant?: FloatVariant;
  className?: string;
  size?: number;
}

export function StickerFloat({ sticker, variant = "float-a", className = "", size = 64 }: StickerFloatProps) {
  return (
    <img
      src={sticker.src}
      alt={sticker.label}
      width={size}
      height={size}
      className={`pointer-events-none select-none ${VARIANT_CLASS[variant]} ${className}`}
    />
  );
}
