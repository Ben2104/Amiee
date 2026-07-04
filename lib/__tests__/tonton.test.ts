import { describe, it, expect } from "vitest";
import { TONTON_STICKERS, tontonById } from "@/lib/tonton";

describe("tonton data", () => {
  it("has exactly the three Tonton Friends characters", () => {
    expect(TONTON_STICKERS.map((s) => s.id)).toEqual(["yuta", "bella", "tobi"]);
  });

  it("looks up a sticker by id", () => {
    const yuta = tontonById("yuta");
    expect(yuta.src).toContain("HWeUBuTIJV73ybn2bd");
  });
});
