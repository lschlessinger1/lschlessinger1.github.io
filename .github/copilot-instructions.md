# AI Agent Working Instructions

Purpose: Enable an AI coding agent to quickly and safely contribute to this static personal portfolio site.

## Project Overview
- Pure static site: `index.html` + `assets/` (css, js, data json, images). No build step, bundler, or package manager.
- Dynamic sections ("Projects" & "Research") are populated client‑side by `assets/js/main.js` pulling structured arrays from `assets/data/{projects,research}.json`.
- Styling: Bootstrap 5.3 CDN + Font Awesome 4.7 CDN + custom overrides in `assets/css/main.css`.
- Images: PNG/JPG originals with optional same‑basename WebP variants. Script auto‑detects WebP via `HEAD` requests and inserts `<source>` when available.

## Key Files
- `index.html`: Single page layout + analytics (Google gtag) + schema.org Person JSON‑LD. Avoid breaking IDs used as anchors (`#about-section`, `#projects-section`, etc.).
- `assets/js/main.js`: All dynamic logic (fetch/retry, validation, rendering, smooth scrolling, reduced‑motion handling, WebP detection cache).
- `assets/data/projects.json` & `research.json`: Flat arrays of objects rendered in two‑column rows (2 items per row) with required keys.
- `assets/css/main.css`: Custom tweaks (do not inline styles into HTML; extend here).

## Data Contract (Do Not Break)
Each item in `projects.json` and `research.json` must include:
```
{
  "title": string,
  "description": string,
  "imgSrc": relative path under assets/img/,
  "imgAlt": string,
  "link": absolute or site‑relative URL,
  "linkText": short CTA label
}
```
- Maintain consistent ordering (chronological / significance as currently curated). Append new entries at the end unless user specifies reordering.
- Keep paths stable: `imgSrc` must match existing file; add corresponding WebP if optimizing.

## Rendering Logic Highlights
- `fetchData(type)`: Fetches `assets/data/${type}.json` with cache‑busting query param, 3 retry attempts (2s delay). On persistent failure inserts a `<p class='text-danger'>` message.
- `renderItems(items,type)`: Validates basic fields; batches into rows of two columns; first row images use `fetchpriority="high"` heuristic.
- `isWebpAvailable(src)`: Memoized HEAD probe; skip if original already webp.
- Smooth scrolling delegated to CSS; JS respects reduced motion media query.

## When Modifying
- Prefer enhancing progressive performance (e.g., add `width`/`height`, lazy loading already present). Avoid introducing heavy frameworks.
- Keep JS ES2017+ vanilla; no transpilation pipeline exists.
- Maintain accessibility: meaningful `alt`, preserve heading hierarchy (`h1` then section `h2`), retain `skip-link`.
- Preserve analytics snippet IDs (`G-E12E2H3CV2`). If adding new scripts, load async/defer and avoid blocking render.

## Adding New Projects/Research
1. Add image(s) in `assets/img/` (600x300 or proportionally similar recommended). Optionally add `.webp` variant.
2. Append object to the appropriate JSON file matching schema.
3. No manual HTML edits needed; JS will auto‑render.

## Common Pitfalls to Avoid
- Introducing trailing commas in JSON (will break fetch/parse).
- Renaming anchor IDs used by navbar links.
- Large unoptimized images without width/height causing layout shift.
- Blocking network calls in the main rendering loop; keep additional fetches async and cached.

## Performance & Optimization Opportunities (Safe Scope)
- Add more WebP variants alongside existing images.
- Inline critical CSS ONLY if a build step is later introduced; currently keep single stylesheet.
- Light DOM sanitization or stricter validation inside `renderItems` (e.g., fallback alt text) acceptable.

## Deployment / Hosting
- Assumed GitHub Pages root (custom domain via `CNAME`). Any new paths should be relative (no leading slash) to work locally and on Pages.
- No build command; pushing to `master` publishes.

## Contributing Conventions
- Keep edits minimal & atomic (one concern per commit).
- Use descriptive commit messages referencing the section (e.g., "data: add Vesuvius topogeo project" or "js: improve retry logging").

## Safe Extension Examples
- Add filtering or search: extend `renderItems` to filter pre‑render; avoid server requirements.
- Add light theme improvements: extend `main.css`; do not modify CDN links unless upgrading Bootstrap (test locally first).

If uncertain about a change that expands scope (build tooling, frameworks, backend), stop and request clarification.
