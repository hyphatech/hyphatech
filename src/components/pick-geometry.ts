/* The pick-and-place drawn back to front. The bench, rails, plates and
   boxes are drawn once; the bridge, carriage and quill are groups the
   page slides; the parts are redrawn each frame into layers, those
   going down an opening, those at rest and those on the quill
   (`PickPlace.astro`). */

import * as k from "./iso/iso-kit";
import type { Plane, Point3 } from "./iso/iso-kit";
import {
  BIN,
  BIN_H,
  BOX,
  BOX_H,
  BOX_Z,
  COLUMN,
  FIXTURE,
  FIXTURE_H,
  FOOT_H,
  HEIGHT,
  HIGH,
  NESTS,
  P,
  PART_H,
  PLATE,
  PLATE_H,
  RAIL_X,
  RAIL_Y,
  RAIL_Z,
  REST,
  SCRAP,
  STAGING,
  STAGING_H,
  WIDTH,
  outlineOf,
  sceneAt,
  type Scene,
} from "./pick-model";

const S = k.solidSvg;
const L = k.lineSvg;
const at = (point: Point3) => k.iso(point, P);
const D = (points: Point3[], size = 0.5) => k.dotsSvg(points.map(at), { size });
const halo = (plan: k.Plan, z: number, h: number) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"/>`;
const slab = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, r = 0.6, steps = 2, bevel = 0) =>
  k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, steps, bevel);
const depth = ([x, y]: Plane) => k.depthOf([x, y, 0], P);

/* The quill's axis sits this far in front of the bridge's centre. */
export const REACH = 18;

function bench() {
  const out = [halo(PLATE, -PLATE_H - FOOT_H, PLATE_H)];
  const feet = [...k.corners(PLATE, 20)].sort((a, b) => depth(a) - depth(b));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 8, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 5), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 10);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.2, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => [x, y, 0])));
  const strip = { x: PLATE.x + PLATE.w - 13, y: -150, w: 7, d: 300, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 4, strip.y + strip.d - 4, 4, 5, strip.x, 0.6, [2, 3.6], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([[strip.x + 3.5, strip.y + 2, 0.6], [strip.x + 3.5, strip.y + strip.d - 2, 0.6]], 0.45));
  /* The scrap slot: a lip screwed to the bench round an opening. */
  out.push(S(k.slabOf(SCRAP, 0, LIP, P, 3, 0.4), { tone: "lo", crease: "none" }));
  out.push(`<path class="iso-shade" data-shade="0" d="${k.planOutline(SLOT, LIP, P, 2)}"/>`);
  out.push(L(k.planOutline(SLOT, LIP, P, 2), { tone: "lo" }));
  out.push(D(k.corners(SCRAP, 1.6).map(([x, y]) => [x, y, LIP]), 0.4));
  return out.join("");
}

const LIP = 0.8;
const SLOT = k.insetPlan(SCRAP, 3);

