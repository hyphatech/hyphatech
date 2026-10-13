/* The template router drawn back to front (`route-model.ts` says what
   it is). The bench, fences, template, boxes and column are drawn once;
   the boards are groups the row slides and the platen drops, each with
   its pocket drawn in the plane of its top through two masks; the router
   is a group that follows the bit, and the arm is redrawn each frame
   (`TemplateRouter.astro`). */

import * as k from "./iso/iso-kit";
import type { Plane, Point3 } from "./iso/iso-kit";
import {
  ARM_Z,
  BIT,
  BOARD,
  BOARD_Z,
  BUSH,
  COLUMN,
  DEPTH,
  FENCE_H,
  FOOT_H,
  HEIGHT,
  MOTOR,
  OPENING,
  P,
  PITCH,
  PLATE,
  PLATE_H,
  TEMPLATE,
  TOP,
  WIDTH,
  armOf,
  type Sample,
} from "./route-model";

const S = k.solidSvg;
const L = k.lineSvg;
const at = (point: Point3) => k.iso(point, P);
const D = (points: Point3[], size = 0.5) => k.dotsSvg(points.map(at), { size });
const halo = (plan: k.Plan, z: number, h: number) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"/>`;
const slab = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, r = 0.6, steps = 2, bevel = 0) =>
  k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, steps, bevel);
const depth = ([x, y]: Plane, z = 0) => k.depthOf([x, y, z], P);
const [VX, VY] = k.towardViewer(P);
const cam = k.cameraOf(P);
const tenth = (value: number) => (Math.round(value * 10) / 10).toString();

/* The hull of some circles on the floor: a teardrop base, a link. */
function hullOf(circles: [number, number, number][], steps = 40): Plane[] {
  const points: Plane[] = [];
  for (const [cx, cy, r] of circles) for (let i = 0; i < steps; i++) points.push([cx + Math.cos((i / steps) * Math.PI * 2) * r, cy + Math.sin((i / steps) * Math.PI * 2) * r]);
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Plane, a: Plane, b: Plane) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: Plane[]) => {
    const out: Plane[] = [];
    for (const point of list) {
      while (out.length >= 2 && cross(out[out.length - 2]!, out[out.length - 1]!, point) <= 0) out.pop();
      out.push(point);
    }
    return out.slice(0, -1);
  };
  return [...half(sorted), ...half([...sorted].reverse())];
}
const hullSolid = (circles: [number, number, number][], z: number, h: number, bevel = 0) => k.extrude(hullOf(circles), z, h, P, { bevel });

/* The row: fences either side of a channel, from the feeder's mouth to
   the stacker's. */
const CHANNEL = BOARD.w / 2 + 2;
const FENCE_W = 24;
export const ROW_Y: [number, number] = [-PITCH * 1.5, PITCH / 2];
const BOX_H = 52;
const BOX_D = PITCH + 6;
const FEEDER = { x: -CHANNEL - FENCE_W, y: ROW_Y[1], w: (CHANNEL + FENCE_W) * 2, d: BOX_D, r: 3 };
const STACKER = { x: -CHANNEL - FENCE_W, y: ROW_Y[0] - BOX_D, w: (CHANNEL + FENCE_W) * 2, d: BOX_D, r: 3 };

function bench() {
  const out = [halo(PLATE, -PLATE_H - FOOT_H, PLATE_H)];
  const feet = [...k.corners(PLATE, 22)].sort((a, b) => depth(a) - depth(b));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 11);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => [x, y, 0])));
  /* A ruler strip along the near edge, under the row. */
  const strip = { x: PLATE.x + PLATE.w - 16, y: PLATE.y + 24, w: 8, d: PLATE.d - 48, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 5, strip.y + strip.d - 5, 5, 5, strip.x, 0.6, [2.2, 4], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([[strip.x + 4, strip.y + 2.5, 0.6], [strip.x + 4, strip.y + strip.d - 2.5, 0.6]], 0.45));
  return out.join("");
}

