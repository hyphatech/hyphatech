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
  /* The screen's height less a phone's toolbars, which does not change
     as they come and go while scrolling: measured by it, the turn keeps
     its length, and the page does not jump under the reader's finger. */
  const screen = document.createElement("div");
  screen.style.cssText = "position:absolute;top:0;width:0;height:100svh;visibility:hidden;pointer-events:none";
  turn.append(screen);
  const set = (el: HTMLElement, prop: "height" | "top" | "position", value: string) => {
    if (el.style[prop] !== value) el.style[prop] = value;
  };
  let seen = "";
  const measure = () => {
    const tall = screen.offsetHeight;
    const pad = innerWidth >= 768 ? 64 : 48;
    stage.style.minHeight = "0";
    const h0 = stage.offsetHeight;
    stage.style.minHeight = "";
    fits = h0 <= tall - pad;
    set(stage, "position", held.matches && !fits ? "static" : "");
    if (!holding()) {
      set(turn, "height", "");
      set(stage, "top", "");
      set(mark, "top", "");
      return;
    }
    const h = stage.offsetHeight;
    /* At least a section's padding from the screen's top, as a section's
       heading stands (the masthead scrolls away with the page), and
       centred on the screen where it has room to be. */
    top = Math.max(pad, Math.round((tall - h) / 2));
    stretch = Math.round(Math.min(800, Math.max(500, tall * 0.9)));
    set(stage, "top", `${top}px`);
    set(turn, "height", `${h + stretch}px`);
    set(mark, "top", `${Math.round(tall / 2 - top + HYPHA * stretch)}px`);
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
  /* A phone's toolbars resize the window as they come and go: only a
     change of width or of the steady height measures again. */
  addEventListener("resize", () => {
    const now = `${innerWidth}x${screen.offsetHeight}`;
    if (now === seen) return soon();
    seen = now;
    again();
  });
  held.addEventListener("change", again);
  new ResizeObserver(again).observe(stage);
  seen = `${innerWidth}x${screen.offsetHeight}`;
  measure();
  update();
}
