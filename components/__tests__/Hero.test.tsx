import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "@/components/Hero";

describe("Hero", () => {
  it("renders the headline and a decorative sticker", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/for you, amie/i);
    expect(screen.getByAltText(/chubby yuta the shiba/i)).toBeInTheDocument();
  });
});
