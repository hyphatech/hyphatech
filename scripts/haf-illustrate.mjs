// Draws the illustrative frames the site plays over HAF's own captures.
//
// HAF's site tool writes each screen as cells (src/content/haf-screens/,
// its README). The site shows more than a capture can: the request typed
// before the first question, the plan counted as it is looked up, the
// right pane with its meters on top and the numbers grouped under them,
// the gates as a matrix of rounds, the Workbench alive. Each frame here
// starts from a capture and redraws a region in HAF's own palette and
// layout, cell by cell, so it stays HAF's screen; every figure is an
// example.
//
//   node scripts/haf-illustrate.mjs
//
// Run it again whenever the captures are written again.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const dir = new URL("../src/content/haf-screens/", import.meta.url).pathname;

const C = {
  vao: "#151719",
  laje: "#1c1e20",
  concreto: "#26282a",
  vidro: "#313436",
  fiacao: "#414346",
  ink: "#c7cdd6",
  bold: "#dae1ea",
  dim: "#8d949f",
  faint: "#767d88",
  taxi: "#e7cb8a",
  sodio: "#e3a068",
  temporal: "#af97d3",
  sereno: "#77babf",
  ibira: "#9acaa2",
  brasa: "#d87676",
  fact: "#56b19f",
  blank: "#ffffff",
};

/* The panes as HAF lays them out at 160 by 42: the left pane to column 94,
   the right from 95, its marks at 96 and its words from 98. */
const RIGHT = 95;
const MARK = 96;
const TEXT = 98;
const END = 157;
const LAST_ROW = 40;
/* The stepper's six segments start every ten columns from its words; a
   value, a bar, a column of marks starts on one of those edges. */
const GRID = 10;
const VALUE = TEXT + GRID;

// ---------- a frame as cells ----------

const read = (name) => {
  const f = JSON.parse(readFileSync(join(dir, `${name}.json`), "utf8"));
  const g = f.lines.map((row) => row.flatMap(([t, fg, bg, b]) => [...t].map((ch) => ({ ch, fg, bg, b }))));
  return { cols: f.cols, rows: f.rows, g };
};

const write = (name, f) => {
  const lines = f.g.map((row) => {
    const runs = [];
    for (const c of row) {
      const last = runs.at(-1);
      if (last && last[1] === c.fg && last[2] === c.bg && last[3] === c.b) last[0] += c.ch;
      else runs.push([c.ch, c.fg, c.bg, c.b]);
    }
    return runs;
  });
  writeFileSync(join(dir, `${name}.json`), JSON.stringify({ cols: f.cols, rows: f.rows, lines }) + "\n");
};

const clone = (f) => ({ ...f, g: f.g.map((row) => row.map((c) => ({ ...c }))) });

/* Words at a row and column, each piece [text, colour, bold]; the ground
   kept unless one is given. */
const put = (f, row, col, pieces, bg) => {
  let c = col;
  for (const [text, fg, b = false] of pieces) {
    for (const ch of text) {
      const cell = f.g[row]?.[c];
      if (!cell) return;
      f.g[row][c] = { ch, fg: ch === " " ? C.blank : fg, bg: bg ?? cell.bg, b };
      c++;
    }
  }
  return c;
};

const clear = (f, r0, r1, c0, c1, bg) => {
  for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) f.g[r][c] = { ch: " ", fg: C.blank, bg, b: false };
};

const text = (f, row, c0, c1) => f.g[row].slice(c0, c1 + 1).map((c) => c.ch).join("");

const copyRow = (to, from, row, toRow, c0 = RIGHT, c1 = to.cols - 1) => {
  for (let c = c0; c <= c1; c++) to.g[toRow][c] = { ...from.g[row][c] };
};

// ---------- HAF's parts, drawn as its screen draws them ----------

/* htop's meter: Label[|||||       value], the value inside, right-aligned. */
const meter = (f, row, label, frac, value, fg) => {
  put(f, row, TEXT, [[label.padEnd(GRID), C.dim]]);
  const inner = END - VALUE - 1;
  const fill = Math.min(inner - value.length - 1, Math.round(inner * Math.max(0, Math.min(1, frac))));
  const bar = "|".repeat(fill).padEnd(inner - value.length).slice(0, inner - value.length);
  put(f, row, VALUE, [["[", C.bold, true], [bar.slice(0, fill), fg], [bar.slice(fill), C.ink], [value, C.bold, true], ["]", C.bold, true]]);
};