/* A fence: a bar screwed down along the channel, its far end on the
   stacker, its near end on the feeder. */
function fence(x0: number) {
  const out = [S(slab(x0, x0 + FENCE_W, ROW_Y[0], ROW_Y[1], 0, FENCE_H, 1, 2, 0.6), { tone: "mid" })];
  const xs = x0 + FENCE_W / 2;
  const screws = [-200, -150, -100].map((y) => [xs, y] as Plane);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.6, FENCE_H, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => [x, y, FENCE_H])));
  return out.join("");
}

/* The column the arm turns on, behind the jig. */
function column() {
  const [cx, cy] = COLUMN;
  const out: string[] = [halo({ x: cx - 34, y: cy - 34, w: 68, d: 68, r: 34 }, 0, 0.1)];
  out.push(S(k.cylinder(cx, cy, 34, 0, 8, P, 56, 0.6), { tone: "mid" }));
  const bolts = [0, 1, 2, 3, 4, 5].map((i) => [cx + Math.cos((i / 6) * Math.PI * 2 + 0.3) * 27, cy + Math.sin((i / 6) * Math.PI * 2 + 0.3) * 27] as Plane);
  out.push(L(bolts.map(([x, y]) => k.ring(x, y, 2.4, 8, P, 14)).join(""), { tone: "lo" }), D(bolts.map(([x, y]) => [x, y, 8])));
  out.push(S(k.cylinder(cx, cy, 16, 8, ARM_Z - 26, P, 40), { tone: "mid", crease: "none", inner: L(k.sideArc(cx, cy, 16, 40, P, 28) + k.sideArc(cx, cy, 16, ARM_Z - 60, P, 28), { tone: "faint" }) }));
  /* The bearing housing the first link turns in. */
  out.push(S(k.cylinder(cx, cy, 22, ARM_Z - 18, 18, P, 48, 0.6), { tone: "mid", inner: L(k.sideArc(cx, cy, 22, ARM_Z - 9, P, 32), { tone: "faint" }) }));
  return out.join("");
}

/* A closed box at either end of the row, sheet metal with a lid, a vent
   and a lamp: the blanks come out of one and the cut boards go into the
   other, out of sight. The stacker's mouth faces the row. */
function boxOf(plan: k.Plan, feeder: boolean) {
  const { x, y, w, d } = plan;
  const out: string[] = [halo(k.insetPlan(plan, 6), 0, 0.1)];
  const lid = BOX_H;
  out.push(S(k.slabOf(plan, 0, BOX_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(plan, lid - 9, P, 4) + k.sideSeam(plan, 7, P, 4), { tone: "faint" }) }));
  const top = k.insetPlan(plan, 8);
  out.push(L(k.planOutline(top, lid, P, 3), { tone: "faint" }));
  /* Two hinge knuckles at the lid's far edge, and a vent on the near face. */
  for (const hy of [y + d * 0.28, y + d * 0.72]) out.push(S(k.slabOf({ x: x + 2, y: hy - 10, w: 6, d: 20, r: 2.5 }, lid, 2.4, P, 4), { tone: "mid", crease: "none" }));
  const face = (fy: number, fz: number): Point3 => [x + w, fy, fz];
  const quad = (y0: number, y1: number, z0: number, z1: number) => k.pathOf([face(y0, z0), face(y1, z0), face(y1, z1), face(y0, z1)].map(at), true);
  if (feeder) {
    /* A label holder: a frame round a card with two lines of print. */
    const [ly, lz] = [y + d / 2 - 22, 17];
    out.push(`<path class="iso-shade" data-shade="1" d="${quad(ly, ly + 44, lz, lz + 16)}"/>`, L(quad(ly, ly + 44, lz, lz + 16), { tone: "lo" }));
    out.push(L([0, 1].map((row) => k.segment(face(ly + 6, lz + 10.5 - row * 5), face(ly + [32, 22][row]!, lz + 10.5 - row * 5), P)).join(""), { tone: "lo", free: true }));
    out.push(D([face(ly + 3, lz + 13), face(ly + 41, lz + 13)], 0.4));
  } else {
    for (let row = 0; row < 3; row++) {
      const z = 15 + row * 7;
      const slot = quad(y + d / 2 - 30, y + d / 2 + 30, z, z + 2.6);
      out.push(`<path class="iso-shade" data-shade="0" d="${slot}"/>`, L(slot, { tone: "lo" }));
    }
  }
  out.push(`<g class="route-lamp">${k.dotsSvg([at([x + w, y + d - 12, lid - 18])], { size: 1.4, tone: "hi" })}</g>`);
  out.push(D([face(y + 6, lid - 4.5), face(y + d - 6, lid - 4.5), face(y + 6, 3.5), face(y + d - 6, 3.5)], 0.45));
  if (!feeder) {
    /* The mouth on the face toward the row, a frame round a dark slot. */
    const side = (fx: number, fz: number): Point3 => [fx, y + d, fz];
    const ring = (by: number) => k.pathOf([side(-CHANNEL - by, BOARD_Z - 4 - by), side(CHANNEL + by, BOARD_Z - 4 - by), side(CHANNEL + by, FENCE_H + 4 + by), side(-CHANNEL - by, FENCE_H + 4 + by)].map(at), true);
    out.push(`<path class="iso-shade" data-shade="1" d="${ring(4)}"/>`, L(ring(4), { tone: "lo" }));
    out.push(`<path class="route-void" d="${ring(0)}"/>`, L(ring(0), { tone: "lo" }));
  }
  return out.join("");
}

