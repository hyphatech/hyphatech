/* The decision cards' drawings (`DecisionCards.astro`), as isometric
   diagrams laid out on the base's grid like parts on a board: every tile
   seated in whole cells, centred on a crossing of the grid's lines, and
   every link run along those lines from the middle of a tile's side, so
   nothing floats and nothing cuts across. Each tile's icon is painted on
   its top square to the viewer, so it reads, with no label or pill; the
   tile a decision lands on in gold. Only
   the projection is the iso kit's; the look is this diagram's own. */

import * as k from "./iso/iso-kit";
import type { Point3 } from "./iso/iso-kit";
import type { AstroComponent } from "@lucide/astro";

export const WIDTH = 320;
export const HEIGHT = 214;
const B = 64; /* half the base's side */
const reach: Point3[] = [
  [-B, -B, -4], [B, -B, -4], [-B, B, -4], [B, B, -4],
  [-B, -B, 18], [B, -B, 18], [-B, B, 18], [B, B, 18],
];
export const P = k.fitProjection(reach, WIDTH, HEIGHT, { pad: 6, azimuth: 45, elevation: 30 });

export type IconName = "server" | "monitor" | "terminal" | "plug" | "check" | "x" | "zap" | "resume" | "code" | "globe" | "key" | "ban" | "factory" | "sparkles" | "questions" | "hammer" | "eye" | "commit" | "tag" | "repo" | "gates" | "issue" | "mail" | "ticket" | "github" | "slack";
/* A tile at a crossing of the grid ([x, y], multiples of 16), filling
   the two cells by two around it less a hair. */
export interface Tile { at: Point3; size?: number; icon: IconName | AstroComponent; gold?: boolean }
export interface Link { from: Point3; to: Point3; gold?: boolean; solid?: boolean; via?: Point3[] }
/* A boundary: a thin square plate on the base, under what it holds. */
export interface Bound { x: number; y: number; w: number; d: number }
export interface Scene { tiles: Tile[]; links: Link[]; bound?: Bound }

const at = (p: Point3) => k.iso(p, P);
const depth = ([x, y, z]: Point3) => k.depthOf([x, y, z], P);
const path = (points: Point3[]) => k.pathOf(points.map(at));

/* A thin tile: its top, its two visible sides and its outline. */
export const SIZE = 28;
export const TILE_H = 3;
export const tilePlan = ({ at: [x, y], size = SIZE }: Tile) => ({ x: x - size / 2, y: y - size / 2, w: size, d: size, r: 2.5 });
export const tileOf = (tile: Tile) => k.slabOf(tilePlan(tile), tile.at[2] - TILE_H, TILE_H, P, 4, 0);
/* The icon painted on a tile's top, square to the viewer: its across
   along the top's screen-level diagonal, its down along the other. */
export const iconMatrix = ({ at: [x, y, z], size = SIZE }: Tile) => {
  const s = (size * 0.62) / 24 / Math.SQRT2;
  const [ox, oy] = at([x, y, z]);
  const [ax, ay] = at([x + s, y - s, z]);
  const [bx, by] = at([x + s, y + s, z]);
  return `matrix(${ax - ox} ${ay - oy} ${bx - ox} ${by - oy} ${ox} ${oy}) translate(-12 -12)`;
};
export const baseOf = () => k.slabOf({ x: -B, y: -B, w: B * 2, d: B * 2, r: 4 }, -4, 4, P, 4, 0);
/* The base's grid: faint lines across its top, every 16. */
export const gridOf = () => {
  const lines: string[] = [];
  for (let v = -B + 16; v < B; v += 16) lines.push(path([[v, -B + 2, 0], [v, B - 2, 0]]), path([[-B + 2, v, 0], [B - 2, v, 0]]));
  return lines.join("");
};
export const linkOf = ({ from, to, via = [] }: Link) => path([from, ...via, to]);
export const pointOf = (p: Point3) => at(p);
export const boundOf = ({ x, y, w, d }: Bound) => k.slabOf({ x, y, w, d, r: 3 }, 0, 2, P, 4, 0);
export const byDepth = <T extends { at: Point3 }>(list: T[]) => [...list].sort((a, b) => a.at[2] - b.at[2] || depth(a.at) - depth(b.at));
