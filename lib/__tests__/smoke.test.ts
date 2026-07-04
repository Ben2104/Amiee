import { describe, it, expect } from "vitest";

describe("test environment", () => {
  it("runs in jsdom with a document global", () => {
    expect(typeof document).toBe("object");
  });
});
