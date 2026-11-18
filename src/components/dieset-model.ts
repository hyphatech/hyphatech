/* The levels under "From the ground up", as a die set: the tool a press
   stamps the same part with, stroke after stroke. Each level stands on
   the one below and is located by it:

   the language   the die shoe, and the four guide pillars that rise from
                  it and locate every plate above;
   Hypha Stack    the die plate, its buttons seated in it: hardened
                  inserts, each bored to the shape of one kind of part;
   the ontology   the guide plate on the pillars, its openings edged in
                  gold, each letting one punch through to its own button
                  and nowhere else, with channels between the openings
                  that join;
   the factory    the punch holder on the press ram, its punches hanging
                  through the guide plate.

   A blank slides in, the ram strokes, the punches pass through the
   openings onto the buttons, and the stamped part slides out: every one
   the same. A level lifted lifts everything that stands on it.

   Millimetres. x toward the viewer, y across (+y to the left on
   screen), z up. */

import { iso, roundedPlan, circleRing, type Plane, type Point3, type Projection } from "./iso/iso-kit";

export type Kind = "round" | "square" | "bar" | "hex";

export function outlineOf(kind: Kind, [cx, cy]: Plane, grow = 0): Plane[] {
  switch (kind) {
    case "round":
      return circleRing(cx, cy, 7 + grow, 32);
    case "square":
      return roundedPlan({ x: cx - 6.5 - grow, y: cy - 6.5 - grow, w: 13 + grow * 2, d: 13 + grow * 2, r: 1.2 + grow }, 3);
    case "bar":
      return roundedPlan({ x: cx - 4 - grow, y: cy - 10 - grow, w: 8 + grow * 2, d: 20 + grow * 2, r: 2 + grow }, 3);
    case "hex":
      return [0, 1, 2, 3, 4, 5].map((i) => [cx + Math.cos((i / 6) * Math.PI * 2 + Math.PI / 6) * (8 + grow), cy + Math.sin((i / 6) * Math.PI * 2 + Math.PI / 6) * (8 + grow)] as Plane);
  }
}

/* Counter-clockwise, so a wall's left normal points into its opening. */
export function ccw(ring: Plane[]) {
  let area = 0;
  ring.forEach(([x0, y0], i) => {
    const [x1, y1] = ring[(i + 1) % ring.length]!;
    area += x0 * y1 - x1 * y0;
  });
  return area < 0 ? [...ring].reverse() : ring;
}

/* The stations: where each kind is cut, the same place on every plate. */
export const STATIONS: { kind: Kind; at: Plane }[] = [
  { kind: "round", at: [-20, 44] },
  { kind: "bar", at: [-20, 0] },
  { kind: "hex", at: [-20, -44] },
  { kind: "square", at: [24, 44] },
  { kind: "round", at: [24, 0] },
  { kind: "bar", at: [24, -44] },
];
export const JOINS: [number, number][] = [
  [0, 1],
  [1, 2],
  [3, 4],
  [4, 5],
  [0, 3],
  [2, 5],
];

/* The die shoe: the language. */
export const SHOE = { x: -96, y: -150, w: 192, d: 300, r: 6 };
export const SHOE_H = 28;
export const FOOT_H = 8;
export const PILLARS: Plane[] = [
  [-74, 112],
  [74, 112],
  [-74, -112],
  [74, -112],
];
export const PILLAR_R = 8;
export const PILLAR_TOP = 334;

/* The die plate: Hypha Stack. Its buttons stand 2 proud of it. */
export const DIE = { x: -58, y: -92, w: 116, d: 184, r: 4 };
export const DIE_TOP = SHOE_H + 18;
export const BUTTON_R = 15;
export const BUTTON_TOP = DIE_TOP + 2;

/* The guide plate: the ontology. */
export const GUIDE = { x: -92, y: -132, w: 184, d: 264, r: 5 };
export const GUIDE_Z = 122;
export const GUIDE_H = 16;
export const CLEAR = 1;

/* The punch holder: the factory. Its punches are long enough to pass
   through the guide plate and reach the buttons; it stands high enough
   over the guide plate, at rest, for the openings to show under it. */
export const HOLDER = GUIDE;
export const HOLDER_Z = 250;
export const HOLDER_H = 22;
export const BLANK = { x: -38, y: -66, w: 78, d: 132, r: 3 };
export const BLANK_H = 2.5;
const BOTTOM_STOP = GUIDE_Z + GUIDE_H + 8;
export const PUNCH_L = BOTTOM_STOP - (BUTTON_TOP + BLANK_H);
export const STROKE = HOLDER_Z - BOTTOM_STOP;

