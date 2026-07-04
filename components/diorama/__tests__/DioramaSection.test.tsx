import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import * as webgl from "@/lib/webgl";

vi.mock("@/components/diorama/DioramaScene", () => ({
  DioramaScene: () => <div data-testid="diorama-scene-mock" />,
}));

describe("DioramaSection", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders the 3D scene when WebGL is available", async () => {
    vi.spyOn(webgl, "hasWebGL").mockReturnValue(true);
    const { DioramaSection } = await import("@/components/diorama/DioramaSection");
    render(<DioramaSection />);
    await waitFor(() => expect(screen.getByTestId("diorama-scene-mock")).toBeInTheDocument());
  });

  it("renders the static fallback image when WebGL is unavailable", async () => {
    vi.spyOn(webgl, "hasWebGL").mockReturnValue(false);
    const { DioramaSection } = await import("@/components/diorama/DioramaSection");
    render(<DioramaSection />);
    await waitFor(() => expect(screen.getByAltText(/illustrated view of the café diorama/i)).toBeInTheDocument());
  });
});
