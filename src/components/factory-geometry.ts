/* The factory floor drawn back to front (`factory-model.ts` says what it
   is). The jig, its arm and router, the fences and the boxes are the
   template router's own parts (`route-geometry.ts`), drawn by its kit for
   this camera, and the template is cut for each order; the line runs on
   past them both ways, over beds of its own, with the magazine of blanks
   and the marking bridge ahead and the insertion bridge and the run-out
   after. The line runs toward the back: what is past the feeder stands
   in front of the cell, what is past the store behind it. What stands
   still is drawn once; the boards move as groups, and the router, the
   arm, the bridges' heads and the template are drawn again when they
   change (`FactoryFloor.astro`). */

import * as k from "./iso/iso-kit";
import type { Plane, Point3 } from "./iso/iso-kit";
import { ARM_Z, BOARD, BOARD_Z, DEPTH, FOOT_H, PLATE, PLATE_H } from "./route-model";
import { cutOf, hatchOf, routeKit } from "./route-geometry";
import {
  BOARD_TOP,
  BRIDGE,
  CHANNEL,
  END_BED,
  FEED_BACK,
  FENCE_W,
  FLOOR,
  FLOOR_H,
  FLOOR_Z,
  HEAD_BED,
  HEIGHT,
  INSERT_H,
  INSERT_Y,
  IN_FEEDER,
  JIG_LABEL,
  LIFT,
  KINDS,
  LABEL,
  MAG_STACK,
  MAG_Y,
  MARK_Y,
  OUT_Y,
  P,
  STACK_BACK,
  TUBE_DX,
  TUBE_Z,
  WIDTH,
  type Dropper,
  type Order,
  type Pen,
  type Scene,
} from "./factory-model";

export const R = routeKit(P, "fx");

const S = k.solidSvg;
const L = k.lineSvg;
const at = (point: Point3) => k.iso(point, P);
const D = (points: Point3[], size = 0.5) => k.dotsSvg(points.map(at), { size });
const halo = (plan: k.Plan, z: number, h: number) => `<path class="iso-halo" d="${k.haloOf(plan, z, h, P)}"/>`;
const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number, r = 0.6, bevel = 0) =>
  k.slabOf({ x: x0, y: y0, w: x1 - x0, d: y1 - y0, r }, z0, z1 - z0, P, 2, bevel);
