---
name: Hypha
description: The site of Hypha, the foundation for agentic engineering, on night and paper with gold where something is proven.
colors:
  night: "#15120e"
  paper: "#f3efe8"
  graphite-on-night: "#948c83"
  graphite-on-paper: "#655d54"
  rule-on-night: "#3d362c"
  rule-on-paper: "#d6cfc2"
  gold: "#d4a820"
  sheet: "#fbf9f5"
  ember: "#1a150f"
  rust: "#b0541e"
typography:
  hero:
    fontFamily: "Roboto Slab Variable, ui-serif, Georgia, serif"
    fontSize: "clamp(2.75rem, 5.5vw, 5rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  statement:
    fontFamily: "Roboto Slab Variable, ui-serif, Georgia, serif"
    fontSize: "clamp(3rem, 7.5vw, 6.5rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Roboto Slab Variable, ui-serif, Georgia, serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 400
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Roboto Slab Variable, ui-serif, Georgia, serif"
    fontSize: "clamp(1.5rem, 2.8vw, 2rem)"
    fontWeight: 400
    lineHeight: 1.2
  card-title:
    fontFamily: "Roboto Slab Variable, ui-serif, Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 400
    lineHeight: 1.25
  lede:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 400
    lineHeight: 1.5
  body:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  panel:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
  tag:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
  control:
    fontFamily: "Inter Tight, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.25
  data:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
rounded:
  control: "4px"
  card: "10px"
  well: "12px"
  panel: "16px"
  pill: "999px"
spacing:
  section: "5rem"
  section-mobile: "4rem"
  page-gutter: "1.5rem"
  page-width: "72rem"
components:
  button-primary:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.night}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "40px"
  button-secondary:
    textColor: "{colors.graphite-on-night}"
    typography: "{typography.control}"
    rounded: "{rounded.control}"
    padding: "0 20px"
    height: "40px"
  panel:
    typography: "{typography.panel}"
    rounded: "{rounded.panel}"
    padding: "0 5px 5px"
  relation-label:
    textColor: "{colors.graphite-on-night}"
    rounded: "{rounded.pill}"
    padding: "5px 10px"
  sheet:
    backgroundColor: "{colors.sheet}"
    textColor: "{colors.night}"
    rounded: "14px"
---

# Design System: Hypha

How hyphatech.io looks, and the patterns every page is built from. What
the site says and to whom is `PRODUCT.md`; this file is how it says it.
A page that needs something these patterns cannot show adds a pattern
here first, then uses it. The classes live in `src/styles/site.css`
(`k-` prefix) and `src/components`.

## Overview

**Creative North Star: "Sound by design"**

The landing says strong boundaries make systems sound, and the site is
held the same way: every element sits inside a rule. A claim is never
left as words. It is shown by an artefact set calmly beside them: a
sourced figure, a comparison, a table, a map of how things relate, a
log of something happening, a document the reader will receive. The
type carries the voice, the artefacts carry the proof.

The page alternates night and paper. The dot grid and the Chladni sand
are the only texture, both full width, never boxed or faded. Gold is
rare and exact: it marks the one thing a pattern points at. Everything
else is ink and graphite, calm and legible, closer to a well-made
product page than to a blog.

The site was rebuilt from references the owner chose (convex.dev,
Paperclip, HeroUI's table, Helix's ontology view, OpenRouter) and
translated into Hypha's own material; their literal palettes,
ornaments and pills were tried and rejected as guessable.

**Key Characteristics:**
- Every claim proven by an artefact beside its words, in a 5/7 split.
- One panel form for every set of rows.
- One level deep: no box inside a box.
- Night and paper alternate; dots and sand fill sections edge to edge.
- Gold marks, never decorates.

## Colors

Two grounds that swap, a graphite for what qualifies, and one gold.

### Primary
- **Proof Gold** (`gold`): the one mark a pattern points at. The second
  line of a hero or a two-line heading, the Hypha side of a comparison
  (its edge, name and outcome), the tick on what is done or proven, the
  done entry of a log, the caret, the index mark of the step in view.

