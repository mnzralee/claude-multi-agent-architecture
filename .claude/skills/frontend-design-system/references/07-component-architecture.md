# Component architecture: plan once, build once, reuse everywhere

The goal: every piece of UI exists exactly once, every screen is composed from the library, and nobody can quietly create a second Button. DRY here means one source per piece of KNOWLEDGE, not one function per similar-looking block.

## Contents

1. Plan before code: the inventory
2. The layers
3. Folder structure and the three homes
4. Building primitives
5. Variant API design
6. Composition over configuration
7. When to extract (and when not to)
8. The journey pattern for multi-step flows
9. Single sources of truth
10. The living showcase
11. Guards that keep it DRY
12. Build order
13. Governance

---

## 1. Plan before code: the inventory

Before any component code, produce `design/COMPONENTS.md`:

1. **List every screen** in the first release (from the brief's jobs), with its entry path.
2. **List the UI pieces on each screen** (header, filters, table, row actions, empty state, form fields, dialogs).
3. **Cluster** pieces that do the same job into one component, even when they look slightly different today.
4. **Count occurrences.** A piece on 3 or more screens is a shared component; a piece on 1 screen lives with that screen.
5. **Assign a layer** (section 2) and mark each REUSE (exists), EXTEND (exists, needs a variant) or NEW.
6. **Write the states matrix** for every shared component (default, hover, focus-visible, active, disabled, loading, error, empty, selected as applicable).

Why: the duplication you find in a codebase is almost always duplication nobody planned against. A one-hour inventory saves the four-copies-of-the-step-indicator refactor later.

## 2. The layers

| Layer | Examples | Knows about |
| --- | --- | --- |
| Tokens | colors, type, space, radius, motion | nothing |
| Primitives | Button, IconButton, Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Dialog, Sheet, Popover, Tooltip, Menu, Tabs, Accordion, Badge, Avatar, Toast, Separator, Spinner, Skeleton | tokens only |
| Layout | PageContainer (width: canvas, measure, reading), PageHeader, Stack, Inline, Grid, Section, AppShell, Sidebar, Bento and Tile | tokens, primitives |
| States | EmptyState, ErrorState, LoadingState (skeleton sets), NotFound, PermissionDenied, OfflineBanner | tokens, primitives |
| Patterns (composites) | FormField (label, hint, error), ErrorSummary, SearchField, FilterBar, DataTable, Pagination, StepIndicator, ConfirmDialog, CommandPalette, FileDrop, CodeField | primitives, layout, states |
| Domain | InvoiceRow, ProjectCard, TransferReceipt, MemberAvatarStack | everything above plus domain types |
| Screens and experiences | InvoicesScreen, CheckoutExperience | everything above plus data hooks |

Rules:
- Imports flow one way: screens import domain, domain imports patterns, patterns import primitives. Never upward. Enforce with dependency-cruiser or eslint `no-restricted-imports`, including no circular imports.
- Primitives and layout contain no domain knowledge and no data fetching.
- Domain and pattern components are presentational: props in, callbacks out. Data fetching, routing and flow state live in screens and hooks. This keeps every component renderable in isolation (showcase, tests, Storybook).

## 3. Folder structure and the three homes

A React or Next.js example (adapt names to the stack in `10-stack-adapters.md`):

```
src/
  app/                    routes only (framework files plus private _components/)
  components/
    ui/                   primitives, one file or folder per job, one barrel
    layout/               PageContainer, PageHeader, Stack, Grid, AppShell
    states/               EmptyState, ErrorState, skeleton sets
    patterns/             FormField, DataTable, StepIndicator, ConfirmDialog
    <domain>/             components named by the noun the user sees (invoices/, projects/)
  lib/
    utils.ts              cn() and tiny helpers
    icons.ts              the ONLY place the icon library is imported
    format/               money, dates, numbers (Intl), one formatter per kind
    <domain>/             types, schemas, query keys, data hooks, flow models (no JSX)
  styles/
    tokens.css            the token source (or globals.css with @theme)
  i18n/                   message catalogs
```

**The three homes for any component:**
1. Used by one route only: that route's private `_components/` folder.
2. Used by two or more routes in one domain: `components/<domain>/`.
3. Domain-free: `components/ui`, `layout`, `states` or `patterns`.

When a component gains a second consumer, it moves up one home. When it loses consumers, it moves down or is deleted.

No generation folders (`v2/`, `-legacy`, `-new`, `NewButton`). The generation lives in git history; two generations in the tree means two sources of truth.

## 4. Building primitives

- **Build on an accessible headless library**, never from scratch for complex widgets. Focus traps, roving tabindex, typeahead, portal layering and screen-reader semantics take months to get right. Options: Radix UI, React Aria Components, Base UI, Ark UI, Headless UI (React); Reka UI (Vue); Bits UI or Melt UI (Svelte); Angular CDK; Kobalte (Solid).
- **Wrap vendored code, do not fork it.** If you copy shadcn/ui components into the repo, treat them as a starting point you own: restyle to your tokens and anatomy, document the changes, and keep upstream fixes mergeable.
- **One primitive per job.** One Button with variants, not PrimaryButton, GhostButton and LinkButton as separate files.
- **Pass through native props and ref** (`...props` onto the underlying element; React 19 passes `ref` as a normal prop, older React uses `forwardRef`), and merge `className` last via `cn()`.
- **Style state with data attributes** the headless library already sets (`data-state="open"`, `data-disabled`, `aria-selected`), not with parallel boolean props.
- **Every primitive ships with:** its states matrix, keyboard behavior, accessible name rules, a showcase entry with every variant and state, and at least one test.

## 5. Variant API design

Variants are typed enums on named axes, not a pile of booleans.

```ts
// components/ui/button.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const button = cva(
  "inline-flex items-center justify-center gap-2 font-medium transition-[background-color,box-shadow] " +
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      emphasis: {
        primary: "bg-action text-on-action hover:bg-action-hover",
        secondary: "border border-border-control bg-surface-raised text-fg hover:bg-surface-sunken",
        ghost: "text-fg hover:bg-surface-sunken",
        danger: "bg-danger text-on-danger hover:bg-danger-hover",
      },
      size: {
        sm: "h-8 px-3 text-label rounded-sm",
        md: "h-10 px-4 text-label rounded-md",
        lg: "h-12 px-5 text-body rounded-md",
      },
    },
    defaultVariants: { emphasis: "secondary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof button> {
  loading?: boolean;
}

export function Button({ emphasis, size, loading, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button className={cn(button({ emphasis, size }), className)} disabled={disabled || loading} aria-busy={loading} {...props}>
      {loading && <Spinner aria-hidden className="size-4" />}
      {children}
    </button>
  );
}
```

Why these choices:
- The default emphasis is `secondary`, not `primary`. One primary per view is a design rule [HIG-HIERARCHY]; making primary opt-in enforces it.
- `loading` keeps the label and width and adds a spinner, per the feedback rule in `08-interaction-and-states.md`.
- Axes are named by meaning (`emphasis`, `tone`, `size`, `density`), so a reviewer can judge a usage in one word.

Smells:
- `isPrimary`, `isLarge`, `isRounded`, `noPadding` booleans: they combine into impossible states. Use an enum axis.
- More than about 4 domain props (not counting variant axes, native attributes and `className`): the component is probably two components, or wants composition (section 6) or a typed object prop.
- A prop that only one call site uses: that call site wants a domain component that wraps the primitive.
- A `style` or `className` override that fights the variant (`className="bg-red-500"` on a Button): the variant set is missing a case. Add the variant with a decision, or the call site is wrong.

## 6. Composition over configuration

Prefer slots and compound components to configuration props, because configuration props grow forever and composition does not.

```tsx
// Configuration (grows a new prop for every case):
<Card title="Invoices" subtitle="May" action={<Button />} footer={...} headerIcon={...} />

// Composition (closed for modification, open for extension):
<Card>
  <Card.Header>
    <Card.Title>Invoices</Card.Title>
    <Card.Action><Button size="sm">Export</Button></Card.Action>
  </Card.Header>
  <Card.Body>...</Card.Body>
</Card>
```

Use `asChild` (Radix Slot) or a polymorphic `as` prop so a Button can render a link without duplicating styles, keeping semantics correct (links navigate, buttons act).

## 7. When to extract (and when not to)

- **Extract on the third repetition.** Two similar blocks are a coincidence; three are a pattern.
- **Ask the knowledge question:** "If one of these changes, must the other change too?" If yes, it is one piece of knowledge and must live once. If no, the similarity is coincidental, and merging them couples two things that will drift apart (the wrong abstraction is worse than duplication).
- **Search before writing.** Before creating any component, search the library and the codebase for the job (`grep -ri "stepper\|steps\|progress" src/components`). Creating a sibling of an existing component is a defect.
- **Tests are DAMP, not DRY.** Share test builders and fixtures, not assertions. Each test should read on its own.

## 8. The journey pattern for multi-step flows

Sign-up, onboarding, checkout, KYC, wizards. Every journey uses the same five parts:

1. **Steps list**: `const STEPS = ["account", "profile", "verify"] as const;` the only list of steps.
2. **Flow model**: a pure reducer or state machine (`flow-model.ts`), exhaustively unit-tested, no React.
3. **Flow hook**: binds the model to React and the API, returns `{ step, state, actions }`.
4. **Experience**: one client entry component that renders the shell and switches on the step.
5. **Steps**: presentational. Props in, callbacks out. No fetching, no routing, and they never decide the next step.

The shell (header, StepIndicator, content column, action bar) mounts once, at the highest level that contains every step, so the layout never jumps between steps and one journey never looks like two products.

## 9. Single sources of truth

| Knowledge | One home |
| --- | --- |
| Design values | the token file |
| Class merging | `cn()` in `lib/utils` |
| Icons | `lib/icons` (lint bans direct library imports elsewhere) |
| Money, dates, numbers | `lib/format` using `Intl` |
| User-facing copy | i18n message catalogs (even single-language apps benefit: one place to edit words) |
| Error messages | one error-code to message map |
| API base URLs and query keys | one module each |
| Steps of a journey | the steps list |
| Loading, empty, error visuals | `components/states` |
| Validation schemas | one schema per shape, shared by form and server (for example Zod with `z.infer` types) |

## 10. The living showcase

The design system is not done until it can be SEEN. Build a showcase route (`/design-system`, dev-only or behind auth) or a Storybook that renders:
- every token: color swatches with their contrast against the surfaces they sit on, the type scale with real sample text, spacing, radius, shadows, motion samples;
- every component in every variant and every state, side by side;
- a theme toggle (light, dark), a direction toggle (LTR, RTL), and a reduced-motion preview;
- one or two real screens composed only from the library, to prove the parts add up.

`assets/showcase.html` in this skill is a standalone starter you can adapt or port. Screenshot the showcase in both themes and review it with the owner before building screens. It is also the visual-regression baseline.

## 11. Guards that keep it DRY

| Guard | Catches | Tool |
| --- | --- | --- |
| Raw values | hex, rgb/oklch literals, arbitrary Tailwind values, raw palette classes, px font sizes, banned imports | `scripts/check-raw-values.mjs` with baseline |
| Duplicates | component files that are probably copies | `scripts/find-duplicate-components.mjs` |
| Layer direction and cycles | upward imports, circular imports | dependency-cruiser or eslint `import/no-cycle` plus `no-restricted-imports` |
| Dead code | unused components, exports, tokens, dependencies | knip |
| Complexity | oversized components | eslint: cognitive complexity 15, max-lines 300 warn and 600 error, max-lines-per-function 60, max-depth 3, max-params 3 |
| Contrast | token pairs under floor, theme parity | `scripts/contrast-matrix.mjs` |
| Visual drift | unintended changes | Playwright screenshots or Chromatic on the showcase, both themes |
| Accessibility | mechanical violations | axe-core in component tests and on key routes (zero serious or critical) |

Ratchet philosophy: new guards ship as warnings with a committed baseline that can only shrink. Accepting new debt requires regenerating the baseline, which shows in the diff and gets reviewed. A guard that is permanently red carries the same information as one that is permanently green: none.

## 12. Build order

1. Tokens (and the contrast matrix passing in every theme)
2. Primitives
3. Layout and states
4. Patterns
5. The showcase, reviewed and approved
6. Domain components
7. Screens, composed only from the above
8. Signature moments last (they need a solid base to stand out against)

Do not build screens before the primitives they need exist. A screen built first invents its own button.

## 13. Governance

- Adding a shared component: search first, write the spec (`templates/component-spec.md`), add it to the showcase, add it to `COMPONENTS.md`.
- Changing a shared component: check its consumers; a visual change gets a decision row.
- Deprecating: mark `@deprecated` with the replacement, migrate consumers, then delete. Never leave both.
- A touched file moves toward the standard, never away (Boy Scout rule), but do not rewrite unrelated code in drive-by changes.
