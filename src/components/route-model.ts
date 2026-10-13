/* The template router under "Strong boundaries make systems sound". A
   board is clamped up under a template whose opening a person cut: the
   spec, edged in gold. An arm drives a router over it as it likes, a
   different path every pass, and often past the edge; the guide bushing
   round the bit rides the opening's wall and goes no further, and a
   compliant wrist takes up the difference. The pocket that results is the
   opening, offset by the bushing, every time. The platen then drops, the
   row of boards moves on by one and the next blank is raised.

   Millimetres. x toward the viewer, y along the row (+y to the left on
   screen), z up. Board-local coordinates have the jig's centre at the
   origin. */

import { iso, type Plane, type Point3, type Projection } from "./iso/iso-kit";

/* The boards: they butt end to end in the channel, so the row moves on
   by one length. */
export const BOARD = { w: 210, d: 150, h: 19 };
export const PITCH = BOARD.d;
/* The platen lifts the row against the template's underside; dropped,
   the bit clears the board. */
export const BOARD_Z = 10;
export const DROP = 10;
export const FENCE_H = BOARD_Z + BOARD.h;
export const TEMPLATE = { x: -128, y: -73, w: 256, d: 146, r: 5 };
export const TEMPLATE_H = 8;
export const TOP = FENCE_H + TEMPLATE_H;

/* A 24 mm guide bushing round a 3/4" bit, cutting 8 deep. */
export const BUSH = 12;
export const BIT = 9.5;
export const DEPTH = 8;
export const OFFSET = BUSH - BIT;
/* How far the wrist's float lets the arm run past the router. */
export const FLOAT = 9;

/* The opening: a rounded slot with a round boss on its near side,
   joined by fillets no tighter than the bushing, so the pocket is the
   opening offset by the bushing and nothing else. */
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - (h * h * k) / 4;
};
const field = ([x, y]: Plane) => {
  const [hx, hy, r] = [74, 38, 21];
  const qx = Math.abs(x) - hx + r;
  const qy = Math.abs(y) - hy + r;
  const slot = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - r;
  const boss = Math.hypot(x - 26, y - 38) - 22;
  return smin(slot, boss, 30);
};

/* The opening's edge, traced from the centre and resampled every
   millimetre, counter-clockwise. */
function trace(): Plane[] {
  const rays: Plane[] = [];
  for (let i = 0; i < 1440; i++) {
    const angle = (i / 1440) * Math.PI * 2;
    const [dx, dy] = [Math.cos(angle), Math.sin(angle)];
    let [lo, hi] = [0, 140];
    for (let step = 0; step < 40; step++) {
      const mid = (lo + hi) / 2;
      if (field([dx * mid, dy * mid]) < 0) lo = mid;
      else hi = mid;
    }
    rays.push([dx * lo, dy * lo]);
  }
  const lengths = [0];
  for (let i = 1; i <= rays.length; i++) {
    const [a, b] = [rays[i - 1]!, rays[i % rays.length]!];
    lengths.push(lengths[i - 1]! + Math.hypot(b[0] - a[0], b[1] - a[1]));
  }
  const total = lengths[lengths.length - 1]!;
  const count = Math.round(total);
  const out: Plane[] = [];
  let j = 0;
  for (let i = 0; i < count; i++) {
    const at = (i / count) * total;
    while (lengths[j + 1]! < at) j++;
    const t = (at - lengths[j]!) / (lengths[j + 1]! - lengths[j]!);
    const [a, b] = [rays[j]!, rays[(j + 1) % rays.length]!];
    out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
  }
  return out;
}

export const OPENING = trace();

/* The signed distance to the opening's edge, exact: negative inside. */
export function nearest([x, y]: Plane) {
  let best = Infinity;
  let point: Plane = [0, 0];
  let inside = false;
  const n = OPENING.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const [ax, ay] = OPENING[j]!;
    const [bx, by] = OPENING[i]!;
    if (ay > y !== by > y && x < ((ax - bx) * (y - by)) / (ay - by) + bx) inside = !inside;
    const [ex, ey] = [bx - ax, by - ay];
    const t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey)));
    const [px, py] = [ax + ex * t, ay + ey * t];
    const d = (x - px) ** 2 + (y - py) ** 2;
    if (d < best) {
      best = d;
      point = [px, py];
    }
  }
  const distance = Math.sqrt(best);
  return { distance: inside ? -distance : distance, point };
}

/* Where the bit's axis may be: the bushing inside the opening. A point
   past that is held at the nearest place it may be. */
