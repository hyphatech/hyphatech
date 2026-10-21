import type { APIRoute } from "astro";
import { components, repoUrl } from "../content/components";

/* The site as llms.txt (llmstxt.org) for an agent told to use a
   component: what Hypha is, then each open component with its version,
   install line, docs and source, drawn from the entries its page uses so
   neither can say what the other does not. */

const site = "https://hyphatech.io";

const component = (c: (typeof components)[number]) => {
  const links = [...(c.docs ? [`[Docs](${c.docs})`] : []), `[Source](${repoUrl(c)})`];
  return `- [${c.name}](${site}/stack/${c.slug}): ${c.tagline} Release ${c.version}, \`opam install ${c.packages.join(" ")}\`. ${links.join(" · ")}`;
};

export const GET: APIRoute = () =>
  new Response(
    [
      "# Hypha",
      "",
      "> Hypha Stack: the missing foundation for agentic engineering. Components, tools, practices and an ontology, built to fit together.",
      "",
      "The open components are OCaml libraries, installed from Hypha's opam repository:",
      "",
      "    opam repo add hypha https://github.com/hyphatech/opam-repository.git",
      "",
      "## Components",
      "",
      ...components.map(component),
      "",
      "## Optional",
      "",
      `- [Hypha Stack](${site}/stack): how the components, the ontology and the practices fit together`,
      `- [Principles](${site}/principles): the seven propositions Hypha is built on`,
      "",
    ].join("\n"),
    { headers: { "Content-Type": "text/plain; charset=utf-8" } },
  );