/* The template: a plate screwed to both fences across the channel, the
   opening cut through it and edged in gold. Its fill and top have the
   opening cut out, so what lies under it shows through; its far walls,
   which face us, are drawn inside. */
const OPEN_TOP = OPENING.map(([x, y]) => at([x, y, TOP]));
const OPEN_PATH = k.pathOf(OPEN_TOP, true);
const WALLS = OPENING.map((point, i) => {
  const next = OPENING[(i + 1) % OPENING.length]!;
  const [tx, ty] = [next[0] - point[0], next[1] - point[1]];
  const length = Math.hypot(tx, ty) || 1;
  /* The wall faces into the opening: the left of a counter-clockwise edge. */
  const [nx, ny] = [-ty / length, tx / length];
  return { from: point, to: next, facing: nx * VX + ny * VY > 0, normal: [nx, ny] as Plane };
});
/* The near edge, whose wall turns away: drawn again over the bushing. */
const runsWhere = (want: boolean) => {
  const runs: Plane[][] = [];
  let run: Plane[] = [];
  const start = WALLS.findIndex((wall) => wall.facing !== want);
  for (let n = 0; n < WALLS.length; n++) {
    const wall = WALLS[(start + 1 + n) % WALLS.length]!;
    if (wall.facing === want) {
      if (!run.length) run.push(wall.from);
      run.push(wall.to);
    } else if (run.length) {
      runs.push(run);
      run = [];
    }
  }
  if (run.length) runs.push(run);
  return runs;
};
const NEAR_EDGE = runsWhere(false)
  .map((run) => k.onTop(run, TOP, P))
  .join("");