export function hold(at: Plane): { at: Plane; edge: Plane | null } {
  const { distance, point } = nearest(at);
  if (distance <= -BUSH) return { at, edge: null };
  const [dx, dy] = [at[0] - point[0], at[1] - point[1]];
  const length = Math.hypot(dx, dy) || 1;
  /* The outward normal at the edge, whichever side the point is on. */
  const sign = distance > 0 ? 1 : -1;
  const [nx, ny] = [(dx / length) * sign, (dy / length) * sign];
  return { at: [point[0] - nx * BUSH, point[1] - ny * BUSH], edge: point };
}

/* The cells a finished pocket covers, every 2 mm, just inside its edge. */
const CELL = 2;
const GRID = { x: -80, y: -50, columns: 81, rows: 61 };
const cellAt = (column: number, row: number): Plane => [GRID.x + column * CELL, GRID.y + row * CELL];
const CELLS: number[] = [];
for (let column = 0; column < GRID.columns; column++)
  for (let row = 0; row < GRID.rows; row++) if (nearest(cellAt(column, row)).distance <= -OFFSET - 0.8) CELLS.push(column * GRID.rows + row);
const cellOf = (index: number) => cellAt(Math.floor(index / GRID.rows), index % GRID.rows);

/* A run's random numbers. */
function random(seed: number) {
  let state = (seed * 2654435761) >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

export interface Sample {
  /* The bit's axis, and where the arm would have it. */
  at: Plane;
  arm: Plane;
  /* Where the bushing bears on the edge, and how hard. */
  edge: Plane | null;
  press: number;
}

export interface Run {
  samples: Sample[];
  /* The swept centreline, thinned to a point every 1.5 mm. */
  path: Plane[];
  /* Which sample each path point was laid at. */
  laid: number[];
}

export const RATE = 120;
const SPEED = 180;
/* The tightest turn, in millimetres of radius. */
const TURN = 9;

/* One pass. The arm heads for a place still to cut, picked loosely, and
   one time in three for a place past the edge; its heading wanders as
   it goes. Wherever it pushes past, the bushing holds the bit at the
   edge and the wrist floats. The pass ends when the whole pocket is cut. */
export function runOf(seed: number, start: Plane): Run {
  const next = random(seed + 1);
  const open = new Set(CELLS);
  const samples: Sample[] = [];
  const path: Plane[] = [start];
  const laid = [0];
  let at: Plane = start;
  let arm: Plane = start;
  let heading = next() * Math.PI * 2;
  let wander = 0;
  let goal: Plane = start;
  let since = 0;
  let tidying = false;
  let lapping = 0;
  let lapped = 0;
  const choose = () => {
    since = 0;
    const left = [...open].map(cellOf);
    if (!left.length) return;
    /* It prefers what lies ahead of it, a little way off, so it sweeps
       in rough strokes; late in the pass it tidies up what is nearest. */
    const tidy = left.length < CELLS.length * 0.15;
    tidying = tidy;
    /* Then it runs the edge once round, as a pocket is finished: it
       pushes out past the edge, a little ahead, and the bushing slides
       along it. */
    if (tidy && lapped < OPENING.length + 40) {
      const n = OPENING.length;
      let index = 0;
      let best = Infinity;
      OPENING.forEach(([x, y], i) => {
        const d = (x - at[0]) ** 2 + (y - at[1]) ** 2;
        if (d < best) [best, index] = [d, i];
      });
      if (!lapping) {
        const [ax, ay] = OPENING[index]!;
        const [bx, by] = OPENING[(index + 1) % n]!;
        lapping = (bx - ax) * Math.cos(heading) + (by - ay) * Math.sin(heading) >= 0 ? 1 : -1;
      }
      const ahead = (((index + lapping * 30) % n) + n) % n;
      const [px, py] = OPENING[ahead]!;
      const [qx, qy] = OPENING[(ahead + 1) % n]!;
      const [rx, ry] = OPENING[(ahead + n - 1) % n]!;
      const [tx, ty] = [qx - rx, qy - ry];
      const length = Math.hypot(tx, ty) || 1;
      goal = [px + (ty / length) * 18, py - (tx / length) * 18];
      lapped += 30;
      return;
    }
    const score = (cell: Plane) => {
      const [dx, dy] = [cell[0] - at[0], cell[1] - at[1]];
      const d = Math.hypot(dx, dy);
      if (tidy) return d;
      const off = Math.abs(Math.atan2(Math.sin(Math.atan2(dy, dx) - heading), Math.cos(Math.atan2(dy, dx) - heading)));
      return Math.abs(d - 30) + off * 22 + next() * 26;
    };
    const cell = !tidy && next() < 0.08 ? left[Math.floor(next() * left.length)]! : left.reduce((a, b) => (score(b) < score(a) ? b : a));
    if (!tidy && next() < 0.2) {
      /* Past the edge: out along the edge's normal nearest the cell. */
      const { point } = nearest(cell);
      const [dx, dy] = [point[0] - cell[0], point[1] - cell[1]];
      const length = Math.hypot(dx, dy) || 1;
      const past = 14 + next() * 26;
      goal = [point[0] + (dx / length) * past, point[1] + (dy / length) * past];
    } else goal = cell;
  };
  const cut = () => {
    const reach = Math.ceil(BIT / CELL);
    const [c0, r0] = [Math.round((at[0] - GRID.x) / CELL), Math.round((at[1] - GRID.y) / CELL)];
    for (let column = c0 - reach; column <= c0 + reach; column++)
      for (let row = r0 - reach; row <= r0 + reach; row++) {
        const index = column * GRID.rows + row;
        if (!open.has(index)) continue;
        const [cx, cy] = cellAt(column, row);
        if ((cx - at[0]) ** 2 + (cy - at[1]) ** 2 <= BIT * BIT) open.delete(index);
      }
  };
  choose();
  const dt = 1 / RATE;
  while (open.size && samples.length < RATE * 90) {
    const want = Math.atan2(goal[1] - arm[1], goal[0] - arm[0]);
    wander += (next() - 0.5) * 9 * dt - wander * 1.6 * dt;
    const turn = Math.atan2(Math.sin(want - heading), Math.cos(want - heading));
    /* It slows as it comes up to where it is going, and turns tighter
       the slower it goes. */
    const arrive = tidying ? Math.max(50, Math.hypot(goal[0] - arm[0], goal[1] - arm[1]) * 6) : SPEED;
    const speed = Math.min(SPEED, arrive) * (Math.abs(turn) > 1.2 ? 0.35 : 1 - 0.3 * Math.abs(turn));
    const rate = speed / TURN;
    heading += Math.max(-rate * dt, Math.min(rate * dt, turn)) + wander * dt * 6;
    arm = [arm[0] + Math.cos(heading) * speed * dt, arm[1] + Math.sin(heading) * speed * dt];
    const held = hold(arm);
    at = held.at;
    let [fx, fy] = [arm[0] - at[0], arm[1] - at[1]];
    const float = Math.hypot(fx, fy);
    if (float > FLOAT) {
      [fx, fy] = [(fx / float) * FLOAT, (fy / float) * FLOAT];
      arm = [at[0] + fx, at[1] + fy];
    }
    const press = held.edge ? Math.min(1, Math.hypot(fx, fy) / FLOAT) : 0;
    samples.push({ at, arm, edge: held.edge, press });
    cut();
    const last = path[path.length - 1]!;
    if (Math.hypot(at[0] - last[0], at[1] - last[1]) >= 1.5) {
      path.push(at);
      laid.push(samples.length - 1);
    }
    since += dt;
    const reached = Math.hypot(goal[0] - at[0], goal[1] - at[1]) < BIT + 3;
    const stalled = press > 0.95 && since > 0.15;
    if (reached || stalled || since > 2.6) choose();
  }
  path.push(at);
  laid.push(samples.length - 1);
  return { samples, path, laid };
}

/* After a pass: a beat, the platen drops, the row moves on, it rises. */
export const BEAT = 0.9;
export const LOWER = 0.7;
export const SLIDE = 2.1;
export const RAISE = 0.7;
export const INDEX = BEAT + LOWER + SLIDE + RAISE;

const ease = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));