const money = (x) => `$${x.toFixed(2)}`;
const clock = (s) => `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, "0")}s`;

/* What the run has spent of its $100 ceiling. */
const CEILING = 100;
const spent = (f, row, dollars) => meter(f, row, "Spent", dollars / CEILING, `$${dollars.toFixed(2)}/$${CEILING}`, C.sodio);

const sparkChars = "▁▂▃▄▅▆▇█";
const spark = (f, row, label, vals, value, fg) => {
  put(f, row, TEXT, [[label.padEnd(GRID), C.dim]]);
  const w = END - VALUE - value.length - 1;
  const max = Math.max(...vals, 1);
  const s = vals.slice(-w).map((v) => sparkChars[Math.min(7, Math.floor((v / max) * 7.99))]).join("");
  put(f, row, VALUE, [[s.padStart(w, " "), fg], [" " + value, C.bold, true]]);
};

/* Numbers in two columns, each a label and its value. */
const facts = (f, row, pairs) => {
  pairs.forEach(([label, value, fg = C.ink], i) => {
    const r = row + Math.floor(i / 2);
    const c = i % 2 === 0 ? TEXT : TEXT + 3 * GRID;
    put(f, r, c, [[label.padEnd(GRID), C.faint], [value.slice(0, i % 2 === 0 ? 19 : 20), fg]]);
  });
  return row + Math.ceil(pairs.length / 2);
};

/* A model in the Models table: its name, the step it works for on the
   grid's third edge, what it has cost at the pane's right. */
const model = (f, row, name, step, cost) => {
  put(f, row, TEXT, [[name, C.ink]]);
  put(f, row, TEXT + 2 * GRID, [[step, C.dim]]);
  put(f, row, END - cost.length + 1, [[cost, C.ink]]);
};

const heading = (f, row, title, count) => put(f, row, TEXT, [[title, C.bold, true], ...(count === undefined ? [] : [[` (${count})`, C.faint]])]);

const markOf = { ok: ["✓", C.ibira], no: ["✗", C.brasa], now: ["⏺", C.sodio], wait: ["·", C.faint], ask: ["?", C.temporal] };

/* The gates as a table: a gate a row, however many there are, and a
   column for each round, or each stage once released, named on the
   heading's own line, R1 a round and S1 a stage; the one at work in
   bold. */
const gates = (f, row, names, cols) => {
  heading(f, row, "Gates", names.length);
  const first = VALUE;
  cols.forEach((c, k) => put(f, row, first + k * 4, [[c.label, c.at ? C.bold : C.faint, Boolean(c.at)]]));
  names.forEach((name, i) => {
    put(f, row + 1 + i, TEXT, [[name, C.ink]]);
    cols.forEach((c, k) => {
      const [ch, fg] = markOf[c.marks[i] ?? "wait"];
      put(f, row + 1 + i, first + k * 4, [[ch, fg]]);
    });
  });
  return row + 1 + names.length;
};

const list = (f, row, title, rows) => {
  heading(f, row, title, rows.length);
  rows.forEach(([mark, words, note = "", noteFg = C.dim], i) => {
    const [m, fg] = markOf[mark];
    put(f, row + 1 + i, MARK, [[m + " ", fg], [words.slice(0, 39).padEnd(40), mark === "wait" ? C.faint : C.ink], [note.slice(0, 19), noteFg]]);
  });
  return row + 1 + rows.length;
};

/* Tokens a second over the last minutes, one value a sample, moving on a
   sample each frame. */
const tps = (seed, n = 46) => Array.from({ length: n }, (_, i) => {
  const x = i + seed;
  return Math.max(3, Math.round(42 + 20 * Math.sin(x * 0.7) + 12 * Math.sin(x * 1.9 + 1) + ((x * 37) % 11)));
});

/* The right pane cleared below the step's name and its segments, which
   stay as HAF drew them, and moved to the top of the pane. */
const freshRight = (f, from, stepRow) => {
  const head = text(from, stepRow, MARK, END);
  clear(f, 1, LAST_ROW, RIGHT, f.cols - 1, C.laje);
  copyRow(f, from, stepRow, 2);
  copyRow(f, from, stepRow + 1, 3);
  return head;
};

