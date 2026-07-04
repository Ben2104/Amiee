"use client";

import { useState } from "react";
import { OpeningState } from "./OpeningState";
import { LetterState } from "./LetterState";
import { CelebrationState } from "./CelebrationState";

type FlowState = "opening" | "letter" | "celebration";

export function LoveNoteFlow() {
  const [state, setState] = useState<FlowState>("opening");

  if (state === "opening") return <OpeningState onOpen={() => setState("letter")} />;
  if (state === "letter") return <LetterState onYes={() => setState("celebration")} />;
  return <CelebrationState />;
}
