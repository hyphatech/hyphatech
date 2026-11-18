/* The levels as a factory floor, HAF being one: one straight line that
   every board travels, the template router of "Strong boundaries make
   systems sound" standing in the middle of it, and each level doing its
   part to the same board in turn.

   the ontology   the marking bridge: a pen that draws the order's
                  layout on the blank in gold, which kinds of feature,
                  where;
   the language   the template, cut to that layout: openings the bushing
                  cannot leave, whatever path the arm takes, so the cut
                  lands on the plan;
   Hypha Stack    the insertion bridge: three magazines of standard
                  inserts, made once and proven, one dropped into each
                  pocket, and the inserts set in every finished board;
   the factory    the line itself: its beds and channel, the magazine of
                  blanks at its head, the bridges, the arm that drives
                  the router, and the run-out at its end.

   Each order is a random layout of standard features, so no two boards
   are the same, and each is still made only of proven parts.

   Millimetres, in the router's own world: the jig's centre at the
   origin, x toward the viewer, y along the line (+y to the left on
   screen, where it starts), z up. */

import { iso, type Plane, type Point3, type Projection } from "./iso/iso-kit";
import { ARM_Z, BOARD, BOARD_Z, BUSH, COLUMN, DEPTH, FOOT_H, OFFSET, PITCH, PLATE, PLATE_H, RATE, Show, indexAt, outlineOf, random, runOf, shapeOf, type Run, type Sample, type Shape } from "./route-model";

/* The channel, from the feeder's mouth to the box's, and the stations
   on it, PITCH apart: the feeder, the wait, the jig, the gate, the box. */
export const CHANNEL = BOARD.w / 2 + 2;
export const FENCE_W = 24;
export const ROW_Y: [number, number] = [-PITCH * 1.5, PITCH * 1.5];
export const BOX_D = PITCH + 6;
export const FEEDER = { x: -CHANNEL - FENCE_W, y: ROW_Y[1], w: (CHANNEL + FENCE_W) * 2, d: BOX_D, r: 3 };
export const SLOTS = [3, 2, 1, 0, -1, -2, -3, -4];
export const BOARD_TOP = BOARD_Z + BOARD.h;

/* The standard: three kinds of feature, every corner no tighter than
   the bushing, and how far each reaches from its centre. */
export type Kind = "round" | "slot" | "square";
export const KINDS: Kind[] = ["round", "slot", "square"];
const box = (hx: number, hy: number, r: number) => ([x, y]: Plane) => {
  const qx = Math.abs(x) - hx + r;
  const qy = Math.abs(y) - hy + r;
  return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
};
const FIELD: Record<Kind, (at: Plane) => number> = {
  round: ([x, y]) => Math.hypot(x, y) - 19,
  slot: box(31, 15, 15),
  square: box(18, 18, BUSH),
};
export const REACH: Record<Kind, number> = { round: 19, slot: 31, square: 22 };

export interface Feature {
  kind: Kind;
  at: Plane;
  /* A slot lies along x, or turned along y. */
  turned: boolean;
  shape: Shape;
  /* The insert's outline, a clearance inside the pocket. */
  insert: Plane[];
}
export interface Order {
  features: Feature[];
}

const fieldAt = (kind: Kind, [cx, cy]: Plane, turned: boolean) => ([x, y]: Plane) => FIELD[kind](turned ? [y - cy, x - cx] : [x - cx, y - cy]);

/* An insert: its outline, a clearance inside its pocket, and how tall
   it stands, a little proud of the board once seated. */
export const INSERT_H = DEPTH + 1.5;
export const insertOf = (kind: Kind, at: Plane, turned = false) => outlineOf(fieldAt(kind, at, turned), at, -(OFFSET + 0.8));

/* Order n: two or three features of any kind, anywhere on the board the
   router can reach, a wall of at least 12 between any two. */
