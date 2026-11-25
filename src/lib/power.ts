/* A figure that turns on: it waits switched off, in the Disposable
   panel's greys, and the first time it comes into view each part turns
   on in its order, its colours going over to its own. Without scripts,
   with reduced motion, or already in view on arrival, it is simply on. */

import { arrived, marginAt, onceVisible, reducedMotion } from "./motion";

/* The longest of a part's transitions in site.css (.k-compare[data-powering]). */
const TURN = 700;
const SHARE = 0.8;

/* Switches `figure` off now, and on once seen, `order` setting when each
   part turns. */
function power(figure: HTMLElement, order: [HTMLElement, number][], end: number) {
  if (reducedMotion.matches || arrived(figure, SHARE)) return;
  for (const [el, at] of order) el.style.setProperty("--on", `${at}ms`);
  figure.setAttribute("data-dim", "");
  onceVisible(
    figure,
    () => {
      figure.setAttribute("data-powering", "");
      requestAnimationFrame(() => {
        figure.removeAttribute("data-dim");
        setTimeout(() => figure.removeAttribute("data-powering"), end + TURN);
      });
    },
    { rootMargin: marginAt(SHARE) },
  );
}

/* A comparison's Hypha panel turns on: its frame and name first, then
   its rows one by one, then its story. */
export function powerCompare(compare: HTMLElement) {
  const [before, after] = [...compare.children] as HTMLElement[];
  if (!before || !after) return;
  const rows = [...after.querySelectorAll<HTMLElement>(".k-compare-row")];
  const STEP = 300;
  const order: [HTMLElement, number][] = [[after, 0], ...rows.map((r, i): [HTMLElement, number] => [r, 250 + i * STEP])];
  const foot = after.querySelector<HTMLElement>(".k-panel-foot");
  const end = 250 + rows.length * STEP;
  if (foot) order.push([foot, end]);
  const well = after.querySelector<HTMLElement>(".k-panel-well");
  if (well) order.push([well, end]);
  power(compare, order, end);
}
