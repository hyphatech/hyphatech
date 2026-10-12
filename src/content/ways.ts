import type { Path } from "../components/Paths.astro";
import Mail from "@lucide/astro/icons/mail";
import CodeXml from "@lucide/astro/icons/code-xml";
import ScrollText from "@lucide/astro/icons/scroll-text";

/* Held once so the landing and Hypha Stack end on the same three. */
export const ways: Path[] = [
  {
    title: "Talk to us",
    body: "Bring a product or an idea.",
    href: "mailto:hello@hyphatech.io",
    action: "hello@hyphatech.io",
    icon: Mail,
    primary: true,
  },
  {
    title: "Read the code",
    body: "The stack is open: source, tests and documentation.",
    href: "https://github.com/hyphatech",
    action: "Open on GitHub",
    icon: CodeXml,
    primary: false,
  },
  {
    title: "Read the principles",
    body: "The argument in full, in seven propositions.",
    href: "/principles",
    action: "Read the principles",
    icon: ScrollText,
    primary: false,
  },
];
