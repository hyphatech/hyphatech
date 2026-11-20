/* What the Factory's page says: why each part of it matters to the
   person who uses it, its mechanism only as a short proof. Each claim
   is one hypha-haf's documentation states, built or designed, in the
   words of its lifecycle: six steps, Intent, Mapping, Scaffold,
   Composition, Validation and Release. */

import type { AstroComponent } from "@lucide/astro";
import FileText from "@lucide/astro/icons/file-text";
import Factory from "@lucide/astro/icons/factory";
import ScrollText from "@lucide/astro/icons/scroll-text";
import Receipt from "@lucide/astro/icons/receipt";
import Gauge from "@lucide/astro/icons/gauge";
import StepForward from "@lucide/astro/icons/step-forward";
import RotateCcw from "@lucide/astro/icons/rotate-ccw";
import Split from "@lucide/astro/icons/split";
import LibraryBig from "@lucide/astro/icons/library-big";
import MessageSquareText from "@lucide/astro/icons/message-square-text";
import FolderGit2 from "@lucide/astro/icons/folder-git-2";
import ShieldCheck from "@lucide/astro/icons/shield-check";
import BellOff from "@lucide/astro/icons/bell-off";
import Coins from "@lucide/astro/icons/coins";
import Blocks from "@lucide/astro/icons/blocks";
import Sparkles from "@lucide/astro/icons/sparkles";

export interface Feature {
  title: string;
  body: string;
}

/* A feature in the page's one card form: an icon, a title, its line,
   and a link where it names another page. */
export type Card = Feature & { icon: AstroComponent; link?: { href: string; text: string } };

/* The six steps, as the page tells them: the step, its claim, why it
   matters, and what it gives you. */
export interface Step {
  title: string;
  claim: string;
  body: string;
  gives: string[];
}

export const steps: Step[] = [
  {
    title: "Intent",
    claim: "Decided up front.",
    body: "Each decision only you can make comes one at a time, with the answer the Factory recommends and why it matters. Everything else is assumed in plain sight, for you to correct. The agreed decisions become PRDs, and nothing is built until they are signed.",
    gives: ["One question at a time", "Every assumption shown", "Your signature starts the work"],
  },
  {
    title: "Mapping",
    claim: "Looked up, never improvised.",
    body: "The signed PRDs are laid over the Ontology, which knows what each requirement means and which of them Hypha Stack covers. Those are taken as they are. Your model writes only what is unique to your product.",
    gives: ["Proven parts, reused", "New parts, built to fit"],
  },
  {
    title: "Scaffold",
    claim: "The shape comes first.",
    body: "On Hypha Stack, the Factory writes the whole application from the signed PRDs, every file it needs, with typed stubs left for the model. It compiles before any model is called.",
    gives: ["Computed, never guessed", "Compiles before a model is paid"],
  },
  {
    title: "Composition",
    claim: "Built behind gates.",
    body: "Your model replaces those stubs, piece by piece. Each counts only once the Factory's checks pass it, and one they refuse goes back for another try.",
    gives: ["Retried without you", "Checked before it counts"],
  },
  {
    title: "Validation",
    claim: "Proven on the running software.",
    body: "Every signed scenario is tested the way your users will use it, from the screens they see to the permissions behind them.",
    gives: ["Every requirement proven", "Built-in QA"],
  },
  {
    title: "Release",
    claim: "Ready to run.",
    body: "Every part of your project is released together, exactly as it passed. Explore in the Workbench, it's ready to deploy.",
    gives: ["Versioned and tagged"],
  },
];

/* What the Factory solves: a problem a cell, its fix in one line, a
   link down to the section that proves it, in the page's order. */
export const solved: Card[] = [
  { title: "Nothing built on a guess", icon: MessageSquareText, body: "Requirements are settled before a line is written.", link: { href: "#steps", text: "Six steps" } },
  { title: "Nothing written twice", icon: Blocks, body: "Proven components are reused as they stand.", link: { href: "#ontology", text: "The Ontology" } },
  { title: "No line crossed", icon: ShieldCheck, body: "A model's code runs walled off from your keys and your files, and reaches the internet through a guarded gate.", link: { href: "#harness", text: "The walls" } },
  { title: "No agent to babysit", icon: BellOff, body: "Refusals are retried and interrupted runs pick up again, with nobody watching.", link: { href: "#screen", text: "Hands off" } },
  { title: "No model lock-in", icon: Sparkles, body: "Whichever models you trust, in the cloud or local, each where it fits.", link: { href: "#models", text: "Any model" } },
  { title: "No tokens wasted", icon: Coins, body: "Mechanical work never reaches a model, and each change costs less.", link: { href: "#economy", text: "Less spent" } },
];

/* The two vaults: what each gives every model, and what holds them. */
export const vaults: Card[] = [
  { title: "Hypha Vault", icon: LibraryBig, body: "Hypha's rules, skills and Ontology, read throughout the work and never changed by a model." },
  { title: "Project Vault", icon: MessageSquareText, body: "Your business, its domains, its words and its decisions, kept as your own and grown as the product grows." },
  { title: "Asked once", icon: FolderGit2, body: "A settled decision is never asked again, and all later work starts from it." },
];

/* The harness, held and never told: what an agent is told in a prompt,
   beside what the Factory holds by a wall, row for row. Each of the
   Factory's is what hypha-haf's tools, gates and build pages say the
   harness does. */
export const held = {
  rows: ["Its files", "Its tests", "Your secrets", "The internet", "Going in circles", "Done"],
  before: {
    name: "An agent with instructions",
    icon: FileText,
    values: ["Any file, asked to keep to its own", "Run by the agent, said to pass", "In reach, kept out by a sentence", "Open, unless told otherwise", "Until someone notices", "When the agent says so"],
    story: "Every rule a sentence the model may follow.",
  },
  after: {
    name: "The Factory",
    icon: Factory,
    values: ["Only those its task may touch", "Run by the Factory, a new test required", "Never in reach", "Through a guarded gate", "Caught and ended", "When every check passes"],
    story: "Every rule a wall the model meets.",
  },
};

/* The screen: autonomy you can see. */
export const screen: Card[] = [
  { title: "Keeps pushing", icon: RotateCcw, body: "A refused piece goes back with what was wrong, then starts afresh." },
  { title: "Never stuck on one piece", icon: Split, body: "A piece that still fails is set aside with its diagnosis, and everything that does not need it goes on." },
  { title: "Nothing lost", icon: StepForward, body: "Work outlives the screen, and a stopped run resumes exactly where it left off." },
];

/* What the journal keeps: an account of every run without anyone
   watching one. */
export const record: Card[] = [
  { title: "Traced to its reason", icon: ScrollText, body: "Every change leads back to the requirement behind it and the checks that passed it." },
  { title: "Priced as you were billed", icon: Receipt, body: "Every call kept with its usage as your provider reported it, priced to the last fraction of a cent." },
  { title: "Kept within budget", icon: Gauge, body: "Each request carries a cost estimated at signing, and the work stays within it." },
];