### Neutral
- **Night** (`night`): the default ground: heroes, arguments, artefacts.
  On paper sections it becomes the text.
- **Paper** (`paper`): text on night; the ground of paper sections
  (`theme-light`), which carry figures, tables, narratives and ruled
  grids.
- **Graphite** (`graphite-on-night`, `graphite-on-paper`): what
  qualifies: notes, sources, labels, the state before Hypha.
- **Rule** (`rule-on-night`, `rule-on-paper`): the hairlines between
  rows and around panels.
- **Sheet** (`sheet`): the paper of a document lying on the page.
- **Ember** (`ember`, `theme-ember`): a third ground, night lit warm
  from two corners, gold from the top right and rust from the bottom
  left. It is for a section that must stand apart from the night and
  the paper around it: every product page's hero, and the landing's
  climax, Hypha: sound by design, with a fine grain over its light
  (`k-grain`) and, in a hero, fine dots (`k-dots`). Night's
  tokens hold on it.
- **Rust** (`rust`): Ember's second light, and the low band of Horizon.
  A light only, never a fill, a text or a mark.

### Named Rules
**The One Mark Rule.** Gold marks the one thing a pattern points at. If
a section has two gold things competing, one is wrong.

**The Mark-Not-Words Rule.** On paper, gold is a mark (a tick, a rule,
an index bar), never words: it reads at 1.9:1 there.

## Materials

The legal set: every section's ground, texture and frame comes from this
list, and nothing else is used. Each has its one place.

### Grounds
| Ground | Class | Where |
|---|---|---|
| **Night** | default | Most sections, and every technical drawing: the landing's jig, the Factory's app and the Ontology's map stand on plain night over fine dots, with no light, so the drawing and its gold carry the section. |
| **Paper** | `theme-light` | Sections that alternate with night. A panel on paper is always night. |
| **Ember** | `theme-ember` + `k-grain` | A page's hero or title band, the landing's climax, and on /haf the harness and the record. Night lit gold from the top right and rust from the bottom left, with the grain. Its two lights drift slowly round their corners, still with reduced motion. |
| **HAF's room** | `k-haf` | The one exception to the site's palette: the section /haf's demo plays in. HAF's grey a step darker (`#141517`), its ink, graphite and rules HAF's own, HAF's pale gold its mark, fine dots in its ink, so the app sits in its own world. Nowhere else. |
| **Lit night** | `k-lit` | A night section that holds a drawing: the grain and a warm light rising under it, quieter than Ember. Its light sways slowly under the drawing. |
| **Overhead** | `k-overhead` + `k-grain` | One gold lamp above the section's middle, falling to plain night. A statement or a closing line. |
| **Horizon** | `k-horizon` + `k-grain` | A low warm band along the section's foot, gold over rust. A section that hands over to the next. |
| **Ember, mirrored** | `theme-ember k-mirrored` + `k-grain` | Ember turned round, rust from the top left and gold from the bottom right, so a second lit section on a page never repeats the first. Its lights drift as Ember's do. |

### Textures
| Texture | Class | Where |
|---|---|---|
| **Grain** | `k-grain`, in `k-lit` | Only on the lit grounds: Ember, lit night, Overhead and Horizon. |
| **Fine dots** | `dotted`, `k-gridground`, in `k-plate` | Only under a drawing, a map or a table: on a plate, or a dotted field edge to edge. Never under a hero or running text. One size everywhere: 0.6px dots on 22px. |
| **Halftone** | `k-halftone` | Under a drawing or a figure, in place of the fine dots, where a section should fade into the next: dots on a 12px grid growing toward the foot, small ones fading out as large ones fade in, never heavier than 1.1px at 10% ink. Never under running text. |
| **Sand** | `Chladni` | The landing's hero only. It keeps off the letters and buttons themselves, a few pixels round each, never a box round the words. |

### Frames and surfaces
| Form | Class | Where |
|---|---|---|
| **Plate** | `k-plate`, `k-mark` | Holds the one figure a section shows, dotted, with gold corner crosses. Reaches into the margin from 80rem so what it holds keeps the text's line. |
| **Panel** | `k-panel` | Every set of rows. Night on paper. |
| **Sheet** | `k-sheet` | A document lying on the page. |

