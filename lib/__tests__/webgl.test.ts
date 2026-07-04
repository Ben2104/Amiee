import { describe, it, expect, vi, afterEach } from "vitest";
import { hasWebGL } from "@/lib/webgl";

describe("hasWebGL", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns true when the canvas can produce a webgl context", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      getContext: () => ({}),
    } as unknown as HTMLCanvasElement);
    expect(hasWebGL()).toBe(true);
  });

  it("returns false when the canvas cannot produce a webgl context", () => {
    vi.spyOn(document, "createElement").mockReturnValue({
      getContext: () => null,
    } as unknown as HTMLCanvasElement);
    expect(hasWebGL()).toBe(false);
  });
});
