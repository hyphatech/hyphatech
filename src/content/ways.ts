import type { Path } from "../components/Paths.astro";

/* Held once so the landing and Hypha Stack end on the same three. */
export const ways: Path[] = [
  {
    title: "Talk to us",
    body: "Bring a product or an idea.",
    href: "mailto:hello@hyphatech.io",
    action: "hello@hyphatech.io",
    primary: true,
  },
  {
    title: "Read the code",
    body: "The stack is open: source, tests and documentation.",
    href: "https://github.com/hyphatech",
    action: "Open on GitHub",
    primary: false,
  },
  {
    title: "Read the principles",
    body: "The argument in full, in seven propositions.",
    href: "/principles",
    action: "Read the principles",
    primary: false,
  },
];