### Named Rules
**The Legal Set Rule.** A ground, a texture or a frame not in Materials
is not used. A new one is added here first, with its place.

**The One Texture Rule.** A section carries at most one texture besides
the grain: fine dots, halftone or sand, never two, and never lines.

## Typography

**Display Font:** Roboto Slab (with ui-serif, Georgia)
**Body Font:** Inter Tight (with ui-sans-serif, system-ui)
**Data Font:** the system mono (SF Mono, Menlo)

**Character:** a sturdy slab serif that states, over a tight sans that
reads easily at any size.

### Hierarchy
- **Hero** (400, `clamp(2.75rem, 5.5vw, 5rem)`, 0.98): a page's first
  heading, in two lines, the second in gold.
- **Statement** (400, `clamp(3rem, 7.5vw, 6.5rem)`, 1): the one line a
  page stands on, over the sand. Once a page.
- **Headline** (400, `clamp(2rem, 4vw, 3rem)`, 1.05): a section's
  heading.
- **Title** (400, `clamp(1.5rem, 2.8vw, 2rem)`, 1.2): a narrative
  block's heading, a step's claim, a decision, a closing card.
- **Card title** (400, 1.5rem, 1.25): a card in a ruled grid.
- **Lede** (Inter Tight 400, 1.25rem, 1.5, ink at 72%): every section's
  paragraph, at a reading measure (42rem).
- **Body** (Inter Tight 400, 1rem, 1.6): a card's line, a point's line.
- **Panel** (Inter Tight 400, 1rem, 1.45): everything inside a
  panel; its head, labels and footer 0.875rem in graphite.
- **Label** (Inter Tight 400, 0.875rem): a label, a note, a step's
  number and name, an index, in sentence case and never tracked or
  uppercase; **Control** is the same size at 500, for buttons and nav.
- **Tag** (Inter Tight 400, 0.75rem): a tag, a relation's pill, the
  legal line.
- **Data** (mono, 0.875rem): code, times, counts and progress only.

### Named Rules
**The Readable Paragraph Rule.** Paragraphs are the sans at 1.25rem.
Never the thin serif: owners must read them without effort.

**The One Size Rule.** Inside a panel or a table everything is one size;
only its labels step down.

**The Data Rule.** Mono is for data a machine would print, never for
labels or headings.

**The Ladder Rule.** Every size is a whole pixel on one ladder: 12,
14, 16, 20, 24, 32, 48, 80 (tag, label, body, lede, card title, title,
headline, hero). The small end climbs by 2px so interface text keeps
its rank; the large end widens so each heading level is unmistakable.
A size off the ladder is not used.

**The Two Weights Rule.** The slab is always 400. The sans is 400, or
500 for a name or a control; nothing heavier is loaded or drawn.

## Layout

The page is 72rem wide, aligned with the masthead, with a 1.5rem gutter
(1rem on phones). Sections stack in alternating night and paper, each
`py-16`/`md:py-20`; the statement takes more. Every section opens the
same way, a heading then a paragraph (`Opener`), and only its content's
form varies.

A claim with an artefact is a 5/7 split: the opener and three points on
the left, the artefact on the right, vertically centred. A centred
heading over two panels is the comparison's form. A narrative puts a
13rem sticky index beside its blocks.

Grounds, textures and frames come only from Materials.

### Named Rules
**The Full Width Rule.** The dotted field and the sand
fill their section edge to edge. Never faded at the edges, never inside
a box.

**The Alignment Rule.** Nothing is wider than the masthead.

## Elevation & Depth

Depth is tonal first: a panel lifts the ground toward ink
(`color-mix` 4 to 7%), and its rows sit in a well a shade nearer the
ground. Shadows are long and soft, and only under objects that sit on
the ground (concept cards, the sheet); never on panels in a row.

### Shadow Vocabulary
- **Object** (`0 16px 32px -20px rgb(0 0 0 / 0.8)`): a concept card on
  the dots.
- **Sheet** (`0 24px 48px -28px rgb(40 28 12 / 0.35)`): a document on
  paper.

