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
   until `play` is called. */
export function whileVisible(element: Element, step: (seconds: number) => boolean | void) {
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
    play();
  });
  document.addEventListener("visibilitychange", play);
  return { play };
}

/* Calls `run` at most once a frame while the page scrolls or the window
   resizes, and once now. */
export function onScroll(run: () => void) {
  let frame = 0;
  const soon = () => {
    frame ||= requestAnimationFrame(() => {
      frame = 0;
      run();
    });
  };
  addEventListener("scroll", soon, { passive: true });
  addEventListener("resize", soon);
  run();
  return soon;
}

/* Whether an element is on screen above `share` of its height as the
   page loads: a figure seen on arrival is simply there, and one above
   or below the screen waits to be scrolled to, from either way. The
   same share, as an observer's margin, is where it starts. */
export const arrived = (element: Element, share: number) => {
  const box = element.getBoundingClientRect();
  return box.bottom > 0 && box.top < innerHeight * share;
};
export const marginAt = (share: number) => `0px 0px -${Math.round((1 - share) * 100)}% 0px`;