function template() {
  const paths = k.slabOf(TEMPLATE, FENCE_H, TOP - FENCE_H, P, 3, 0.8);
  const out: string[] = [];
  out.push(`<g class="iso-solid"><path class="iso-fill" fill-rule="evenodd" d="${paths.fill}${OPEN_PATH}"/>`);
  paths.shades.forEach((d, shade) => d && out.push(`<path class="iso-shade" data-shade="${shade}" d="${d}"/>`));
  out.push(`<path class="iso-top" fill-rule="evenodd" d="${paths.top}${OPEN_PATH}"/>`);
  if (paths.bevel) out.push(L(paths.bevel, { tone: "faint", className: "iso-bevel" }));
  out.push(L(paths.crease, { tone: "faint", className: "iso-crease" }), L(paths.outline, { tone: "mid", className: "iso-edge" }), `</g>`);
  /* The far walls, shaded by how they face the light. */
  const [lx, ly] = [-cam.sinA, cam.cosA];
  const buckets: string[][] = [[], [], [], []];
  for (const wall of WALLS) {
    if (!wall.facing) continue;
    const lit = (wall.normal[0] * lx + wall.normal[1] * ly + 1) / 2;
    const shade = Math.min(3, Math.max(0, Math.floor(lit * 4)));
    buckets[shade]!.push(k.pathOf([at([...wall.from, TOP]), at([...wall.to, TOP]), at([...wall.to, FENCE_H]), at([...wall.from, FENCE_H])], true));
  }
  buckets.forEach((list, shade) => list.length && out.push(`<path class="iso-shade route-wall-face" data-shade="${shade}" d="${list.join("")}"/>`));
  /* The walls' foot, and their edges where they turn away. */
  const far = runsWhere(true);
  out.push(L(far.map((run) => k.onTop(run, FENCE_H, P) + k.rise(run[0]!, FENCE_H, TOP, P) + k.rise(run[run.length - 1]!, FENCE_H, TOP, P)).join(""), { tone: "faint" }));
  out.push(L(OPEN_PATH, { tone: "gold" }));
  /* Countersunk screws into the fences, four a side. */
  const screws = [-60, 0, 60].flatMap((y) => [[-118, y], [118, y]] as Plane[]);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 3.2, TOP, P, 18) + k.ring(x, y, 1.6, TOP, P, 12)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => [x, y, TOP]), 0.4));
  return out.join("");
}

/* A board, built about its own centre at the platen's raised height. */
const BOARD_TOP = BOARD_Z + BOARD.h;
/* A board's plan, cut off where it has gone into the stacker: from y0
   on, in its own coordinates. */
const planFrom = (y0: number) => {
  const from = Math.max(-BOARD.d / 2, y0);
  return { x: -BOARD.w / 2, y: from, w: BOARD.w, d: BOARD.d / 2 - from, r: from > -BOARD.d / 2 ? 0 : 1.5 };
};
export const boardSolid = (y0: number) => (y0 >= BOARD.d / 2 ? "" : S(k.slabOf(planFrom(y0), BOARD_Z, BOARD.h, P, 2, 0.6), { tone: "hi", crease: "lo" }));
export const faceOf = (y0: number) => (y0 >= BOARD.d / 2 ? "M0 0Z" : k.planOutline(planFrom(y0), BOARD_TOP, P, 2));
/* Where the stacker's mouth is, for a board at y. */
export const mouthFor = (y: number) => ROW_Y[0] - y;
export const SURFACE = k.topMatrix([0, 0], BOARD_TOP, P, "x");
export const RISE = k.screenRise(DEPTH, P);
/* Strokes of the swept bit, in the board's plane. A chunk is this many
   path points; neighbours share one, so the stroke runs on unbroken. */
export const CHUNK = 24;
export const chunkD = (points: Plane[]) => points.map(([x, y], i) => `${i ? "L" : "M"}${tenth(x)} ${tenth(y)}`).join("");
export const chunksOf = (path: Plane[]) => {
  const out: Plane[][] = [];
  for (let start = 0; start < path.length - 1; start += CHUNK) out.push(path.slice(start, start + CHUNK + 1));
  return out;
};
/* A chunk as it is drawn: in the masks' sweep, and on the floor as a
   pass, its later edge lying over the earlier ones like the ridge a
   router leaves between passes. */
export const sweepSvg = (d: string) => `<path d="${d}"/>`;
export const passSvg = (d: string) => `<path class="route-pass-edge" d="${d}"/><path class="route-pass" d="${d}"/>`;

/* The pocket on board n: the wall where the sweep's top is not also its
   floor seen a depth lower, then the floor with its passes. */