### Named Rules
**The One Level Rule.** A panel holds rows ruled apart. Never a box in a
box, never a frame around an artefact's frame.

## Shapes

Gently rounded and consistent: controls 4px, cards in a ruled grid
10px, a panel 16px with its well 12px, concept cards 14px, relation
labels fully round. Rules are 1px. Nothing is tilted.

## Components

### Buttons
- **Shape:** 4px corners, 40px high (44px on touch).
- **Primary:** paper on night (night on paper), with an icon; the
  conversation.
- **Secondary:** a panel-toned button with a rule edge and graphite
  text that inks on hover.
- **Hover / Focus:** opacity or ink shift in 120ms; focus ring in gold
  on night, ink on paper.

### Hero (`Hero`)
Night over the full dot grid: headline in two lines, the second in gold;
the lede; primary and secondary button.

### Opener (`Opener`)
A section's heading, then its paragraph. Every section starts this way.

### Panel (`k-panel`)
The one form for every set of rows. On paper a panel is always night. A frame (ink 7% over the ground),
edged by a hairline in the rule's colour so it holds on any ground,
carries small graphite labels at its head: its icon and name, and a
note, or a table's column heads. One well (ink 1.5%) inset in it holds the rows,
ruled apart. An optional footer line sits on the frame. Used three
ways:
- **Compare** (`Compare.astro`): one thing two ways, as two panels of
  the same rows side by side, each with its name and note on its head
  and its story in its footer. The Hypha panel is night on any ground,
  edged in gold, its name and note gold; the other is stone laid thin
  over the ground, lighter and colder, never brighter. One outcome sits
  under both, after a gold tick, with no label, unless the heading
  above already says it.
- **Table:** column heads on the frame, rows in the well, a tag
  (`k-tag`) on the state before, a tick (`k-tick`) on the state after.
  A tick is a bare gold check, never a filled box, which reads as a
  form's checkbox.
- **Log:** a name and a progress at its head, timed entries in the well
  (the last done one in gold), the next one in the footer with the
  caret.

### Points beside an artefact (`k-point`)
A bare icon in graphite on the title's line, the title, its line. Three
of them under an opener, beside the artefact they explain.

### Map (`k-map`, `k-concept`, `k-relation`)
Concept cards in a strict 3×3 grid, each relation in the cell between
two cards, its name in a pill on the line. The concept a page points at
has the gold edge. On the landing each card is a panel, as the
comparison's are: the name in the header line, the sentence in the
well, and the gold panel's name in gold. On /modernise, the first time it comes into view,
it assembles once, in the order its relations read: each card fades
in, each line draws out of the card before it, and the gold edge
lights last, where the others meet. Already in view on arrival, or
under reduced motion, it is simply there. Over the landing's sand it
stays still.


### Two vaults (`Vaults.astro`)
On /haf, one source of truth drawn as two hearts on the landing hero's
plate, on lit night: Hypha's Vault above, your Project Vault below,
each the site's panel of its rows, stores, Hypha's laid on the steps'
columns so each line rises from the part it names; and between them the
Factory's six steps, a sequence and not a store, so never a third
table: a stepper, ringed icons on one gold line (the lanes' icons for
each step), as /modernise's stepper joins its steps, each number and
name under its ring. A hairline runs
from a vault to each step that takes from it, the relation named in
the map's pill; a write into your vault is gold. No glow and no colour
of its own. On a phone the stepper runs down the page, rings on the
left, the vaults joined to it on the same line.

