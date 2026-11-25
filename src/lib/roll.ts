/* A figure's number rolls in once, the first time it comes into view:
   each digit a reel that spins up from 0 and lands on its own, left to
   right, the marks between them still. A screen reader hears the number alone.
   Without scripts, with reduced motion, or already in view on arrival,
   it is simply there. */

import { onceVisible, reducedMotion } from "./motion";

/* How many whole turns the first reel makes, and each after it one more. */
const TURNS = 1;
const SPIN = { duration: 1300, easing: "cubic-bezier(0.22, 0.8, 0.2, 1)", fill: "backwards" as const };
const LAND = 220;

export function rollNumbers(selector = "[data-roll]") {
  if (reducedMotion.matches) return;
  for (const figure of document.querySelectorAll<HTMLElement>(selector)) {
    if (figure.getBoundingClientRect().top < innerHeight * 0.85) continue;
    const text = figure.textContent?.trim() ?? "";
    const spoken = document.createElement("span");
    spoken.className = "sr-only";
    spoken.textContent = text;
    const shown = document.createElement("span");
    shown.setAttribute("aria-hidden", "true");
    const reels: [HTMLElement, HTMLElement, number][] = [];
    for (const ch of text) {
      if (!/\d/.test(ch)) {
        shown.append(ch);
        continue;
      }
      const target = Number(ch);
      const count = 10 * (TURNS + reels.length) + target + 1;
      const reel = document.createElement("span");
      reel.className = "k-reel";
      const size = document.createElement("span");
      size.className = "k-reel-size";
      size.textContent = ch;
      const strip = document.createElement("span");
      strip.className = "k-reel-strip";
      strip.append(
        ...Array.from({ length: count }, (_, i) => {
          const digit = document.createElement("span");
          digit.textContent = String(i % 10);
          return digit;
        }),
      );
      reel.append(size, strip);
      shown.append(reel);
      reel.setAttribute("data-spin", "");
      reels.push([reel, strip, count]);
    }
    if (!reels.length) continue;
    figure.replaceChildren(spoken, shown);
    onceVisible(
      figure,
      () => {
        reels.forEach(([reel, strip, count], i) =>
          strip.animate(
            [
              { transform: "translateY(0)" },
              { transform: `translateY(${(-100 * (count - 1)) / count}%)` },
            ],
            { ...SPIN, duration: SPIN.duration + i * LAND, fill: "both" },
          ).finished.then(() => reel.removeAttribute("data-spin")),
        );
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
  }
}