/* A rail on its two posts, at x. */
function rail(x: number) {
  const out: string[] = [];
  for (const y of [RAIL_Y[1] - 6, RAIL_Y[0] + 6]) {
    out.push(S(k.cylinder(x, y, 7, 0, 3, P, 28, 0.5), { tone: "mid" }));
    out.push(S(k.cylinder(x, y, 4, 3, RAIL_Z - 11, P, 24), { tone: "mid", crease: "none" }));
    /* The bracket the rail is bolted to, clamped round the post's top. */
    out.push(S(slab(x - 6, x + 6, y - 7, y + 7, RAIL_Z - 16, RAIL_Z - 8, 0.6, 2, 0.4), { tone: "mid" }));
    out.push(D([[x + 6, y - 4, RAIL_Z - 12], [x + 6, y + 4, RAIL_Z - 12]], 0.45));
  }
  out.push(S(slab(x - 5, x + 5, RAIL_Y[0], RAIL_Y[1], RAIL_Z - 8, RAIL_Z, 0.8, 2, 0.5), { tone: "mid" }));
  const ticks = k.topTicks(RAIL_Y[0] + 16, RAIL_Y[1] - 16, 6, 5, x + 1.5, RAIL_Z, [1.6, 3], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  for (const y of [RAIL_Y[0] + 1, RAIL_Y[1] - 5]) out.push(S(slab(x - 5, x + 5, y, y + 4, RAIL_Z, RAIL_Z + 5, 0.6, 2, 0.4), { tone: "mid" }));
  out.push(D([[x, RAIL_Y[0] + 6, RAIL_Z], [x, RAIL_Y[1] - 6, RAIL_Z]], 0.5));
  return out.join("");
}

function plates() {
  const out: string[] = [];
  out.push(S(k.slabOf(STAGING, 0, STAGING_H, P, 3, 0.6), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(STAGING, 4), STAGING_H, P, 3), { tone: "faint" }));
  out.push(D(k.corners(STAGING, 8).map(([x, y]) => [x, y, STAGING_H]), 0.5));
  out.push(S(k.slabOf(FIXTURE, 0, FIXTURE_H, P, 3, 0.8), { tone: "mid" }));
  out.push(D(k.corners(FIXTURE, 5).map(([x, y]) => [x, y, FIXTURE_H])));
  /* Two dowels that locate the fixture, and its plate. */
  for (const [x, y] of [[FIXTURE.x + 6, FIXTURE.y + 6], [FIXTURE.x + FIXTURE.w - 6, FIXTURE.y + FIXTURE.d - 6]] as Plane[]) {
    out.push(S(k.cylinder(x, y, 2.2, FIXTURE_H, 3, P, 18), { tone: "mid" }));
  }
  const label = { x: FIXTURE.x + FIXTURE.w - 7, y: FIXTURE.y + 26, w: 5, d: 40, r: 0.6 };
  out.push(S(k.slabOf(label, FIXTURE_H, 0.5, P, 2), { tone: "lo", crease: "none" }));
  out.push(L([0, 1].map((line) => k.lineOnTop([label.x + 1.6 + line * 1.8, label.y + 4], [label.x + 1.6 + line * 1.8, label.y + [26, 18][line]!], FIXTURE_H + 0.5, P)).join(""), { tone: "lo", free: true }));
  /* The nests: pockets cut to each piece, edged in gold. */
  for (const nest of NESTS) {
    const d = k.onTop(nest, FIXTURE_H, P, true);
    out.push(`<path class="iso-shade" data-shade="0" d="${d}"/>`, L(d, { tone: "gold" }));
  }
  return out.join("");
}

/* The bin: a sheet-metal hopper, tall enough that what goes in is out
   of sight, over an opening in the bench. Its walls stand on a flange
   screwed down at its corners and end in a rolled lip. It is drawn as
   its far half, inside walls and all, then whatever is going down it,
   then its near half. */
const SHEET = 2;
const RIM = 3;
const RIM_OUT = 1.2;
const FLANGE_H = 1.6;
const CHUTE = k.insetPlan(BIN, SHEET);
const FLANGE = { x: BIN.x - 3, y: BIN.y - 3, w: BIN.w + 6, d: BIN.d + 6, r: 2 };

/* The far walls and the near ones, each one L of sheet, so no seam runs
   down a face; the near one widened by `o` makes the lip. */
const binRings = () => {
  const { x, y, w, d } = BIN;
  const t = SHEET;
  const far: Plane[] = [
    [x, y],
    [x + w, y],
    [x + w, y + t],
    [x + t, y + t],
    [x + t, y + d],
    [x, y + d],
  ];
  const near = (o: number): Plane[] => [
    [x + w + o, y - o],
    [x + w + o, y + d + o],
    [x - o, y + d + o],
    [x - o, y + d - t],
    [x + w - t, y + d - t],
    [x + w - t, y - o],
  ];
  return { far, near };
};

/* The lip's top, mitred at the two side corners into a far half and a
   near half. */
const lipTop = (half: "far" | "near") => {
  const { x, y, w, d } = BIN;
  const [t, o] = [SHEET, RIM_OUT];
  const ring: Plane[] =
    half === "far"
      ? [
          [x - o, y - o],
          [x + w + o, y - o],
          [x + w - t, y + t],
          [x + t, y + t],
          [x + t, y + d - t],
          [x - o, y + d + o],
        ]
      : [
          [x + w + o, y - o],
          [x + w + o, y + d + o],
          [x - o, y + d + o],
          [x + t, y + d - t],
          [x + w - t, y + d - t],
          [x + w - t, y + t],
        ];
  const top = k.onTop(ring, BIN_H, P, true);
  return `<path class="iso-fill" d="${top}"/><path class="iso-top" d="${top}"/>`;
};