export function pocketSvg(n: number, path: Plane[]) {
  const chunks = chunksOf(path).map(chunkD);
  const huge = `x="-3000" y="-3000" width="8000" height="8000"`;
  return [
    `<defs><g id="route-cut-${n}" data-cut>${chunks.map(sweepSvg).join("")}</g>`,
    `<mask id="route-top-${n}" maskUnits="userSpaceOnUse" ${huge}><g transform="${SURFACE}"><use href="#route-cut-${n}" class="route-sweep"/></g></mask>`,
    `<mask id="route-floor-${n}" maskUnits="userSpaceOnUse" ${huge}><g transform="translate(0 ${tenth(RISE)})"><g transform="${SURFACE}"><use href="#route-cut-${n}" class="route-sweep"/></g></g></mask></defs>`,
    `<g mask="url(#route-top-${n})"><path class="route-wall" d="${faceOf(-BOARD.d)}"/>`,
    `<g mask="url(#route-floor-${n})"><g transform="translate(0 ${tenth(RISE)})"><g transform="${SURFACE}" data-passes>${chunks.map(passSvg).join("")}</g></g></g></g>`,
  ].join("");
}

export const boardSvg = (n: number, y: number, path: Plane[]) =>
  `<clipPath id="route-face-${n}"><path data-face d="${faceOf(mouthFor(y))}"/></clipPath><g data-solid>${boardSolid(mouthFor(y))}</g><g data-pocket clip-path="url(#route-face-${n})">${pocketSvg(n, path)}</g>`;
export const boardMove = (y: number, dropped: number) => k.translateAlong(P, [0, y, -dropped]);

/* The router, built with the bit's axis at the origin: the bushing and
   the bit, seen through the opening; then the clear sub-base, the drive
   housing over the bit and the motor beside it, on an offset base. */
function bushing() {
  return [
    S(k.cylinder(0, 0, BIT, BOARD_TOP - DEPTH, FENCE_H + 2 - (BOARD_TOP - DEPTH), P, 36), { tone: "hi", crease: "none", inner: L(k.knurl(0, 0, BIT, BOARD_TOP - DEPTH, FENCE_H + 2, 6, P, 0), { tone: "faint" }) }),
    S(k.cylinder(0, 0, BUSH, FENCE_H + 2, TOP - FENCE_H - 2, P, 48), { tone: "hi", lit: true, crease: "none" }),
  ].join("");
}

const M_TOP = 176;
const BASE_Z = TOP + 5;
function router() {
  const [mx, my] = MOTOR;
  const out: string[] = [];
  /* The clear sub-base: a teardrop of acrylic round both. */
  const sub = hullSolid([[0, 0, 20], [mx, my, 35]], TOP, 5, 0.6);
  out.push(S(sub, { tone: "mid", className: "route-glass" }));
  out.push(L(k.ring(0, 0, BUSH + 1.6, BASE_Z, P, 40), { tone: "lo" }));
  const screws: Plane[] = [[mx - 19, -25], [mx - 19, 25], [mx + 26, -22], [mx + 26, 22]];
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.4, BASE_Z, P, 14)).join(""), { tone: "lo" }), D(screws.map(([x, y]) => [x, y, BASE_Z]), 0.4));
  /* The drive housing: the belt from the motor to the spindle runs inside. */
  const house = hullOf([[0, 0, 10], [mx, my, 30]]);
  out.push(S(k.extrude(house, BASE_Z, 16, P, { bevel: 0.6 }), { tone: "mid", inner: L(k.ringSeam(house, BASE_Z + 6, P), { tone: "faint" }) }));
  out.push(D([[mx - 22, my - 12, BASE_Z + 16], [mx - 22, my + 12, BASE_Z + 16], [mx + 20, my, BASE_Z + 16]], 0.4));
  /* The spindle's cap and its depth-lock knob, over the bit. */
  out.push(S(k.cylinder(0, 0, 8, BASE_Z + 16, 6, P, 32, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(0, 0, 5, BASE_Z + 22, 7, P, 28), { tone: "mid", inner: L(k.knurl(0, 0, 5, BASE_Z + 22.6, BASE_Z + 28.4, 16, P), { tone: "lo" }) }));
  out.push(L(k.lineOnTop([-2.6, 0], [3.6, 0], BASE_Z + 29, P), { tone: "hi" }));
  /* The motor: a band of vents near the top between two seams, a switch. */
  const [z0, z1] = [BASE_Z + 16, M_TOP - 8];
  out.push(S(k.cylinder(mx, my, 26, z0, z1 - z0, P, 56), { tone: "mid", crease: "none", inner: L(k.sideArc(mx, my, 26, z0 + 22, P, 40), { tone: "faint" }) + L(k.knurl(mx, my, 26, z1 - 34, z1 - 14, 36, P, 0) + k.sideArc(mx, my, 26, z1 - 34, P, 40) + k.sideArc(mx, my, 26, z1 - 14, P, 40), { tone: "lo" }) }));
  out.push(S(slab(mx + 24, mx + 29, my - 7, my + 7, z0 + 34, z0 + 50, 1.4, 3, 0.4), { tone: "mid" }));
  out.push(S(k.cylinder(mx, my, 23.5, z1, 8, P, 48, 0.6), { tone: "mid" }));
  out.push(L(k.ring(mx, my, 17, M_TOP, P, 40), { tone: "faint" }));
  /* The wrist's lower plate, screwed to the motor's cap. */
  out.push(S(k.cylinder(mx, my, 20, M_TOP, 4, P, 44, 0.4), { tone: "mid" }));
  return out.join("");
}

