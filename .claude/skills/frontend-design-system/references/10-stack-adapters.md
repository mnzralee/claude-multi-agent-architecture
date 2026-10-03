# Stack adapters

The process and the rules are stack-agnostic. This file says where tokens live, what builds components, how variants are typed, and where the showcase runs, for each common stack. If the project already has a stack, use it; changing stack is an architecture decision for the owner, not a design decision.

## Default recommendation (when the owner has no preference)

| Concern | Choice | Why |
| --- | --- | --- |
| Framework | Next.js (App Router) with TypeScript; Vite plus React for a pure SPA; Astro for content and marketing sites | mature, server rendering for speed and SEO, large ecosystem |
| Styling | Tailwind CSS v4, CSS-first `@theme` | tokens become utilities; resetting the default palette makes raw values impossible |
| Accessible primitives | shadcn/ui (on Radix or Base UI) as owned source, restyled to the system | accessible behavior for free, code you control |
| Variants | class-variance-authority (cva) plus `tailwind-merge` via `cn()` | typed variant enums, no class conflicts |
| Icons | one family through `lib/icons.ts` | one place to swap, lint-enforced |
| Motion | CSS transitions first; Motion (formerly Framer Motion) for orchestrated or gesture motion | smallest tool that does the job |
| Forms | React Hook Form plus Zod, one schema shared with the server | one source per validation rule |
| Server state | TanStack Query (or the framework's data layer) | caching, retries, states in one place |
| Showcase | a `/design-system` route, or Storybook when the team is larger | the system must be visible to be reviewed |
| Tests | Vitest plus Testing Library; Playwright for flows and visual snapshots; axe-core | behavior over implementation |

## Per stack

### React / Next.js with Tailwind v4
- Tokens: `app/globals.css` (`@theme`, `:root`, `[data-theme="dark"]`, `@theme inline`). See `06-design-tokens.md`.
- Fonts: `next/font` once in the root layout (self-hosts, subsets, metric-matched fallback, no layout shift).
- Theme without flash: read a cookie in the root layout and set `data-theme` on `<html>` on the server; or `next-themes`.
- Server Components by default; `"use client"` only on interactive leaves. Runtime CSS-in-JS (styled-components, Emotion) fights Server Components; avoid it in new App Router work.
- Images: `next/image` with explicit dimensions.

### React with zero-runtime CSS-in-JS
- vanilla-extract: `createThemeContract` plus `createTheme` give typed tokens; `recipe()` gives typed variants.
- Panda CSS: tokens and semantic tokens in config, `cva`/recipes for variants, generates atomic CSS.
- StyleX: `defineVars` for tokens, `createTheme` for themes.
- All three type-check token usage, which is a stronger DRY guard than lint.

### Vue / Nuxt
- Tokens: CSS custom properties in a global stylesheet; Tailwind v4 or UnoCSS on top.
- Primitives: Reka UI (headless), shadcn-vue, or PrimeVue unstyled mode. Variants: cva works in Vue too.
- Fonts: `@nuxt/fonts`. Theme: `@nuxtjs/color-mode`.
- Showcase: a `/design-system` page or Histoire / Storybook for Vue.

### Svelte / SvelteKit
- Tokens: CSS custom properties; Tailwind v4.
- Primitives: Bits UI or Melt UI; shadcn-svelte as owned source. Variants: tailwind-variants or cva.
- Showcase: a route, or Storybook for Svelte.

### Angular
- Tokens: CSS custom properties; Angular Material's theming tokens if using Material, otherwise Tailwind.
- Primitives: Angular CDK (a11y, overlay, listbox), Spartan UI (shadcn-style for Angular), or Angular Material restyled.
- Showcase: Storybook for Angular.

### React Native / Expo
- No CSS variables: tokens are a typed TS object (one source), themed via context.
- Styling: NativeWind (Tailwind classes), Tamagui (tokens plus compiler), or Unistyles (themes plus variants).
- Platform conventions matter more here: follow Apple HIG on iOS and Material on Android for navigation, sheets, haptics and back behavior.
- Touch targets 44 pt iOS, 48 dp Android. Respect Dynamic Type and font scaling.

### Plain HTML, CSS and JS (or server-rendered templates)
- Tokens: custom properties in a `tokens` cascade layer; components as classes in a `components` layer (`@layer reset, tokens, base, components, utilities;`).
- Variants: modifier classes (`.button--primary`) or data attributes (`[data-emphasis="primary"]`).
- Interactive widgets: native elements first (`<dialog>`, `<details>`, popover attribute, `<select>`), then a small accessible library.
- Showcase: `assets/showcase.html` from this skill is already this stack.

## Mobile web and PWA notes (all stacks)
- Use `dvh`/`svh` instead of `100vh` (mobile browser bars change height).
- `padding-bottom: env(safe-area-inset-bottom)` on anything pinned to the bottom; `viewport-fit=cover` in the viewport meta.
- Never `maximum-scale=1` or `user-scalable=no`: it blocks zoom for low-vision users.
- Inputs at least 16 px so iOS Safari does not zoom on focus.
