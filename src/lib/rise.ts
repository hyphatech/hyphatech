/* A figure's number rises once from its base line, the first time it
   comes into view: each character a step after the one before it, left
   to right. A screen reader hears the number alone. Without scripts,
   with reduced motion, or already in view on arrival, it is simply there. */

import { onceVisible, reducedMotion } from "./motion";

const RISE = { duration: 420, easing: "cubic-bezier(0.25, 1, 0.5, 1)" };
const STEP = 35;

export function riseNumbers(selector = "[data-rise]") {
  if (reducedMotion.matches) return;
  for (const figure of document.querySelectorAll<HTMLElement>(selector)) {
    if (figure.getBoundingClientRect().top < innerHeight * 0.85) continue;
    const text = figure.textContent?.trim() ?? "";
    if (!text) continue;
    const spoken = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = text;
    const shown = document.createElement("span");
    shown.className = "k-rise";
    shown.setAttribute("aria-hidden", "true");
    const chars = Array.from(text, (ch) => {
      const span = document.createElement("span");
      span.textContent = ch;
      span.style.transform = "translateY(100%)";
      return span;
    });
    shown.append(...chars);
    figure.replaceChildren(spoken, shown);
    onceVisible(
      figure,
      () =>
        chars.forEach((span, i) => {
          span.style.transform = "";
          span.animate([{ transform: "translateY(100%)" }, { transform: "none" }], {
            ...RISE,
            delay: i * STEP,
            fill: "backwards",
          });
        }),
      { rootMargin: "0px 0px -15% 0px" },
    );
  }
}
