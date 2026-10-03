# Design tokens: encoding the system so nothing drifts

Tokens are the contract between design and code. The goal is that changing the brand color, the radius personality or the dark theme is ONE edit, and that no component can quietly invent its own value.

## Contents

1. Three layers
2. Naming
3. The full token inventory
4. Where tokens live
5. Theming (light, dark, more)
6. Implementation: Tailwind v4, shadcn/ui, plain CSS
7. Rules that keep it DRY
8. Drift detection and CI
9. Versioning

---

## 1. Three layers

| Layer | Holds | Who may use it |
| --- | --- | --- |
| Foundation (primitive) | raw scales: color ramps (`purple-600`), type sizes, spacing steps, radii, durations, easings | only the semantic layer |
| Semantic (role) | meaning: `surface-raised`, `text-muted`, `action`, `on-action`, `border-control`, `danger-subtle`, `focus-ring` | every component |
| Component | one component's decisions: `button-height-md`, `card-padding` | that component only |

Why three layers: components reference roles, roles reference primitives. Rebranding edits the primitive or the mapping; theming swaps the mapping; no component file changes.

Maturity rules:
- Foundation and semantic tokens exist from the first screen.
- A component token is created only when a value repeats in that component family three times. Earlier, it is premature abstraction.
- No token exists without a current consumer. An unused token is deleted, because dead tokens mislead the next person.

## 2. Naming

Name by role, never by value or look. `--color-text-muted` survives a redesign; `--color-gray-500-text` does not; `--blue` is a lie the day the brand turns green.

Convention: `--<category>-<role>[-<variant>][-<state>]`

```
--color-surface-canvas      --color-text-primary       --color-action
--color-surface-raised      --color-text-secondary     --color-action-hover
--color-surface-sunken      --color-text-muted         --color-action-active
--color-surface-overlay     --color-text-disabled      --color-on-action
--color-border-control      --color-text-inverse       --color-focus-ring
--color-border-divider      --color-danger / --color-on-danger / --color-danger-subtle / --color-danger-text
                            (same four for success, warning, info: solid fill, text on fill, tinted background, text on tint)
--radius-sm  --radius-md  --radius-lg  --radius-full
--shadow-raised  --shadow-floating  --shadow-overlay
--duration-fast  --duration-base  --duration-slow    --ease-standard  --ease-enter  --ease-exit
```

**Pair rule:** every fill token has an `on-` foreground token (`action` and `on-action`, `danger` and `on-danger`, `danger-subtle` and `danger-text`). A component never picks its own text color on a colored surface, which is how unreadable text on colored cards happens.

Follow the project's existing naming if it has one (for example shadcn's `--primary` and `--primary-foreground`). Consistency beats the ideal convention.

## 3. The full token inventory

Check each category; mark N/A with a reason if the product does not need it.

| Category | Tokens |
| --- | --- |
| Color | primitives (ramps), semantic roles (section 2), data-viz palette |
| Typography | families (display, UI, mono), role rows (size, line height, weight, tracking) for display, h1 to h4, body-lg, body, body-sm, label, caption, mono |
| Space | the 4 px scale; optionally named jobs (`space-inset-sm`, `space-stack-md`, `space-section`) |
| Size | control heights (sm 32, md 40, lg 48 is a common set), icon sizes (14, 16, 20, 24), avatar sizes, touch target minimum (44) |
| Layout | container widths (canvas, measure, reading), breakpoints, grid columns and gutters |
| Shape | radius scale, border widths (hairline 1, control 1 or 1.5, focus 2) |
| Elevation | shadow scale, z-index scale (base, dropdown, sticky, overlay, modal, toast, tooltip) |
| Motion | durations (for example 120, 200, 320, 500 ms), easings (standard, enter, exit), distances |
| Opacity | disabled, scrim, hover overlay |
| Focus | ring width, offset, color |

z-index as tokens matters: a named scale stops the "z-index: 99999" arms race.

## 4. Where tokens live

- **Runtime source of truth: CSS custom properties.** They theme at runtime, cascade, and work in every framework.
- **A typed JS/TS export** only for consumers that cannot read CSS (charts, canvas, email, native). Generate it from the same source or read the variables at runtime; never hand-maintain a second copy.
- **Design-tool interchange (W3C Design Tokens Community Group JSON)** only when syncing with Figma (Tokens Studio, Style Dictionary). Do not add a token build pipeline the project does not need.
- **Code is the source of truth.** Documentation points to the token file and line; it does not restate values that can drift.

## 5. Theming (light, dark, more)

- Define semantic tokens on `:root` for the default theme and override them under a theme selector. Only the semantic layer changes per theme; components never contain `dark:` color decisions of their own.
- Respect the OS default (`prefers-color-scheme`) and allow a manual Light, Dark, System override that persists.
- Prevent the flash of the wrong theme: render the theme class on the server from a cookie, or run a tiny inline script in `<head>` before paint.
- Set `color-scheme: light dark` (or per theme) so native controls, scrollbars and form fields match.
- `light-dark()` is fine for small cases; a full mapping block per theme is clearer for a real system.
- A theme nobody tests is a theme that is broken. If the product will not support dark, remove it fully rather than ship a half-styled one.

## 6. Implementation

### Tailwind CSS v4 (CSS-first)

