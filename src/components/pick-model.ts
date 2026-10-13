/* The pick-and-place under "Strong boundaries make systems sound". A
   gantry picks four loose parts off a staging plate, in whatever order
   and by whatever route it takes this time, and sets each into the
   fixture: nests cut so that each part seats in one place only, and the
   four make one square. A fifth part comes out of the box with them, a
   shape no nest is cut for: the gantry tries it on the fixture, it will
   not seat anywhere, and it goes down the scrap slot. The square goes to
   the bin and the feeder lets out the next five. World units, x toward the viewer, y along the
   bench (+y to the left on screen), z up. */

import { iso, type Plane, type Point3, type Projection } from "./iso/iso-kit";

export const PLATE = { x: -84, y: -216, w: 168, d: 420, r: 8 };
export const PLATE_H = 12;
export const FOOT_H = 5;

/* Where the parts lie loose, and the box standing on its end that they
   come out of: closed, nothing to see inside, a part at a time through
   its far side. */
export const STAGING = { x: -61, y: 32, w: 122, d: 164, r: 3 };
export const STAGING_H = 6;
export const BOX = { x: -38, y: 154, w: 78, d: 48, r: 3 };
export const BOX_Z = 36;
export const BOX_H = 46;
/* The column the box hangs from, behind it, and where a part lands
   when it drops out of the box's underside. */
export const COLUMN = { x: -58, y: 166, w: 10, d: 24, r: 1 };
export const LAND: Plane = [1, 178];

/* The fixture, its nests forming one square, and the bin past it. */
export const FIXTURE = { x: -46, y: -125, w: 92, d: 92, r: 3 };
export const FIXTURE_H = 10;
export const POCKET = 3;
export const CELL = 22;
export const SQUARE = { x: -33, y: -112 };
export const BIN = { x: -40, y: -205, w: 80, d: 73, r: 2 };
export const BIN_H = 42;
export const PART_H = 6;
/* The slot the misfit goes down, cut in the bench between the fixture
   and the staging plate, a lip round it. */
export const SCRAP = { x: -27, y: -29, w: 54, d: 50, r: 2 };

/* The pieces, in cells of the square: an L, a bar of three, a pair and
   a single. Each part is its piece, a little smaller than its nest. */
export const PIECES: Plane[][] = [
  [
    [0, 0],
    [2, 0],
    [2, 1],
    [1, 1],
    [1, 2],
    [0, 2],
  ],
  [
    [2, 0],
    [3, 0],
    [3, 3],
    [2, 3],
  ],
  [
    [1, 1],
    [2, 1],
    [2, 3],
    [1, 3],
  ],
  [
    [0, 2],
    [1, 2],
    [1, 3],
    [0, 3],
  ],
];

const centroidOf = (cells: Plane[]): Plane => {
  let area = 0;
  let cx = 0;
  let cy = 0;
  cells.forEach(([ax, ay], index) => {
    const [bx, by] = cells[(index + 1) % cells.length]!;
    const cross = ax * by - bx * ay;
    area += cross;
    cx += (ax + bx) * cross;
    cy += (ay + by) * cross;
  });
  return [cx / (3 * area), cy / (3 * area)];
};

/* A nest in world units, and the part's outline about its own centre. */
export const NESTS = PIECES.map((cells) => cells.map(([c, r]) => [SQUARE.x + c * CELL, SQUARE.y + r * CELL] as Plane));
export const CENTRES = PIECES.map((cells) => {
  const [c, r] = centroidOf(cells);
  return [SQUARE.x + c * CELL, SQUARE.y + r * CELL] as Plane;
});
/* The misfit, a block of two by two that no nest is cut for, is the
   last of the shapes. */
export const MISFIT = PIECES.length;
const BLOCK: Plane[] = [
  [-CELL, -CELL],
  [CELL, -CELL],
  [CELL, CELL],
  [-CELL, CELL],
];
export const SHAPES = [
  ...NESTS.map((nest, index) => {
    const [cx, cy] = CENTRES[index]!;
    return nest.map(([x, y]) => [(x - cx) * 0.96, (y - cy) * 0.96] as Plane);
  }),
  BLOCK.map(([x, y]) => [x * 0.96, y * 0.96] as Plane),
];
export const ASSEMBLY: Plane = [SQUARE.x + 1.5 * CELL, SQUARE.y + 1.5 * CELL];
/* The angle each part drops out of the box at: whichever of square or
   quarter-turned keeps it shortest along y, to fit under the box. */