const depth = ([x, y]: Plane, z = 0) => k.depthOf([x, y, z], P);
const backFirst = <T>(list: T[], of: (item: T) => Plane) => [...list].sort((a, b) => depth(of(a)) - depth(of(b)));
const screws = (points: Point3[], r = 2.2) => L(points.map(([x, y, z]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(points, 0.45);

/* The floor: a plate on feet, its tiles' seams, a ruler along the near
   edge and a label plate. */
function floor() {
  const out = [halo(FLOOR, -FLOOR_H - 5, FLOOR_H)];
  for (const [x, y] of backFirst(k.corners(FLOOR, 24), (p) => p)) {
    out.push(S(k.cylinder(x, y, 11, -FLOOR_H - 5, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 9, -FLOOR_H - 3.4, 3.4, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(FLOOR, -FLOOR_H, FLOOR_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(FLOOR, -FLOOR_H / 2, P, 8), { tone: "faint" }) }));
  const seams: string[] = [];
  for (let y = FLOOR.y + 116; y < FLOOR.y + FLOOR.d - 40; y += 116) seams.push(k.lineOnTop([FLOOR.x + 8, y], [FLOOR.x + FLOOR.w - 8, y], 0, P));
  out.push(L(seams.join(""), { tone: "faint" }));
  const strip = { x: FLOOR.x + FLOOR.w - 16, y: FLOOR.y + 40, w: 8, d: FLOOR.d - 80, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 5, strip.y + strip.d - 5, 5, 5, strip.x, 0.6, [2.2, 4], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([[strip.x + 4, strip.y + 2.5, 0.6], [strip.x + 4, strip.y + strip.d - 2.5, 0.6]], 0.45));
  const plate = { x: FLOOR.x + FLOOR.w - 44, y: FLOOR.y + 30, w: 20, d: 56, r: 1 };
  out.push(S(k.slabOf(plate, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L([0, 1, 2].map((i) => k.lineOnTop([plate.x + 5 + i * 5, plate.y + plate.d - 7], [plate.x + 5 + i * 5, plate.y + 7 + i * 9], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D(k.corners(plate, 2.4).map(([x, y]) => [x, y, 0.8] as Point3), 0.4));
  out.push(screws(k.corners(FLOOR, 11).map(([x, y]) => [x, y, 0] as Point3), 2.6));
  /* The bay the jig's cell stands in: its outline, a hand's width out
     from the bench, and a mark at each corner. */
  const bay = k.insetPlan(PLATE, -12);
  out.push(L(k.planOutline(bay, 0, P, 4), { tone: "lo", dashed: true }));
  const marks = k.corners(bay, 0).map(([x, y]) => {
    const [sx, sy] = [x < 0 ? 1 : -1, y < PLATE.y + PLATE.d / 2 ? 1 : -1];
    return k.onTop([[x + sx * 30, y], [x, y], [x, y + sy * 30]], 0, P);
  });
  out.push(L(marks.join(""), { tone: "mid" }));
  return out.join("");
}

/* A bed of the line beyond the cell: a plate on feet like the bench's,
   its top level with the bench's, and under each station a pair of bars
   the board rests on between moves. The rest is in the cell's frame. */
const BED_X = CHANNEL + FENCE_W + 8;
function bed({ y0, y1 }: { y0: number; y1: number }, stations: number[]) {
  const plan = { x: -BED_X, y: y0, w: BED_X * 2, d: y1 - y0, r: 4 };
  const out = [halo(plan, -PLATE_H - FOOT_H, PLATE_H)];
  for (const [x, y] of backFirst(k.corners(plan, 18), (p) => p)) {
    out.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(plan, -PLATE_H, PLATE_H, P, 4, 1.2), { tone: "mid" }));
  out.push(L(k.planOutline(k.insetPlan(plan, 6), 0, P, 3), { tone: "lo" }));
  for (const y of stations)
    for (const x of [-60, 60]) out.push(S(box(x - 8, x + 8, y - 56, y + 56, 0, BOARD_Z, 0.6, 0.4), { tone: "lo", crease: "none" }));
  return out.join("");
}
const fenceAlong = ([y0, y1]: [number, number]) => [y0 + 30, (y0 + y1) / 2, y1 - 30];
const HEAD_FENCE: [number, number] = [FEED_BACK, HEAD_BED.y1];
const END_FENCE: [number, number] = [END_BED.y0, STACK_BACK];

/* The run-out's stop, where the finished board comes to rest. */
const stop = () => S(box(-70, 70, END_BED.y0 + 6, END_BED.y0 + 16, 0, BOARD_Z + 12, 0.8, 0.5), { tone: "mid", inner: screws([-50, 50].map((x) => [x, END_BED.y0 + 11, BOARD_Z + 12] as Point3), 1.2) });

/* A bridge over a station: a post either side, standing on the floor
   outside the bed, a rail along the line on each pair, and a beam
   across riding them, drawn with its head. The far side stands behind
   the boards, the near side in front. */
const railsOf = (y: number, ends: [number, number]) => [Math.max(ends[0], y - BRIDGE.reach - 20), Math.min(ends[1], y + BRIDGE.reach + 20)] as [number, number];
function bridgeSide(side: -1 | 1, [y0, y1]: [number, number]) {
  const x = side * BRIDGE.span;
  const out: string[] = [];
  for (const py of backFirst([y0 + 7, y1 - 7], (py) => [x, py])) out.push(S(box(x - 6, x + 6, py - 6, py + 6, FLOOR_Z, BRIDGE.z - 8, 0.6, 0.4), { tone: "mid" }));
  out.push(S(box(x - 5, x + 5, y0, y1, BRIDGE.z - 8, BRIDGE.z, 0.6, 0.4), { tone: "mid", inner: screws([y0 + 7, y1 - 7].map((py) => [x, py, BRIDGE.z] as Point3), 1) }));
  return out.join("");
}
const beam = (y: number) => S(box(-BRIDGE.span - 6, BRIDGE.span + 6, y - 9, y + 9, BRIDGE.z, BRIDGE.z + 10, 0.6, 0.4), { tone: "mid" });
const MARK_RAILS = railsOf(MARK_Y, [FEED_BACK + 4, HEAD_BED.y1]);
const INSERT_RAILS = railsOf(INSERT_Y, [END_BED.y0, STACK_BACK - 4]);

/* The marking bridge's head: the beam where the pen is, its carriage,
   and the pen, down on the blank while it draws, its tip gold. */
export function penSvg(pen: Pen) {
  const { x, y, down } = pen;
  const tip = BOARD_TOP + (down ? 0.3 : 8);
  const out = [beam(y)];
  out.push(S(k.cylinder(x, y, 2, tip, 7, P, 16), { tone: "hi", crease: "none" }));
  out.push(S(k.cylinder(x, y, 4.5, tip + 7, BRIDGE.z - 10 - tip - 7, P, 20), { tone: "mid", crease: "none" }));
  out.push(S(box(x - 14, x + 14, y - 14, y + 14, BRIDGE.z - 10, BRIDGE.z + 18, 0.8, 0.5), { tone: "mid", inner: screws(k.corners({ x: x - 14, y: y - 14, w: 28, d: 28, r: 0.8 }, 3).map(([px, py]) => [px, py, BRIDGE.z + 18] as Point3), 0.8) }));
  if (down) out.push(L(k.ring(x, y, 3, tip, P, 14), { tone: "gold" }));
  return out.join("");
}

/* The insertion bridge's head: the insert falling from its magazine,
   the three magazines, a standard insert in each, the beam and the
   carriage they hang from. */
export function dropperSvg(dropper: Dropper) {
  const { x, y, falling } = dropper;
  const out: string[] = [];
  if (falling) out.push(insertSvg(falling.feature.insert.map(([px, py]) => [px, py + INSERT_Y] as Plane), falling.z, INSERT_H));
  for (const kind of backFirst(KINDS, (kind) => [x + TUBE_DX[kind], y])) {
    const cx = x + TUBE_DX[kind];
    const tube = { x: cx - 17, y: y - 17, w: 34, d: 34, r: kind === "round" ? 17 : 3 };
    const window = k.segment([cx + 17, y - 6, TUBE_Z + 8], [cx + 17, y - 6, BRIDGE.z - 18], P) + k.segment([cx + 17, y + 6, TUBE_Z + 8], [cx + 17, y + 6, BRIDGE.z - 18], P);
    out.push(S(k.slabOf(tube, TUBE_Z, BRIDGE.z - 8 - TUBE_Z, P, 6, 0.4), { tone: "mid", inner: L(window, { tone: "lo" }) }));
  }
  out.push(beam(y));
  out.push(S(box(x - 62, x + 62, y - 14, y + 14, BRIDGE.z - 8, BRIDGE.z + 16, 0.8, 0.5), { tone: "mid", inner: screws([-50, 50].map((dx) => [x + dx, y, BRIDGE.z + 16] as Point3), 0.8) }));
  return out.join("");
}

/* The magazine of blanks at the head of the line: four angle posts
   round the station and a stack of blanks held over it; the bottom one
   is let down onto the line for each order. The posts behind the board
   go first, the stack and the post in front after it. */
const MAG = { hx: BOARD.w / 2 + 9, hy: BOARD.d / 2 + 9, base: BOARD_TOP + 14 };
const MAG_TOP = MAG.base + MAG_STACK * (BOARD.h + 2) + 8;
const magPosts = backFirst(
  [-1, 1].flatMap((sx) => [-1, 1].map((sy) => [sx * MAG.hx, MAG_Y + sy * MAG.hy] as Plane)),
  (p) => p,
);
const magPost = ([x, y]: Plane) => S(box(x - 4, x + 4, y - 4, y + 4, 0, MAG_TOP, 0.4, 0.3), { tone: "mid" });
function magazineBack() {
  return magPosts.slice(0, 3).map(magPost).join("");
}
function magazineFront() {
  const plan = { x: -BOARD.w / 2, y: MAG_Y - BOARD.d / 2, w: BOARD.w, d: BOARD.d, r: 1.5 };
  const out: string[] = [];
  for (let i = 0; i < MAG_STACK; i++) out.push(S(k.slabOf(plan, MAG.base + i * (BOARD.h + 2), BOARD.h, P, 2, 0.6), { tone: "hi", crease: "lo" }));
  out.push(L(k.planOutline({ x: -MAG.hx, y: MAG_Y - MAG.hy, w: MAG.hx * 2, d: MAG.hy * 2, r: 1 }, MAG_TOP, P, 2), { tone: "mid" }));
  out.push(magPost(magPosts[3]!));
  return out.join("");
}

/* An insert: a solid of its outline standing on z. */
export const insertSvg = (ring: Plane[], z: number, h: number) => S(k.extrude(ring, z, h, P, { bevel: 0.6 }), { tone: "mid", crease: "lo" });

/* A board's inserts, in its own frame, each seated in its pocket. */
export const insertsSvg = (order: Order, count = order.features.length) =>
  order.features
    .slice(0, count)
    .map((f) => insertSvg(f.insert, BOARD_TOP - DEPTH, INSERT_H))
    .join("");

/* The layout the pen has drawn on a blank, in its own frame: of each
   feature's outline, as much as is drawn. */
export function marksSvg(order: Order, drawn: number[]) {
  const lines = order.features.map((f, i) => {
    const ring = f.shape.opening;
    const n = Math.ceil((drawn[i] ?? 0) * ring.length);
    return n < 2 ? "" : k.onTop(ring.slice(0, n), BOARD_TOP + 0.2, P, n >= ring.length);
  });
  return L(lines.join(""), { tone: "gold" });
}

/* Where a board is drawn, by where it is along the line: past the
   feeder's far face at the head, in front of the cell; past the point
   where it is wholly in the store, behind it; else in the cell's row.
   And from where in its own frame it is seen: at the head, what is out
   of the feeder; in the row, what is out of the store; behind, all of
   it, the store standing in front. */
export type Place = "head" | "cell" | "end";
export const placeOf = (y: number): Place => (y > IN_FEEDER ? "head" : y < R.ROW_Y[0] - BOARD.d / 2 ? "end" : "cell");
export const seenFrom = (y: number, place: Place) => (place === "head" ? FEED_BACK - y : place === "end" ? -BOARD.d : R.mouthFor(y));
/* A finished board fades as it leaves the run-out. */
export const leaving = (y: number) => Math.max(0, Math.min(1, 1 - (OUT_Y - y) / (BOARD.d * 0.6)));

/* The template, its near edge and its openings, cut for an order. */
export const cutFor = (order: Order) => cutOf(P, order.features.map((f) => f.shape.opening));
export const nearSvg = (cut: ReturnType<typeof cutFor>) => L(cut.NEAR_EDGE, { tone: "gold" });
export const lifted = (by: Plane, lift: number) => k.translateAlong(P, [by[0], by[1], lift]);
export const raised = (lift: number) => k.translateAlong(P, [0, 0, lift]);

/* The jig on its own stand, as "Strong boundaries make systems sound"
   shows it: the router figure's bench, fences and boxes round the
   factory's own jig, framed whole. */
export const CLOSE = (() => {
  const points = [
    ...[PLATE.x, PLATE.x + PLATE.w].flatMap((x) => [PLATE.y, PLATE.y + PLATE.d].flatMap((y) => [-PLATE_H - FOOT_H, 0].map((z) => at([x, y, z])))),
    ...[-235, 40].flatMap((x) => [-90, 110].flatMap((y) => [0, 262].map((z) => at([x, y, z])))),
  ];
  const xs = points.map(([x]) => x);
  const ys = points.map(([, y]) => y);
  const pad = 6;
  const [x0, y0] = [Math.min(...xs) - pad, Math.min(...ys) - pad];
  return [x0, y0, Math.max(...xs) + pad - x0, Math.max(...ys) + pad - y0] as [number, number, number, number];
})();
export { IN_FEEDER };

/* The pieces the script moves, for the boards. */
export const { armSvg, boardMove, boardSolid, chunkD, chunksOf, faceOf, passSvg, postsSvg, sweepSvg } = R;

/* The router's kit for a figure, its ids carrying the figure's own
   name, so two figures on a page never share a mask. */
const kits = new Map<string, ReturnType<typeof routeKit>>();
export const kitFor = (id: string) => {
  if (!kits.has(id)) kits.set(id, routeKit(P, id));
  return kits.get(id)!;
};

/* The portal the jig's cell passes through between the two figures: a
   hatch in the ground the size of its bay, under the jig, where it sinks
   away, and in the floor's bay, where it rises again (`hatchOf`). How
   far it moves to pass through whole, on screen. */
export const PORTAL = k.insetPlan(PLATE, -12);
const CELL_TOP = ARM_Z + 20 + LIFT;
export const SINK = k.axisVector(P, [0, 0, -(CELL_TOP - FLOOR_Z + 8)])[1];
const HATCH = hatchOf(P, PORTAL, FLOOR_Z);
const portalClip = (id: string) => HATCH.clip(`${id}-portal`);
export const hatchSvg = HATCH.svg;

export function factorySvg(
  scene: Scene,
  path: (pass: number, points: number) => Plane[],
  order: (n: number) => Order,
  inserts: (pass: number) => number,
  marks: (pass: number) => number[],
  id = "fx",
  frame: "whole" | "close" | "pull" = "whole",
) {
  const R = kitFor(id);
  const cut = cutFor(order(scene.order));
  const close = frame === "close";
  const rows: Record<Place, string[]> = { head: [], cell: [], end: [] };
  scene.boards
    .map((board, n) => ({ board, n }))
    .sort((a, b) => a.board.y - b.board.y)
    .forEach(({ board, n }) => {
      const place = close ? "cell" : placeOf(board.y);
      const from = seenFrom(board.y, place);
      const set = close || board.pass < 0 ? "" : insertsSvg(order(board.pass), inserts(board.pass));
      const drawn = close || board.pass < 0 || board.points ? "" : marksSvg(order(board.pass), marks(board.pass));
      const hidden = close && board.y > IN_FEEDER ? ` display="none"` : "";
      const fade = place === "end" && leaving(board.y) < 1 ? ` opacity="${leaving(board.y).toFixed(2)}"` : "";
      const face = `<clipPath id="${id}-face-${n}"><path data-face d="${R.faceOf(from)}"/></clipPath>`;
      rows[place].push(
        `<g data-board="${n}"${hidden}${fade} transform="${R.boardMove(board.y, scene.dropped)}">${face}<g data-solid>${R.boardSolid(from)}</g><g data-pocket clip-path="url(#${id}-face-${n})">${R.pocketSvg(n, path(board.pass, board.points))}</g><g data-layer="ontology" data-marks clip-path="url(#${id}-face-${n})">${drawn}</g><g data-layer="stack" data-inserts clip-path="url(#${id}-face-${n})">${set}</g></g>`,
      );
    });
  const clip = scene.lift > 8 ? "" : ` clip-path="url(#${id}-open)"`;
  /* The floor and the line beyond the cell, left out of the jig alone. */
  const part = (svg: string, extra = "") => (close ? "" : `<g${extra}>${svg}</g>`);
  /* The jig's cell: the router figure whole. On the floor it waits for
     the cell to land (`fx-cell`), and so do the boards. */
  const cell = (svg: string, layer = "factory") => `<g data-carry><g class="fx-cell" data-layer="${layer}">${svg}</g></g>`;
  const row = (place: Place) => (place === "cell" ? (svg: string) => `<g data-carry>${svg}</g>` : (svg: string) => svg)(`<g class="fx-cell" data-row="${place}">${rows[place].join("")}</g>`);
  const carry = (svg: string) => `<g data-carry>${svg}</g>`;
  /* The jig leaves through a hatch under it, and the floor's cell comes
     up through one in its bay; neither shows until it opens. */
  const portal = close || frame === "pull";
  const hatch = portal ? `<g data-portal></g>` : "";
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: close ? JIG_LABEL : LABEL,
    body: [
      `<defs><clipPath id="${id}-open"><path data-open d="${cut.OPEN_PATH}"/></clipPath>${portal ? portalClip(id) : ""}</defs>`,
      close ? hatch : "",
      part(floor(), ` transform="${raised(FLOOR_Z)}"`),
      close ? "" : hatch,
      /* Behind the cell: the end of the line. */
      part(bed(END_BED, [INSERT_Y, OUT_Y]) + R.fence(-CHANNEL - FENCE_W, END_FENCE, fenceAlong(END_FENCE)) + stop(), ` data-layer="factory"`),
      part(bridgeSide(-1, INSERT_RAILS), ` data-layer="stack"`),
      cell(R.bench()),
      close ? "" : row("end"),
      part(R.fence(CHANNEL, END_FENCE, fenceAlong(END_FENCE)), ` data-layer="factory"`),
      part(dropperSvg(scene.dropper), ` data-layer="stack" data-dropper`),
      part(bridgeSide(1, INSERT_RAILS), ` data-layer="stack"`),
      /* The cell. */
      cell(R.column() + R.boxOf(R.STACKER, false) + R.fence(-CHANNEL - FENCE_W)),
      row("cell"),
      cell(R.fence(CHANNEL)),
      cell(cut.template(), "language").replace('<g class="fx-cell"', '<g class="fx-cell" data-template'),
      carry(`<g class="fx-cell" data-bushing${clip}><g data-glow="far">${cut.glowSvg(scene.sample, "far")}</g><g data-layer="factory" data-move="bushing" transform="${lifted(scene.bit, scene.lift)}">${R.bushing()}</g></g>`),
      cell(nearSvg(cut), "language").replace('<g class="fx-cell"', '<g class="fx-cell" data-near'),
      carry(`<g class="fx-cell" data-glow="near">${cut.glowSvg(scene.sample, "near")}</g>`),
      cell(`<g data-move="router" transform="${lifted(scene.bit, scene.lift)}">${R.router()}</g><g data-posts transform="${raised(scene.lift)}">${R.postsSvg(scene.bit, scene.arm)}</g><g data-move="wrist" transform="${lifted(scene.arm, scene.lift)}">${R.wrist()}</g><g data-arm transform="${raised(scene.lift)}">${R.armSvg(scene.arm)}</g>`),
      cell(R.boxOf(R.FEEDER, true)),
      /* In front of the cell: the head of the line. */
      part(bed(HEAD_BED, [MAG_Y, MARK_Y]) + R.fence(-CHANNEL - FENCE_W, HEAD_FENCE, fenceAlong(HEAD_FENCE)) + magazineBack(), ` data-layer="factory"`),
      part(bridgeSide(-1, MARK_RAILS), ` data-layer="ontology"`),
      close ? "" : row("head"),
      part(R.fence(CHANNEL, HEAD_FENCE, fenceAlong(HEAD_FENCE)), ` data-layer="factory"`),
      part(penSvg(scene.pen), ` data-layer="ontology" data-pen`),
      part(bridgeSide(1, MARK_RAILS), ` data-layer="ontology"`),
      part(magazineFront(), ` data-layer="factory"`),
    ],
  });
}