/* Where the row stands during the index that follows a pass, at time t
   after the pass ended: how far it has moved on and how far it has
   dropped. */
export function indexAt(t: number) {
  const dropped = ease((t - BEAT) / LOWER) * (1 - ease((t - BEAT - LOWER - SLIDE) / RAISE));
  const moved = ease((t - BEAT - LOWER) / SLIDE);
  return { moved: moved * PITCH, dropped: dropped * DROP };
}

/* The arm. Its column stands behind the jig; two links reach the
   router's top, where the wrist holds the motor on its float. */
export const COLUMN: Plane = [-205, 10];
export const LINK = 112;
/* The motor stands beside the bit, behind it, on an offset base, so the
   bushing and the bit stay in view. */
export const MOTOR: Plane = [-54, 0];

export function armOf(wrist: Plane) {
  const [dx, dy] = [wrist[0] - COLUMN[0], wrist[1] - COLUMN[1]];
  const d = Math.min(Math.hypot(dx, dy), LINK * 2 - 0.5);
  const toward = Math.atan2(dy, dx);
  const bend = Math.acos(d / (LINK * 2));
  const first = toward + bend;
  const elbow: Plane = [COLUMN[0] + Math.cos(first) * LINK, COLUMN[1] + Math.sin(first) * LINK];
  return { elbow, wrist };
}

