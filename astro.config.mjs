import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hyphatech.io",
  prefetch: { prefetchAll: true, defaultStrategy: "hover" },
  integrations: [sitemap({ filter: (page) => !page.includes("/404") })],
  vite: { plugins: [tailwindcss()] },
});