const LANDINGS = SHAPES.map((shape) => {
  const spread = (angle: number) => {
    const ys = shape.map(([x, y]) => x * Math.sin(angle) + y * Math.cos(angle));
    return Math.max(...ys) - Math.min(...ys);
  };
  return spread(0) <= spread(Math.PI / 2) ? 0 : Math.PI / 2;
});

/* Whether two outlines come within `gap` of each other. */
const crosses = ([a, b]: [Plane, Plane], [c, d]: [Plane, Plane]) => {
  const turn = (p: Plane, q: Plane, r: Plane) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
  return turn(a, b, c) * turn(a, b, d) < 0 && turn(c, d, a) * turn(c, d, b) < 0;
};
const within = ([x, y]: Plane, poly: Plane[]) => {
  let hit = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i]!;
    const [xj, yj] = poly[j]!;
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};
function touching(a: Plane[], b: Plane[], gap: number) {
  const grow = (poly: Plane[]) => {
    const cx = poly.reduce((sum, [x]) => sum + x, 0) / poly.length;
    const cy = poly.reduce((sum, [, y]) => sum + y, 0) / poly.length;
    return poly.map(([x, y]) => {
      const length = Math.hypot(x - cx, y - cy) || 1;
      return [x + ((x - cx) / length) * gap, y + ((y - cy) / length) * gap] as Plane;
    });
  };
  const [ga, gb] = [grow(a), grow(b)];
  const edges = (poly: Plane[]) => poly.map((point, index) => [point, poly[(index + 1) % poly.length]!] as [Plane, Plane]);
  return edges(ga).some((e) => edges(gb).some((f) => crosses(e, f))) || ga.some((point) => within(point, gb)) || gb.some((point) => within(point, ga));
}

/* Where the misfit can be tried: any two by two of the square's cells,
   and the pieces whose cells lie under it. The nests are cut edge to
   edge, so where every nest under it is still empty they make one
   opening it would drop into: it is tried only where a part already
   seated stops it, and rests on that part's top. */
const inPiece = (cells: Plane[], c: number, r: number) => within([c + 0.5, r + 0.5], cells);
const WINDOWS = [0, 1].flatMap((r) =>
  [0, 1].map((c) => ({
    at: [SQUARE.x + (c + 1) * CELL, SQUARE.y + (r + 1) * CELL] as Plane,
    under: PIECES.flatMap((cells, piece) => ([0, 1].some((dc) => [0, 1].some((dr) => inPiece(cells, c + dc, r + dr))) ? [piece] : [])),
  })),
);

/* The gantry: rails along y on posts at either side, a bridge across. */
export const RAIL_X = 70;
export const RAIL_Z = 90;
export const RAIL_Y = [-212, 200] as const;
export const HIGH = 72;
export const PARK: Point3 = [0, 0, HIGH];

export const WIDTH = 960;
const PAD = 12;
export const AZIMUTH = 30;

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

export const box = (x0: number, x1: number, y0: number, y1: number, z0: number, z1: number): Point3[] =>
  [z0, z1].flatMap((z) => [
    [x0, y0, z],
    [x1, y0, z],
    [x0, y1, z],
    [x1, y1, z],
  ]) as Point3[];

const fitted = fit([...box(PLATE.x, PLATE.x + PLATE.w, PLATE.y, PLATE.y + PLATE.d, -PLATE_H - FOOT_H, 0), ...box(-RAIL_X - 6, RAIL_X + 6, RAIL_Y[0], RAIL_Y[1], 0, RAIL_Z + 34)]);
export const P = fitted.P;
export const HEIGHT = fitted.height;

/* The run. */

function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const shuffle = <T>(list: T[], next: () => number) => {
  const out = [...list];
  for (let index = out.length - 1; index > 0; index--) {
    const other = Math.floor(next() * (index + 1));
    [out[index], out[other]] = [out[other]!, out[index]!];
  }
  return out;
};
const clamp = (value: number) => Math.min(1, Math.max(0, value));
const glide = (value: number) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

export interface Pose {
  x: number;
  y: number;
  z: number;
  angle: number;
}

/* A head move: along a curve through `via` at height, or straight up or
   down. */
interface Move {
  t0: number;
  t1: number;
  from: Point3;
  to: Point3;
  via?: Plane;
}

interface Run {
  length: number;
  moves: Move[];
  /* Each part: where it lies loose, when it leaves the feeder, when it
     is gripped and set down, when the square is lifted and dropped. */
  loose: Pose[];
  feed: number[];
  grip: number[];
  set: number[];
  turn: [number, number][];
  lift: number;
  drop: number;
  /* When the misfit first rests on the fixture, and when it is let go
     over the scrap slot. */
  trial: number;
  scrap: number;
}