/* The camera, and the world's extent for fitting it. */
export const WIDTH = 960;
const PAD = 12;
export const AZIMUTH = 30;
export const PLATE = { x: -244, y: -404, w: 396, d: 660, r: 8 };
export const PLATE_H = 12;
export const FOOT_H = 5;

export const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Point3[] =>
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
  const P: Projection = { origin: [PAD - Math.min(...xs) * scale, PAD - Math.min(...ys) * scale], scale, azimuth: AZIMUTH };
  return { P, height };
}

export const ARM_Z = 214;
const fitted = fit([
  ...box(PLATE.x, PLATE.x + PLATE.w, PLATE.y, PLATE.y + PLATE.d, -PLATE_H - FOOT_H, 0),
  ...box(COLUMN[0] - 24, COLUMN[0] + 24, -24, 24, 0, ARM_Z + 20),
  ...box(-150, 40, -90, 110, 0, ARM_Z + 20),
]);
export const P = fitted.P;
export const HEIGHT = fitted.height;

/* The show: pass after pass, each starting where the last one stopped.
   Board n carries pass n; four boards go round, so the board that went
   into the stacker comes back out of the feeder as the next blank, out
   of sight both times. */
export interface Scene {
  bit: Plane;
  arm: Plane;
  sample: Sample | null;
  /* For each of the four boards: where it is along the row, and what of
     its pocket is cut. */
  boards: { y: number; pass: number; points: number }[];
  dropped: number;
  pass: number;
}

export class Show {
  runs: Run[] = [];
  starts: number[] = [0];
  constructor(readonly first = 0) {}
  run(n: number): Run {
    while (this.runs.length <= n) {
      const previous = this.runs[this.runs.length - 1];
      const start = previous ? previous.samples[previous.samples.length - 1]!.at : ([0, 0] as Plane);
      const run = runOf(this.first + this.runs.length, start);
      this.runs.push(run);
      this.starts.push(this.starts[this.starts.length - 1]! + run.samples.length / RATE + INDEX);
    }
    return this.runs[n]!;
  }
  /* Which pass is under way at time t. */
  passAt(t: number) {
    let n = 0;
    for (;;) {
      this.run(n);
      if (t < this.starts[n + 1]!) return n;
      n++;
    }
  }
  sceneAt(t: number): Scene {
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
    for (let slot = 1; slot >= -2; slot--) {
      const pass = n - slot;
      const points = pass < 0 || slot > 0 ? 0 : pass === n ? (cutting ? laid(run.laid, index) : run.path.length) : this.run(pass).path.length;
      boards[((pass % 4) + 4) % 4] = { y: slot * PITCH - moved, pass, points };
    }
    /* Once the pocket is cut the arm stops pushing, and the wrist and
       the gold settle. */
    const settle = cutting ? 1 : 1 - ease((local - cut) / 0.5);
    const arm: Plane = [sample.at[0] + (sample.arm[0] - sample.at[0]) * settle, sample.at[1] + (sample.arm[1] - sample.at[1]) * settle];
    return { bit: sample.at, arm, sample: { ...sample, press: sample.press * settle }, boards, dropped, pass: n };
  }
  /* The still: well into the second pass, the bushing bearing on the
     edge where it can be seen. */
  rest() {
    const run = this.run(1);
    const from = Math.floor(run.samples.length * 0.5);
    const to = Math.floor(run.samples.length * 0.72);
    let best = from;
    let score = -Infinity;
    for (let i = from; i < to; i++) {
      const sample = run.samples[i]!;
      /* Bearing on the right-hand wall, which faces us clear of the motor. */
      const value = sample.edge ? sample.press + (sample.at[1] - sample.edge[1]) / BUSH : -1;
      if (value > score) [score, best] = [value, i];
    }
    return this.starts[1]! + best / RATE;
  }
}
