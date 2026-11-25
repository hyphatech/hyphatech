/* A concept map (`k-map`) assembles once, the first time it comes into
   view, in the order its relations read: the first card, its relation
   drawn out of it to the second, down to the fourth, back to the third,
   and the gold edge of the concept the page points at lit last, as what
   the others meet in. Without scripts, with reduced motion, or when the
   map is already in view on arrival, it is simply there. */

import { arrived, marginAt, onceVisible, reducedMotion } from "./motion";

/* The delay between one step and the next, in ms. */
const STEP = 420;
const SHARE = 0.75;
/* A fade on an even curve: the glide would have a card nearly opaque in
   its first tenth, which reads as a pop. */
const FADE = { duration: 500, easing: "cubic-bezier(0.33, 0, 0.25, 1)", fill: "backwards" as const };
const DRAW = { duration: 450, easing: "cubic-bezier(0.65, 0, 0.35, 1)", fill: "backwards" as const };

export function assembleMaps() {
  if (reducedMotion.matches) return;
  for (const map of document.querySelectorAll<HTMLElement>(".k-map")) {
    if (arrived(map, SHARE)) continue;
    /* In grid order: the cards are the first, second, third (below the
       first) and fourth; the relations run first to second, second down
       to fourth, and fourth back to third. */
    const cards = [...map.querySelectorAll<HTMLElement>(".k-concept")];
    const relations = [...map.querySelectorAll<HTMLElement>(".k-relation")];
    if (cards.length !== 4 || relations.length !== 3) continue;
    const [first, second, third, fourth] = cards as [HTMLElement, HTMLElement, HTMLElement, HTMLElement];
    const path: [HTMLElement, string][] = [
      [relations[0]!, "scaleX(0)"],
      [relations[1]!, "scaleY(0)"],
      [relations[2]!, "scaleX(0)"],
    ];
    const origins = ["left center", "center top", "right center"];
    map.setAttribute("data-veiled", "");
    onceVisible(
      map,
      () => {
        [first, second, fourth, third].forEach((card, i) => card.animate([{ opacity: 0 }, { opacity: 1 }], { ...FADE, delay: i * STEP }));
        path.forEach(([relation, from], i) => {
          const at = i * STEP + STEP * 0.55;
          relation.animate([{ transform: from, transformOrigin: origins[i] }, { transform: "none", transformOrigin: origins[i] }], { ...DRAW, delay: at, pseudoElement: "::before" });
          relation.querySelector("span")?.animate([{ opacity: 0 }, { opacity: 1 }], { ...FADE, duration: 350, delay: at + DRAW.duration * 0.5 });
        });
        /* The pointed-at concept arrives with a plain edge, then turns
           gold once every relation is drawn. */
        const lit = map.querySelector<HTMLElement>(".k-concept-hypha");
        if (lit) {
          const plain = getComputedStyle(map.querySelector(".k-concept:not(.k-concept-hypha)")!).boxShadow;
          lit.animate([{ boxShadow: plain }, { boxShadow: getComputedStyle(lit).boxShadow }], {
            duration: 700,
            delay: 4 * STEP + 200,
            easing: "cubic-bezier(0.16, 1, 0.3, 1)",
            fill: "backwards",
          });
        }
        map.removeAttribute("data-veiled");
      },
      { rootMargin: marginAt(SHARE) },
    );
  }
}
