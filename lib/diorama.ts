export const ROOM = { width: 7, height: 4.8, depth: 7 } as const;

export const MEZZANINE = { y: 1.4, depth: 3.5 } as const;

export const PALETTE = {
  brick: "#382010",
  mezzanineFloor: "#B08050",
  sofa: "#C09494",
  furniture: "#D2AE60",
  warmLight: "#FFB030",
} as const;

export const CAMERA = {
  position: [14, 12, 14] as [number, number, number],
  lookAt: [3.5, 1, 3.5] as [number, number, number],
  zoom: 30,
} as const;

export const LIGHTING = {
  pointLightIntensity: 8,
  pointLightDecay: 0,
} as const;