```css
/* app/globals.css */
@import "tailwindcss";

/* Dark mode follows a class or data attribute that the server sets. */
@custom-variant dark (&:where([data-theme="dark"], [data-theme="dark"] *));

/* Foundation: remove Tailwind's default palette so raw classes like bg-blue-500 cannot exist. */
@theme {
  --color-*: initial;

  /* Placeholders: the real families are chosen and justified in phase 4. */
  --font-display: "Brand Display", ui-serif, Georgia, serif;
  --font-sans: "Brand Text", ui-sans-serif, system-ui, sans-serif;
  --font-mono: "Brand Mono", ui-monospace, monospace;

  --radius-sm: 0.375rem;
  --radius-md: 0.625rem;
  --radius-lg: 1rem;

  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-enter: cubic-bezier(0, 0, 0, 1);
  --ease-exit: cubic-bezier(0.3, 0, 1, 1);
}

/* Semantic: mapped per theme. Values here are placeholders. */
:root {
  --surface-canvas: oklch(0.985 0.004 250);
  --surface-raised: oklch(1 0 0);
  --text-primary: oklch(0.22 0.02 250);
  --text-muted: oklch(0.48 0.02 250);
  --action: oklch(0.48 0.16 255);
  --on-action: oklch(0.99 0 0);
  --border-control: oklch(0.62 0.02 250);
  --border-divider: oklch(0.92 0.01 250);
  --focus-ring: oklch(0.55 0.18 255);
}
[data-theme="dark"] {
  --surface-canvas: oklch(0.17 0.01 250);
  --surface-raised: oklch(0.22 0.012 250);
  --text-primary: oklch(0.95 0.005 250);
  --text-muted: oklch(0.72 0.01 250);
  --action: oklch(0.68 0.14 255);
  --on-action: oklch(0.16 0.02 255);
  --border-control: oklch(0.55 0.015 250);
  --border-divider: oklch(0.3 0.01 250);
  --focus-ring: oklch(0.72 0.15 255);
}

/* Expose semantic roles as utilities: bg-surface-raised, text-fg, text-fg-muted, bg-action, text-on-action.
   Text roles are exposed as "fg" so the class reads text-fg-muted, not text-text-muted. */
@theme inline {
  --color-surface-canvas: var(--surface-canvas);
  --color-surface-raised: var(--surface-raised);
  --color-fg: var(--text-primary);
  --color-fg-muted: var(--text-muted);
  --color-action: var(--action);
  --color-on-action: var(--on-action);
  --color-border-control: var(--border-control);
  --color-border-divider: var(--border-divider);
  --color-focus-ring: var(--focus-ring);
}
```

Notes:
- `--color-*: initial` is the strongest DRY guard Tailwind offers: the raw palette no longer exists, so nobody can reach for `text-gray-500`.
- Tailwind v4 derives spacing from one `--spacing` base, so off-scale values like `p-7` still compile. Enforce the spacing scale with the guard script or a lint rule.
- Bind type roles as component classes or `@utility` rules (`.text-body`, `.text-label`) that set size, line height, weight and tracking together, so nobody mixes a size from one role with the weight of another.

### shadcn/ui

shadcn components read `--background`, `--foreground`, `--primary`, `--primary-foreground`, `--secondary`, `--muted`, `--muted-foreground`, `--accent`, `--destructive`, `--border`, `--input`, `--ring`, `--radius`, `--chart-1` to `--chart-5` and the sidebar set. Map YOUR semantic tokens onto these names (or rename to them) instead of keeping two parallel systems. New colors are added as a pair in both theme selectors plus an `@theme inline` mapping. Then customize the components' anatomy and variants; un-customized shadcn defaults are one of the most recognizable generated-UI looks. Before writing a custom component, check whether a registry component exists (`npx shadcn@latest add`), and prefer its built-in variants. Use `gap-*` over `space-y-*`, `size-*` for squares; every Dialog, Sheet and Drawer has a Title (visually hidden if needed).

### Plain CSS (any framework)

```css
@layer reset, tokens, base, components, utilities;
@layer tokens {
  :root { --space-1: 0.25rem; --space-2: 0.5rem; /* ... */ --text-primary: oklch(0.22 0.02 250); }
  [data-theme="dark"] { --text-primary: oklch(0.95 0.005 250); }
}
@layer components {
  .button { block-size: var(--size-control-md); padding-inline: var(--space-4); border-radius: var(--radius-md);
            background: var(--color-action); color: var(--color-on-action); }
}
```

Cascade layers make specificity predictable, which prevents the common bug where a type selector and a class selector cancel each other's padding.

## 7. Rules that keep it DRY

1. Components use semantic tokens only. A primitive (`purple-600`) or a literal (`#5B21B6`, `13px`) inside a component is a defect.
2. Inline `style` only for runtime-computed values (a progress width, a user-chosen color).
3. Conditional classes go through one helper (`cn()` with `clsx` plus `tailwind-merge`), never template-literal class strings that conflict silently.
4. If no scale step fits, the design is wrong, not the scale. Change the design or, with a recorded decision, add a step to the scale for everyone.
5. One source per fact: tokens in the token file, icons in the icon module, copy in the message catalog, money formatting in one formatter.

## 8. Drift detection and CI

- `scripts/check-raw-values.mjs` with a committed baseline: blocks new hex, rgb/oklch literals, arbitrary Tailwind values, raw palette classes, px font sizes and direct icon-library imports. The baseline can only shrink.
- `scripts/contrast-matrix.mjs` on the semantic pairs in every theme: fails the build when a pair misses its floor or passes in only one theme.
- A unit test asserts that every token the system documents exists in the CSS (catches deletions).
- Visual regression on the showcase page in both themes (Playwright screenshots or Storybook plus Chromatic) catches unintended token changes.
- Guards report three outcomes: clean, worse, or could not measure. "Could not measure" is never a pass.

## 9. Versioning

- Changing a token value is a minor change; renaming or removing a token is a major change.
- Deprecate before removing (keep the old name as an alias for at least one release, marked `@deprecated` in the docs).
- Record every token change that alters the look in `design/DECISIONS.md` with its reason.