/* The camera: higher than the router's, to look down between the
   plates. */
export const WIDTH = 760;
export const AZIMUTH = 30;
export const ELEVATION = 40;
const PAD = 14;
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Point3[] =>
  [z0, z1].flatMap((z) => [
    [x0, y0, z],
    [x1, y0, z],
    [x0, y1, z],
    [x1, y1, z],
  ]) as Point3[];
/* How far a level may be lifted, so the fit leaves room for it. */
export const LIFT = 26;
function fit(points: Point3[]) {
  const unit: Projection = { origin: [0, 0], scale: 1, azimuth: AZIMUTH, elevation: ELEVATION };
  const flat = points.map((point) => iso(point, unit));
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const scale = (WIDTH - PAD * 2) / (Math.max(...xs) - Math.min(...xs));
  const height = Math.ceil((Math.max(...ys) - Math.min(...ys)) * scale + PAD * 2);
  return { P: { origin: [PAD - Math.min(...xs) * scale, PAD - Math.min(...ys) * scale], scale, azimuth: AZIMUTH, elevation: ELEVATION } as Projection, height };
}
export const RAM_TOP = HOLDER_Z + HOLDER_H + 48;
const fitted = fit([
  ...box(SHOE.x, SHOE.x + SHOE.w, SHOE.y, SHOE.y + SHOE.d, -FOOT_H, 0),
  ...box(GUIDE.x, GUIDE.x + GUIDE.w, GUIDE.y, GUIDE.y + GUIDE.d, 0, PILLAR_TOP + LIFT * 3),
  ...box(-30, 30, -30, 30, 0, RAM_TOP + LIFT * 3),
]);
export const P = fitted.P;
export const HEIGHT = fitted.height;

/* The press cycle, in seconds: the blank slides in, the ram comes down
   and goes back up, the stamped part slides out, a beat. */
export const FEED = 1.1;
const SETTLE = 0.5;
const DOWN = 0.7;
const DWELL = 0.18;
const UP = 1.0;
const OUT = 1.1;
const BEAT = 0.9;
export const CYCLE = FEED + SETTLE + DOWN + DWELL + UP + OUT + BEAT;
/* Where the blank comes in from and goes out to, along y: over the
   shoe both ways, never past its ends, fading in and out as it goes. */
export const IN_Y = 80;
export const OUT_Y = -80;

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
const easeIn = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t);

export interface Press {
  /* How far the ram is down, 0 to STROKE. */
  down: number;
  /* Where the blank is along y, whether it is stamped, how present. */
  blank: { y: number; stamped: boolean; opacity: number } | null;
  strokes: number;
}

export function pressAt(time: number): Press {
  const n = Math.floor(time / CYCLE);
  let t = time - n * CYCLE;
  const strokes = n + (t >= FEED + SETTLE + DOWN ? 1 : 0);
  if (t < FEED) return { down: 0, blank: { y: IN_Y * (1 - ease(t / FEED)), stamped: false, opacity: ease(t / (FEED * 0.4)) }, strokes };
  t -= FEED;
  if (t < SETTLE) return { down: 0, blank: { y: 0, stamped: false, opacity: 1 }, strokes };
  t -= SETTLE;
  if (t < DOWN) return { down: STROKE * easeIn(t / DOWN), blank: { y: 0, stamped: false, opacity: 1 }, strokes };
  t -= DOWN;
  if (t < DWELL) return { down: STROKE, blank: { y: 0, stamped: true, opacity: 1 }, strokes };
  t -= DWELL;
  if (t < UP) return { down: STROKE * (1 - ease(t / UP)), blank: { y: 0, stamped: true, opacity: 1 }, strokes };
  t -= UP;
  if (t < OUT) return { down: 0, blank: { y: OUT_Y * ease(t / OUT), stamped: true, opacity: 1 - ease((t - OUT * 0.6) / (OUT * 0.4)) }, strokes };
  return { down: 0, blank: null, strokes };
}

/* The still: the ram up and the die plate clear, every level in view. */
export const REST = CYCLE - BEAT / 2;

export const LEVELS = ["language", "stack", "ontology", "factory"] as const;
export type Level = (typeof LEVELS)[number];

export const LABEL =
  "A die set, the tool a press stamps the same part with, built from the ground up. The die shoe at the bottom carries four guide pillars that locate every plate above. On it, the die plate holds six hardened buttons, each bored to the shape of one kind of part. Above, a guide plate on the pillars has an opening for each, edged in gold, with channels between them. At the top the punch holder on the press ram carries the punches, hanging through the guide plate's openings. A blank slides in, the ram strokes, each punch passes through its opening onto its own button, and the stamped part slides out, every one the same.";
