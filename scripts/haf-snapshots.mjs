// Writes HAF's snapshot screens as the cells the site draws.
//
// hypha-haf keeps every screen of its screen system as a text snapshot,
// test/screens/<name>.txt, drawn at five sizes; the 120 by 40 one is read
// here. A snapshot keeps the characters and not their colours, so each is
// given the colour HAF's own palette gives it (the frames its site tool
// writes, beside these, carry the palette): a mark by its meaning, a rule
// and a frame faint, the line chosen in a list gold, the rest ink.
//
//   node scripts/haf-snapshots.mjs ~/Projects/hypha-haf/test/screens thinking preset-opened ...
//
// Each is written to src/content/haf-screens/snap-<name>.json.

import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [dir, ...names] = process.argv.slice(2);
if (!dir || names.length === 0) {
  console.error("usage: node scripts/haf-snapshots.mjs <hypha-haf/test/screens> <name>...");
  process.exit(2);
}

const ink = "#c7cdd6";
const faint = "#767d88";
const dim = "#8d949f";
const rule = "#414346";
const ground = "#1c1e20";
const gold = "#e7cb8a";

const colourOf = (ch) => {
  if ("─│╭╮╰╯├┤".includes(ch)) return rule;
  if (ch === "✓") return "#9acaa2";
  if ("✗■".includes(ch)) return "#d87676";
  if ("●⠋⠹⠸⠼⠴⠦⠧⠇⠏".includes(ch)) return "#7993cb";
  if ("○◇›".includes(ch)) return faint;
  if ("█▀▄".includes(ch)) return dim;
  return ink;
};

// A row as runs of one colour: [text, colour, background, bold].
const runs = (cells) => {
  const out = [];
  for (const [ch, fg, bg, bold] of cells) {
    const last = out[out.length - 1];
    if (last && last[1] === fg && last[2] === bg && last[3] === bold) last[0] += ch;
    else out.push([ch, fg, bg, bold]);
  }
  return out;
};

for (const name of names) {
  const text = readFileSync(join(dir, `${name}.txt`), "utf8").split("\n");
  const start = text.indexOf("120×40");
  if (start < 0) throw new Error(`${name}: no 120×40 snapshot`);
  const rows = text.slice(start + 1, start + 41).map((l) => [...l.slice(4).padEnd(120)].slice(0, 120));
  // The card that holds the keys, framed in gold as HAF draws it: the
  // frame around the line chosen in a list.
  const focus = new Set();
  const pick = rows.findIndex((row) => row.includes("❯"));
  if (pick >= 0) {
    const col = rows[pick].indexOf("❯");
    const left = rows[pick].lastIndexOf("│", col);
    const right = rows[pick].indexOf("│", col);
    let top = pick;
    while (top > 0 && rows[top][left] !== "╭") top--;
    let bottom = pick;
    while (bottom < rows.length - 1 && rows[bottom][left] !== "╰") bottom++;
    if (left >= 0 && right > left && rows[top][left] === "╭") {
      for (let r = top; r <= bottom; r++) {
        focus.add(`${r}:${left}`);
        focus.add(`${r}:${right}`);
        if (r === top || r === bottom) for (let c = left; c <= right; c++) focus.add(`${r}:${c}`);
      }
    }
  }
  const lines = rows.map((row, r) => {
    const status = r === rows.length - 1;
    const top = r === 0;
    // The line chosen in a list: from its ❯ to the frame or the pane's edge.
    const chosen = row.indexOf("❯");
    const end = chosen < 0 ? -1 : row.findIndex((ch, i) => i > chosen + 1 && ch === "│");
    const cells = row.map((ch, i) => {
      if (focus.has(`${r}:${i}`)) return [ch, gold, ground, false];
      if (chosen >= 0 && i >= chosen && i < (end < 0 ? row.length : end - 1)) return [ch, ground, gold, false];
      if (status) return [ch, faint, ground, false];
      if (top) return [ch, colourOf(ch) === rule ? rule : ink, ground, true];
      if (ch === "+" && row[i + 1] === " " && row.slice(0, i).every((c) => c === " ")) return [ch, "#95c47f", ground, false];
      return [ch, colourOf(ch), ground, false];
    });
    return runs(cells);
  });
  writeFileSync(join("src/content/haf-screens", `snap-${name}.json`), JSON.stringify({ cols: 120, rows: 40, lines }));
  console.log(`snap-${name}.json`);
}