/* The right pane's rows from `from` moved up by `by`, the rows they
   leave at its foot cleared. */
const shiftUp = (f, from, by) => {
  for (let r = from; r <= LAST_ROW; r++) {
    const to = r - by;
    for (let c = RIGHT; c < f.cols; c++) f.g[to][c] = r <= LAST_ROW ? { ...f.g[r][c] } : f.g[to][c];
  }
  clear(f, LAST_ROW - by + 1, LAST_ROW, RIGHT, f.cols - 1, C.laje);
};

/* The Recap HAF draws over the stepper dropped, so the stepper is the
   pane's first line: it already says where the run is and what is next. */
const noRecap = (f) => {
  const recap = findRow(f, "Recap", TEXT, TEXT + 6);
  if (recap < 0) return;
  let stepper = recap + 1;
  while (stepper <= LAST_ROW && !"?⏺✓■".includes(f.g[stepper][MARK].ch)) stepper++;
  if (stepper > LAST_ROW) return;
  /* The stepper and its segments first, then a row, then the meters, as
     every pane the site draws lays them out. */
  shiftUp(f, stepper, stepper - 2);
  shiftDown(f, 4, 1);
};

/* The right pane's rows from `from` moved down by `by`, what falls off its
   foot dropped. */
const shiftDown = (f, from, by) => {
  for (let r = LAST_ROW; r >= from + by; r--) for (let c = RIGHT; c < f.cols; c++) f.g[r][c] = { ...f.g[r - by][c] };
  clear(f, from, from + by - 1, RIGHT, f.cols - 1, C.laje);
};

/* What the run has spent, written into HAF's own Spent meter. */
const respend = (f, dollars) => {
  const row = findRow(f, "Spent", TEXT, TEXT + 6);
  if (row > 0) spent(f, row, dollars);
};

const findRow = (f, words, c0 = MARK, c1 = END) => {
  for (let r = 1; r <= LAST_ROW; r++) if (text(f, r, c0, c1).includes(words)) return r;
  return -1;
};

// ---------- HAF's captures, as the demo's one story tells them ----------

/* The person's projects before the demo's scope: acme with one scope
   released, hypha-hq with one at work, nothing waiting on the person. */
const notify = (f) => {
  const head = findRow(f, "Notifications", RIGHT, f.cols - 1);
  if (head < 0) return;
  const rows = [
    ["⏺", C.sodio, "Billing", "proving, 2 of 5 scenarios", "hypha-hq"],
    ["✓", C.ibira, "Accounts", "released 0.3.0", "acme"],
  ];
  clear(f, head, head + 4, RIGHT, f.cols - 1, C.laje);
  put(f, head, TEXT, [["Notifications", C.bold, true], [` (${rows.length})`, C.faint]]);
  rows.forEach(([m, fg, name, said, where], i) => {
    put(f, head + 1 + i, MARK, [[m + " ", fg], [name.padEnd(11), C.ink], [said.padEnd(37), C.dim]]);
    put(f, head + 1 + i, END - where.length, [[where, C.dim]]);
  });
  /* HAF lays out four notifications; with two, what stood under them
     comes up the two rows they leave. */
  shiftUp(f, head + 6, 2);
};

/* Each project's card, as the demo's story has it. */
const cards = {
  "hypha-hq": { Repositories: "3", "Need you": "0", "At work": "1", Released: "4" },
  acme: { Repositories: "2", "Need you": "0", "At work": "0", Released: "1" },
};

for (const name of ["projects", "projects-1", "projects-2"]) {
  const f = read(name);
  notify(f);
  const hq = findRow(f, "hypha-hq", 0, RIGHT - 1);
  const acme = findRow(f, "acme ", 0, RIGHT - 1);
  for (const [row, m, fg, said] of [[hq, "⏺", C.sodio, "1 scope at work"], [acme, "✓", C.ibira, "1 scope released"]]) {
    if (row < 0) continue;
    const bg = f.g[row][3].bg;
    put(f, row, 1, [[m, f.g[row][3].bg === C.taxi ? C.vao : fg]], bg);
    put(f, row, 13, [[said.padEnd(30), f.g[row][13].fg]], bg);
  }
  const card = Object.keys(cards).find((p) => findRow(f, p, TEXT, TEXT + 10) > 0 && text(f, findRow(f, p, TEXT, TEXT + 10), TEXT, TEXT + 10).trim() === p);
  if (card) for (const [label, value] of Object.entries(cards[card])) {
    const r = findRow(f, label, TEXT, TEXT + 14);
    if (r > 0) put(f, r, TEXT + 14, [[value.padEnd(4), C.ink]]);
  }
  put(f, f.rows - 1, 1, [["ready".padEnd(12), C.bold, true]]);
  write(`i-${name}`, f);
}
{
  const f = read("project");
  notify(f);
  clear(f, 4, 9, 0, RIGHT - 1, C.vao);
  put(f, 4, 3, [["Done", C.bold, true], [" (1)", C.faint]]);
  put(f, 5, 1, [["✓ ", C.ibira], ["Accounts".padEnd(11), C.ink], ["Released 0.3.0", C.dim]]);
  put(f, f.rows - 1, 1, [["ready".padEnd(14), C.bold, true]]);
  write("i-project", f);
}

