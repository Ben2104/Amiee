import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LoveNoteFlow } from "@/components/lovenote/LoveNoteFlow";

describe("LoveNoteFlow", () => {
  it("walks from opening to letter to celebration", async () => {
    render(<LoveNoteFlow />);

    expect(screen.getByText(/a tiny delivery/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /open/i }));
    expect(screen.getByText(/will you go on a date with me/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /^yes/i }));
    expect(screen.getByText(/it's official/i)).toBeInTheDocument();
  });
});
