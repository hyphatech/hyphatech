/* HAF's screens as the site plays them: each a frame HAF wrote cell by
   cell (haf-screens/, and its README), and the run cut into the parts
   the page shows, the hero's demo whole and each of the six steps alone. */

export type Run = [string, string | null, string | null, boolean];
export type Frame = { cols: number; rows: number; lines: Run[][] };
const files = import.meta.glob<{ default: Frame }>("./haf-screens/*.json", { eager: true });
export const frame = (name: string) => files[`./haf-screens/${name}.json`]!.default;

/* Frames named by a prefix, in order, each shown for `d` seconds. */
const named = (prefix: string, d: number) =>
  Object.keys(files)
    .map((f) => f.match(new RegExp(`${prefix}-(\\d+)\\.json$`))?.[1])
    .filter((n): n is string => n !== undefined)
    .sort()
    .map((n) => [`${prefix}-${n}`, d] as [string, number]);

/* A run of frames shown one after another, each for `d` seconds, the
   last held for `hold`. */
const run = (prefix: string, d: number, hold: number) => {
  const all = named(prefix, d);
  return all.map(([n, x], k) => [n, k === all.length - 1 ? hold : x] as [string, number]);
};

/* The run, a part for each step: the request typed and the questions
   that settle it, the PRD read to sign, the plan counted as it is looked
   up, the application's parts written before a model is called, a stage
   proven round by round, the whole proven on its service, and the
   release tried in the Workbench, alive. Most past the questions are the
   illustrated frames scripts/haf-illustrate.mjs draws over HAF's own. */
export const runSteps = {
  intent: [
    ...run("intro", 0.55, 1.4),
    ["i-question-0", 3.5],
    ["i-thinking-0", 1.1],
    ["i-thinking-1", 1.3],
    ["i-thinking-2", 2.2],
    ["i-question-1", 3],
    ["i-question-2", 3],
    ["i-question-3", 2.5],
    ["i-own-words", 1.2],
    ["i-own-words-typed-0", 0.7],
    ["i-own-words-typed-1", 0.8],
    ["i-own-words-typed-2", 2],
    ["i-question-4", 3],
    ["i-decided", 2.5],
  ] as [string, number][],
  prd: [
    ["prd-0", 3.5],
    ["prd-1", 4],
  ] as [string, number][],
  mapping: run("plan", 0.9, 3),
  scaffold: run("scaffold", 1.1, 3),
  composition: run("compose", 1, 3),
  validation: run("validate", 1, 3),
  release: [["released", 5], ...run("bench", 0.8, 2.5)] as [string, number][],
};
