/* A figure's number rises once from its base line, the first time it
   comes into view: each character a step after the one before it, left
   to right. A screen reader hears the number alone. Without scripts,
   with reduced motion, or already in view on arrival, it is simply there. */

import { arrived, marginAt, onceVisible, reducedMotion } from "./motion";

const RISE = { duration: 420, easing: "cubic-bezier(0.25, 1, 0.5, 1)" };
const STEP = 35;
const SHARE = 0.85;

export function riseNumbers() {
  if (reducedMotion.matches) return;
  for (const figure of document.querySelectorAll<HTMLElement>("[data-rise]")) {
    if (arrived(figure, SHARE)) continue;
    const text = figure.textContent?.trim() ?? "";
    if (!text) continue;
    const spoken = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = text;
    const shown = document.createElement("span");
    shown.className = "k-rise";
    shown.setAttribute("aria-hidden", "true");
    const spans = Array.from(text, (ch) => {
      const span = document.createElement("span");
      span.textContent = ch;
      return span;
    });
    shown.append(...spans);
    figure.replaceChildren(spoken, shown);
    const rises = spans.map((span, i) => {
      const rise = span.animate([{ transform: "translateY(100%)" }, { transform: "none" }], {
        ...RISE,
        delay: i * STEP,
        fill: "backwards",
      });
      rise.pause();
      return rise;
    });
    onceVisible(
      figure,
      () => rises.forEach((rise) => rise.play()),
      { rootMargin: marginAt(SHARE) },
    );
  }
}
