import { PALETTE } from "@/lib/diorama";

export interface BoxSpec {
  position: [number, number, number];
  size: [number, number, number];
  color: string;
}

export const ROOM_SHELL: BoxSpec[] = [
  { position: [3.5, 2.4, -0.1], size: [7, 4.8, 0.2], color: PALETTE.brick },
  { position: [-0.1, 2.4, 3.5], size: [0.2, 4.8, 7], color: PALETTE.brick },
];

export const FLOOR: BoxSpec[] = [{ position: [3.5, -0.1, 3.5], size: [7, 0.2, 7], color: "#1E1206" }];

export const MEZZANINE_FLOOR: BoxSpec[] = [
  { position: [3.5, 1.4, 1.75], size: [7, 0.14, 3.5], color: PALETTE.mezzanineFloor },
];

export const STAIRS: BoxSpec[] = Array.from({ length: 6 }, (_, i) => ({
  position: [5.0, (1.4 / 6) * i, 3.5 + 0.42 * (6 - i)] as [number, number, number],
  size: [1.6, 1.4 / 6 + 0.05, 0.45] as [number, number, number],
  color: "#C8A87A",
}));

export const LOUNGE: BoxSpec[] = [
  { position: [0.8, 1.83, 1.93], size: [1.0, 0.86, 2.9], color: PALETTE.sofa },
  { position: [2.4, 1.83, 0.86], size: [2.3, 0.86, 0.95], color: PALETTE.sofa },
  { position: [3.9, 1.83, 1.68], size: [0.9, 0.86, 2.6], color: PALETTE.sofa },
  { position: [2.25, 1.61, 1.9], size: [1.8, 0.42, 1.5], color: "#D4A0A8" },
];

export const BAR: BoxSpec[] = [
  { position: [5.8, 1.9, 0.98], size: [2.4, 1.0, 1.85], color: "#6A4A1E" },
  { position: [5.05, 2.15, 0.36], size: [0.52, 0.5, 0.48], color: "#242424" },
];

export const TABLES: BoxSpec[] = [
  { position: [1.25, 0.76, 4.1], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [3.5, 0.76, 4.05], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [5.6, 0.76, 4.0], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [1.85, 0.76, 5.55], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
  { position: [4.3, 0.76, 5.5], size: [0.76, 0.07, 0.76], color: PALETTE.furniture },
];

export const DELIVERY_BOT: BoxSpec[] = [
  { position: [2.85, 0.04, 4.72], size: [0.6, 0.08, 0.6], color: "#4A5870" },
  { position: [2.85, 0.6, 4.72], size: [0.46, 1.05, 0.46], color: "#5C6A82" },
  { position: [2.85, 1.25, 4.72], size: [0.34, 0.25, 0.34], color: "#6A7890" },
];

export const DECOR: BoxSpec[] = [
  { position: [3.0, 2.9, -0.09], size: [3, 1.5, 0.02], color: "#1B2418" },
  { position: [0.15, 3.0, 1.45], size: [0.02, 1.85, 1.9], color: "#3A5880" },
  { position: [0.15, 2.68, 3.13], size: [0.02, 1.15, 0.95], color: "#9B4020" },
];
