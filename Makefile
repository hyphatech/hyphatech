# `make help` lists the targets.

PORT_DEV ?= 4321

.PHONY: help setup dev build preview stop check clean

help: ## list the targets
	@grep -E '^[a-z-]+:.*## ' $(MAKEFILE_LIST) | awk -F':.*## ' '{printf "  %-10s %s\n", $$1, $$2}'

setup: ## install the dependencies, once
	npm install

dev: ## run the site with live reload on http://localhost:$(PORT_DEV)
	npx astro dev --port $(PORT_DEV)

build: ## build the static site into dist/
	npx astro build

preview: build ## serve the built site in the background, as Pages will
	npx astro preview --port $(PORT_DEV)

check: ## type-check the pages and components
	npx astro check

clean: ## remove what a build leaves
	rm -rf dist .astro

stop: ## stop the background preview server
	npx astro preview stop
