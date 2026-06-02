# CLAUDE.md

## Project Overview

Personal portfolio website (louschlessinger.com) hosted on GitHub Pages. Static HTML/CSS/JavaScript site showcasing projects and research.

## Tech Stack

- HTML5, CSS3, vanilla JavaScript (ES2020+)
- Bootstrap 5.3.6 (CDN)
- Inline SVG icons
- Node.js tooling for linting and image optimization

## Commands

- `npm install` — install dependencies
- `npm run lint` — run all linters (HTMLHint + ESLint)
- `npm run lint:html` — HTMLHint only
- `npm run lint:js` — ESLint only
- `npm run build` — render project/research cards from JSON into `index.html`
- `node tools/generate-webp.js <image-paths>` — generate WebP variants

## Project Structure

- `index.html` — single-page site with Bootstrap layout
- `assets/css/main.css` — custom styles with CSS custom properties
- `assets/js/main.js` — in-page navigation, scrollspy sync, copyright year
- `assets/data/` — `projects.json` and `research.json`, rendered into `index.html` at build time
- `assets/img/` — portfolio images (PNG/JPG with WebP variants)
- `tools/` — Node.js utility scripts
- `.github/workflows/ci.yml` — CI pipeline (lint + content-sync check on push/PR)

## Conventions

- Commit messages use conventional prefix format: `type: description` (e.g., `ux:`, `code:`, `seo:`, `a11y:`, `perf:`, `security:`, `chore:`, `docs:`)
- ESLint 9.x flat config (`eslint.config.cjs`)
- HTMLHint config (`.htmlhintrc`)
- PRs target `master` branch
- CI runs `npm ci && npm run lint` plus a build content-sync check on Node.js 20

## Key Patterns

- Project/research cards rendered from JSON into static HTML at build time (`tools/build-content.js`)
- WebP image optimization with fallback to original formats
- Accessibility: ARIA attributes, prefers-reduced-motion support
- Dark mode via `prefers-color-scheme`
- SRI hashes on CDN resources