function binBack() {
  const { x, y, w, d } = BIN;
  const [t, o] = [SHEET, RIM_OUT];
  return [
    S(k.slabOf(FLANGE, 0, FLANGE_H, P, 3, 0.4), { tone: "lo" }),
    D(k.corners(FLANGE, 1.5).map(([fx, fy]) => [fx, fy, FLANGE_H]), 0.45),
    `<path class="iso-shade" data-shade="0" d="${k.planOutline(CHUTE, FLANGE_H, P, 2)}"/>`,
    S(k.extrude(binRings().far, FLANGE_H, BIN_H - FLANGE_H, P, { convex: false }), { tone: "mid", crease: "none" }),
    /* The inside corner, where the two far walls meet. */
    L(k.segment([x + t, y + t, FLANGE_H], [x + t, y + t, BIN_H], P), { tone: "faint" }),
    lipTop("far"),
    L(k.onTop([[x - o, y + d + o], [x - o, y - o], [x + w + o, y - o]], BIN_H, P), { tone: "mid" }),
    L(k.onTop([[x + t, y + d - t], [x + t, y + t], [x + w - t, y + t]], BIN_H, P), { tone: "mid" }),
  ].join("");
}

/* Whatever goes down an opening shows only above it. */
export const clipAbove = (id: string, plan: k.Plan, z: number) => {
  const corners = k.boxCorners(plan, z, 200).map(at);
  const sorted = [...corners].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: k.Flat, a: k.Flat, b: k.Flat) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (list: k.Flat[]) => {
    const out: k.Flat[] = [];
    for (const point of list) {
      while (out.length >= 2 && cross(out[out.length - 2]!, out[out.length - 1]!, point) <= 0) out.pop();
      out.push(point);
    }
    return out.slice(0, -1);
  };
  return `<clipPath id="${id}"><path d="${k.pathOf([...half(sorted), ...half([...sorted].reverse())], true)}"/></clipPath>`;
};

function binFront() {
  const { x, y, w, d } = BIN;
  const [t, o] = [SHEET, RIM_OUT];
  const { near } = binRings();
  /* A label holder on the near face, under the lip: a frame round a card
     with two lines of print, riveted at its top corners. */
  const face = (fy: number, fz: number): Point3 => [x + w, fy, fz];
  const [ly, lz, lw, lh] = [y + d / 2 - 13, 18, 26, 11];
  const holder = k.pathOf([face(ly, lz), face(ly + lw, lz), face(ly + lw, lz + lh), face(ly, lz + lh)].map(at), true);
  const print = [0, 1].map((row) => k.segment(face(ly + 4, lz + 7 - row * 3.5), face(ly + [18, 12][row]!, lz + 7 - row * 3.5), P)).join("");
  return [
    S(k.extrude(near(0), FLANGE_H, BIN_H - RIM - FLANGE_H, P, { convex: false }), { tone: "mid", crease: "none" }),
    `<path class="iso-shade" data-shade="1" d="${holder}"/>`,
    L(holder, { tone: "lo" }),
    L(print, { tone: "lo", free: true }),
    D([face(ly + 2, lz + lh - 2), face(ly + lw - 2, lz + lh - 2)], 0.4),
    S(k.extrude(near(o), BIN_H - RIM, RIM, P, { convex: false }), { tone: "mid", crease: "none" }),
    lipTop("near"),
    L(k.onTop([[x + w + o, y - o], [x + w + o, y + d + o], [x - o, y + d + o]], BIN_H, P), { tone: "mid" }),
    L(k.onTop([[x + t, y + d - t], [x + w - t, y + d - t], [x + w - t, y + t]], BIN_H, P), { tone: "mid" }),
  ].join("");
}

/* The column the box hangs from, standing behind it on the plate, and
   the arm across to the box. */
const column = () =>
  S(k.slabOf(COLUMN, STAGING_H, BOX_Z + BOX_H - 6 - STAGING_H, P, 2, 0.5), { tone: "mid" }) +
  D([[COLUMN.x + 5, COLUMN.y + 4, STAGING_H + 2], [COLUMN.x + 5, COLUMN.y + COLUMN.d - 4, STAGING_H + 2]], 0.45) +
  S(slab(COLUMN.x + COLUMN.w, BOX.x, COLUMN.y + 4, COLUMN.y + COLUMN.d - 4, BOX_Z + BOX_H - 18, BOX_Z + BOX_H - 8, 0.6, 2, 0.4), { tone: "mid" });

