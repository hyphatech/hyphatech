/* The landing's turn: one drawing, two steps: the principle's heading
   over the jig, then Hypha's heading with Hypha's levels arriving on the
   drawing. Wherever the screen is tall enough to hold the heading and
   the drawing, they are held still where a section's heading stands,
   for a fixed stretch of scroll whatever the screen's height, and Hypha
   arrives part way through it; on a short screen Hypha arrives as its
   heading reaches the screen. Either way as often as the reader scrolls,
   and the ground's light follows the scroll through the whole turn. With
   reduced motion everything is simply there. */

const HELD = "(prefers-reduced-motion: no-preference) and (height >= 34rem)";
/* Where in the held stretch Hypha arrives. */
const HYPHA = 0.45;

export function turnAt(turn: HTMLElement, ground?: HTMLElement | null) {
  const stage = turn.querySelector<HTMLElement>(".k-turn-stage");
  const mark = turn.querySelector<HTMLElement>('[data-mark="hypha"]');
  const hypha = turn.querySelector<HTMLElement>('[data-say="hypha"]');
  if (!stage || !mark || !hypha) return;
  const held = matchMedia(HELD);
  const still = matchMedia("(prefers-reduced-motion: reduce)");
  let top = 0;
  let stretch = 0;
  /* The held stage's place and the stretch it is held for, from the
     screen and the stage as they are. */
  /* Held only where the stage fits the screen: on a phone too short for
     it, the turn runs down the page as it stands. */
  let fits = true;
  const holding = () => held.matches && fits;
  const measure = () => {
    turn.style.height = "";
    stage.style.top = "";
    const pad = innerWidth >= 768 ? 64 : 48;
    stage.style.minHeight = "0";
    fits = stage.offsetHeight <= innerHeight - pad;
    stage.style.minHeight = "";
    stage.style.position = held.matches && !fits ? "static" : "";
    if (!holding()) {
      turn.style.height = "";
      stage.style.top = "";
      mark.style.top = "";
      return;
    }
    const h = stage.offsetHeight;
    /* At least a section's padding from the screen's top, as a section's
       heading stands (the masthead scrolls away with the page), and
       centred on the screen where it has room to be. */
    top = Math.max(pad, Math.round((innerHeight - h) / 2));
    stretch = Math.min(800, Math.max(500, innerHeight * 0.9));
    stage.style.top = `${top}px`;
    turn.style.height = `${h + stretch}px`;
    mark.style.top = `${innerHeight / 2 - top + HYPHA * stretch}px`;
  };
  let frame = 0;
  const update = () => {
    frame = 0;
    const box = turn.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.5 - box.top) / Math.max(1, box.height)));
    (ground ?? turn).style.setProperty("--p", still.matches ? "1" : p.toFixed(3));
    let step: string;
    if (still.matches) step = "hypha";
    else if (holding()) {
      const q = (top - box.top) / stretch;
      step = q >= HYPHA ? "hypha" : "bound";
    } else if (held.matches) {
      /* Not held, the heading turns in place as the stage passes the
         screen's middle. */
      const st = stage.getBoundingClientRect();
      step = st.top + st.height * 0.35 <= innerHeight * 0.45 ? "hypha" : "bound";
    } else {
      step = hypha.getBoundingClientRect().top <= innerHeight * 0.6 ? "hypha" : "bound";
    }
    if (stage.dataset.step !== step) stage.dataset.step = step;
  };
  const soon = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };
  const again = () => {
    measure();
    soon();
  };
  addEventListener("scroll", soon, { passive: true });
  addEventListener("resize", again);
  held.addEventListener("change", again);
  new ResizeObserver(again).observe(stage);
  measure();
  update();
}