const since = (n) => [...Array(Math.max(0, 46 - n)).fill(0), ...tps(0, n)].slice(-46);

/* Intent's frames with what each call has cost by then. */
const intentSpend = {
  "question-0": 0.07,
  "thinking-0": 0.09,
  "thinking-1": 0.11,
  "thinking-2": 0.13,
  "question-1": 0.17,
  "question-2": 0.24,
  "question-3": 0.31,
  "own-words": 0.33,
  "own-words-typed-0": 0.33,
  "own-words-typed-1": 0.33,
  "own-words-typed-2": 0.33,
  "question-4": 0.39,
  decided: 0.45,
  signing: 0.58,
  "signing-read": 0.58,
};
/* How many of Intent's questions each frame has settled, of the five it
   asks. */
const settledBy = {
  "question-0": 0,
  "thinking-0": 1,
  "thinking-1": 1,
  "thinking-2": 1,
  "question-1": 1,
  "question-2": 2,
  "question-3": 3,
  "own-words": 3,
  "own-words-typed-0": 3,
  "own-words-typed-1": 3,
  "own-words-typed-2": 3,
  "question-4": 4,
  decided: 5,
  signing: 5,
  "signing-read": 5,
};

/* Intent's right pane under its Spent: what the chat on the left cannot
   say -- how much of the questioning is settled, the model at work and
   what it has cost -- and never the questions again, which the chat
   already holds. */
const intentPane = (f, settled, dollars, seed, speeds = tps(seed)) => {
  const spentRow = findRow(f, "Spent", TEXT, TEXT + 6);
  const decided = findRow(f, "Decided so far", TEXT, TEXT + 14);
  if (spentRow < 0) return;
  if (decided > 0) clear(f, decided, LAST_ROW, RIGHT, f.cols - 1, C.laje);
  /* The PRD's frames keep their Versions, under the same lines. */ else shiftDown(f, spentRow + 1, 5);
  meter(f, spentRow + 1, "Settled", settled / 5, `${settled}/5 questions`, C.temporal);
  spark(f, spentRow + 2, "Tok/s", speeds, `${speeds.at(-1)} last`, C.sereno);
  heading(f, spentRow + 4, "Models");
  model(f, spentRow + 5, "claude-opus-5-5", "Intent", money(dollars));
};

for (const [name, dollars] of Object.entries(intentSpend)) {
  const f = read(name);
  respend(f, dollars);
  noRecap(f);
  intentPane(f, settledBy[name], dollars, 0, since((Object.keys(intentSpend).indexOf(name) + 1) * 3));
  if (name.startsWith("signing")) {
    put(f, 3, 3, [["─".repeat(90), C.fiacao]]);
    /* The version's own Spent under Versions says what the meter says. */
    const first = findRow(f, "Spent", TEXT, TEXT + 6);
    for (let r = first + 1; r <= LAST_ROW; r++)
      if (text(f, r, TEXT, TEXT + 6).startsWith("Spent")) clear(f, r, r, RIGHT, f.cols - 1, C.laje);
  }
  write(name.startsWith("signing") ? `prd-${name === "signing" ? 0 : 1}` : `i-${name}`, f);
}

// ---------- Intent: the request, before the first question ----------

