lschlessinger1.github.io
========================
My personal website.

This project is a static portfolio website built with HTML, CSS, and JavaScript, utilizing Bootstrap for styling and
Font Awesome for icons. It dynamically loads project and research information from local JSON files (`projects.json`
and `research.json`) to populate the respective sections of the site.

Key features include:

- Responsive design for various screen sizes.
- Smooth scrolling for navigation.
- Dynamic content loading for projects and research.
- Integration with Google Analytics and Microsoft Clarity for usage insights.

## Tooling

Install dev dependencies and run lint checks locally:

```bash
npm install
npm run lint
```

- `npm run lint:html` — Validate HTML files with HTMLHint.
- `npm run lint:js` — Lint `assets/js/` with ESLint (recommended ruleset, browser + latest ECMAScript).

## CI

GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push to `master` and on pull requests. It installs
Node.js 20, performs `npm ci`, and executes the lint suite to keep the static site healthy.

> **Note:** `npm ci` requires a committed `package-lock.json`. Include lockfile changes in commits when adjusting
> dependencies so the workflow can run successfully.