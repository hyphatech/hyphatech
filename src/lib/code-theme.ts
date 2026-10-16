import type { ThemeRegistration } from "shiki";

/* Code in the site's own tokens, so a block follows the ground it sits
   on, night or paper: ink for the text, gold for the words of the
   language, graphite for what is said about it. */
export const codeTheme: ThemeRegistration = {
  name: "hypha",
  type: "dark",
  fg: "var(--color-ink)",
  bg: "var(--color-panel)",
  settings: [
    { settings: { foreground: "var(--color-ink)", background: "var(--color-panel)" } },
    { scope: ["comment", "punctuation.definition.comment", "string.comment"], settings: { foreground: "var(--color-graphite)", fontStyle: "italic" } },
    { scope: ["keyword", "storage", "keyword.operator.word", "keyword.other"], settings: { foreground: "var(--color-accent)" } },
    { scope: ["string", "string.quoted", "markup.inline.raw"], settings: { foreground: "color-mix(in oklab, var(--color-ink) 72%, var(--color-accent))" } },
    { scope: ["constant.numeric", "constant.language", "constant.character"], settings: { foreground: "var(--color-accent)" } },
    { scope: ["entity.name.type", "support.type", "entity.name.class", "entity.name.namespace", "support.other.module"], settings: { foreground: "var(--color-ink)", fontStyle: "" } },
    { scope: ["punctuation", "keyword.operator", "meta.brace"], settings: { foreground: "var(--color-graphite)" } },
    { scope: ["meta.prompt", "punctuation.definition.prompt", "comment.line.shell-session"], settings: { foreground: "var(--color-graphite)" } },
  ],
};
