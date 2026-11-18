# HAF's screens, as HAF draws them

Each file is one screen of HAF at 137 columns by 34 rows, written by HAF
itself: every row a list of runs, a run `[text, colour, background, bold]`,
a colour `null` where the terminal's own is kept. The Factory's demo
(`src/components/Demo.astro`) plays them.

They come from hypha-haf's `tools/site/site_screens.exe`, which drives HAF's
screens on an emulated terminal as its snapshot tests do, through the run
recorded in `examples/task-tracker/journal.jsonl`. As HAF changes, write them
again, from hypha-haf's `test/` folder:

    opam exec --switch=hypha-haf -- dune build ../tools/site/site_screens.exe
    opam exec --switch=hypha-haf -- ../_build/default/tools/site/site_screens.exe <this folder>

The `snap-*.json` files are HAF's snapshot screens, read from hypha-haf's
`test/screens/<name>.txt` at 120 by 40, for screens the demo's run does not
reach: founding a vault, a preset, the model thinking. A snapshot keeps the
characters and not their colours, so `scripts/haf-snapshots.mjs` gives each
the colour HAF's palette gives it, the card holding the keys framed in gold.
Write them again as HAF changes:

    node scripts/haf-snapshots.mjs ~/Projects/hypha-haf/test/screens thinking preset-opened founding-asks gallery-gaps gallery-scaffold checklist-steps done-requirement

The Factory's page (`src/pages/haf.astro`) shows regions of both kinds
through `src/components/Crop.astro`.
