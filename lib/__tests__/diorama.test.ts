import { describe, it, expect } from "vitest";
import { ROOM, MEZZANINE, PALETTE, CAMERA } from "@/lib/diorama";

describe("diorama constants", () => {
  it("matches the imported blueprint's room dimensions", () => {
    expect(ROOM).toEqual({ width: 7, height: 4.8, depth: 7 });
  });

  it("matches the blueprint's mezzanine split", () => {
    expect(MEZZANINE).toEqual({ y: 1.4, depth: 3.5 });
  });

  it("matches the blueprint's material palette", () => {
    expect(PALETTE.brick).toBe("#382010");
    expect(PALETTE.mezzanineFloor).toBe("#B08050");
    expect(PALETTE.sofa).toBe("#C09494");
    expect(PALETTE.furniture).toBe("#D2AE60");
    expect(PALETTE.warmLight).toBe("#FFB030");
  });

  it("matches the blueprint's camera position and look-at target", () => {
    expect(CAMERA.position).toEqual([14, 12, 14]);
    expect(CAMERA.lookAt).toEqual([3.5, 1, 3.5]);
  });
});
