import type { Path } from "../components/Paths.astro";
import Mail from "@lucide/astro/icons/mail";
import Layers from "@lucide/astro/icons/layers";
import Factory from "@lucide/astro/icons/factory";
import Handshake from "@lucide/astro/icons/handshake";

/* Every page ends on "Build with Hypha." and the same three, in the same
   order: the conversation first, on paper, then Services, then the one
   of the Stack and the Factory the page is not about. A page that is
   itself one of them, or under Services, takes the next in that order
   instead. Each card's line is its page's hero in brief, then the
   reader's reason, two sentences each, so any three read together on
   every page. */

const talk: Path = {
  title: "Talk to us",
  body: "Bring an idea, a product or a system. Questions and feedback are just as welcome.",
  href: "mailto:hello@hyphatech.io",
  action: "Get in touch",
  icon: Mail,
  primary: true,
};

const services: Path = {
  title: "Services",
  body: "A new product built to last, or the system your business runs on rebuilt. Hypha's expertise and its foundation, end to end.",
  href: "/services/",
  action: "Work with Hypha",
  icon: Handshake,
  primary: false,
};

const factory: Path = {
  title: "The Factory",
  body: "The autonomous factory for durable software. You make the decisions, the Factory does the rest.",
  href: "/haf/",
  action: "Explore the Factory",
  icon: Factory,
  primary: false,
};

const stack: Path = {
  title: "The Stack",
  body: "Open components made to fit together. Designed from the ground up to build software that lasts.",
  href: "/stack/",
  action: "Explore the Stack",
  icon: Layers,
  primary: false,
};

/* The landing, Hypha Stack and each component's page. */
export const ways: Path[] = [talk, services, factory];

/* The Factory's page. */
export const hafWays: Path[] = [talk, services, stack];

/* Services, and the two pages under it. */
export const serviceWays: Path[] = [talk, stack, factory];
