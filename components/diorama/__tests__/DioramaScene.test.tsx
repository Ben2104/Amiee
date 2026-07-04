import { describe, it, expect } from "vitest";
import ReactThreeTestRenderer from "@react-three/test-renderer";
import { DioramaContents } from "@/components/diorama/DioramaScene";

// @react-three/test-renderer drives React via react-reconciler's `act`, which
// warns unless the environment opts in to React 18's act() semantics.
(globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("DioramaContents", () => {
  it("renders without throwing and includes the orthographic camera", async () => {
    const renderer = await ReactThreeTestRenderer.create(<DioramaContents />);
    const graph = JSON.stringify(renderer.toGraph());
    expect(graph.toLowerCase()).toContain("orthographiccamera");
  });
});