/* The box the parts come out of: closed, finely perforated, a light
   on its face. What happens inside is not for us to see. */
function magicBox() {
  const { x, y, w, d } = BOX;
  const out: string[] = [];
  const base = BOX_Z;
  const lid = base + BOX_H;
  out.push(halo(k.insetPlan(BOX, 6), STAGING_H, 0.1));
  out.push(S(k.slabOf(BOX, base, BOX_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(BOX, lid - 8, P, 4), { tone: "faint" }) }));
  const top = k.insetPlan(BOX, 6);
  out.push(L(k.planOutline(top, lid, P, 3), { tone: "faint" }));
  out.push(k.dotsSvg(k.dotGrid(top.x + 3, top.y + 3, Math.floor((top.w - 6) / 4) + 1, Math.floor((top.d - 6) / 4) + 1, 4, lid, P), { size: 0.35, tone: "lo" }));
  /* The perforations on the near face, in its plane. */
  const face: Point3[] = [];
  for (let z = base + 8; z <= lid - 14; z += 4) for (let fy = y + 6; fy <= y + d - 6; fy += 4) face.push([x + w, fy, z]);
  out.push(D(face, 0.35));
  out.push(`<g class="pick-light">${k.dotsSvg([at([x + w, y + d - 5, lid - 4])], { size: 1.3, tone: "hi" })}</g>`);
  return out.join("");
}

/* The bridge across the rails, built at y = 0; the carriage on its near
   face; the quill and its cup, built with the cup at HIGH. */
function bridge() {
  const out: string[] = [];
  out.push(truck(-RAIL_X));
  out.push(S(slab(-RAIL_X + 7, RAIL_X - 7, -6, 6, RAIL_Z + 2, RAIL_Z + 12, 0.6, 2, 0.5), { tone: "mid" }));
  out.push(L(k.lineOnTop([-RAIL_X + 7, -3], [RAIL_X - 7, -3], RAIL_Z + 12, P) + k.lineOnTop([-RAIL_X + 7, 3], [RAIL_X - 7, 3], RAIL_Z + 12, P), { tone: "faint" }));
  out.push(S(k.cylinder(-RAIL_X, 0, 6, RAIL_Z + 12, 12, P, 28, 0.5), { tone: "mid" }));
  out.push(L(k.knurl(-RAIL_X, 0, 6, RAIL_Z + 15, RAIL_Z + 21, 28, P) + k.sideArc(-RAIL_X, 0, 6, RAIL_Z + 15, P, 28) + k.sideArc(-RAIL_X, 0, 6, RAIL_Z + 21, P, 28), { tone: "lo" }));
  out.push(L(k.ring(-RAIL_X, 0, 2.6, RAIL_Z + 24, P, 18), { tone: "lo" }));
  return out.join("");
}

/* The block that rides a rail at each end of the bridge. The near one
   is drawn after the near rail it sits on. */
const truck = (x: number) => S(slab(x - 7, x + 7, -12, 12, RAIL_Z, RAIL_Z + 12, 1, 2, 0.5), { tone: "mid" });

function carriage() {
  return [
    S(slab(-11, 11, 6, 14, RAIL_Z - 12, RAIL_Z + 16, 1, 2, 0.5), { tone: "mid" }),
    S(slab(-6, 6, 14, REACH + 5, RAIL_Z - 12, RAIL_Z - 4, 0.8, 2, 0.4), { tone: "mid" }),
    S(k.cylinder(0, 10, 5.5, RAIL_Z + 16, 9, P, 28, 0.5), { tone: "mid" }),
    L(k.ring(0, 10, 2.4, RAIL_Z + 25, P, 18), { tone: "lo" }),
    D([[-8, 14, RAIL_Z + 12], [8, 14, RAIL_Z + 12]], 0.45),
  ].join("");
}

function quill() {
  return [
    S(k.cylinder(0, REACH, 5, HIGH, 2.5, P, 28), { tone: "lo" }),
    S(k.cylinder(0, REACH, 2.4, HIGH + 2.5, 3, P, 20), { tone: "mid", crease: "none" }),
    S(k.cylinder(0, REACH, 1.8, HIGH + 5.5, 88, P, 20), { tone: "hi", crease: "none" }),
    L(k.sideArc(0, REACH, 1.8, HIGH + 40, P, 16), { tone: "faint" }),
  ].join("");
}