/* The wrist's float: four rubber posts from the lower plate to the
   upper, leaning as far as the arm runs past the router. */
const POSTS: Plane[] = [0, 1, 2, 3].map((i) => [Math.cos((i / 4) * Math.PI * 2 + Math.PI / 4) * 14, Math.sin((i / 4) * Math.PI * 2 + Math.PI / 4) * 14]);
const W_LO = M_TOP + 4;
const W_HI = W_LO + 5;
export function postsSvg(bit: Plane, arm: Plane) {
  const [mx, my] = [bit[0] + MOTOR[0], bit[1] + MOTOR[1]];
  const [ax, ay] = [arm[0] + MOTOR[0], arm[1] + MOTOR[1]];
  const posts = [...POSTS].sort((a, b) => depth(a) - depth(b));
  return posts
    .map(([px, py]) => {
      const [low, high]: [Point3, Point3] = [[mx + px, my + py, W_LO], [ax + px, ay + py, W_HI]];
      return L(k.segment(low, high, P), { tone: "mid", className: "route-post" }) + D([low, high], 1.1);
    })
    .join("");
}

/* The upper plate and the wrist hub, built at the arm's end over the
   motor; the group moves with the arm. */
function wrist() {
  const [mx, my] = MOTOR;
  return [S(k.cylinder(mx, my, 20, W_HI, 4, P, 44, 0.4), { tone: "mid" }), S(k.cylinder(mx, my, 13, W_HI + 4, LINK2_Z - W_HI - 4, P, 32), { tone: "mid", crease: "none" })].join("");
}

/* The arm: the second link at the wrist, the first above it from the
   column, the caps on their pins. */
