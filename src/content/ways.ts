import type { Path } from "../components/Paths.astro";
import Mail from "@lucide/astro/icons/mail";
import Layers from "@lucide/astro/icons/layers";
import Factory from "@lucide/astro/icons/factory";
import Split from "@lucide/astro/icons/split";

/* Every page ends on "Build with Hypha." and the same three, in the same
   order: the conversation first, on paper, then modernisation, then the
   one of the Factory and the Stack the page is not about. A page that is
   itself one of them takes the next in that order instead. Each card's
   line is its page's hero in brief, then the reader's reason, two
   sentences each, so any three read together on every page. */

const talk: Path = {
  title: "Talk to us",
  body: "Bring an idea, a product, a system or a partnership. Questions and feedback are just as welcome.",
  href: "mailto:hello@hyphatech.io",
  action: "Get in touch",
  icon: Mail,
  primary: true,
};

const modernise: Path = {
  title: "Modernise",
  body: "The system your business runs on, moved part by part while it keeps running. Each part switches over only once it does everything the old one did.",
  href: "/modernise/",
  action: "See how it moves",
  icon: Split,
  primary: false,
};

const factory: Path = {
  title: "The Factory",
  body: "The autonomous factory for durable software. It takes your product from decisions to working software, with nothing to babysit.",
  href: "/haf/",
  action: "Explore the Factory",
  icon: Factory,
  primary: false,
};

const stack: Path = {
  title: "The Stack",
  body: "Open components, made to fit together. Every part is typed, tested and documented, so a mistake is caught before the code runs.",
  href: "/stack/",
  action: "Explore the Stack",
  icon: Layers,
  primary: false,
};

/* The landing, Hypha Stack and each component's page. */
export const ways: Path[] = [talk, modernise, factory];

/* The Factory's page. */
export const hafWays: Path[] = [talk, modernise, stack];

/* The modernisation page. */
export const modernWays: Path[] = [talk, factory, stack];
