# Card Visual Refresh — Design Spec

**Date:** 2026-03-15
**Scope:** Visual polish for project and research cards (elevated shadow style)
**Files affected:** `assets/js/main.js`, `assets/css/main.css`

---

## Goal

Refresh the visual style of project and research cards from a flat, unstyled Bootstrap column to a polished elevated-shadow card with hover lift. No changes to card content, data format, or grid layout.

---

## Approach

Wrap each card's visual content in a new `.project-card` div inside `renderItems()`. The outer `col-md-5` remains the grid column; `.project-card` is the visual card boundary. This cleanly separates layout from appearance.

---

## Changes

### `assets/js/main.js` — `renderItems()`

**Before:**
```html
<div class="col-md-5 ... bg-white mb-3">
  <div class="img-container">
    <picture>...</picture>
  </div>
  <p class="text-muted">...</p>
  <div class="container text-center btn-container">...</div>
</div>
```

**After:**
```html
<div class="col-md-5 ... mb-3">
  <div class="project-card">
    <div class="img-container">
      <picture>...</picture>
    </div>
    <div class="card-body-inner">
      <p class="text-muted">...</p>
      <div class="container text-center btn-container">...</div>
    </div>
  </div>
</div>
```

- Remove `bg-white` from the col div (visual background moves to `.project-card`)
- Remove `border border-white` from the `<img>` (card rounded corners handle the visual boundary)
- Add `<div class="card-body-inner">` wrapper around the text and button

### `assets/css/main.css`

Add new rules:

```css
.project-card {
  background: var(--color-card-bg);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.10);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
}

.project-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 28px rgba(0, 0, 0, 0.16);
}

.card-body-inner {
  padding: 12px 16px;
}

@media (prefers-reduced-motion: reduce) {
  .project-card {
    transition: none;
  }
}
```

Remove or replace the existing dark mode overrides for `.bg-white` and `.border-white` that target card appearance — those are no longer needed since `.project-card` uses `var(--color-card-bg)` directly.

---

## Dark Mode

No new work needed. `--color-card-bg` is already defined for both light and dark in `main.css`. The drop shadow is naturally invisible against dark backgrounds; the existing `--color-card-border` variable provides separation if a border is desired (not added in this change).

---

## Accessibility & Motion

The hover lift transition is wrapped in a `prefers-reduced-motion: reduce` media query that disables it. Existing card animations (`fadeInUp`) are unchanged.

---

## Out of Scope

- Card content changes (tags, dates, tech stack)
- Grid layout changes
- Hero or section background changes
- Dark mode border on cards