const LINK2_Z = 200;
const LINK1_Z = ARM_Z;
export function armSvg(arm: Plane) {
  const wristAt: Plane = [arm[0] + MOTOR[0], arm[1] + MOTOR[1]];
  const { elbow } = armOf(wristAt);
  const [cx, cy] = COLUMN;
  const out: string[] = [];
  out.push(S(hullSolid([[wristAt[0], wristAt[1], 16], [elbow[0], elbow[1], 18]], LINK2_Z, 12, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(wristAt[0], wristAt[1], 8, LINK2_Z + 12, 3, P, 24), { tone: "mid" }));
  out.push(D([[wristAt[0], wristAt[1], LINK2_Z + 15]], 0.5));
  out.push(S(hullSolid([[cx, cy, 22], [elbow[0], elbow[1], 20]], LINK1_Z, 12, 0.5), { tone: "mid" }));
  for (const [x, y, r] of [[elbow[0], elbow[1], 11], [cx, cy, 13]] as [number, number, number][]) {
    out.push(S(k.cylinder(x, y, r, LINK1_Z + 12, 5, P, 32, 0.4), { tone: "mid" }));
    out.push(L(k.ring(x, y, r - 4, LINK1_Z + 17, P, 24), { tone: "lo" }), D([[x, y, LINK1_Z + 17]], 0.5));
  }
  return out.join("");
}

/* Where the bushing bears on the edge, the gold there lights, fading
   along the edge either side; split into the stretch whose wall faces us
   (drawn under the bushing) and the near one (over it). */
export function glowSvg(sample: Sample | null, part: "far" | "near") {
  if (!sample?.edge || sample.press < 0.04) return "";
  const n = OPENING.length;
  let index = 0;
  let best = Infinity;
  OPENING.forEach(([x, y], i) => {
    const d = (x - sample.edge![0]) ** 2 + (y - sample.edge![1]) ** 2;
    if (d < best) [best, index] = [d, i];
  });
  const out: string[] = [];
  for (let offset = -32; offset < 32; offset += 2) {
    const i = (index + offset + n) % n;
    const wall = WALLS[i]!;
    if (wall.facing !== (part === "far")) continue;
    const fade = Math.max(0, 1 - Math.abs(offset + 1) / 32);
    const alpha = sample.press * fade * fade * (3 - 2 * fade);
    if (alpha < 0.03) continue;
    const j = (i + 2) % n;
    out.push(`<path class="route-glow" stroke-opacity="${alpha.toFixed(2)}" d="${k.onTop([OPENING[i]!, OPENING[(i + 1) % n]!, OPENING[j]!], TOP, P)}"/>`);
  }
  return out.join("");
}

export const move = (by: Plane) => k.translateAlong(P, [by[0], by[1], 0]);

export const ROUTE_LABEL =
  "A router on an arm cuts a pocket in a board through a template, a plate whose opening is edged in gold. The arm drives the router in a different, wandering path every pass, often pushing it past the edge; the guide bushing round the bit rides the opening's wall and goes no further, and the arm's wrist floats to take up the difference. Each pocket comes out the shape of the opening. Then the platen drops, the row of boards moves on by one into a closed box, and the next blank is raised under the template.";

export interface Frame {
  bit: Plane;
  arm: Plane;
  sample: Sample | null;
  boards: { y: number; path: Plane[] }[];
  dropped: number;
}

export function routeSvg(frame: Frame) {
  const opening = `<clipPath id="route-open"><path d="${OPEN_PATH}"/></clipPath>`;
  const boards = frame.boards
    .map((board, n) => ({ board, n }))
    .sort((a, b) => a.board.y - b.board.y)
    .map(({ board, n }) => `<g data-board="${n}" transform="${boardMove(board.y, frame.dropped)}">${boardSvg(n, board.y, board.path)}</g>`)
    .join("");
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: ROUTE_LABEL,
    body: [
      `<defs>${opening}</defs>`,
      bench(),
      column(),
      boxOf(STACKER, false),
      fence(-CHANNEL - FENCE_W),
      `<g data-row>${boards}</g>`,
      fence(CHANNEL),
      template(),
      `<g clip-path="url(#route-open)"><g data-glow="far">${glowSvg(frame.sample, "far")}</g><g data-move="bushing" transform="${move(frame.bit)}">${bushing()}</g></g>`,
      L(NEAR_EDGE, { tone: "gold" }),
      `<g data-glow="near">${glowSvg(frame.sample, "near")}</g>`,
      `<g data-move="router" transform="${move(frame.bit)}">${router()}</g>`,
      `<g data-posts>${postsSvg(frame.bit, frame.arm)}</g>`,
      `<g data-move="wrist" transform="${move(frame.arm)}">${wrist()}</g>`,
      `<g data-arm>${armSvg(frame.arm)}</g>`,
      boxOf(FEEDER, true),
    ],
  });
}

export { PITCH };
