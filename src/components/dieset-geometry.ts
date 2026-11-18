/* The die set drawn back to front (`dieset-model.ts` says what it is).
   Each level is drawn once and moved as a group; what passes from one
   level through another, the pillars and the punches, is drawn per frame
   in pieces between the plates, so each piece takes its place in the
   order (`DieSet.astro`). */

import * as k from "./iso/iso-kit";
import type { Plane, Point3 } from "./iso/iso-kit";
import {
  BLANK,
  BLANK_H,
  BUTTON_R,
  BUTTON_TOP,
  CLEAR,
  DIE,
  DIE_TOP,
  FOOT_H,
  GUIDE,
  GUIDE_H,
  GUIDE_Z,
  HEIGHT,
  HOLDER,
  HOLDER_H,
  HOLDER_Z,
  JOINS,
  LABEL,
  P,
  PILLARS,
  PILLAR_R,
  PILLAR_TOP,
  PUNCH_L,
  RAM_TOP,
  SHOE,
  SHOE_H,
  STATIONS,
  WIDTH,
  ccw,
  outlineOf,
  type Level,
  type Press,
} from "./dieset-model";

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
const screws = (points: Point3[], r = 2.2) => L(points.map(([x, y, z]) => k.ring(x, y, r, z, P, 14)).join(""), { tone: "lo" }) + D(points, 0.42);
const hole = (ring: Plane[], z: number) => k.pathOf(ring.map(([x, y]) => at([x, y, z])), true);
export const lift = (dz: number) => k.translateAlong(P, [0, 0, dz]);

/* Where each level stands, from how far each is lifted and how far the
   ram is down: a level lifted carries everything above it. */
export interface Lifts {
  language: number;
  stack: number;
  ontology: number;
  factory: number;
}
export function standing(lifts: Lifts, down: number) {
  const language = lifts.language;
  const stack = language + lifts.stack;
  const ontology = stack + lifts.ontology;
  const factory = ontology + lifts.factory - down;
  return { language, stack, ontology, factory };
}

