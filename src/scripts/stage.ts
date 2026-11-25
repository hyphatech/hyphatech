/* What the moving bands share: a canvas the band's size, a mask that
   fades the drawing under the words and at the band's head and foot, a
   clock that runs only while the band is visible and its tab open, and
   one settled frame with reduced motion. */

import { reducedMotion, whileVisible } from "../lib/motion";

export interface Scene {
  /* Called on first measure and each resize: start over at this size. */
  resize(width: number, height: number): void;
  step(seconds: number): void;
  /* In CSS pixels, onto a cleared canvas. */
  draw(context: CanvasRenderingContext2D): void;
  /* With reduced motion, seconds run to the held frame. */
  rest: number;
  /* The grains it draws; the canvas is one pixel per CSS pixel. */
  sand: Sand;
}

export interface Fade {
  /* Share of the drawing shown under the words, 0 to 1. */
  underWords: number;
  /* Pixels of clear ground round each letter and control. */
  feather: number;
  /* Pixels faded out at the band's head and foot. */
  head: number;
  foot: number;
}

/* Grains in one colour, a pixel each, more opaque per grain on it. The
   canvas is one pixel per CSS pixel, so a grain keeps its size on dense
   screens. `grain` is one grain's alpha; `curve` below 1 lifts a lone
   grain. */
export class Sand {
  width = 0;
  height = 0;
  image: ImageData | undefined;
  private colour = new Uint32Array(0);
  private count = new Uint8Array(0);
  /* Colour per grain count, tabled once. */
  private shade = new Uint32Array(256);
  constructor(tone: [number, number, number], grain: number, curve = 1) {
    const [r, g, b] = tone;
    const rgb = (b << 16) | (g << 8) | r;
    for (let c = 1; c < 256; c++) {
      const alpha = Math.round(255 * Math.min(1, c * grain) ** curve);
      this.shade[c] = ((alpha << 24) | rgb) >>> 0;
    }
  }
  resize(context: CanvasRenderingContext2D, width: number, height: number) {
    this.width = width;
    this.height = height;
    this.image = context.createImageData(width, height);
    this.colour = new Uint32Array(this.image.data.buffer);
    this.count = new Uint8Array(width * height);
  }
  clear() {
    this.colour.fill(0);
    this.count.fill(0);
  }
  plot(x: number, y: number) {
    const ix = x | 0;
    const iy = y | 0;
    if (ix < 0 || iy < 0 || ix >= this.width || iy >= this.height) return;
    const k = iy * this.width + ix;
    const c = Math.min(255, this.count[k]! + 1);
    this.count[k] = c;
    this.colour[k] = this.shade[c]!;
  }
  put(context: CanvasRenderingContext2D) {
    if (this.image) context.putImageData(this.image, 0, 0);
  }
}

type Rect = { left: number; top: number; right: number; bottom: number };

/* A colour token as RGB, resolved through a canvas so any CSS colour
   form works. */