### Presets (`Presets.astro`)
On /haf, one preset as a card in the panel form, a row for each kind
of work (an icon in a soft square, the model, the work under it, the
provider's mark and name), mixing providers so no one is sold. Under
it the providers as chips: today's in ink, those coming in graphite.
Marks from Simple Icons, in the text colour, never gold.

### Lanes over time (`Autonomy.astro`)
On /haf, a piece of work from two sides: your lane and the Factory's,
thin graphite lines on the page's ground, joined where the work is
handed over and back. Each step a small ringed badge carrying a Lucide
icon of what it is (an answer, the signature, the map, the scaffold,
an item passed, a refusal, a retry, an item set aside, the checks, the
release, trying it), never bare dots, squares or diamonds; the
signature and the release in gold. Its labels in the sans at small
size. The scroll is its clock: as the figure rises the work's ink trace
draws over the plan, drawn faint, its gold token at the head, each
badge lit once passed; with reduced motion it stands whole. On a phone
the drawing keeps its size and scrolls sideways.

### Decision cards (`DecisionCards.astro`)
On /haf, how the Factory is built: a card for each decision, its top an
isometric diagram of it (`decisions-geometry.ts`), its own system and
not the anatomy kit's machines -- a gridded base plate of night laid
out like a board: thin tiles seated in whole cells on it, centred on
crossings of its lines, never floating; links run along the grid's
lines from the middle of a tile's side, dashed (solid where a line is a
track), never across it; each tile's Lucide icon painted on its top
square to the viewer, so it reads; no label and no pill, the icons and
the drawing say it alone; and the one tile the decision lands on edged
in gold with a soft gold glow under it.
Every drawing shows its decision's logic: a bus into one socket, a
wall every way out stops at, one track of steps, a loop, a branch, a
straight line main moves along. Only the
projection is shared with the iso kit. The six sit on the section's
own ground, with no frame or cells, as a chess grid: each decision a row,
a large drawing cell beside a words cell (a card title and one sentence
of what it gives), the drawing on alternate sides, so drawings and words
alternate down the section, one faint rule across between decisions. Never rows or data. On a
phone, the drawing over its words.

### Figures (`k-figure`)
A sourced number at display size, its line, what the source measured
in graphite (so the number is not read for more), and the source as a
link that leaves the site. The whole card is that link: under the
pointer it steps a shade brighter and its source inks. Beside the claim it bears out, on either
ground, never in a box of its own.

### Statement (`k-statement`)
One line at poster scale over the Chladni sand, its line under it.

### Narrative
A sticky index of numbered steps beside their blocks, the step in view
marked; each block a number and name, a two-line title, a paragraph,
ticks for what you keep.

### Claims
Numbered cards in one row, a claim and its reason, every one in view:
never a slider, since a claim behind an arrow is a claim unread. For
up to four bold claims.

### Ruled grid (`Cell`)
Cells in one frame ruled apart: a bare icon, a card title, its line,
and a link when a card names another page.

### Sheet (`k-sheet`)
A document lying straight on the ground: a header, labelled rows ruled
with dashes, a signature line.

### Blueprint drawing (`TemplateRouter blueprint`)
An isometric drawing on night: faces and tops a step and two of
graphite off the ground, edges in graphite hairlines, no halo, so it
holds the site's warm greys; the one thing it shows gold, edged and
washed. Recesses are a shadowed wall and an even floor a step below
the top. Words never sit over a drawing that moves.

### Closing (`Closing`)
Every page ends on "Build with Hypha." and three ways in, Talk to us
first, on paper. Always on night, the first card always light, on every
page.

## Do's and Don'ts

### Do:
- **Do** show every claim with an artefact beside it, in a 5/7 split.
- **Do** use the panel for every set of rows, in one size.
- **Do** keep gold for the one thing a pattern points at.
- **Do** fill a section with the dots or the sand edge to edge.
- **Do** align everything to the masthead's 72rem.
- **Do** label illustrative examples' data as an example in the source,
  and never present it as measured.

### Don't:
- **Don't** nest a box in a box, or frame an artefact's frame.
- **Don't** put icons in tiles; icons stand bare.
- **Don't** underline or link a label; only what navigates is a link.
- **Don't** use the thin serif for paragraphs.
- **Don't** use eyebrows over headings, captions or legends under
  figures, status dots, or outlined chips that look like buttons.
- **Don't** use grain, noise, gradients as decoration, or metaphor
  props (wood, letterpress, receipts, tilted papers).
- **Don't** copy a reference's palette or ornaments (Convex's moss,
  clay and pixel marks were rejected as guessable).
- **Don't** draw a stack of boxes joined by arrows as a diagram.
- **Don't** invent a figure, or write a rhetorical question.
