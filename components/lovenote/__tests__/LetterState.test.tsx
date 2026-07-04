import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LetterState } from "@/components/lovenote/LetterState";

describe("LetterState", () => {
  it("asks both the date question and the girlfriend question", () => {
    render(<LetterState onYes={() => {}} />);
    expect(screen.getByText(/will you go on a date with me/i)).toBeInTheDocument();
    expect(screen.getByText(/be my girlfriend/i)).toBeInTheDocument();
  });

  it("calls onYes when either yes button is clicked", async () => {
    const onYes = vi.fn();
    render(<LetterState onYes={onYes} />);
    await userEvent.click(screen.getByRole("button", { name: /^yes/i }));
    expect(onYes).toHaveBeenCalledOnce();
  });

  it("renders the dodge link with no click handler", () => {
    render(<LetterState onYes={() => {}} />);
    const dodge = screen.getByText(/maybe\.\.\. no\?/i);
    expect(dodge.tagName).toBe("SPAN");
  });
});
