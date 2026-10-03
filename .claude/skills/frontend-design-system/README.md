# frontend-design-system

A design-system-first frontend operating standard for Claude Code. It runs a project from intake questions to references, brand directions, tokens, a living showcase, a DRY component library, screens and quality gates. Every design decision must cite a human-interface principle (Apple HIG, Norman, Nielsen, Gestalt, the laws of UX, WCAG 2.2) and the human reason it matters. That is the rule against generic AI-looking UI.

## Install locations

- **Inside this kit:** it ships at `.claude/skills/frontend-design-system/`, so cloning the kit or installing it as a plugin includes it.
- **Personal (all your projects):** copy the folder to `~/.claude/skills/frontend-design-system/`.
- **One project only:** copy the folder to `<repo>/.claude/skills/frontend-design-system/` and commit it.
- **Other AI tools (Cursor, ChatGPT, v0, Lovable):** paste `MASTER-PROMPT.md` as the project or system prompt.

## Use

It triggers on its own for frontend, UI, design system, branding and UI review requests. You can also call it directly:

```
/frontend-design-system kickoff a booking app for physiotherapy clinics
/frontend-design-system system
/frontend-design-system brand
/frontend-design-system component DataTable with sorting and row actions
/frontend-design-system screen the invoice detail page
/frontend-design-system audit src/app
/frontend-design-system review the checkout flow at 390 and 1280, both themes
```

## What is inside

```
SKILL.md                         the operating standard: directives, precedence, modes, the 8-phase pipeline, artifacts
MASTER-PROMPT.md                 portable single-file version for any AI tool
references/
  01-intake.md                   question rounds, surface posture, design dials, the Design Read
  02-references-and-moodboard.md how to ask for references, curated galleries and products, how to analyze them
  03-brand-and-directions.md     brand principles, uniqueness levers, signature moments, directions, 23 slop tells
  04-human-interface-laws.md     HIG, Norman, Nielsen, Shneiderman, Gestalt, UX laws, craft rules, numbers, rationale protocol
  05-visual-system.md            deciding type, color (OKLCH), space, shape, elevation, icons, imagery, responsive
  06-design-tokens.md            three token layers, naming, theming, Tailwind v4, shadcn, drift detection
  07-component-architecture.md   inventory, layers, folders, variants, composition, journeys, DRY guards, build order
  08-interaction-and-states.md   hierarchy, feedback, states, forms, flows, overflow, honesty, dark patterns, motion, copy
  09-accessibility-i18n.md       WCAG 2.2 floors, component patterns, i18n, RTL, scripts
  10-stack-adapters.md           default stack, Next.js, Vue, Svelte, Angular, React Native, plain CSS
  11-quality-gates.md            phase gates, verification ladder, capture matrix, 15 review categories, definitions of done
templates/                       design-brief, references, brand-soul, design-directions, decisions, design-system,
                                 components-inventory, component-spec
scripts/
  contrast-matrix.mjs            WCAG contrast plus APCA (advisory) for token pairs in every theme; handles hex, rgb, oklch, alpha
  check-raw-values.mjs           finds hex, color functions, arbitrary Tailwind values, raw palette classes, px fonts, banned imports; shrink-only baseline
  find-duplicate-components.mjs  finds component files that are probably copies
assets/
  showcase.html                  living style guide starter: tokens, type, space, buttons, fields, status, states; theme, RTL and motion toggles; live contrast
```

The scripts need Node 18 or later and have no dependencies.

## Sources merged

- **In-house:** a production fintech codebase's design discipline:
  - its UI/UX engineering skill (modes, charter, directions, contract, states matrix, review categories);
  - its brand and content skill (brand-soul principles, a three-voice type system, honesty rules);
  - its HIG-as-code, UI design loop, frontend engineering, faithful presentation, anti-entropy and complexity rules;
  - its design-soul document (peak-end signature moments), UI kit architecture spec and frontend engineering standard.
- **Public:**
  - Anthropic's frontend-design skill (2026 rewrite).
  - Vercel Web Interface Guidelines.
  - Impeccable, taste-skill, Emil Kowalski's animation skills, ui-ux-pro-max, baseline-ui, the official shadcn skill, a Refactoring UI skill.
  - Apple Human Interface Guidelines, WCAG 2.2 (ISO/IEC 40500:2025), DTCG token format 2025.10, Tailwind v4 theme docs, Utopia.

## Working with an existing design system

If a project already has a locked design system (a design canon, a brand skill, approved tokens, design rules in `.claude/rules/`), that system governs values and brand. The skill's precedence rule defers to it and still supplies the process, the checks and the component discipline.
