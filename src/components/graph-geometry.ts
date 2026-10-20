/* Geometry for the ontology map, shared by the server render (no
   JavaScript) and the page at any width: relation curves, name
   placement and capability grounds. */

export type Pt = { x: number; y: number };
export type Side = "right" | "left" | "below" | "above";
export type Box = { x0: number; y0: number; x1: number; y1: number };

/* The frame the hand-set places are on. */
export const FRAME = { w: 1400, h: 870 };

/* Concept ring radius, in viewBox units. */
export const RING = 7;
/* Curve bow, as a share of the relation's length. */
const BOW = 0.08;

const f = (n: number) => n.toFixed(1);

/* Quadratic curve from a to b, trimmed short of both rings. `mid` is
   where its label goes; `n` is the normal toward the bow's outer side. */
export const bow = (a: Pt, b: Pt) => {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const d = Math.hypot(dx, dy) || 1;
  const n = { x: -dy / d, y: dx / d };
  const c = { x: (a.x + b.x) / 2 + n.x * d * BOW, y: (a.y + b.y) / 2 + n.y * d * BOW };
  const trim = (p: Pt) => {
    const ex = c.x - p.x;
    const ey = c.y - p.y;
    const e = Math.hypot(ex, ey) || 1;
    return { x: p.x + (ex / e) * (RING + 5), y: p.y + (ey / e) * (RING + 5) };
  };
  const s = trim(a);
  const t = trim(b);
  const mid = { x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x, y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y };
  return { d: `M${f(s.x)} ${f(s.y)}Q${f(c.x)} ${f(c.y)} ${f(t.x)} ${f(t.y)}`, a, b, c, mid, n };
};

/* Sample points along a curve, for overlap tests. */
const along = (e: { a: Pt; b: Pt; c: Pt }) =>
  Array.from({ length: 21 }, (_, i) => {
    const t = 0.1 + (i / 20) * 0.8;
    const u = 1 - t;
    return { x: u * u * e.a.x + 2 * u * t * e.c.x + t * t * e.b.x, y: u * u * e.a.y + 2 * u * t * e.c.y + t * t * e.b.y };
  });

/* Where a name goes: its side, and for a name above or below, how far it
   slides off centre to stay inside the frame. */
export type Place = { side: Side; dx: number };

/* A name's bounding box on each side of its point, and its text offset. */
export const NAME = { gap: 13, rise: 11, fall: 5, under: 27, over: 15 };
export const box = (p: Pt, w: number, { side: s, dx }: Place): Box => {
  const { gap, rise, fall, under, over } = NAME;
  if (s === "right") return { x0: p.x + gap - 2, y0: p.y - rise, x1: p.x + gap + w + 2, y1: p.y + fall };
  if (s === "left") return { x0: p.x - gap - w - 2, y0: p.y - rise, x1: p.x - gap + 2, y1: p.y + fall };
  const x0 = p.x + dx - w / 2 - 2;
  const x1 = p.x + dx + w / 2 + 2;
  if (s === "below") return { x0, y0: p.y + under - rise - 5, x1, y1: p.y + under + fall - 5 };
  return { x0, y0: p.y - over - rise, x1, y1: p.y - over + fall };
};
export const set = ({ side: s, dx }: Place) =>
  s === "right"
    ? { x: NAME.gap, y: NAME.fall, anchor: "start" }
    : s === "left"
      ? { x: -NAME.gap, y: NAME.fall, anchor: "end" }
      : s === "below"
        ? { x: dx, y: NAME.under, anchor: "middle" }
        : { x: dx, y: -NAME.over, anchor: "middle" };

const hits = (b: Box, p: Pt, m = 0) => p.x > b.x0 - m && p.x < b.x1 + m && p.y > b.y0 - m && p.y < b.y1 + m;
const meets = (a: Box, b: Box, m = 0) => a.x0 < b.x1 + m && b.x0 < a.x1 + m && a.y0 < b.y1 + m && b.y0 < a.y1 + m;

/* Picks each name's side, avoiding curves, other points, placed names
   and the frame edge. Right is preferred; most-connected concepts pick
   first. A name above or below that would cross the frame's side slides
   inward, as long as it still spans its point: at a narrow band's edge
   that is often the only place clear of a neighbour. */
