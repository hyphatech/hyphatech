/* Lit night, the recipe every isometric figure takes: one light from
   the top right of the drawing, and each side face of a solid shaded by
   its exact turn to it, from 0 (turned away) to 100 (turned to it), so a
   rounded corner or a curved wall turns smoothly instead of in steps.
   The colours are the figure's CSS: a face mixes its dark and its lit by
   `--t`. */

import * as k from "./iso-kit";
import type { Plane, Projection } from "./iso-kit";

/* The light's direction in plan, from the projection's azimuth: the
   same the kit lights its shades by. */
export function lightOf(P: Projection): Plane {
  const a = ((P.azimuth ?? k.AZIMUTH) * Math.PI) / 180;
  return [-Math.sin(a), Math.cos(a)];
}

export const toneOf = (nx: number, ny: number, [lx, ly]: Plane) => Math.round(((nx * lx + ny * ly + 1) / 2) * 100);

/* The side faces of a prism standing on `ring` from z0 to z1 that turn
   to the viewer, each with its tone. */
export function litSides(ring: Plane[], z0: number, z1: number, P: Projection) {
  const n = ring.length;
  const ccw = ring.reduce((s, [x, y], i) => { const [x2, y2] = ring[(i + 1) % n]!; return s + x * y2 - x2 * y; }, 0) > 0;
  const view = k.towardViewer(P);
  const light = lightOf(P);
  const at = (x: number, y: number, z: number) => k.iso([x, y, z], P);
  const out: { d: string; t: number }[] = [];
  for (let i = 0; i < n; i++) {
    const [x0, y0] = ring[i]!, [x1, y1] = ring[(i + 1) % n]!;
    const L = Math.hypot(x1 - x0, y1 - y0) || 1;
    const [nx, ny] = ccw ? [(y1 - y0) / L, -(x1 - x0) / L] : [-(y1 - y0) / L, (x1 - x0) / L];
    if (nx * view[0] + ny * view[1] <= 1e-9) continue;
    out.push({ d: k.pathOf([at(x0, y0, z1), at(x1, y1, z1), at(x1, y1, z0), at(x0, y0, z0)], true), t: toneOf(nx, ny, light) });
  }
  return out;
}
