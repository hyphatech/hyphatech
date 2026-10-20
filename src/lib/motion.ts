/* What everything that moves on the site shares: whether the reader
   asked for less motion, word of an element coming on and off screen,
   and a clock that runs only while it is on screen and its tab open. */

export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");

/* Calls `seen` each time `element` comes on screen or leaves it. */
export function onVisible(element: Element, seen: (visible: boolean) => void) {
  new IntersectionObserver((entries) => seen(entries.at(-1)?.isIntersecting ?? false)).observe(element);
}

/* Calls `run` once, the first time `element` is on screen. */
export function onceVisible(element: Element, run: () => void, options?: IntersectionObserverInit) {
  const watch = new IntersectionObserver((entries) => {
    if (!entries.some((e) => e.isIntersecting)) return;
    watch.disconnect();
    run();
  }, options);
  watch.observe(element);
}

/* Calls `step` once a frame with the seconds since the last, never more
   than a thirtieth so a stalled frame is not a jump, while `element` is
   on screen and its tab open. A step that returns false rests the clock
   until `play` is called; `seen` hears each coming and going first. */
export function whileVisible(element: Element, step: (seconds: number) => boolean | void, seen?: (visible: boolean) => void) {
  let visible = false;
  let frame = 0;
  let last = 0;
  const tick = (now: number) => {
    frame = 0;
    if (!visible || document.hidden) return;
    /* A frame's time can precede the start of play: never step back. */
    const seconds = Math.min(1 / 30, Math.max(0, (now - last) / 1000));
    last = now;
    if (step(seconds) !== false) frame = requestAnimationFrame(tick);
  };
  const play = () => {
    if (frame || !visible || document.hidden) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };
  onVisible(element, (on) => {
    visible = on;
    seen?.(on);
    play();
  });
  document.addEventListener("visibilitychange", play);
  return { play };
}