const request = "A team task tracker: tasks with a due date and an assignee, done or reopened, and an email reminder before a task is due.";
{
  const base = read("question-0");
  const typing = read("own-words-typed-1");
  const box = typing.g[17][1];
  const typed = [0, 22, 58, 92, request.length];
  typed.forEach((n, i) => {
    const f = clone(base);
    clear(f, 2, LAST_ROW, 0, RIGHT - 1, C.vao);
    const w = 91;
    put(f, 2, 1, [["╭" + "─".repeat(w) + "╮", box.fg]]);
    put(f, 3, 1, [["│ ", box.fg], ["? ", C.temporal], ["What would you like to build?", C.bold, true]]);
    put(f, 3, 1 + w + 1, [["│", box.fg]]);
    put(f, 4, 1, [["│   ", box.fg], ["Say it as you would to a colleague. I ask only what changes what gets built.", C.faint]]);
    put(f, 4, 1 + w + 1, [["│", box.fg]]);
    put(f, 5, 1, [["│", box.fg]]);
    put(f, 5, 1 + w + 1, [["│", box.fg]]);
    const words = request.slice(0, n);
    const first = words.slice(0, 86);
    const second = words.slice(86);
    put(f, 6, 1, [["│ ", box.fg], ["› ", C.dim], [first, C.ink]]);
    put(f, 6, 1 + w + 1, [["│", box.fg]]);
    put(f, 7, 1, [["│   ", box.fg], [second, C.ink]]);
    put(f, 7, 1 + w + 1, [["│", box.fg]]);
    const cursorRow = second ? 7 : 6;
    const cursorCol = second ? 4 + second.length : 5 + first.length;
    if (i < typed.length - 1) f.g[cursorRow][cursorCol] = { ch: " ", fg: C.blank, bg: C.ink, b: false };
    put(f, 8, 1, [["╰" + "─".repeat(w) + "╯", box.fg]]);
    respend(f, 0);
    noRecap(f);
    intentPane(f, 0, 0, 0, Array(46).fill(0));
    copyRow(f, typing, typing.rows - 1, f.rows - 1, 0);
    write(`intro-${i}`, f);
  });
}

// ---------- Mapping: the plan counted as it is looked up ----------

{
  const base = read("mapping");
  const steps = [0, 3, 6, 9, 12];
  steps.forEach((n, i) => {
    const f = clone(base);
    freshRight(f, base, findRow(base, "Mapping", MARK, MARK + 12));
    const provided = Math.min(6, n);
    const own = Math.max(0, Math.min(4, n - 6));
    const build = Math.max(0, n - 10);
    spent(f, 5, 0.58);
    meter(f, 6, "Looked up", n / 12, `${n}/12 items`, C.sereno);
    meter(f, 7, "Provided", provided / 12, `${provided}/12`, C.ibira);
    meter(f, 8, "Own", own / 12, `${own}/12`, C.sereno);
    meter(f, 9, "To build", build / 12, `${build}/12`, C.sodio);
    facts(f, 11, [
      ["Stages", n === 12 ? "3" : "…"],
      ["Model", "none, computed"],
      ["From", "the signed PRD"],
      ["Ontology", "0.15.0"],
    ]);
    write(`plan-${i}`, f);
  });
}

// ---------- the right pane of a stage at work ----------

const gateNames = ["build", "Pg.verify", "tests", "layout", "lint", "paths", "proof", "review"];

/* A round's gates: those before the one that refused it passed, the one
   refused, the rest never run. */
const refusedAt = (gate) => gateNames.map((_, i) => (i < gateNames.indexOf(gate) ? "ok" : i === gateNames.indexOf(gate) ? "no" : "wait"));

const stagePane = (f, base, o) => {
  freshRight(f, base, o.stepRow);
  spent(f, 5, o.spent);
  meter(f, 6, "Proof", o.proven / o.of, `${o.proven}/${o.of} proven`, C.ibira);
  meter(f, 7, "Unproven", o.calls / 240, `${o.calls}/240 calls`, o.calls > 200 ? C.brasa : C.sereno);
  spark(f, 8, "Tok/s", tps(o.seed), `${tps(o.seed).at(-1)} last`, C.sereno);
  let r = facts(f, 10, [
    ["Stage", o.working],
    ["Round", o.round],
    ["Calls", String(o.calls)],
    ["Took", o.took],
  ]);
  r++;
  heading(f, r, "Models");
  model(f, r + 1, "claude-opus-5-5", "Intent", "$0.58");
  model(f, r + 2, "claude-haiku-5-5", o.stepName, o.cost);
  model(f, r + 3, "claude-sonnet-5-5", "Review", o.review);
  r += 5;
  r = gates(f, r, gateNames, o.rounds.map((rd, k) => ({ label: `R${k + 1}`, marks: rd.marks, at: k === o.rounds.length - 1 })));
  r++;
  list(f, r, "Scenarios", o.scenarios);
};

