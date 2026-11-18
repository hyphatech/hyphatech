import type { APIRoute } from "astro";
import { components, repoUrl } from "../content/components";

/* The site as llms.txt (llmstxt.org) for an agent told to use a
   component: what Hypha is, then each open component with its version,
   install line, docs and source, drawn from the entries its page uses so
   neither can say what the other does not. */

const site = "https://hyphatech.io";

const component = (c: (typeof components)[number]) => {
  const links = [...(c.docs ? [`[Docs](${c.docs})`] : []), `[Source](${repoUrl(c)})`];
  return `- [${c.name}](${site}/stack/${c.slug}/): ${c.tagline} Release ${c.version}, \`opam install ${c.packages.join(" ")}\`. ${links.join(", ")}`;
};

export const GET: APIRoute = () =>
  new Response(
    [
      "# Hypha",
      "",
      "> Hypha Stack: open components for agentic engineering, made to fit together, in OCaml.",
      "",
      "The open components are OCaml libraries, installed from open-opam:",
      "",
      "    opam repo add open-opam https://github.com/open-opam/opam-repository.git",
      "",
      "## Components",
      "",
      ...components.map(component),
      "",
      "## Optional",
      "",
      `- [Hypha Stack](${site}/stack/): the open components and the language they are written in`,
      `- [Hypha Autonomous Factory](${site}/haf/): from a request to durable software, autonomous between your signature and the release`,
      `- [Principles](${site}/principles/): the seven propositions Hypha is built on`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