export function orderOf(n: number): Order {
  const next = random(n * 31 + 7);
  const want = next() < 0.6 ? 3 : 2;
  const placed: { kind: Kind; at: Plane; turned: boolean }[] = [];
  for (let tries = 0; placed.length < want && tries < 400; tries++) {
    const kind = KINDS[Math.floor(next() * KINDS.length)]!;
    const turned = kind === "slot" && next() < 0.5;
    const [rx, ry] = kind === "slot" ? (turned ? [15, 31] : [31, 15]) : [REACH[kind], REACH[kind]];
    const at: Plane = [-74 + rx + next() * (148 - rx * 2), -48 + ry + next() * (108 - ry * 2)];
    if (placed.some((p) => Math.hypot(p.at[0] - at[0], p.at[1] - at[1]) < REACH[p.kind] + REACH[kind] + 12)) continue;
    placed.push({ kind, at, turned });
  }
  const features = placed.map(({ kind, at, turned }) => {
    const field = fieldAt(kind, at, turned);
    return { kind, at, turned, shape: shapeOf(field, at), insert: insertOf(kind, at, turned) };
  });
  return { features };
}

/* Between openings the router lifts clear of the template, crosses at
   this speed and comes down again. */
export const LIFT = 30;
const UP = 0.3;
const CROSS = 160;

function hop(from: Plane, to: Plane): Sample[] {
  const out: Sample[] = [];
  const lift = (f: number) => LIFT * ease(f);
  const span = Math.hypot(to[0] - from[0], to[1] - from[1]) / CROSS;
  for (let i = 0; i < RATE * UP; i++) out.push({ at: from, arm: from, edge: null, press: 0, lift: lift(i / (RATE * UP)) });
  for (let i = 0; i < RATE * span; i++) {
    const f = ease(i / (RATE * span));
    const at: Plane = [from[0] + (to[0] - from[0]) * f, from[1] + (to[1] - from[1]) * f];
    out.push({ at, arm: at, edge: null, press: 0, lift: LIFT });
  }
  for (let i = 0; i < RATE * UP; i++) out.push({ at: to, arm: to, edge: null, press: 0, lift: lift(1 - i / (RATE * UP)) });
  return out;
}

/* The jig's cell is the router figure whole: its bench, two boxes,
   fences, boards and jig, standing in a bay in the middle of the line,
   on a floor the bench's feet below its plate. Its feeder's far face,
   where a board from the line ahead goes in, and its end box's, where
   one comes out onto the line after; a board between the two that far
   into the feeder is out of sight in it. */
export const FLOOR_Z = -PLATE_H - FOOT_H;
export const IN_FEEDER = 156;
export const FEED_BACK = PITCH / 2 + BOX_D;
export const STACK_BACK = -PITCH * 1.5 - BOX_D;

/* The line beyond the cell, the same channel on beds of its own. Ahead:
   the magazine of blanks over the board at MAG_Y, the marking bridge
   over the one at MARK_Y. After: the insertion bridge over the one at
   INSERT_Y, and the run-out where the finished board rests at OUT_Y. */
export const MAG_Y = 3 * PITCH;
export const MARK_Y = 2 * PITCH;
export const INSERT_Y = -3 * PITCH;
export const OUT_Y = -4 * PITCH;
export const HEAD_BED = { y0: PLATE.y + PLATE.d, y1: MAG_Y + PITCH / 2 + 24 };
export const END_BED = { y0: OUT_Y - PITCH / 2 - 24, y1: PLATE.y };
/* A bridge: a post either side outside the fences, rails along the line
   on their tops, a beam across riding them. */
export const BRIDGE = { span: CHANNEL + FENCE_W + 18, post: 12, z: 112, reach: 64 };
export const MAG_STACK = 3;
/* The insertion head's three magazines, along its beam. */
export const TUBE_DX: Record<Kind, number> = { round: -44, slot: 0, square: 44 };
export const TUBE_Z = 62;

/* The floor everything stands on. */
export const FLOOR = { x: -300, y: END_BED.y0 - 30, w: 520, d: HEAD_BED.y1 - END_BED.y0 + 60, r: 8 };
export const FLOOR_H = 10;

