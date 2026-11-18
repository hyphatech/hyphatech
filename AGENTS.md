# AGENTS.md

The source of [hyphatech.io](https://hyphatech.io), Hypha's website: an
Astro site, built to static files and published by GitHub Pages. This file
is for anyone changing it, human or agent. Visitors start at the site.

## Commands

```sh
make setup   # once: install the dependencies
make dev     # the site with live reload on http://localhost:4321
make check   # type-check the pages and components
make build   # the static site into dist/, as Pages builds it
make help    # every other target, each with its one line
```

`.github/workflows/pages.yml` checks, builds and publishes the site to
hyphatech.io on every push to `main`.

Work lands on `main` directly, without a pull request: its owner
pushes `main`, which publishes it.

## Design

`DESIGN.md` is how the site looks and the patterns every page is built
from ("Sound by design"); `PRODUCT.md` is who each page is for. Read
both before changing a page. A page builds from the patterns there (the
`k-` classes in `src/styles/site.css` and the components); something
they cannot show becomes a pattern in `DESIGN.md` first.

## Components

Each open component has a page at `/stack/<slug>`, drawn from its entry
in `src/content/components.ts`: its words, install lines and snippets
copied from its README, and `version`, its latest release's tag. The
same entry gives its line in `/llms.txt`, the site for agents. The
site reads nothing from GitHub, so a component's release is not on its
page until that entry is changed: after releasing, set `version`, and
whatever the README changed that the entry copies.
