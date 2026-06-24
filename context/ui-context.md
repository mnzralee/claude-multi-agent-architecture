# UI Context

> Fill in this file before starting any frontend work. Claude reads it to stay consistent with
> your visual language, color tokens, and component conventions. Update it whenever the design
> system changes.

## Theme

[Describe the overall visual language. Example: dark-only workspace with near-black backgrounds,
layered surfaces, and vivid accent colors for interactive elements. Or: light-mode default with
a soft neutral palette and a single brand accent. Be explicit about whether a second mode exists.]

## Colors

[Define your color tokens as CSS custom properties. All components must use these tokens; no
hardcoded hex values in component files.]

| Role            | CSS Variable       | Value    |
| --------------- | ------------------ | -------- |
| Page background | `--bg-base`        | `#[hex]` |
| Surface         | `--bg-surface`     | `#[hex]` |
| Primary text    | `--text-primary`   | `#[hex]` |
| Muted text      | `--text-muted`     | `#[hex]` |
| Primary accent  | `--accent-primary` | `#[hex]` |
| Border          | `--border-default` | `#[hex]` |
| Error           | `--state-error`    | `#[hex]` |
| Success         | `--state-success`  | `#[hex]` |

[Add more roles as needed: warning, info, hover overlays, focus rings, etc.]

## Typography

| Role      | Font                  | CSS Variable  |
| --------- | --------------------- | ------------- |
| UI text   | [e.g. Geist Sans]     | `--font-sans` |
| Code/mono | [e.g. Geist Mono]     | `--font-mono` |

[Include font loading strategy here if relevant: local, CDN, next/font, etc.]

## Border Radius

| Context           | Class / Value    |
| ----------------- | ---------------- |
| Inline / small UI | `rounded-[size]` |
| Cards / panels    | `rounded-[size]` |
| Modals / overlays | `rounded-[size]` |

## Component Library

[Name the component library and its location. Example: shadcn/ui on top of Tailwind CSS.
Components live in `components/ui/`. Use the CLI (`npx shadcn-ui@latest add <component>`)
to add new primitives rather than writing them from scratch. Custom variants go in the same
directory with a `-custom` suffix.]

## Layout Patterns

[Document the recurring layout shapes in the app. Examples:]

- [Pattern: full-viewport split with left sidebar, center canvas, right sidebar]
- [Pattern: sidebars at fixed width with a 1px border separator]
- [Pattern: modals as centered overlays with backdrop blur]
- [Pattern: top navbar with a bottom border, sticky on scroll]

[Be specific enough that a new component can be placed without needing to inspect existing ones.]

## Icons

[Name the icon library and usage conventions. Example: Lucide React. Stroke-based icons only.
Sizes: `h-4 w-4` for inline text, `h-5 w-5` for buttons and nav items. Never fill icons unless
the icon set requires it.]

## Spacing and Sizing Scale

[Optional but recommended. If the project uses a custom Tailwind spacing scale or a fixed set
of spacing steps, list them here so Claude does not invent arbitrary margins.]

| Step | Value       | Common use                   |
| ---- | ----------- | ---------------------------- |
| 1    | `[e.g. 4px]`  | Tight inline gaps            |
| 2    | `[e.g. 8px]`  | Component internal padding   |
| 3    | `[e.g. 16px]` | Section gaps                 |
| 4    | `[e.g. 24px]` | Card padding                 |
| 5    | `[e.g. 32px]` | Page-level section spacing   |

## Accessibility Conventions

[Optional. State any a11y rules the project enforces: minimum contrast ratio, keyboard
navigation requirements, ARIA landmark usage, focus-visible ring style, etc.]

## Animation and Motion

[Optional. State the motion budget: no motion by default with `prefers-reduced-motion` support,
or a specific transition duration (e.g. 150ms ease-out) for all interactive state changes.]