// ---------- Scaffold: written before a model is called ----------

{
  const names = ["build-022", "build-022", "build-024", "build-024"];
  names.forEach((name, i) => {
    const base = read(name);
    const f = clone(base);
    freshRight(f, base, findRow(base, "Scaffold", MARK, MARK + 12));
    const files = [14, 38, 64, 64][i];
    spent(f, 5, 0.58);
    meter(f, 6, "Written", files / 64, `${files}/64 files`, C.sereno);
    let r = facts(f, 8, [
      ["Stage", "S1 its parts"],
      ["Compiles", i === 3 ? "yes" : "not yet", i === 3 ? C.ibira : C.faint],
      ["Model", "none, computed"],
      ["Took", ["4m 41s", "4m 46s", "4m 58s", "5m 11s"][i]],
    ]);
    r++;
    r = gates(f, r, ["build", "layout"], [{ label: "R1", marks: i < 3 ? ["now", "wait"] : ["ok", "ok"], at: true }]);
    r++;
    list(f, r, "Its items", [
      [i > 0 ? "ok" : "now", "contexts accounts and tasks", "dune, migrations"],
      [i > 1 ? "ok" : i === 1 ? "now" : "wait", "compose and the locked acceptance", "compose.yaml"],
      [i > 2 ? "ok" : i === 2 ? "now" : "wait", "typed stubs for every item", "left for the model"],
    ]);
    write(`scaffold-${i}`, f);
  });
}

// ---------- Composition: a stage proven round by round ----------

{
  const scen = ["a person makes a project", "the tasks are listed", "a stranger cannot complete a task", "the owner moves a task's due date"];
  /* Each frame: its round, the scenarios it has proven, how far the round's
     gates have gone. */
  const beats = [
    { round: 1, proven: [], gate: 0 },
    { round: 1, proven: [], gate: 3 },
    { round: 1, proven: [], gate: 6 },
    { round: 1, proven: [], refused: "proof", say: "0 proven, proof refused" },
    { round: 2, proven: [], gate: 2 },
    { round: 2, proven: [0], gate: 6 },
    { round: 2, proven: [0, 1], refused: "proof", say: "2 proven, proof refused" },
    { round: 3, proven: [0, 1], gate: 4 },
    { round: 3, proven: [0, 1, 2], gate: 6 },
    { round: 3, proven: [0, 1, 2, 3], gate: 7 },
    { round: 3, proven: [0, 1, 2, 3], passed: true, say: "4 proven, passed" },
  ];
  const history = [
    { marks: refusedAt("proof"), proven: 0 },
    { marks: refusedAt("proof"), proven: 2 },
  ];
  const base = read("proving-13");
  const stepRow = findRow(base, "Composition", MARK, MARK + 14);
  beats.forEach((b, i) => {
    const f = clone(base);
    const now = b.passed ? gateNames.map(() => "ok") : b.refused ? refusedAt(b.refused) : gateNames.map((_, k) => (k < b.gate ? "ok" : k === b.gate ? "now" : "wait"));
    const rounds = [...history.slice(0, b.round - 1), { marks: now, proven: b.proven.length, say: b.say ?? `round ${b.round}, at work` }];
    stagePane(f, base, {
      stepRow,
      stepName: "Composition",
      proven: b.proven.length,
      of: 4,
      calls: 4 + i * 3,
      seed: i * 3,
      working: "S2 Tasks",
      done: "1 of 3 stages",
      next: "S3 Reminders",
      spent: 0.62 + i * 0.15,
      round: String(b.round),
      took: clock(360 + i * 70),
      cost: money(0.04 + i * 0.13),
      review: money(i * 0.02),
      rounds,
      scenarios: scen.map((s, k) => b.proven.includes(k) ? ["ok", s, "proven", C.ibira] : b.refused ? ["no", s, "it answered 404", C.brasa] : ["wait", s, "not yet", C.faint]),
    });
    /* The stage at work on the left: how many of its scenarios hold. */
    const left = findRow(f, "S2 Tasks", 0, RIGHT - 1);
    if (left > 0) put(f, left, 31, [[`${b.proven.length} of 4 proven, ${b.passed ? "passed" : "at work"}`.padEnd(40), f.g[left][31].fg]]);
    write(`compose-${String(i).padStart(2, "0")}`, f);
  });
}

