import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StickerFloat } from "@/components/StickerFloat";
import { tontonById } from "@/lib/tonton";

describe("StickerFloat", () => {
  it("renders the sticker image with correct alt text and animation class", () => {
    render(<StickerFloat sticker={tontonById("tobi")} variant="float-b" />);
    const img = screen.getByAltText("Chubby Tobi the bunny");
    expect(img).toHaveAttribute("src", expect.stringContaining("scGLs3atZgUCevRxn1"));
    expect(img).toHaveClass("animate-float-b");
  });
});
