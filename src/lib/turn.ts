/* The landing's turn: one drawing, two steps: the principle's heading
   over the jig, then Hypha's heading with Hypha's levels arriving on the
   drawing. Where and how long the stage is held is the stylesheet's;
   here the stage gives it its height, and Hypha arrives as the mark the
   stylesheet places for it passes the screen's middle. On a screen too
   low to turn the heading in place, Hypha arrives as its own heading
   reaches the screen. The ground's light follows the scroll through the
   whole turn. With reduced motion everything is simply there. */

import { onScroll, reducedMotion } from "./motion";

/* As site.css turns the heading in place (.k-turn-mark). */
const TURNS = matchMedia("(height >= 34rem)");

export function turnAt(turn: HTMLElement, ground: HTMLElement) {
  const stage = turn.querySelector<HTMLElement>(".k-turn-stage");
  const mark = turn.querySelector<HTMLElement>('[data-mark="hypha"]');
  const hypha = turn.querySelector<HTMLElement>('[data-say="hypha"]');
  if (!stage || !mark || !hypha) return;
  if (reducedMotion.matches) {
    stage.dataset.step = "hypha";
    return;
  }
  /* The screen less a phone's toolbars, as the stylesheet's svh. */
  const screen = document.documentElement;
  const update = () => {
    const tall = screen.clientHeight;
    const box = turn.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (tall / 2 - box.top) / box.height));
    ground.style.setProperty("--p", p.toFixed(3));
    const arrived = TURNS.matches
      ? mark.getBoundingClientRect().top <= tall / 2
      : hypha.getBoundingClientRect().top <= tall * 0.6;
    const step = arrived ? "hypha" : "bound";
    if (stage.dataset.step !== step) stage.dataset.step = step;
  };
  const soon = onScroll(update);
  new ResizeObserver(([entry]) => {
    turn.style.setProperty("--stage-h", `${entry.borderBoxSize[0].blockSize}px`);
    soon();
  }).observe(stage);
}
