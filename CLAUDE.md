# CLAUDE.md

## Project Overview

Personal portfolio website (louschlessinger.com) hosted on GitHub Pages. Static HTML/CSS/JavaScript site showcasing projects and research.

## Tech Stack

- HTML5, CSS3, vanilla JavaScript (latest ECMAScript)
- Bootstrap 5.3.6 (CDN)
- Inline SVG icons
- Node.js tooling for linting, tests, content generation, and image optimization

## Commands

- `npm install` — install dependencies
- `npm ci` — reproduce the locked dependency set used by CI
- `npm run lint` — run all linters (HTMLHint + ESLint)
- `npm run lint:html` — HTMLHint only
- `npm run lint:js` — ESLint only
- `npm test` — run navigation regression tests with `node:test`
- `npm run build` — render project/research cards from JSON into `index.html`
- `npm run build:social` — generate the 1200×630 social preview image
- `npm run validate:social` — validate the committed social preview dimensions and format
- `node tools/generate-webp.js <image-paths>` — generate WebP variants

## Project Structure

- `index.html` — single-page site with Bootstrap layout
- `assets/css/main.css` — custom styles with CSS custom properties
- `assets/js/main.js` — mobile-menu collapse, scrollspy `aria-current` sync, and copyright year
- `assets/data/` — `projects.json` and `research.json`, rendered into `index.html` at build time
- `assets/img/` — portfolio images (PNG/JPG with WebP variants)
- `tests/` — `node:test` navigation regression tests
- `tools/` — content, WebP, social-card generation, and social-card validation scripts
- `.github/workflows/ci.yml` — CI pipeline (lint, tests, generated-content sync, and social validation)

## Conventions

- Commit messages use conventional prefix format: `type: description` (e.g., `ux:`, `code:`, `seo:`, `a11y:`, `perf:`, `security:`, `chore:`, `docs:`)
- ESLint 10.x flat config (`eslint.config.cjs`)
- HTMLHint config (`.htmlhintrc`)
- PRs target `master` branch
- CI uses Node.js 24 and runs install, lint, tests, build-sync, and social-preview validation

## Key Patterns

- Project/research cards rendered from JSON into static HTML at build time (`tools/build-content.js`)
- WebP image optimization with fallback to original formats
- Navigation behavior covered by `node:test` regression tests
- Social sharing uses a generated and validated 1200×630 PNG
- Accessibility: ARIA attributes, prefers-reduced-motion support
- Dark mode via `prefers-color-scheme`
- SRI hashes on CDN resources
