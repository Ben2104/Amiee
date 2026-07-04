import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CelebrationState } from "@/components/lovenote/CelebrationState";

describe("CelebrationState", () => {
  it("confirms girlfriend status, not just a date", () => {
    render(<CelebrationState />);
    expect(screen.getByText(/it's official/i)).toBeInTheDocument();
    expect(screen.getByText(/call you mine/i)).toBeInTheDocument();
    expect(screen.getByAltText(/chubby tobi the bunny/i)).toBeInTheDocument();
  });

  it("still shows the date plan card", () => {
    render(<CelebrationState />);
    expect(screen.getByText(/coffee, dessert/i)).toBeInTheDocument();
    expect(screen.getByText(/required: your smile/i)).toBeInTheDocument();
  });
});
