# Design system: <product name>

```
status: draft | approved (owner, date)
version: 1
direction: <D-id>
token source: <path to tokens.css or globals.css, the source of truth>
showcase: <route or file>
```

This document explains the system and its reasons. Values live in code; where this file shows a value, the code wins if they ever disagree.

## 0. Dials and posture

Expression <n>/10, motion <n>/10, density <n>/10. Posture: <Operate, Persuade, Read, Experience>. Every decision below should be consistent with these.

## 1. Rationale table

Every row cites a principle ID and a human reason from the brief.

| Decision | Choice | Principle | Human reason | Status | D-id |
| --- | --- | --- | --- | --- | --- |
| Typefaces and roles | | | | | |
| Type scale and ratio | | | | | |
| Canvas and neutrals | | | | | |
| Action color | | | | | |
| Accent and its limits | | | | | |
| Semantic colors and what red means | | | | | |
| Spacing base and jobs | | | | | |
| Grid and content widths | | | | | |
| Radius personality | | | | | |
| Elevation model (light and dark) | | | | | |
| Icon family, weight, sizes | | | | | |
| Imagery and illustration rules | | | | | |
| Motion language, durations, easings | | | | | |
| Density | | | | | |
| Themes supported | | | | | |

## 2. Typography

| Role | Family | Size (rem/px) | Line height | Weight | Tracking | Use |
| --- | --- | --- | --- | --- | --- | --- |
| display | | | | | | brand moments only |
| h1 | | | | | | |
| h2 | | | | | | |
| h3 | | | | | | |
| body | | | | | | |
| body-sm | | | | | | |
| label | | | | | | buttons, form labels |
| caption | | | | | | |
| mono | | | | | | amounts, IDs, code |

Role boundaries (who may use which family): <...>. Numerals: <tabular where, proportional where>. Loading: <self-hosted, subsets, preload, fallback>. License: <...>.

## 3. Color

Primitive ramps: <hues, steps, built in OKLCH>.

| Semantic token | Light | Dark | Role | Pairs with (contrast) |
| --- | --- | --- | --- | --- |
| surface-canvas | | | app background | |
| surface-raised | | | cards, panels | |
| surface-sunken | | | wells, inputs | |
| surface-overlay | | | dialogs, popovers | |
| fg (text-primary) | | | body text | on canvas, raised |
| fg-muted | | | secondary text | |
| border-control | | | input boundaries (3:1) | |
| border-divider | | | decorative separators | |
| action / on-action | | | primary buttons, links | |
| focus-ring | | | keyboard focus (3:1) | |
| danger, on-danger, danger-subtle, danger-text | | | | |
| success (same four) | | | | |
| warning (same four) | | | | |
| info (same four) | | | | |

Contrast matrix: run `node scripts/contrast-matrix.mjs design/contrast.json`. Result: <n of n pass, parity breaks: none>.

## 4. Space, layout, size

Spacing scale: <values>. Spacing jobs: <inside control, related, groups, cards, sections, gutters>.
Content widths: canvas <>, measure <>, reading <>. Grid: <columns, gutters per breakpoint>. Breakpoints: <values and why>.
Control heights: sm <>, md <>, lg <>. Touch target minimum: 44.

## 5. Shape and elevation

Radius scale and which component uses which: <...>. Nesting rule: inner = outer minus inset.
Elevation levels (light and dark treatments): <...>. z-index scale: <...>.

## 6. Iconography and imagery

Family, weight, sizes, labeling rule, the icon module path. Imagery rules: style, crops, treatment, banned.

## 7. Motion

| Token | Value | Use |
| --- | --- | --- |
| duration-fast | | press, toggle |
| duration-base | | state changes, popovers |
| duration-slow | | sheets, dialogs |
| ease-enter / ease-exit / ease-move | | |

What moves, what never moves, the reduced-motion rule, the one authored signature transition.

## 8. Voice

Link to `BRAND-SOUL.md` voice section, plus the glossary.

## 9. Components

Link to `COMPONENTS.md`. Primitive library and headless base: <...>. Variant axes in use: emphasis, size, tone, density.

## 10. Guards

| Guard | Command | Baseline |
| --- | --- | --- |
| Raw values | `node <skill>/scripts/check-raw-values.mjs src --allow <token file> --ban-import <icon pkg>=<icon module> --baseline .design-baseline.json` | |
| Duplicates | `node <skill>/scripts/find-duplicate-components.mjs src` | |
| Contrast | `node <skill>/scripts/contrast-matrix.mjs design/contrast.json` | |
| Accessibility | axe in tests and on key routes | zero serious or critical |

## 11. Changelog

| Version | Date | Change | D-id |
| --- | --- | --- | --- |