export function tone(name: string): [number, number, number] {
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  if (!probe) return [0, 0, 0];
  probe.canvas.width = probe.canvas.height = 1;
  probe.fillStyle = value;
  probe.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

export function stage(host: HTMLElement, scene: Scene, fade: Fade) {
  const canvas = host.querySelector("canvas");
  const content = host.parentElement?.querySelector<HTMLElement>("[data-content]");
  const context = canvas?.getContext("2d");
  if (!canvas || !content || !context) return;
  const reduce = reducedMotion.matches;
  /* The fade, drawn once per size and cut out of each frame. */
  const mask = document.createElement("canvas");

  let width = 0;
  let height = 0;

  /* What the sand keeps off: each character of the words, as the page
     sets it, and each control's box. */
  type Glyph = { char: string; font: string; x: number; y: number };
  type Clear = { glyphs: Glyph[]; boxes: Rect[] };
  const measure = (): Clear => {
    const origin = host.getBoundingClientRect();
    const glyphs: Glyph[] = [];
    const boxes: Rect[] = [];
    const probe = document.createElement("canvas").getContext("2d");
    const range = document.createRange();
    for (const element of content.querySelectorAll("[data-clear]")) {
      for (const control of element.querySelectorAll("a, button")) {
        const box = control.getBoundingClientRect();
        boxes.push({ left: box.left - origin.left, top: box.top - origin.top, right: box.right - origin.left, bottom: box.bottom - origin.top });
      }
      const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      for (let node = walker.nextNode(); node; node = walker.nextNode()) {
        const parent = node.parentElement;
        if (!parent || parent.closest("script, a, button")) continue;
        const face = getComputedStyle(parent);
        const font = `${face.fontStyle} ${face.fontWeight} ${face.fontSize} ${face.fontFamily}`;
        if (probe) probe.font = font;
        const ascent = probe?.measureText("H").fontBoundingBoxAscent ?? 0;
        const text = node.textContent ?? "";
        for (let i = 0; i < text.length; i++) {
          if (!text[i]!.trim()) continue;
          range.setStart(node, i);
          range.setEnd(node, i + 1);
          const box = range.getBoundingClientRect();
          if (box.width < 1) continue;
          glyphs.push({ char: text[i]!, font, x: box.left - origin.left, y: box.top - origin.top + ascent });
        }
      }
    }
    return { glyphs, boxes };
  };

  /* Mask alpha is what is removed: none in the open, most under the
     words, all at the band's very edges. Built at quarter size and
     scaled up smooth. */
  const shade = (clear: Clear) => {
    const q = 4;
    const w = Math.ceil(width / q);
    const h = Math.ceil(height / q);
    mask.width = w;
    mask.height = h;
    const m = mask.getContext("2d")!;
    const image = m.createImageData(w, h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        const py = y * q;
        const edge = Math.min(1, py / fade.head, (height - py) / fade.foot);
        const shown = edge <= 0 ? 0 : edge * edge * (3 - 2 * edge);
        image.data[(y * w + x) * 4 + 3] = Math.round(255 * (1 - shown));
      }
    m.putImageData(image, 0, 0);
    /* Over the edges, the words' own shapes, thickened and blurred by
       the feather, so the sand keeps off the letters and not a box
       round them; each control keeps off its own shape. */
    m.save();
    m.scale(1 / q, 1 / q);
    m.filter = `blur(${fade.feather / q / 2}px)`;
    m.fillStyle = m.strokeStyle = `rgba(0, 0, 0, ${1 - fade.underWords})`;
    m.lineJoin = "round";
    m.lineWidth = fade.feather;
    m.textBaseline = "alphabetic";
    for (const g of clear.glyphs) {
      m.font = g.font;
      m.fillText(g.char, g.x, g.y);
      m.strokeText(g.char, g.x, g.y);
    }
    for (const b of clear.boxes) {
      m.beginPath();
      m.roundRect(b.left - fade.feather / 2, b.top - fade.feather / 2, b.right - b.left + fade.feather, b.bottom - b.top + fade.feather, fade.feather / 2);
      m.fill();
    }
    m.restore();
  };

  const render = () => {
    context.setTransform(1, 0, 0, 1, 0, 0);
    context.globalCompositeOperation = "source-over";
    context.globalAlpha = 1;
    context.clearRect(0, 0, width, height);
    scene.draw(context);
    context.globalCompositeOperation = "destination-out";
    context.globalAlpha = 1;
    context.imageSmoothingEnabled = true;
    context.drawImage(mask, 0, 0, width, height);
    context.globalCompositeOperation = "source-over";
  };

  /* With reduced motion, the run to the held frame goes in time slices,
     yielding between them so the page never waits. The canvas keeps its
     last frame meanwhile; a newer resize abandons the run. */
  const SLICE_MS = 8;
  let generation = 0;
  const pause = () => new Promise((resolve) => setTimeout(resolve, 0));

  const settle = async () => {
    const run = ++generation;
    const w = host.clientWidth;
    const h = host.clientHeight;
    if (!w || !h) return false;
    scene.sand.resize(context, w, h);
    scene.resize(w, h);
    const seconds = reduce ? scene.rest : 0;
    let slice = performance.now();
    for (let t = 0; t < seconds; t += 1 / 30) {
      scene.step(1 / 30);
      if (performance.now() - slice > SLICE_MS) {
        await pause();
        if (run !== generation) return false;
        slice = performance.now();
      }
    }
    width = w;
    height = h;
    canvas.width = width;
    canvas.height = height;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    shade(measure());
    render();
    return true;
  };

  const start = async () => {
    const heading = content.querySelector("h1, h2");
    if (heading) {
      const face = getComputedStyle(heading);
      await document.fonts.load(`${face.fontWeight} ${face.fontSize} ${face.fontFamily}`).catch(() => []);
    }
    if (await settle()) host.classList.add("is-live");

    let settling = 0;
    let measured = `${host.clientWidth}x${host.clientHeight}`;
    new ResizeObserver(() => {
      const size = `${host.clientWidth}x${host.clientHeight}`;
      if (size === measured) return;
      measured = size;
      clearTimeout(settling);
      settling = window.setTimeout(async () => {
        if (await settle()) host.classList.add("is-live");
      }, 150);
    }).observe(host);
    if (reduce) return;

    whileVisible(host, (seconds) => {
      scene.step(seconds);
      render();
    });
  };

  void start();
}
