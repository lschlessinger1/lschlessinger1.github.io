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

Install the locked dev dependencies and run the same core checks as CI:

```bash
npm ci
npm run lint
npm test
```

- `npm run build` — Render project/research cards from JSON into `index.html` (run after editing `assets/data/*.json`).
- `npm run build:social` — Generate the 1200×630 social preview image.
- `npm run validate:social` — Validate the committed social preview dimensions and format.
- `npm run lint:html` — Validate HTML files with HTMLHint.
- `npm run lint:js` — Lint browser code, tools, tests, and the ESLint config.
- `npm test` — Run navigation regression tests with Node's built-in test runner.

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `master` and on pull requests. It uses
Node.js 24, performs `npm ci`, runs lint and tests, verifies `index.html` is in sync with the JSON data, and validates
the committed social preview.

> **Note:** `npm ci` requires a committed `package-lock.json`. Include lockfile changes in commits when adjusting
> dependencies so the workflow can run successfully.