export const sides = (
  points: Map<string, Pt>,
  widths: Map<string, number>,
  relations: { from: string; to: string }[],
  frame: { w: number; h: number },
) => {
  const curves = relations.map((r) => ({ r, pts: along(bow(points.get(r.from)!, points.get(r.to)!)) }));
  const degree = (id: string) => relations.filter((r) => r.from === id || r.to === id).length;
  const order = [...points.keys()].sort((a, b) => degree(b) - degree(a));
  const bias: Record<Side, number> = { right: 0, left: 0.6, below: 1.4, above: 1.6 };
  const chosen = new Map<string, Place>();
  const taken: Box[] = [];
  for (const id of order) {
    const p = points.get(id)!;
    const w = widths.get(id)!;
    let best: Place = { side: "right", dx: 0 };
    let cost = Infinity;
    for (const side of ["right", "left", "below", "above"] as Side[]) {
      let s: Place = { side, dx: 0 };
      if (side === "below" || side === "above") {
        const centred = box(p, w, s);
        const dx = centred.x0 < 0 ? -centred.x0 : centred.x1 > frame.w ? frame.w - centred.x1 : 0;
        if (Math.abs(dx) > w / 2 - RING) continue;
        s = { side, dx };
      }
      const b = box(p, w, s);
      if (b.x0 < 0 || b.x1 > frame.w || b.y0 < 0 || b.y1 > frame.h) continue;
      let c = bias[side];
      for (const { pts } of curves) c += pts.filter((q) => hits(b, q, 3)).length * 3;
      for (const [o, q] of points) if (o !== id && hits(b, q, RING + 3)) c += 40;
      for (const t of taken) if (meets(b, t, 4)) c += 60;
      if (c < cost) [best, cost] = [s, c];
    }
    chosen.set(id, best);
    taken.push(box(p, w, best));
  }
  return chosen;
};

/* A capability's ground: the convex hull of the given boxes, corners
   rounded by up to ROUND. CSS pads it further with a wide stroke. */
const ROUND = 26;
export const hull = (boxes: Box[]) => {
  const pts = boxes
    .flatMap((b) => [
      { x: b.x0, y: b.y0 },
      { x: b.x1, y: b.y0 },
      { x: b.x1, y: b.y1 },
      { x: b.x0, y: b.y1 },
    ])
    .sort((p, q) => p.x - q.x || p.y - q.y);
  const cross = (o: Pt, a: Pt, b: Pt) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const half = (list: Pt[]) => {
    const out: Pt[] = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out.at(-2)!, out.at(-1)!, p) <= 0) out.pop();
      out.push(p);
    }
    return out.slice(0, -1);
  };
  const ring = [...half(pts), ...half([...pts].reverse())];
  /* Corner radius is capped at half the shorter adjacent side. */
  const toward = (p: Pt, q: Pt) => {
    const d = Math.hypot(q.x - p.x, q.y - p.y) || 1;
    const r = Math.min(ROUND, d / 2) / d;
    return { x: p.x + (q.x - p.x) * r, y: p.y + (q.y - p.y) * r };
  };
  return (
    ring
      .map((p, i) => {
        const a = toward(p, ring.at(i - 1)!);
        const b = toward(p, ring[(i + 1) % ring.length]!);
        return `${i ? "L" : "M"}${f(a.x)} ${f(a.y)}Q${f(p.x)} ${f(p.y)} ${f(b.x)} ${f(b.y)}`;
      })
      .join("") + "Z"
  );
};

/* A capability's ground around `boxes`, with its title's position. */
export const ground = (boxes: Box[], title: number) => {
  const x = Math.min(...boxes.map((b) => b.x0));
  const y = Math.min(...boxes.map((b) => b.y0)) - 12;
  return { x, y, d: hull([...boxes, { x0: x, y0: y - 10, x1: x + title, y1: y + 3 }]) };
};

export const ringBox = (p: Pt): Box => ({ x0: p.x - RING - 4, y0: p.y - RING - 4, x1: p.x + RING + 4, y1: p.y + RING + 4 });
