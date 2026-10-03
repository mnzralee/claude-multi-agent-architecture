# Visual system: how to decide type, color, space, shape, depth, icons and imagery

This file is about DECIDING the visual language. `06-design-tokens.md` is about encoding it. Every choice here becomes a row in `design/DECISIONS.md` with a principle and a human reason (see section 10 of `04-human-interface-laws.md`).

## Contents

1. Order of decisions
2. Typography
3. Color
4. Space, grid and density
5. Shape (radius)
6. Elevation and depth
7. Iconography
8. Imagery and illustration
9. Texture and effects
10. Responsive behavior

---

## 1. Order of decisions

Decide in this order, because each fixes constraints for the next:
1. **Typography** (it fixes hierarchy, density and line length)
2. **Space and grid** (rhythm follows the type's line height)
3. **Color roles, then values** (meaning first, hex last)
4. **Shape and elevation** (personality, applied consistently)
5. **Iconography and imagery** (must match the type's stroke and the brand's voice)
6. **Motion language** (see `08-interaction-and-states.md` section 9)

Design the first screens in grayscale before color is decided [CRAFT-GRAYSCALE-FIRST]. If the hierarchy only works with color, it does not work.

## 2. Typography

Typography carries most of a product's personality and most of its usability. Decide it from the brief, not from habit.

**Selection criteria, in order:**
1. Reading conditions: long reading, glanceable dashboards, dense data, small mobile screens, outdoor glare.
2. Script and numeral coverage for every locale in the brief (Arabic, Devanagari, CJK need companion families; check diacritics render).
3. Personality from the brief's brand adjectives and the subject's vernacular (a legal tool, a kids' app and a trading desk share nothing).
4. Numerals: tabular figures for data, slashed or dotted zero for codes, lining figures for UI.
5. License (commercial use, self-hosting, app embedding) and payload (variable font size, subsets).

**Pairing rules:**
- One family is a valid, often better, answer. A variable family with optical sizes can carry display and text.
- Two families must differ clearly (serif with sans, grotesk with mono). Two similar sans faces look like a mistake.
- Three voices at most, each with a hard role boundary, for example display (brand moments only), UI (all interface text), numeric (amounts and IDs only). Write the boundaries into the system so nobody crosses them.

**Overused defaults.** These appear in most generated interfaces regardless of subject. They are not banned, but choosing one needs a recorded reason beyond "clean": Inter, Roboto, Arial, Open Sans, Poppins, Montserrat, Space Grotesk, Playfair Display plus Inter, system-ui alone as a display voice, and, as of 2026, Fraunces and Instrument Serif as the "editorial" default and Geist as the "dev tool" default. Any face becomes a default once generators converge on it, so the test is always: would this choice appear for a different subject? Inter is legitimate for dense product UI or public-sector work when the reason is recorded (tall x-height, tabular figures, wide script coverage).

**A starting palette of alternatives by character** (verify current license before use):

| Character | Options |
| --- | --- |
| Humanist sans: warm, legible, inclusive | Source Sans 3, IBM Plex Sans, Atkinson Hyperlegible Next, Figtree, Public Sans, Instrument Sans, Hanken Grotesk |
| Geometric sans: friendly, brand-forward | Outfit, Plus Jakarta Sans, Manrope, Sora, Urbanist, DM Sans |
| Grotesk: neutral, engineered | Geist, Schibsted Grotesk, Onest, Host Grotesk, Funnel Sans |
| Text serif: editorial, trustworthy | Source Serif 4, Newsreader, Literata, Spectral, Crimson Pro, EB Garamond |
| Display with character | Bricolage Grotesque, Syne, Unbounded, Gloock, Young Serif; Fontshare (free commercial): Satoshi, General Sans, Cabinet Grotesk, Clash Display, Zodiak, Gambetta (Fraunces and Instrument Serif are now overused, see above) |
| Mono: data, IDs, code | JetBrains Mono, IBM Plex Mono, Geist Mono, Commit Mono, Martian Mono |
| Paid, when budget allows | Söhne, Neue Haas Grotesk, GT America, Tiempos, Untitled Sans, Berkeley Mono |

**Scale.** Pick a modular ratio by density and context:

| Ratio | Use |
| --- | --- |
| 1.125 (major second) | dense apps, admin tools, data-heavy screens |
| 1.2 (minor third) | most product UI |
| 1.25 (major third) | balanced product plus marketing |
| 1.333 (perfect fourth) and up | editorial, marketing, expressive brands |

- Body text 16 px base (17 to 18 for reading-heavy products). Floor 12 px for captions; nothing smaller.
- App UI uses fixed rem steps (predictable layout). Marketing pages may use fluid type with `clamp()` between a min and max viewport (the Utopia method, utopia.fyi), so headlines scale smoothly. Always mix rem with vw inside `clamp()` and keep the max at most 2.5 times the min, or text stops scaling with browser zoom (WCAG 1.4.4).
- Display text no larger than about 6 rem and tracking no tighter than -0.04 em; `text-wrap: balance` on headings and `text-wrap: pretty` on body to avoid orphans.
- Name steps by role, never by size: `display`, `h1` to `h4`, `body-lg`, `body`, `body-sm`, `label`, `caption`, `mono`. Each role is a full row: family, size, line height, weight, tracking.
- Adjacent levels differ by a full step plus weight or color. A 1 to 2 px difference is imperceptible and reads as an error.

**Line height and tracking:**
- Body 1.45 to 1.6; headings 1.05 to 1.25 (larger text needs less); UI labels 1.2 to 1.4.
- Tighten large display sizes slightly (about -0.01 to -0.03 em); loosen small uppercase labels (about +0.02 to +0.06 em). Never letter-space cursive or joined scripts.
- Measure 45 to 75 characters for running text (`max-width: 65ch` is a good start).

**Numbers:** `font-variant-numeric: tabular-nums` in tables, amounts and anything that updates in place (so digits do not jitter); proportional in prose. Right-align numeric columns; pad decimals consistently.

**Loading:** self-host and subset; preload only the one or two files needed above the fold; use a metric-matched fallback (`size-adjust`, or `next/font` which does this) so the swap causes no layout shift. Every extra weight costs bytes on a mid-range phone.

## 3. Color

**Meaning first, values last.** List the roles the product needs before picking a single hex:
brand; primary action and its hover, active, disabled; secondary action; canvas (app background); surfaces (raised, sunken, overlay); borders (control boundary vs decorative divider); text (primary, secondary, muted, disabled, inverse, on-action); success, warning, danger, info (each with background, foreground, border); selected and active; focus ring; data visualization (separate palette).

**Build in OKLCH.** OKLCH lightness is perceptually uniform, so two colors at the same L look equally light regardless of hue. That makes ramps predictable and contrast reasoning possible. HSL lightness lies (HSL yellow at 50 percent looks far lighter than HSL blue at 50 percent).
- Generate each hue as a ramp of 11 to 12 steps (50 to 950) with evenly spaced L, chroma peaking mid-ramp and falling at the ends (very light and very dark colors cannot hold high chroma in sRGB).
- A slight hue drift along the ramp (lighter steps warmer, darker steps cooler, or the reverse) looks more natural than a fixed hue.
- Keep values inside sRGB unless you deliberately target P3: put P3 values behind `@media (color-gamut: p3)` with sRGB fallbacks. The contrast script warns when an oklch value is clipped.
- Derive states with relative color syntax instead of hand-picking: `oklch(from var(--action) calc(l - 0.06) c h)` for hover; `color-mix(in oklch, var(--action) 12%, transparent)` for tints. `contrast-color()` (Baseline since April 2026) can pick black or white text automatically, but still verify with the matrix.
- Reduce chroma near white and black, and avoid stacking translucent overlays (alpha on alpha), because contrast then depends on what happens to be underneath.

**Theme the browser defaults too:** text selection color, caret color, scrollbars (`scrollbar-color`), focus rings, link underline offset, and the `theme-color` meta tag. Unthemed defaults next to a themed UI look unfinished.

**Neutrals carry the product.** Most of the screen is neutral. Tint neutrals with a trace of the brand hue (chroma about 0.005 to 0.02) for cohesion; pure gray reads sterile. Decide the canvas deliberately: stark white, warm paper, cool gray and near-black each say something different, and each is a decision with a reason.

**Proportion.** Roughly 60 percent neutral surfaces, 30 percent secondary tones, 10 percent accent. The accent is scarce so it means something [LAW-VON-RESTORFF]. An accent used everywhere is noise.

**Action color.** The primary action color must hold white (or its on-color) text at 4.5:1. If the brand color fails, use a darker step of the brand hue for actions and reserve the pure brand color for large areas and marks.

**Semantic colors.** Each status gets background, foreground and border tokens, and every use carries an icon and words too [WCAG 1.4.1]. Decide what red means and keep it to that (danger only is a strong, reasoned choice; for example, a debit is not an error and need not be red).

**Dark theme is a second design, not an inversion.**
- Elevation flips: on dark, higher surfaces get lighter; shadows barely read.
- Lower chroma on saturated colors to stop edge vibration against dark surfaces.
- Avoid pure white text on pure black for long reading (halation); use an off-white on a dark neutral.
- Every semantic token is defined for both themes, and every pair passes contrast in both (`scripts/contrast-matrix.mjs` reports theme parity breaks).

**Culture.** Check the audience: red signals prosperity in China and danger in the West; white is mourning in parts of East Asia; green carries religious meaning in Muslim-majority regions; purple is mourning in Thailand and parts of Latin America. Do not let a culturally loaded color carry a money or status meaning without checking.

**Data visualization** gets its own palette: categorical (at most about 8, color-vision-safe, distinct in lightness too), sequential (one hue, light to dark), diverging (two hues through a neutral). If the session has a dataviz skill, use it.

## 4. Space, grid and density

**One spacing scale on a 4 px base:** 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128. Every gap comes from it. A `gap-[7px]` is a decision nobody made.

**Assign spacing jobs, not just values,** so the same relationship always gets the same space:

| Job | Typical value |
| --- | --- |
| Inside a control (icon to label) | 4 to 8 |
| Between related items in a group | 8 to 12 |
| Between groups inside a card or section | 16 to 24 |
| Between cards or tiles | 16 to 24 (pick one) |
| Between page sections | 48 to 96 (marketing), 24 to 40 (app) |
| Page gutter | 16 mobile, 24 to 32 tablet, 32 to 64 desktop |

The gap inside a group is always smaller than the gap between groups [GES-PROXIMITY].

**Grid.** 12 columns on desktop (divisible by 2, 3, 4 and 6), 4 to 6 on mobile, gutters 16 to 24. Define three content widths and make pages declare one: `canvas` (full app width, for example 72 to 80 rem), `measure` (about 40 rem, for forms and settings), `reading` (about 65 ch, for prose). A one-word width decision prevents dozens of drifting `max-w-*` literals.

**Layout model by task:**

| Model | Fits |
| --- | --- |
| Single centered column | one task at a time: sign-up, checkout, settings |
| App shell with sidebar | many sections, frequent switching: SaaS, admin |
| Bento or card grid | overview of independent signals: dashboards, home screens |
| Master-detail | browse then inspect: mail, CRM, file managers |
| Editorial | reading and storytelling: blogs, docs, marketing |
| Split screen | compare or pair: editor plus preview, auth with brand panel |
| Board or canvas | spatial work: kanban, design tools, maps |

**Density** is a per-audience decision recorded in the system: experts tolerate and prefer density (admin, trading, dev tools); public and occasional users need openness. A compact mode never shrinks touch targets below their floor. Large whitespace does not by itself make a design premium.

## 5. Shape (radius)

Radius is personality. Pick one personality and apply it with hierarchy:

| Radius range | Reads as |
| --- | --- |
| 0 to 2 px | precise, technical, editorial, institutional |
| 4 to 8 px | balanced, product-neutral |
| 12 to 20 px | friendly, consumer, soft |
| pill | playful; best kept to tags, chips, toggles |

- Larger components get larger radii (a dialog rounder than a button rounder than a checkbox), so the corner looks optically consistent.
- Nested elements are concentric: inner radius = outer radius minus the padding between them [HIG-HARMONY].
- One radius on everything regardless of size and hierarchy is a generated-UI tell.
- Optional craft upgrade: continuous corners via `@supports (corner-shape: squircle)` over a plain `border-radius` base.

## 6. Elevation and depth

Define a small elevation scale with a job for each level:

| Level | Job | Light theme | Dark theme |
| --- | --- | --- | --- |
| 0 canvas | app background | canvas color | canvas color |
| 1 raised | cards, panels | subtle 2-layer shadow or 1 px border | lighter surface plus hairline border |
| 2 floating | menus, popovers, toasts | medium shadow | lighter surface, border |
| 3 overlay | dialogs, sheets | large soft shadow plus scrim | lightest surface plus scrim |
| focus | keyboard focus | 2 px ring at 3:1, offset 2 px | same, re-checked for contrast |

- Shadows use two layers (a tight contact shadow plus a soft ambient one) tinted toward the background hue, not pure black at 10 percent. One light source, from above [CRAFT-SHADOW-LIGHT].
- Every depth cue must exist in both themes (shadow-only depth disappears on dark; glow-only depth disappears on light).
- The same grey shadow under every card is a generated-UI tell. Elevation means something: it says "this is above that".

## 7. Iconography

- One family, one stroke weight that matches the text weight it sits beside, one size set tied to text (14 with caption, 16 with body, 20 with large text, 24 for standalone).
- Optically align icons to the text baseline, not just the box center. `shrink-0` beside wrapping text.
- Label any icon whose meaning is not universal. Icon-only is acceptable for universally known glyphs (close, search, menu) and only with an accessible name. Never icon-only for destructive actions.
- Decorative icons are `aria-hidden="true"`.
- All icons come through one project module (for example `lib/icons.ts`), so the family can change in one place and lint can ban direct imports.
- Options by character: Lucide (clean, very common), Phosphor (six weights, warmer), Tabler (large set), Heroicons (Tailwind-native), Material Symbols (variable weight and fill), Iconoir, Remix Icon. Match the icon stroke to the typeface's stroke.
- Mirror directional icons in RTL; never mirror logos, clocks, media controls or numerals.

## 8. Imagery and illustration

- Every image has a job (explain, prove, set mood, identify) and alt text, or it is marked decorative.
- Write art direction rules once: photo style (candid or staged, natural or studio light), crop and aspect ratio tokens (for example 1:1, 4:3, 16:9, 3:4), color treatment (duotone, desaturated, brand-tinted), subject rules (real product in use beats abstract).
- Banned without a reason: stock "diverse hands holding phones", floating 3D blobs, generic isometric office illustrations, AI-generated imagery with garbled detail.
- Generated imagery needs owner approval and recorded provenance. Never text inside images (it cannot be translated, resized or read by screen readers).
- Use responsive images (`srcset`, `next/image`) with explicit dimensions to prevent layout shift.

## 9. Texture and effects

Gradients, grain, glass (backdrop blur), glows, noise and mesh backgrounds are legitimate tools with costs.
- Each needs a purpose in the rationale table: layering, focus, brand signature, or atmosphere for one hero moment.
- Each states its cost (paint time, GPU, battery) and a plain fallback; backdrop blur on large areas is expensive on mid-range phones.
- Spend effects in one place (the signature moment), not across every section.
- Text on gradients and images is checked for contrast at the worst point of the background.

## 10. Responsive behavior

Design behavior across sizes, not two screenshots. For a significant interface specify:

| Item | Specify |
| --- | --- |
| Breakpoint strategy | few rungs, set where the content breaks (for example 640, 1024, 1280), not at device names |
| Container queries | components that live in different slot sizes respond to their container, not the viewport |
| Fluid sizing | which sizes scale (display type, section spacing) and between which bounds |
| Content priority | what stays, what collapses, what moves behind an action |
| Navigation | how nav changes form (sidebar to bottom bar or drawer) |
| Touch | target sizes and spacing on touch layouts; no hover-only actions |
| Text | wrapping, truncation rules, longest allowed string |
| Images | crops and aspect ratios per size |
| Density | where density changes by size or input mode |
| Keyboard | focus order holds at every size |
| Orientation | landscape phones and tablets where relevant |

Mobile is not a squeezed desktop. Decide the primary viewport from the brief (where users actually are) and make the other sizes intentional, not collapsed.
