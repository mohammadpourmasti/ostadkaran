import type { ApplianceId } from "@/types/appliance";

/*
 * Hero scene geometry in "scene units": 1 unit = 1% of the scene width. The scene
 * is SCENE_H units tall: an orbit area with a strip below it for the technician,
 * who works just outside the orbit. Everything is fixed and deterministic: a true
 * circular orbit, eight slots on it from the lower right (RTL start) across the
 * top to the lower left, and a focus point inside the orbit where the selected
 * appliance is shown (as a separate, larger render; the orbit slot itself never
 * changes).
 */

export const SCENE_H = 141;

// Scene units -> CSS % of the scene height (x needs no conversion).
export const pctY = (units: number) => Math.round((units / SCENE_H) * 10000) / 100;

export const orbit = {
  cx: 50,
  cy: 54,
  r: 43,
};

// Centre of the selected-appliance showcase, and its box width (scene units).
export const focus = {
  x: 50,
  y: 57,
  size: 46,
};

// Orbit items are this wide (% of the scene).
export const ITEM_SIZE = 13;

export type OrbitSlot = {
  // Position as CSS % of the scene box.
  x: number;
  y: number;
  // The same position in scene units (for SVG).
  ux: number;
  uy: number;
  // Normalises render framing (wide/short renders sit smaller in a square box).
  zoom: number;
  // Name label sits above the item on the lower half of the orbit, below it elsewhere.
  labelAbove: boolean;
};

// Degrees clockwise from 12 o'clock. The bottom of the orbit is left open for the technician.
const slotAngles: Record<ApplianceId, { angle: number; zoom: number }> = {
  "washing-machine": { angle: 140, zoom: 1 },
  refrigerator: { angle: 100, zoom: 1 },
  dishwasher: { angle: 60, zoom: 1 },
  television: { angle: 20, zoom: 1.25 },
  stove: { angle: -20, zoom: 1 },
  "vacuum-cleaner": { angle: -60, zoom: 1 },
  "air-conditioner": { angle: -100, zoom: 1.2 },
  other: { angle: -140, zoom: 1.25 },
};

const round = (value: number) => Math.round(value * 100) / 100;

export const orbitSlots = Object.fromEntries(
  Object.entries(slotAngles).map(([id, { angle, zoom }]) => {
    const radians = (angle * Math.PI) / 180;
    const ux = round(orbit.cx + orbit.r * Math.sin(radians));
    const uy = round(orbit.cy - orbit.r * Math.cos(radians));
    return [id, { x: ux, y: pctY(uy), ux, uy, zoom, labelAbove: Math.abs(angle) >= 120 }];
  }),
) as Record<ApplianceId, OrbitSlot>;

// Technician placement: crouched just below the orbit ring, facing the centre showcase.
// The image is 3:2, so its box is width * 2/3 tall; the figure spans ~5%-95% of that.
const TECHNICIAN_WIDTH = 72;
const TECHNICIAN_FIGURE_TOP = 86.5; // scene units: just under the ring's lowest point

export const technicianBox = {
  left: -33,
  top: pctY(TECHNICIAN_FIGURE_TOP - TECHNICIAN_WIDTH * (2 / 3) * 0.05),
  width: TECHNICIAN_WIDTH,
};

// Small nodes on the orbit line, midway between neighbouring appliances (degrees clockwise from 12 o'clock).
export const orbitNodes = [120, 80, 40, 0, -40, -80, -120].map((angle) => {
  const radians = (angle * Math.PI) / 180;
  return { x: round(orbit.cx + orbit.r * Math.sin(radians)), y: round(orbit.cy - orbit.r * Math.cos(radians)) };
});
