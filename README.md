lschlessinger1.github.io
========================
My personal website.

This project is a static portfolio website built with HTML, CSS, and JavaScript, utilizing Bootstrap for styling and
inline SVG icons. Project and research information lives in local JSON files (`projects.json` and
`research.json`) and is rendered into static HTML in `index.html` at build time via `npm run build`.

Key features include:

- Responsive design for various screen sizes.
- Smooth scrolling for navigation.
- Build-time rendering of project and research cards from JSON.
- Integration with Google Analytics and Microsoft Clarity for usage insights.

## Tooling

Install dev dependencies and run lint checks locally:

```bash
npm install
npm run lint
```

- `npm run build` — Render project/research cards from JSON into `index.html` (run after editing `assets/data/*.json`).
- `npm run lint:html` — Validate HTML files with HTMLHint.
- `npm run lint:js` — Lint `assets/js/` with ESLint (recommended ruleset, browser + latest ECMAScript).

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `master` and on pull requests. It installs
Node.js 20, performs `npm ci`, executes the lint suite, and verifies `index.html` is in sync with the JSON data
(by re-running `npm run build`) to keep the static site healthy.

> **Note:** `npm ci` requires a committed `package-lock.json`. Include lockfile changes in commits when adjusting
> dependencies so the workflow can run successfully.