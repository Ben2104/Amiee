import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OpeningState } from "@/components/lovenote/OpeningState";

describe("OpeningState", () => {
  it("calls onOpen when the envelope is tapped", async () => {
    const onOpen = vi.fn();
    render(<OpeningState onOpen={onOpen} />);
    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(onOpen).toHaveBeenCalledOnce();
  });

  it("shows the opening copy and the shiba Tonton", () => {
    render(<OpeningState onOpen={() => {}} />);
    expect(screen.getByText(/a tiny delivery/i)).toBeInTheDocument();
    expect(screen.getByAltText(/chubby yuta the shiba/i)).toBeInTheDocument();
  });
});