/* The camera: the router's own, so the jig reads as the same one. */
export const WIDTH = 960;
export const AZIMUTH = 30;
const PAD = 12;
const corners = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Point3[] =>
  [z0, z1].flatMap((z) => [
    [x0, y0, z],
    [x1, y0, z],
    [x0, y1, z],
    [x1, y1, z],
  ]) as Point3[];
function fit(points: Point3[]) {
  const unit: Projection = { origin: [0, 0], scale: 1, azimuth: AZIMUTH };
  const flat = points.map((point) => iso(point, unit));
  const xs = flat.map(([x]) => x);
  const ys = flat.map(([, y]) => y);
  const scale = (WIDTH - PAD * 2) / (Math.max(...xs) - Math.min(...xs));
  const height = Math.ceil((Math.max(...ys) - Math.min(...ys)) * scale + PAD * 2);
  return { P: { origin: [PAD - Math.min(...xs) * scale, PAD - Math.min(...ys) * scale], scale, azimuth: AZIMUTH } as Projection, height };
}
const fitted = fit([
  ...corners(FLOOR.x, FLOOR.x + FLOOR.w, FLOOR.y, FLOOR.y + FLOOR.d, FLOOR_Z - FLOOR_H - 5, FLOOR_Z),
  ...corners(COLUMN[0] - 24, COLUMN[0] + 24, -24, 24, 0, ARM_Z + 20 + LIFT),
  ...corners(-150, 40, -90, 110, 0, ARM_Z + 20 + LIFT),
]);
export const P = fitted.P;
export const HEIGHT = fitted.height;

function ease(t: number) {
  return t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t);
}

/* The pen: how far through each feature's outline it has drawn, and
   where it is. A board is drawn on in the pass two before its cut,
   under the marking bridge; all features in turn, a little lifted
   between. */
export interface Pen {
  x: number;
  y: number;
  down: boolean;
}
/* The insertion head: where its carriage is, and the insert falling
   from a magazine into its pocket. */
export interface Dropper {
  x: number;
  y: number;
  falling: { feature: Feature; z: number } | null;
}
export const PEN_PARK: Plane = [0, MARK_Y + BRIDGE.reach];
export const DROP_PARK: Plane = [0, INSERT_Y + BRIDGE.reach];
const DROP = { move: 0.7, fall: 0.3, rest: 0.25 };
const AT_POCKET = BOARD_TOP - DEPTH;

export interface Scene {
  bit: Plane;
  arm: Plane;
  lift: number;
  sample: Sample | null;
  /* The order the template is cut for. */
  order: number;
  /* For each board: where it is along the line, whose pass it carries
     and how much of its pocket is cut. */
  boards: { y: number; pass: number; points: number }[];
  dropped: number;
  pen: Pen;
  dropper: Dropper;
}

/* A point a fraction of the way round an outline. */
function along(ring: Plane[], f: number): Plane {
  const i = Math.min(ring.length - 1, Math.floor(f * ring.length));
  return ring[i]!;
}

/* The router's passes, one order each, run on a longer line: eight
   boards go round, the one that went off the run-out coming back as
   the next blank under the magazine. */