/* A part where it lies. */
const partSvg = (index: number, pose: { x: number; y: number; z: number; angle: number }) =>
  S(k.extrude(outlineOf(index, pose), pose.z, PART_H, P, { convex: false }), { tone: "hi", crease: "lo" });

/* The layers of parts: going down the slot, going down the chute, at
   rest and carried. Nothing hides what stands wholly above it, so the
   parts at rest are drawn far to near, except that one resting on
   another's top comes after it; those carried come after them all, and
   the gantry, above every part, after that. */
export function partsSvg(scene: Scene) {
  const order = scene.parts.map((pose, index) => ({ pose, index })).sort((a, b) => depth([a.pose.x, a.pose.y]) - depth([b.pose.x, b.pose.y]));
  const draw = (list: typeof order) => list.map(({ pose, index }) => partSvg(index, pose)).join("");
  const inChute = ({ pose }: (typeof order)[number]) => pose.z < BIN_H && pose.y < BIN.y + BIN.d;
  const inSlot = ({ pose }: (typeof order)[number]) => pose.scrap;
  const rest = order.filter((item) => !item.pose.carried && !inChute(item) && !inSlot(item));
  const above = (a: (typeof order)[number], b: (typeof order)[number]) => a.pose.z >= b.pose.z + PART_H - 0.01;
  for (let moved = true; moved; ) {
    moved = false;
    for (let i = 0; i < rest.length && !moved; i++) {
      const j = rest.findIndex((item, at) => at > i && above(rest[i]!, item));
      if (j < 0) continue;
      rest.splice(j, 0, ...rest.splice(i, 1));
      moved = true;
    }
  }
  return {
    scrap: draw(order.filter(inSlot)),
    chute: draw(order.filter(inChute)),
    rest: draw(rest),
    carried: draw(order.filter((item) => item.pose.carried && !inChute(item))),
  };
}

/* Whether the quill's cup is down inside the bin. */
export const inBin = ([x, y, z]: Point3) => x > BIN.x && x < BIN.x + BIN.w && y > BIN.y && y < BIN.y + BIN.d && z < BIN_H;

/* Where the moving groups go for a head at (x, y, z). */
export const moves = ([x, y, z]: Point3) => ({
  bridge: k.translateAlong(P, [0, y - REACH, 0]),
  carriage: k.translateAlong(P, [x, y - REACH, 0]),
  quill: k.translateAlong(P, [x, y - REACH, z - HIGH]),
});

export const PICK_LABEL =
  "A gantry over a bench picks four loose parts off a staging plate, in a different order and by a different route each time, turns each to fit and sets it into a fixture whose gold-edged nests take each part in one place only. A fifth part, a square block no nest is cut for, is tried on the fixture twice, rests proud both times and is dropped through a scrap slot in the bench. The four make one square, which goes into the bin, and a closed box lets out the next five.";

export function pickSvg() {
  const scene = sceneAt(REST);
  const parts = partsSvg(scene);
  const move = moves(scene.head);
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: PICK_LABEL,
    body: [
      bench(),
      clipAbove("pick-scrap", SLOT, LIP),
      `<g clip-path="url(#pick-scrap)"><g data-layer="scrap">${parts.scrap}</g></g>`,
      rail(-RAIL_X),
      binBack(),
      clipAbove("pick-chute", CHUTE, FLANGE_H),
      `<g clip-path="url(#pick-chute)"><g data-layer="chute">${parts.chute}</g></g>`,
      plates(),
      column(),
      binFront(),
      `<g data-layer="rest">${parts.rest}</g>`,
      `<g data-layer="carried">${parts.carried}</g>`,
      `<g data-move="bridge" transform="${move.bridge}">${bridge()}</g>`,
      `<g data-move="carriage" transform="${move.carriage}">${carriage()}</g>`,
      `<g data-move="quill" transform="${move.quill}">${quill()}</g>`,
      /* While the quill is down in the bin, its near walls hide it. */
      `<g data-bin-cover${inBin(scene.head) ? "" : ' style="display:none"'}>${binFront()}</g>`,
      `<g data-box>${magicBox()}</g>`,
      rail(RAIL_X),
      `<g data-move="bridge" transform="${move.bridge}">${truck(RAIL_X)}</g>`,
    ],
  });
}
