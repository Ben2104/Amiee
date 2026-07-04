import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/components/diorama/DioramaSection", () => ({
  DioramaSection: () => <div data-testid="diorama-section-mock" />,
}));

import Home from "@/app/page";

describe("Home page", () => {
  it("renders the hero, diorama section, and love note flow in order", () => {
    render(<Home />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/for you, amie/i);
    expect(screen.getByTestId("diorama-section-mock")).toBeInTheDocument();
    expect(screen.getByText(/a tiny delivery/i)).toBeInTheDocument();
  });

  it("includes at least one extra decorative sticker outside the love note flow", () => {
    render(<Home />);
    expect(screen.getByAltText(/tsundere bella the cat/i)).toBeInTheDocument();
    expect(screen.getByAltText(/chubby tobi the bunny/i)).toBeInTheDocument();
  });
});