const DOWN = 0.3;
const FALL = 0.32;
const SLIDE = 1.1;
const FEED_GAP = 1.2;
export const FED = 0.3 + 3 * FEED_GAP + FALL + SLIDE;
const DWELL = 0.12;
const TRY = 0.3;
const PRESS = 0.12;

/* A part on its way out of the box, `since` seconds after the feeder
   lets it go: dropping out of the box's underside, sliding out from
   under it on a curve, then lying loose. */
function fedAt(index: number, loose: Pose, since: number): Pose {
  const landing = LANDINGS[index]!;
  if (since < FALL) {
    const s = clamp(since / FALL);
    return { x: LAND[0], y: LAND[1], z: BOX_Z + 2 - (BOX_Z + 2 - STAGING_H) * s * s, angle: landing };
  }
  const s = glide((since - FALL) / SLIDE);
  const bend: Plane = [loose.x, loose.y + 30];
  const turn = ((((loose.angle - landing) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
  const u = 1 - s;
  return {
    x: u * u * LAND[0] + 2 * u * s * bend[0] + s * s * loose.x,
    y: u * u * LAND[1] + 2 * u * s * bend[1] + s * s * loose.y,
    z: STAGING_H,
    angle: landing + turn * s,
  };
}

/* Whether a part fed at `start` comes out and lies down clear of the
   parts in `others`, each lying or still on its own way out. */
const clearOut = (index: number, loose: Pose, start: number, others: { index: number; loose: Pose; feed: number }[]) => {
  for (let since = 0; since <= FALL + SLIDE; since += 0.04) {
    const pose = fedAt(index, loose, since);
    const outline = outlineOf(index, pose);
    for (const other of others) {
      const at = start + since - other.feed;
      if (at < 0) continue;
      const them = fedAt(other.index, other.loose, at);
      if (Math.abs(them.z - pose.z) < PART_H && touching(outline, outlineOf(other.index, them), 1.5)) return false;
    }
  }
  return true;
};
const onPlate = (outline: Plane[]) => outline.every(([x, y]) => x > STAGING.x + 3 && x < STAGING.x + STAGING.w - 3 && y > STAGING.y + 3 && y < BOX.y - 3);

function plan(pass: number): Run {
  const next = random(pass * 9973 + 11);
  /* Four spots on the staging plate, each part at any angle; tried
     again until every part lies on the plate, no two could touch, and
     none touches another on its way out. One at a time out of the box,
     the far spots first. */
  const spots: Plane[] = [
    [-28, 64],
    [28, 64],
    [-28, 116],
    [28, 116],
  ];
  let loose: Pose[] = [];
  let order: number[] = [];
  let feed: number[] = [];
  for (let attempt = 0; attempt < 2000; attempt++) {
    order = shuffle([0, 1, 2, 3], next);
    loose = order.map((spot) => ({ x: spots[spot]![0] + (next() - 0.5) * 6, y: spots[spot]![1] + (next() - 0.5) * 6, z: STAGING_H, angle: next() * Math.PI * 2 }));
    const outlines = loose.map((pose, index) => outlineOf(index, pose));
    const apart = outlines.every((a, i) => outlines.every((b, j) => j <= i || !touching(a, b, 3)));
    if (!outlines.every(onPlate) || !apart) continue;
    feed = [];
    [...loose.keys()].sort((a, b) => loose[a]!.y - loose[b]!.y).forEach((part, index) => (feed[part] = 0.3 + index * FEED_GAP));
    const out = loose.map((pose, index) => ({ index, loose: pose, feed: feed[index]! }));
    if (out.every((part) => clearOut(part.index, part.loose, part.feed, out.filter((other) => other.feed < part.feed)))) break;
  }
  const moves: Move[] = [];
  let t = FED + 0.2;
  let at: Point3 = PARK;
  const wander = (): Plane => [(next() - 0.5) * 60, 0];
  /* A carry wanders; a hop between two places it is testing goes
     straight. */
  const travel = (to: Plane, seconds: number, straight = false) => {
    const [vx] = wander();
    const middle: Plane = [(at[0] + to[0]) / 2, (at[1] + to[1]) / 2];
    const via: Plane = straight ? middle : [vx, middle[1] + (next() - 0.5) * 30];
    const end: Point3 = [to[0], to[1], HIGH];
    moves.push({ t0: t, t1: t + seconds, from: at, to: end, via });
    t += seconds;
    at = end;
  };
  const plunge = (z: number) => {
    const end: Point3 = [at[0], at[1], z];
    moves.push({ t0: t, t1: t + DOWN, from: at, to: end });
    t += DOWN + DWELL;
    at = end;
    return t - DWELL / 2;
  };
  const rise = () => {
    const end: Point3 = [at[0], at[1], HIGH];
    moves.push({ t0: t, t1: t + DOWN, from: at, to: end });
    t += DOWN;
    at = end;
  };
  const grip: number[] = [];
  const set: number[] = [];
  const turn: [number, number][] = [];
  let scrap = Infinity;
  let trial = Infinity;
  /* The misfit comes out of the box into the first spot near it that
     the gantry clears, at any angle that keeps it, all the way out, off
     the parts still lying there; when none does, it waits for the next
     spot. */
  feed[MISFIT] = Infinity;
  const release = (cleared: number) => {
    const [sx, sy] = spots[order[cleared]!]!;
    const lying = [0, 1, 2, 3].filter((part) => grip[part] === undefined).map((part) => ({ index: part, loose: loose[part]!, feed: feed[part]! }));
    for (let attempt = 0; attempt < 300; attempt++) {
      const tried = { x: sx + (next() - 0.5) * 6, y: sy + (next() - 0.5) * 6, z: STAGING_H, angle: next() * Math.PI * 2 };
      if (onPlate(outlineOf(MISFIT, tried)) && lying.every((other) => !touching(outlineOf(MISFIT, tried), outlineOf(other.index, other.loose), 3)) && clearOut(MISFIT, tried, t + 0.2, lying)) {
        loose[MISFIT] = tried;
        feed[MISFIT] = t + 0.2;
        return;
      }
    }
  };
  /* Tried in two places, it rests on the top of a part already seated
     under it, and pressed again it goes no lower. */
  const stopped = () => WINDOWS.filter(({ under }) => under.some((part) => set[part]! < t));
  const press = () => {
    const down = at;
    const up: Point3 = [down[0], down[1], down[2] + 3];
    moves.push({ t0: t, t1: t + PRESS, from: down, to: up }, { t0: t + PRESS, t1: t + 2 * PRESS, from: up, to: down });
    t += 2 * PRESS;
  };
  const reject = () => {
    travel([loose[MISFIT]!.x, loose[MISFIT]!.y], 0.8 + next() * 0.3);
    grip[MISFIT] = plunge(STAGING_H + PART_H);
    rise();
    const begin = t;
    shuffle(stopped(), next).slice(0, 2).forEach(({ at: spot }, index) => {
      travel(spot, index === 0 ? 0.8 + next() * 0.3 : 0.6, index > 0);
      if (index === 0) turn[MISFIT] = [begin, t];
      plunge(FIXTURE_H - POCKET + PART_H + PART_H);
      if (index === 0) trial = t;
      press();
      t += TRY;
      rise();
    });
    travel([SCRAP.x + SCRAP.w / 2, SCRAP.y + SCRAP.d / 2], 0.8, true);
    scrap = plunge(4 + PART_H);
    rise();
  };
  set[MISFIT] = Infinity;
  for (const part of shuffle([0, 1, 2, 3], next)) {
    if (feed[MISFIT]! + FALL + SLIDE < t && grip[MISFIT] === undefined && stopped().length >= 2 && next() < 0.6) reject();
    travel([loose[part]!.x, loose[part]!.y], 0.8 + next() * 0.3);
    grip[part] = plunge(STAGING_H + PART_H);
    rise();
    if (feed[MISFIT] === Infinity && order[part]! >= 2) release(part);
    if (feed[MISFIT] === Infinity && order[part]! < 2 && [0, 1, 2, 3].every((other) => order[other]! < 2 || grip[other] !== undefined)) release(part);
    const begin = t;
    travel(CENTRES[part]!, 0.85 + next() * 0.3);
    turn[part] = [begin, t];
    set[part] = plunge(FIXTURE_H - POCKET + PART_H);
    rise();
  }
  if (grip[MISFIT] === undefined) {
    /* With the plate clear, it comes out to the last spot emptied. */
    if (feed[MISFIT] === Infinity) release(set.indexOf(Math.max(...set.slice(0, MISFIT))));
    t = Math.max(t, feed[MISFIT]! + FALL + SLIDE);
    reject();
  }
  t += 0.7;
  travel(ASSEMBLY, 0.7);
  const lift = plunge(FIXTURE_H - POCKET + PART_H);
  rise();
  travel([BIN.x + BIN.w / 2, BIN.y + BIN.d / 2], 0.8);
  const drop = plunge(2 + PART_H);
  rise();
  travel([PARK[0], PARK[1]], 0.8);
  return { length: t + 0.4, moves, loose, feed, grip, set, turn, lift, drop, trial, scrap };
}

const runs = new Map<number, Run>();
const runOf = (pass: number) => {
  let run = runs.get(pass);
  if (!run) {
    run = plan(pass);
    runs.set(pass, run);
    if (runs.size > 6) runs.delete(runs.keys().next().value!);
  }
  return run;
};

/* Every pass runs the same length, the longest a plan can take. */
export const PASS = 33;

function headIn(run: Run, t: number): Point3 {
  for (const move of run.moves) {
    if (t > move.t1) continue;
    if (t < move.t0) return move.from;
    const s = glide((t - move.t0) / (move.t1 - move.t0));
    if (!move.via) return [0, 1, 2].map((axis) => move.from[axis]! + (move.to[axis]! - move.from[axis]!) * s) as Point3;
    const [vx, vy] = move.via;
    const u = 1 - s;
    return [u * u * move.from[0] + 2 * u * s * vx + s * s * move.to[0], u * u * move.from[1] + 2 * u * s * vy + s * s * move.to[1], HIGH];
  }
  return PARK;
}

/* A part counts as carried, drawn over the parts at rest, only once it
   is clear above them. */
const ABOVE = FIXTURE_H - POCKET + PART_H;

/* The box gives a small shiver while it lets parts out, never the
   same twice: the first four together, the misfit on its own. */
const LATE = FALL + 0.6;
export const shiverAt = (time: number): Plane => {
  const pass = Math.floor(time / PASS);
  const t = time - pass * PASS;
  const late = t - runOf(pass).feed[MISFIT]! + 0.2;
  const live = t < FED ? Math.sin((Math.PI * t) / FED) : late > 0 && late < LATE ? Math.sin((Math.PI * late) / LATE) : 0;
  return [0.5 * live * Math.sin(time * 41 + pass), 0.5 * live * Math.sin(time * 53 + 2 * pass)];
};

export interface Scene {
  head: Point3;
  parts: (Pose & { carried: boolean; scrap?: boolean })[];
}

export function sceneAt(time: number): Scene {
  const pass = Math.floor(time / PASS);
  const run = runOf(pass);
  const t = time - pass * PASS;
  const head = headIn(run, t);
  const parts = SHAPES.map((_, index) => {
    const loose = run.loose[index]!;
    /* The misfit has no nest: it never reaches the branches that use one. */
    const [nx, ny] = CENTRES[index] ?? ASSEMBLY;
    const nest = { x: nx, y: ny, z: FIXTURE_H - POCKET, angle: 0 };
    if (t < run.grip[index]!) {
      return { ...fedAt(index, loose, t - run.feed[index]!), carried: false };
    }
    if (index === MISFIT && t >= run.scrap) {
      /* Let go over the slot, it falls through the bench. */
      const fall = t - run.scrap;
      return { x: SCRAP.x + SCRAP.w / 2, y: SCRAP.y + SCRAP.d / 2, z: 4 - 160 * fall * fall, angle: 0, carried: false, scrap: true };
    }
    if (t < run.set[index]!) {
      const [b, e] = run.turn[index]!;
      const s = glide((t - b) / (e - b));
      /* Turn the short way round to the nest's angle. */
      const from = loose.angle % (Math.PI * 2);
      const delta = ((((0 - from) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      return { x: head[0], y: head[1], z: head[2] - PART_H, angle: from + delta * s, carried: head[2] - PART_H > ABOVE };
    }
    if (t < run.lift) return { ...nest, carried: false };
    const [ax, ay] = ASSEMBLY;
    const offset = [nx - ax, ny - ay];
    if (t < run.drop) return { x: head[0] + offset[0]!, y: head[1] + offset[1]!, z: head[2] - PART_H, angle: 0, carried: true };
    /* Let go, the square falls away down the chute. */
    const fall = Math.max(0, t - run.drop);
    return { x: BIN.x + BIN.w / 2 + offset[0]!, y: BIN.y + BIN.d / 2 + offset[1]!, z: 2 - 160 * fall * fall, angle: 0, carried: false };
  });
  return { head, parts };
}

/* A part's outline where it lies. */
export const outlineOf = (index: number, pose: Pose): Plane[] => {
  const c = Math.cos(pose.angle);
  const s = Math.sin(pose.angle);
  return SHAPES[index]!.map(([x, y]) => [pose.x + x * c - y * s, pose.y + x * s + y * c]);
};

/* The moment the server draws, and reduced motion keeps: the misfit
   at its first try, resting proud on the fixture beside the parts
   already seated. */
export const REST = runOf(0).trial;