// ---------- Validation: the whole proven on the running service ----------

{
  const scen = [
    ["a person sees their own account", "FR-1"],
    ["a person makes a project", "FR-6"],
    ["a project with a blank name is refused", "FR-6"],
    ["a task due in the past is refused", "FR-2"],
    ["a stranger cannot complete a task", "FR-3"],
    ["the assignee completes and reopens", "FR-3"],
    ["the tasks are listed", "FR-5"],
    ["the owner moves a task's due date", "FR-4"],
    ["a person renames their account", "FR-1"],
    ["the projects are listed", "FR-6"],
  ];
  const base = read("build-114");
  const stepRow = findRow(base, "Validation", MARK, MARK + 14);
  const beats = [0, 2, 4, 5, 7, 10];
  beats.forEach((n, i) => {
    const f = clone(base);
    freshRight(f, base, stepRow);
    const failedOnce = i === 3;
    spent(f, 5, 2.4 + i * 0.06);
    meter(f, 6, "Proof", n / 10, `${n}/10 proven`, C.ibira);
    spark(f, 7, "Requests", tps(40 + i * 4).map((v) => v % 9), `${n * 7 + 3} sent`, C.ibira);
    let r = facts(f, 9, [
      ["Sent", `${n * 7 + 3} requests`],
      ["Failed", i >= 3 ? "1, sent again" : "none"],
      ["Stages", "3 of 3"],
      ["Took", clock(1320 + i * 40)],
    ]);
    r++;
    list(f, r, "Scenarios", scen.map(([s, fr], k) => {
      if (k < n) return ["ok", s, fr, C.dim];
      if (k === n && failedOnce) return ["no", s, "500, sent again", C.brasa];
      if (k === n && n < 10) return ["now", s, "sending", C.sodio];
      return ["wait", s, fr, C.faint];
    }));
    /* Every stage done, the whole proven on its service. */
    clear(f, 2, 12, 0, RIGHT - 1, C.vao);
    put(f, 2, 3, [["A team task tracker, API only", C.bold, true], [" (Validation, 3 of 3)", C.faint]]);
    put(f, 4, 3, [["Done", C.bold, true], [" (3)", C.faint]]);
    ["S1 The application's parts", "S2 Tasks", "S3 Reminders"].forEach((st, k) => put(f, 5 + k, 1, [["✓ ", C.ibira], [st, C.ink]]));
    write(`validate-${i}`, f);
  });
}

// ---------- Released: what it came to, meters on top ----------

{
  const base = read("done");
  const f = clone(base);
  freshRight(f, base, findRow(base, "Released", MARK, MARK + 14));
  spent(f, 5, 2.74);
  meter(f, 6, "Proven", 1, "10/10 proven", C.ibira);
  meter(f, 7, "Provided", 6 / 12, "6/12", C.ibira);
  meter(f, 8, "Own", 4 / 12, "4/12", C.sereno);
  meter(f, 9, "Built", 2 / 12, "2/12", C.sodio);
  spark(f, 10, "Tok/s", tps(9), `${tps(9).at(-1)} last`, C.sereno);
  let r = facts(f, 12, [
    ["Rounds", "6, 3 refused"],
    ["Took", "27m 40s"],
    ["Calls", "71"],
    ["Resent", "1 scenario"],
    ["Tagged", "0.1.0"],
    ["Pushed", "origin, main"],
  ]);
  r++;
  r = gates(f, r, gateNames, ["S1", "S2", "S3"].map((label) => ({ label, marks: gateNames.map(() => "ok") })));
  r++;
  heading(f, r, "Models");
  model(f, r + 1, "claude-opus-5-5", "Intent", "$0.58");
  model(f, r + 2, "claude-haiku-5-5", "Composition", "$1.84");
  model(f, r + 3, "claude-sonnet-5-5", "Review", "$0.32");
  r += 5;
  heading(f, r, "Try it");
  put(f, r + 1, TEXT, [["Opens the Workbench: each repository of the project started", C.ink]]);
  put(f, r + 2, TEXT, [["in its container, to use what this scope released.", C.ink]]);
  for (const [label, value] of [["Spent", "$2.74"], ["Took", "27:40"]]) {
    const row = findRow(f, label, 3, 15);
    if (row > 0) put(f, row, 15, [[value.padEnd(10), C.ink]]);
  }
  write("released", f);
}