/* The die shoe and what is fixed to it: the language. */
function shoe() {
  const out = [halo(SHOE, -FOOT_H, SHOE_H)];
  for (const [x, y] of [...k.corners(SHOE, 22)].sort((a, b) => depth(a) - depth(b))) {
    out.push(S(k.cylinder(x, y, 11, -FOOT_H, 2, P, 28), { tone: "lo" }), S(k.cylinder(x, y, 8.4, -FOOT_H + 2, FOOT_H - 2, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(SHOE, 0, SHOE_H, P, 8, 1.4), { tone: "mid", inner: L(k.sideSeam(SHOE, 7, P, 8), { tone: "faint" }) }));
  /* The clamp slots at either end, where it is bolted to the press bed. */
  for (const y of [SHOE.y + 9, SHOE.y + SHOE.d - 23]) out.push(L(k.planOutline({ x: -9, y, w: 18, d: 14, r: 7 }, SHOE_H, P, 6), { tone: "lo" }));
  /* A ruler along the near edge, and a label plate. */
  const strip = { x: SHOE.x + SHOE.w - 12, y: SHOE.y + 36, w: 6, d: SHOE.d - 72, r: 1 };
  out.push(S(k.slabOf(strip, SHOE_H, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.y + 4, strip.y + strip.d - 4, 4, 5, strip.x, SHOE_H + 0.6, [1.8, 3.4], P, "y");
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(screws(k.corners(SHOE, 8).map(([x, y]) => [x, y, SHOE_H] as Point3), 2.2));
  /* The pillars are pressed into the shoe: a collar round each foot. */
  for (const [x, y] of [...PILLARS].sort((a, b) => depth(a) - depth(b))) {
    out.push(S(k.cylinder(x, y, PILLAR_R + 5, SHOE_H, 6, P, 32, 0.5), { tone: "mid" }));
  }
  return out.join("");
}

/* The die plate and its buttons: Hypha Stack. Each button a hardened
   insert, its bore the shape of its kind. */
function die() {
  const out = [halo(DIE, SHOE_H, 0.1)];
  out.push(S(k.slabOf(DIE, SHOE_H, DIE_TOP - SHOE_H, P, 4, 0.8), { tone: "mid", inner: L(k.sideSeam(DIE, SHOE_H + 6, P, 4), { tone: "faint" }) }));
  for (const station of [...STATIONS].sort((a, b) => depth(a.at) - depth(b.at))) {
    const [x, y] = station.at;
    out.push(L(k.ring(x, y, BUTTON_R + 1.2, DIE_TOP, P, 40), { tone: "faint" }));
    out.push(S(k.cylinder(x, y, BUTTON_R, DIE_TOP, BUTTON_TOP - DIE_TOP, P, 48, 0.6), { tone: "hi", crease: "lo" }));
    const bore = hole(ccw(outlineOf(station.kind, station.at, CLEAR)), BUTTON_TOP);
    out.push(`<path class="ds-void" d="${bore}"/>`, L(bore, { tone: "lo" }));
  }
  out.push(screws([[DIE.x + 7, DIE.y + 8, DIE_TOP], [DIE.x + DIE.w - 7, DIE.y + 8, DIE_TOP], [DIE.x + 7, DIE.y + DIE.d - 8, DIE_TOP], [DIE.x + DIE.w - 7, DIE.y + DIE.d - 8, DIE_TOP]], 1.8));
  return out.join("");
}

/* The guide plate: the ontology. Its openings are cut through it, each
   edged in gold; its fill and top have them cut out, so what lies under
   them shows through; inside each, its far walls, shaded by how they
   face the light. Bushings carry it on the pillars. */
const OPENINGS = STATIONS.map((station) => ccw(outlineOf(station.kind, station.at, CLEAR)));
const GUIDE_TOP = GUIDE_Z + GUIDE_H;
export const OPEN_TOP = OPENINGS.map((ring) => hole(ring, GUIDE_TOP));

function farWalls(ring: Plane[], z0: number, z1: number) {
  const [lx, ly] = [-cam.sinA, cam.cosA];
  const buckets: string[][] = [[], [], [], []];
  ring.forEach((from, i) => {
    const to = ring[(i + 1) % ring.length]!;
    const [tx, ty] = [to[0] - from[0], to[1] - from[1]];
    const length = Math.hypot(tx, ty) || 1;
    const [nx, ny] = [-ty / length, tx / length];
    if (nx * VX + ny * VY <= 0) return;
    const lit = (nx * lx + ny * ly + 1) / 2;
    buckets[Math.min(3, Math.max(0, Math.floor(lit * 4)))]!.push(k.pathOf([at([...from, z1]), at([...to, z1]), at([...to, z0]), at([...from, z0])], true));
  });
  return buckets.map((list, shade) => (list.length ? `<path class="iso-shade" data-shade="${shade}" d="${list.join("")}"/>` : "")).join("");
}

function plateWithOpenings(plan: k.Plan, z: number, h: number, openings: string) {
  const paths = k.slabOf(plan, z, h, P, 5, 0.8);
  const out = [`<g class="iso-solid"><path class="iso-fill" fill-rule="evenodd" d="${paths.fill}${openings}"/>`];
  paths.shades.forEach((d, shade) => d && out.push(`<path class="iso-shade" data-shade="${shade}" d="${d}"/>`));
  out.push(`<path class="iso-top" fill-rule="evenodd" d="${paths.top}${openings}"/>`);
  if (paths.bevel) out.push(L(paths.bevel, { tone: "faint", className: "iso-bevel" }));
  out.push(L(k.sideSeam(plan, z + h / 2, P, 5), { tone: "faint" }), L(paths.crease, { tone: "faint", className: "iso-crease" }), L(paths.outline, { tone: "mid", className: "iso-edge" }), `</g>`);
  return out.join("");
}

/* A bushing where a pillar passes a plate: a flanged collar on its top. */
const bushings = (z: number) =>
  [...PILLARS]
    .sort((a, b) => depth(a) - depth(b))
    .map(([x, y]) => S(k.cylinder(x, y, PILLAR_R + 6, z, 6, P, 32, 0.5), { tone: "mid" }) + screws([[x + PILLAR_R + 3, y, z + 6]], 1))
    .join("");

function guide() {
  const out = [plateWithOpenings(GUIDE, GUIDE_Z, GUIDE_H, OPEN_TOP.join(""))];
  /* The channels that join the openings: closed slots on its top. */
  const slots = JOINS.map(([a, b]) => {
    const [pa, pb] = [STATIONS[a]!.at, STATIONS[b]!.at];
    const along = pa[0] === pb[0];
    const gap = 15;
    return along
      ? k.planOutline({ x: pa[0] - 1.8, y: Math.min(pa[1], pb[1]) + gap, w: 3.6, d: Math.abs(pb[1] - pa[1]) - gap * 2, r: 1.8 }, GUIDE_TOP, P, 3)
      : k.planOutline({ x: Math.min(pa[0], pb[0]) + gap, y: pa[1] - 1.8, w: Math.abs(pb[0] - pa[0]) - gap * 2, d: 3.6, r: 1.8 }, GUIDE_TOP, P, 3);
  });
  out.push(L(slots.join(""), { tone: "lo" }));
  OPENINGS.forEach((ring, i) => out.push(`<g clip-path="url(#ds-open-${i})">${farWalls(ring, GUIDE_Z, GUIDE_TOP)}</g>`));
  out.push(bushings(GUIDE_TOP));
  out.push(screws([[GUIDE.x + 8, 0, GUIDE_TOP], [GUIDE.x + GUIDE.w - 8, 0, GUIDE_TOP]], 1.8));
  return out.join("");
}
export const RIMS = OPEN_TOP.map((d) => L(d, { tone: "gold" })).join("");

/* The punch holder, its shank and the ram: the factory. */
function holder() {
  const out = [k.solidSvg(k.slabOf(HOLDER, HOLDER_Z, HOLDER_H, P, 5, 0.8), { tone: "mid", inner: L(k.sideSeam(HOLDER, HOLDER_Z + 7, P, 5), { tone: "faint" }) })];
  const top = HOLDER_Z + HOLDER_H;
  /* Each punch's head, held in the plate by a screw. */
  out.push(screws(STATIONS.map(({ at: [x, y] }) => [x, y, top] as Point3), 3));
  out.push(bushings(top));
  /* The shank the ram grips, and the ram's foot, cut off above. */
  out.push(S(k.cylinder(0, 0, 22, top, 8, P, 48, 0.6), { tone: "mid" }));
  out.push(screws([0, 1, 2, 3, 4, 5].map((i) => [Math.cos((i / 6) * Math.PI * 2) * 17, Math.sin((i / 6) * Math.PI * 2) * 17, top + 8] as Point3), 1.2));
  out.push(S(k.cylinder(0, 0, 13, top + 8, RAM_TOP - top - 26, P, 40), { tone: "mid", crease: "none", inner: L(k.sideArc(0, 0, 13, top + 20, P, 28), { tone: "faint" }) }));
  out.push(S(slab(-26, 26, -34, 34, RAM_TOP - 18, RAM_TOP, 2, 3, 0.6), { tone: "mid", inner: L(k.sideSeam({ x: -26, y: -34, w: 52, d: 68, r: 2 }, RAM_TOP - 9, P, 3), { tone: "faint" }) }));
  return out.join("");
}

/* A pillar between two heights, standing where the language stands. */
const pillarPiece = ([x, y]: Plane, z0: number, z1: number) => (z1 - z0 > 0.2 ? S(k.cylinder(x, y, PILLAR_R, z0, z1 - z0, P, 28), { tone: "hi", crease: "none" }) : "");
const backFirst = [...PILLARS].sort((a, b) => depth(a) - depth(b));
const BACK = backFirst.filter((p) => depth(p) < 0);
const FRONT = backFirst.filter((p) => depth(p) >= 0);

/* The pillars in three runs: from the shoe to the guide plate, from its
   bushings to the holder, from the holder's bushings to their tops. */
export function pillarsSvg(z: ReturnType<typeof standing>, run: "low" | "mid" | "top", side: "back" | "front" | "all") {
  const pillars = side === "back" ? BACK : side === "front" ? FRONT : backFirst;
  const [z0, z1] =
    run === "low"
      ? [SHOE_H + 6 + z.language, GUIDE_Z + z.ontology]
      : run === "mid"
        ? [GUIDE_TOP + 6 + z.ontology, HOLDER_Z + z.factory]
        : [HOLDER_Z + HOLDER_H + 6 + z.factory, PILLAR_TOP + z.language];
  return pillars.map((p) => pillarPiece(p, z0, z1)).join("");
}

/* The punches, each the shape of its kind, its tip PUNCH_L below the
   holder: below the guide plate, and from there up, cut to its opening
   and to what stands above the plate. */
const stationsBackFirst = STATIONS.map((station, i) => ({ ...station, i })).sort((a, b) => depth(a.at) - depth(b.at));
export function punchesLowSvg(z: ReturnType<typeof standing>) {
  const tip = HOLDER_Z - PUNCH_L + z.factory;
  const under = GUIDE_Z + z.ontology;
  if (tip >= under) return "";
  return stationsBackFirst.map((s) => S(k.extrude(outlineOf(s.kind, s.at), tip, Math.min(under, HOLDER_Z + z.factory) - tip, P, { bevel: 0.4 }), { tone: "hi", crease: "lo" })).join("");
}
export function punchesHighSvg(z: ReturnType<typeof standing>) {
  const tip = HOLDER_Z - PUNCH_L + z.factory;
  const from = Math.max(tip, GUIDE_Z + z.ontology);
  const to = HOLDER_Z + z.factory;
  if (to - from < 0.2) return "";
  return stationsBackFirst.map((s) => `<g clip-path="url(#ds-punch-${s.i})">${S(k.extrude(outlineOf(s.kind, s.at), from, to - from, P, { bevel: 0.4 }), { tone: "hi", crease: "lo", inner: L(k.ringSeam(outlineOf(s.kind, s.at), to - 10, P), { tone: "faint" }) })}</g>`).join("");
}
/* What of punch i shows from the guide plate up: its opening, and all of
   it above the plate. */
export function punchClip(i: number, z: ReturnType<typeof standing>) {
  const top = GUIDE_TOP + z.ontology;
  const to = HOLDER_Z + z.factory;
  const ring = outlineOf(STATIONS[i]!.kind, STATIONS[i]!.at);
  const opening = k.pathOf(OPENINGS[i]!.map(([x, y]) => at([x, y, top])), true);
  const above = to - top > 0.2 ? k.extrude(ring, top, to - top, P).fill : "";
  return opening + above;
}

/* The blank: plain coming in, stamped going out. */
export function blankSvg(press: Press, z: ReturnType<typeof standing>) {
  if (!press.blank || press.blank.opacity < 0.02) return "";
  const base = BUTTON_TOP + z.stack;
  const plan = { ...BLANK, y: BLANK.y + press.blank.y };
  const out = [S(k.slabOf(plan, base, BLANK_H, P, 3, 0.5), { tone: "hi", crease: "lo" })];
  if (press.blank.stamped) {
    for (const station of STATIONS) {
      const d = hole(outlineOf(station.kind, [station.at[0], station.at[1] + press.blank.y]), base + BLANK_H);
      out.push(`<path class="ds-void" d="${d}"/>`, L(d, { tone: "lo" }));
    }
  }
  return `<g opacity="${press.blank.opacity.toFixed(2)}">${out.join("")}</g>`;
}

export function dieSetSvg(lifts: Lifts, press: Press) {
  const z = standing(lifts, press.down);
  const defs = [
    ...OPEN_TOP.map((d, i) => `<clipPath id="ds-open-${i}"><path d="${d}"/></clipPath>`),
    ...STATIONS.map((_, i) => `<clipPath id="ds-punch-${i}"><path data-punch-clip="${i}" d="${punchClip(i, z)}"/></clipPath>`),
  ].join("");
  const level = (name: Level, dz: number, body: string) => `<g data-layer="${name}" data-lift="${name}" transform="${lift(dz)}">${body}</g>`;
  return k.figureSvg({
    width: WIDTH,
    height: HEIGHT,
    label: LABEL,
    body: [
      `<defs>${defs}</defs>`,
      level("language", z.language, shoe()),
      `<g data-layer="language" data-run="low-back">${pillarsSvg(z, "low", "back")}</g>`,
      level("stack", z.stack, die()),
      `<g data-blank>${blankSvg(press, z)}</g>`,
      `<g data-layer="factory" data-run="punch-low">${punchesLowSvg(z)}</g>`,
      `<g data-layer="language" data-run="low-front">${pillarsSvg(z, "low", "front")}</g>`,
      level("ontology", z.ontology, guide() + RIMS),
      `<g data-layer="language" data-run="mid-back">${pillarsSvg(z, "mid", "back")}</g>`,
      `<g data-layer="factory" data-run="punch-high">${punchesHighSvg(z)}</g>`,
      `<g data-layer="language" data-run="mid-front">${pillarsSvg(z, "mid", "front")}</g>`,
      `<g data-layer="factory" data-lift="factory" transform="${lift(z.factory)}">${holder()}</g>`,
      `<g data-layer="language" data-run="top">${pillarsSvg(z, "top", "all")}</g>`,
    ],
  });
}
