import { describe, it, expect } from "vitest";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { CafeModel } from "@/components/diorama/CafeModel";

// @react-three/test-renderer drives React via react-reconciler's `act`, which
// warns unless the environment opts in to React 18's act() semantics.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("CafeModel", () => {
  it("renders every expected scene-graph group exactly once", async () => {
    const renderer = await ReactThreeTestRenderer.create(<CafeModel />);
    const graph = JSON.stringify(renderer.toGraph());

    const expectedGroups = [
      "room",
      "floor",
      "mezzanine",
      "stairs",
      "lounge",
      "bar",
      "tables",
      "deliveryBot",
      "decor",
    ];

    for (const name of expectedGroups) {
      const matches = graph.match(new RegExp(`"name":"${name}"`, "g"));
      expect(matches?.length).toBe(1);
    }
  });
});