// ---------- the Workbench, alive ----------

{
  const base = read("workbench");
  const logs = [
    ["migrated: 3 changes", C.ink],
    ["listening on :8080", C.ink],
    ["POST /projects 201 5ms", C.ink],
    ["POST /tasks 201 4ms", C.ink],
    ["GET /tasks 200 2ms", C.ink],
    ["POST /tasks/7:complete 200 3ms", C.ink],
    ["POST /tasks/7:reopen 200 3ms", C.ink],
    ["PATCH /tasks/7 422 due date in the past", C.brasa],
    ["PATCH /tasks/7 200 4ms", C.ink],
    ["job remind: 1 due tomorrow", C.sodio],
    ["mail sent to ana@acme.test", C.ibira],
    ["GET /tasks 200 2ms", C.ink],
  ];
  const frames = 12;
  for (let i = 0; i < frames; i++) {
    const f = clone(base);
    clear(f, 3, LAST_ROW, 0, RIGHT - 1, C.vao);
    clear(f, 1, LAST_ROW, RIGHT, f.cols - 1, C.laje);
    put(f, 4, 3, [["Applications", C.bold, true], [" (1)", C.faint]]);
    put(f, 5, 1, [["⏺ ", C.sodio], ["task-tracker".padEnd(14), C.bold, true], [":8080".padEnd(8), C.ink], ["running", C.ink]]);
    for (let c = 1; c < RIGHT - 1; c++) f.g[5][c].bg = C.vidro;
    put(f, 7, 3, [["Infrastructure", C.bold, true], [" (2)", C.faint]]);
    put(f, 8, 1, [["⏺ ", C.sodio], ["postgres".padEnd(14), C.ink], ["".padEnd(8), C.ink], ["running", C.ink]]);
    put(f, 9, 1, [["⏺ ", C.sodio], ["mail".padEnd(14), C.ink], [":1025".padEnd(8), C.ink], ["running, catching what is sent", C.ink]]);

    put(f, 2, TEXT, [["task-tracker", C.bold, true]]);
    put(f, 3, TEXT, [["State".padEnd(GRID), C.faint], ["⏺ ", C.sodio], [`running, up ${1 + Math.floor(i / 4)}m`, C.ink]]);
    put(f, 4, TEXT, [["Address".padEnd(GRID), C.faint], ["http://localhost:8080", C.fact]]);
    const cpu = [3.2, 4.1, 12.6, 6.0, 3.8, 18.4, 7.2, 4.4, 3.1, 9.9, 5.2, 3.6][i];
    meter(f, 6, "CPU", cpu / 100, `${cpu}%`, C.sereno);
    meter(f, 7, "Mem", (212 + i * 3) / 4096, `${212 + i * 3}M/4G`, C.sereno);
    spark(f, 8, "Req", tps(i, 46).map((v, k) => (k > 46 - i * 3 ? v % 11 : 0)), `${i * 2 + 1} served`, C.ibira);
    heading(f, 10, "Guard");
    put(f, 11, TEXT, [["Reached".padEnd(GRID), C.faint], [i >= 10 ? "2  " : "1  ", C.ibira], [i >= 10 ? "your mail relay, the catcher" : "your mail relay", C.ink]]);
    put(f, 12, TEXT, [["Refused".padEnd(GRID), C.faint], [i >= 6 ? "1  " : "0  ", i >= 6 ? C.brasa : C.faint], [i >= 6 ? "api.analytics.example, not allowed" : "nothing yet", C.ink]]);
    heading(f, 14, "Logs");
    const shown = logs.slice(Math.max(0, i + 1 - 20), i + 1);
    shown.forEach(([line, fg], k) => put(f, 15 + k, TEXT, [[`12:0${Math.min(9, Math.floor((i - shown.length + 1 + k) / 2) + 1)}`.padEnd(GRID), C.faint], ["task-tracker".padEnd(2 * GRID), C.faint], [line, fg]]));
    write(`bench-${String(i).padStart(2, "0")}`, f);
  }
}

console.log("illustrated frames written to", dir);
