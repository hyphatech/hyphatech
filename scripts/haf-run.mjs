// Writes the demo run's record as the Factory's page charts it, from
// hypha-haf's examples/task-tracker/journal.jsonl: the phases, each item as
// planned with when it started and passed and the checks it passed last,
// each refusal and why, every call's cost as the journal priced it, and the
// release. The site reads nothing from hypha-haf at build time, so
// run this again as the example's journal changes:
//
//   node scripts/haf-run.mjs ~/Projects/hypha-haf/examples/task-tracker/journal.jsonl
//
// It writes src/content/haf-run.json.

import { readFileSync, writeFileSync } from "node:fs";

const [path] = process.argv.slice(2);
if (!path) {
  console.error("usage: node scripts/haf-run.mjs <journal.jsonl>");
  process.exit(2);
}
const lines = readFileSync(path, "utf8").trim().split("\n").map((l) => JSON.parse(l));
const t0 = Date.parse(lines[0].at);
const at = (l) => Math.round((Date.parse(l.at) - t0) / 1000);

const phases = [];
const items = [];
const calls = [];
const passed = [];
const refused = [];
let released = null;
let spent = 0;
for (const l of lines) {
  const e = l.event;
  if (e.type === "phase_started") phases.push({ name: e.phase, from: at(l), to: at(l) });
  if (e.type === "phase_finished") {
    const p = phases.findLast((p) => p.name === e.phase);
    if (p) p.to = at(l);
  }
  if (e.type === "called") {
    spent += e.cost?.picodollars ?? 0;
    calls.push({ t: at(l), spent: spent / 1e12 });
  }
  if (e.type === "planned") for (const i of e.items) items.push({ id: i.id, name: i.name, from: null, to: null, checks: null, refused: [] });
  if (e.type === "item_started") {
    const i = items.find((i) => i.id === e.item);
    if (i && i.from === null) i.from = at(l);
  }
  if (e.type === "item_finished") {
    const i = items.find((i) => i.id === e.item);
    if (i) i.to = at(l);
  }
  if (e.type === "gate_passed") {
    passed.push({ t: at(l), item: e.item, checks: e.checks });
    const i = items.find((i) => i.id === e.item);
    if (i) i.checks = e.checks;
  }
  if (e.type === "gate_refused") {
    refused.push({ t: at(l), item: e.item, checks: e.checks, why: e.why });
    items.find((i) => i.id === e.item)?.refused.push({ t: at(l), checks: e.checks, why: e.why });
  }
  if (e.type === "run_finished" && e.outcome?.type === "delivered") released = { t: at(l), commit: e.outcome.commit };
}
const out = { took: at(lines.at(-1)), spent: spent / 1e12, phases, items: items.filter((i) => i.from !== null), calls, passed, refused, released };
writeFileSync("src/content/haf-run.json", JSON.stringify(out, null, 2) + "\n");
console.log(`${calls.length} calls, $${out.spent.toFixed(4)}, ${out.took}s, ${refused.length} refusals`);