export class Line extends Show {
  orders = new Map<number, Order>();
  order(n: number) {
    if (!this.orders.has(n)) this.orders.set(n, orderOf(n));
    return this.orders.get(n)!;
  }
  /* A pass cuts its order's openings nearest first, lifting between. */
  override runFor(n: number, start: Plane): Run {
    const left = [...this.order(n).features];
    const run: Run = { samples: [], path: [], laid: [] };
    let at = start;
    let first = true;
    while (left.length) {
      left.sort((a, b) => Math.hypot(a.at[0] - at[0], a.at[1] - at[1]) - Math.hypot(b.at[0] - at[0], b.at[1] - at[1]));
      const feature = left.shift()!;
      const from = feature.shape.hold(at).at;
      if (!first) run.samples.push(...hop(at, from));
      first = false;
      const part = runOf(n * 7 + run.path.length, from, feature.shape);
      const offset = run.samples.length;
      run.samples.push(...part.samples);
      run.path.push(...part.path);
      run.laid.push(...part.laid.map((i) => i + offset));
      at = part.samples[part.samples.length - 1]!.at;
    }
    return run;
  }
  lineAt(t: number): Scene {
    const n = this.passAt(t);
    const run = this.run(n);
    const local = t - this.starts[n]!;
    const cut = run.samples.length / RATE;
    const index = Math.min(run.samples.length - 1, Math.floor(local * RATE));
    const sample = run.samples[index]!;
    const cutting = local < cut;
    const { moved, dropped } = cutting ? { moved: 0, dropped: 0 } : indexAt(local - cut);
    const laid = (points: number[], upTo: number) => {
      let [lo, hi] = [0, points.length];
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (points[mid]! <= upTo) lo = mid + 1;
        else hi = mid;
      }
      return lo;
    };
    const boards: Scene["boards"] = [];
    for (const slot of SLOTS) {
      const pass = n + slot;
      const points = pass < 0 || slot > 0 ? 0 : pass === n ? (cutting ? laid(run.laid, index) : run.path.length) : this.run(pass).path.length;
      boards[((pass % SLOTS.length) + SLOTS.length) % SLOTS.length] = { y: slot * PITCH - moved, pass, points };
    }
    if (cutting) {
      return { bit: sample.at, arm: sample.arm, lift: sample.lift ?? 0, sample, order: n, boards, dropped, pen: this.penAt(t), dropper: this.dropperAt(t) };
    }
    /* Between orders the router lifts, the template is changed while
       the row moves on, and the router crosses to where the next order
       starts and comes down. */
    const u = local - cut;
    const settle = 1 - ease(u / 0.5);
    const lift = LIFT * ease(u / 0.5) * (1 - ease((u - this.index + 0.6) / 0.5));
    const to = this.run(n + 1).samples[0]!.at;
    const f = ease((u - 0.6) / (this.index - 1.4));
    const bit: Plane = [sample.at[0] + (to[0] - sample.at[0]) * f, sample.at[1] + (to[1] - sample.at[1]) * f];
    const arm: Plane = f > 0 ? bit : [sample.at[0] + (sample.arm[0] - sample.at[0]) * settle, sample.at[1] + (sample.arm[1] - sample.at[1]) * settle];
    const order = u < this.index / 2 ? n : n + 1;
    return { bit, arm, lift, sample: { ...sample, press: sample.press * settle }, order, boards, dropped, pen: this.penAt(t), dropper: this.dropperAt(t) };
  }
  /* When pass m's board is drawn on: in pass m - 2, each feature in its
     own share of the time, all before the row moves on. */
  markOf(m: number) {
    const features = this.order(m).features;
    if (m - 2 < 0) return features.map(() => ({ start: -Infinity, span: 0 }));
    const cut = this.run(m - 2).samples.length / RATE;
    const span = Math.min(1.6, (cut - 1) / features.length);
    const from = this.starts[m - 2]! + 0.5;
    return features.map((_, i) => ({ start: from + i * (span + 0.2), span }));
  }
  /* How much of each feature's outline is drawn on pass m's board. */
  markedBy(m: number, t: number) {
    return this.markOf(m).map(({ start, span }) => (span ? Math.max(0, Math.min(1, (t - start) / span)) : 1));
  }
  penAt(t: number): Pen {
    const n = this.passAt(t);
    const m = n + 2;
    const marks = this.markOf(m);
    const features = this.order(m).features;
    for (const [i, { start, span }] of marks.entries()) {
      if (t < start - 0.2 || t > start + span) continue;
      const ring = features[i]!.shape.opening;
      if (t < start) {
        /* Over to where this outline starts, lifted. */
        const [x, y] = ring[0]!;
        return { x, y: MARK_Y + y, down: false };
      }
      const [x, y] = along(ring, (t - start) / span);
      return { x, y: MARK_Y + y, down: true };
    }
    return { x: PEN_PARK[0], y: PEN_PARK[1], down: false };
  }
  /* When each insert of pass m's board drops: in pass m + 3, under the
     insertion bridge, the carriage moving over its pocket first. */
  dropOf(m: number) {
    const features = this.order(m).features;
    if (!this.starts[m + 3] && m + 3 > 0) this.run(m + 3);
    const cut = this.run(m + 3).samples.length / RATE;
    const each = Math.min(DROP.move + DROP.fall + DROP.rest, (cut - 0.8) / features.length);
    const k = each / (DROP.move + DROP.fall + DROP.rest);
    const from = this.starts[m + 3]! + 0.5;
    return features.map((feature, i) => {
      const start = from + i * each;
      return { feature, start, move: DROP.move * k, fall: DROP.fall * k, set: start + (DROP.move + DROP.fall) * k };
    });
  }
  /* How many of pass m's inserts are in by time t, counting only those
     set since `since`. */
  setBy(m: number, t: number, since = -Infinity) {
    if (m < 0) return 0;
    return this.dropOf(m).filter(({ set }) => set <= t && set >= since).length;
  }
  dropperAt(t: number): Dropper {
    const n = this.passAt(t);
    const m = n - 3;
    if (m < 0) return { x: DROP_PARK[0], y: DROP_PARK[1], falling: null };
    let from: Plane = DROP_PARK;
    for (const { feature, start, move, fall } of this.dropOf(m)) {
      const to: Plane = [feature.at[0] - TUBE_DX[feature.kind], INSERT_Y + feature.at[1]];
      if (t < start) break;
      if (t < start + move) {
        const f = ease((t - start) / move);
        return { x: from[0] + (to[0] - from[0]) * f, y: from[1] + (to[1] - from[1]) * f, falling: null };
      }
      if (t < start + move + fall) {
        const f = (t - start - move) / fall;
        return { x: to[0], y: to[1], falling: { feature, z: TUBE_Z + (AT_POCKET - TUBE_Z) * f * f } };
      }
      from = to;
    }
    const drops = this.dropOf(m);
    const last = drops[drops.length - 1];
    if (last && t > last.set) {
      const f = ease((t - last.set - 0.2) / 0.8);
      return { x: from[0] + (DROP_PARK[0] - from[0]) * f, y: from[1] + (DROP_PARK[1] - from[1]) * f, falling: null };
    }
    return { x: from[0], y: from[1], falling: null };
  }
  /* The still: in the fourth order, the arm on an edge, a board being
     drawn on and one getting its inserts. */
  still() {
    const run = this.run(3);
    const from = Math.floor(RATE * 1.4);
    let best = from;
    for (let i = from; i < Math.min(run.samples.length, from + RATE * 2); i++) {
      if (run.samples[i]!.edge && !run.samples[i]!.lift && run.samples[i]!.press > (run.samples[best]!.press ?? 0)) best = i;
    }
    return this.starts[3]! + best / RATE;
  }
}

export const JIG_LABEL =
  "A router on an arm cuts pockets in a board through a template, a plate whose openings are edged in gold. The arm drives the router in a different, wandering path every pass, often pushing it past an edge, and the guide bushing round the bit rides the opening's wall and goes no further. Each pocket comes out the shape of its opening, and the row of boards moves on between two boxes.";

export const LEVELS = ["language", "stack", "ontology", "factory"] as const;
export type Level = (typeof LEVELS)[number];

export const LABEL =
  "A small factory: one straight line that every board travels, with the template router standing in the middle of it. At the head, a magazine lets down a blank, and a pen on a bridge draws the order's layout on it in gold: which kinds of feature go where. Every order is a new layout. The board goes into the router's feeder and comes up under a template cut to that same layout, and an arm drives the router through its openings in a wandering path while the bushing rides each opening's wall and goes no further, so every pocket lands on the plan. Out of the router's far box, a second bridge with three magazines of standard inserts drops the right one into each pocket, and the finished board rests at the end of the line. No two boards are the same, and every one is made of the same proven parts.";
