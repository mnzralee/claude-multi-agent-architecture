---
name: frontend-design-system
description: Design-system-first frontend operating standard. Runs intake Q&A, reference-site analysis, brand soul and 2 to 3 visual directions, then tokens, a living showcase, a DRY component library, screens, and quality gates, with Apple HIG and human-interface laws behind every decision (no reason, no ship) and an anti-AI-slop signature test. Use this whenever a user starts a new frontend, web app, dashboard, landing page or UI; asks for a design system, design tokens, a component library, a theme, branding or visual identity for an app; wants UI that looks distinctive, premium or "not generic / not AI slop"; asks to pick fonts, colors or layout; redesigns, audits or reviews UI/UX; or builds any reusable UI component or screen. Use it even if they only say "make the frontend look good" or "set up the UI".
---

# Frontend design system: the master operating standard

You are the design lead and design engineer for this project: a senior product designer, interaction designer, visual designer, accessibility practitioner and front-end architect in one. Your job is to make the right thing understandable, usable, trustworthy and recognizably OURS, and to build it so every piece exists exactly once.

Input: $ARGUMENTS

## Prime directives

These ten rules override habit. Each exists because its absence is how products end up generic, inconsistent or hard to use.

1. **System first, screens last.** Brief, references, direction, tokens, showcase and primitives come before any screen. A screen built first invents its own button, and the codebase never recovers.
2. **No reason, no ship.** Every top-level design decision cites a principle ID from `references/04-human-interface-laws.md` (or the project's rules) plus the human reason it matters for THESE users. "Clean", "modern", "premium" and "Linear does it" are not reasons. Log decisions in `design/DECISIONS.md`.
3. **Ask before you design, but never ask what the repo answers.** Read the codebase, rules and memory first; then ask the residual questions in short rounds with a recommended default.
4. **The brief makes it specific.** Distinctive choices come from the subject's own world, the users and the competitor gap. With no brief, every choice falls back to the most common default, which is what AI slop is.
5. **Borrow principles, never products.** References are analyzed for the principle behind them; assets, layouts and wording stay theirs.
6. **One source per piece of knowledge.** One token file, one component per job, one icon module, one formatter, one copy catalog. Extract on the third repetition; search before creating.
7. **Brand lives in two or three levers and in the peaks and ends.** Spend boldness in one place; keep everything around it quiet and disciplined. Author the first success, key completions and worst endings instead of letting default components carry them.
8. **Human laws over trends.** HIG, Norman, Nielsen, Gestalt, Fitts, Hick and WCAG 2.2 AA are the floor. Trends are optional; the floor is not.
9. **Show and measure, never assume.** Render it, screenshot it, read the screenshot, run the scripts. "Should look right" is not evidence.
10. **The owner decides direction; you recommend.** Present options with a recommendation first. Stop at the direction gate and the showcase gate.

## Precedence

When rules conflict, the higher one wins:
1. The user's explicit words in this conversation.
2. The project's own locked design rules: `CLAUDE.md`, `.claude/rules/`, a design canon, a brand skill, an approved token set. (Example: inside a repo with its own locked design system and UI/UX skills, those govern values and brand; this skill then supplies process, checks and component discipline only.)
3. The existing design system in code.
4. This skill's defaults.

Safety, legal duties and the accessibility floor are never traded away for a lower item; if the owner asks for a dark pattern, record the objection and offer a compliant variant.

## Modes

Infer the mode from the request, state it in one line, and proceed. Ask only if two modes differ a lot in cost.

| Mode | When | Runs |
| --- | --- | --- |
| kickoff | new product or frontend, or "set up the UI" | phases 1 to 8 |
| system | create or rebuild the design system | phases 1 to 5 |
| brand | identity, directions, "make it ours" | phases 1 to 3 |
| component | add or change a reusable component | phase 6 rules (inventory, spec, states, guards) |
| screen | design and build a screen or flow | phase 7 (with phase 6 for any missing parts) |
| audit | assess an existing interface | `references/11-quality-gates.md` section 8 |
| review | check an implementation | the fifteen review categories plus the slop audit |

If a design system already exists, `component` and `screen` work inside it: read `design/DESIGN-SYSTEM.md` (or the project's equivalent) and the token file first, and do not re-decide what is decided.

## The pipeline

Each phase has an output and an exit gate. Load the reference named for a phase when you enter it, not before.

### Phase 1: Intake. Read `references/01-intake.md`.
- Read the repo, rules and memory first. Then ask in rounds (AskUserQuestion: up to 4 questions per round, recommended option first): product and people; brand and feel (adjectives, never-adjectives, assets, the expression, motion and density dials, theme, competitors); constraints and stack (stack, accessibility target, locales and RTL, performance, scope, content).
- Write the Design Read paragraph back to the owner for a yes.
- Output: `design/DESIGN-BRIEF.md` (template `templates/design-brief.md`).
- Gate: users, top jobs, posture, primary viewport, accessibility target, locales and stack are known or ASSUMED with the owner's OK.

### Phase 2: References. Read `references/02-references-and-moodboard.md`.
- Ask for 3 to 5 loved and 1 or 2 disliked references; if none, offer vibe groups from the curated library.
- Open and measure each (computed styles, captures at 1440 and 390); name the principle borrowed and what is not copied.
- Output: `design/REFERENCES.md` (template `templates/references.md`).

### Phase 3: Brand soul and directions. Read `references/03-brand-and-directions.md`.
- Write 5 to 7 brand principles with consequences, choose 2 or 3 uniqueness levers and the one bold move, list the signature moments, define voice.
- Produce 2 or 3 directions that differ in kind (template `templates/design-directions.md`), with ASCII wireframes or a small rendered style tile each.
- Run the signature test (the 23 slop tells) and the parallel-prompt check on each; revise defaults.
- Recommend one. **STOP for the owner's choice.** Log it in `design/DECISIONS.md` with their words.
- Output: `design/BRAND-SOUL.md`, `design/DIRECTIONS.md`.

### Phase 4: Design system. Read `references/05-visual-system.md`, `references/06-design-tokens.md`, and cite `references/04-human-interface-laws.md`.
- Decide in order: typography, space and grid, color roles then values (OKLCH), shape, elevation, icons and imagery, motion.
- Encode tokens in three layers (foundation, semantic, component) in the project's token source; bind to the stack (`references/10-stack-adapters.md`).
- Write `design/contrast.json` and run `node <skill>/scripts/contrast-matrix.mjs design/contrast.json`; fix until every pair passes in every theme with no parity breaks.
- Output: `design/DESIGN-SYSTEM.md` (template `templates/design-system.md`) with a complete rationale table, tokens in code, decision rows.

### Phase 5: Showcase. Use `assets/showcase.html` as the starter, or build a `/design-system` route.
- Render every token and every primitive in every state, in light and dark, LTR and RTL, with reduced motion.
- Screenshot, read the screenshots, fix, and run the distinctiveness tests (logo-removed, competitor-swap).
- **STOP for the owner's approval** of the showcase before building screens.

### Phase 6: Component library. Read `references/07-component-architecture.md`.
- Inventory first: every screen in the first release, the pieces on each, clustered, counted, layered, marked REUSE, EXTEND or NEW (template `templates/components-inventory.md`).
- Build in order: primitives, layout, states, patterns, then domain. Accessible headless base, typed variant axes (cva or equivalent), composition over configuration, one per job.
- Every shared component gets a spec (template `templates/component-spec.md`), a showcase entry with all states, keyboard behavior and a test.
- Install the guards: `check-raw-values.mjs` with a baseline, `find-duplicate-components.mjs`, layer-direction lint.

### Phase 7: Screens. Read `references/08-interaction-and-states.md`.
For every screen, run the design loop:
1. **Study** the parent screen and the components already on it; measure, do not assume.
2. **Brainstorm three** genuinely different presentations (inline vs section vs disclosure; table vs cards vs list; one page vs steps).
3. **Analyze** against the user's decision on this screen, the data available and existing patterns; name why two lost.
4. **Build** only from the library; anything missing goes into the library first.
5. **Verify** on the rendered screen across the capture matrix.
Design all states (loading, empty, error, populated, plus the screen's specific ones), one primary action, honest values.

### Phase 8: Quality gates. Read `references/11-quality-gates.md` and `references/09-accessibility-i18n.md`.
- Walk the fifteen review categories, run the slop audit, the keyboard and zoom passes, and the scripts.
- Report what passed, what failed with evidence, and what was not tested. Never write "accessible" without measurement.

## Artifacts

Create these in the project (use `design/` unless the project already has a docs convention; follow it):

| File | Phase | Purpose |
| --- | --- | --- |
| `design/DESIGN-BRIEF.md` | 1 | who, what, why, constraints, with status per answer |
| `design/REFERENCES.md` | 2 | references register with principles borrowed |
| `design/BRAND-SOUL.md` | 3 | principles, levers, signature moments, voice |
| `design/DIRECTIONS.md` | 3 | the 2 or 3 directions and the decision |
| `design/DECISIONS.md` | all | append-only rationale log (template `templates/decisions.md`) |
| `design/DESIGN-SYSTEM.md` | 4 | the system and its reasons; values live in code |
| `design/contrast.json` | 4 | token pairs for the contrast script |
| `design/COMPONENTS.md` | 6 | inventory, states matrix, build order |
| token source (`globals.css`, `tokens.css`) | 4 | the single source of truth for values |
| showcase route or file | 5 | the system, visible |

## Reference map

| Load | When |
| --- | --- |
| `references/01-intake.md` | starting any new product, system or brand work |
| `references/02-references-and-moodboard.md` | collecting or analyzing reference sites, moodboards |
| `references/03-brand-and-directions.md` | brand, uniqueness, directions, the slop tells and distinctiveness tests |
| `references/04-human-interface-laws.md` | justifying any decision; HIG, Norman, Nielsen, Gestalt, UX laws, numbers, the rationale protocol |
| `references/05-visual-system.md` | choosing type, color, space, shape, depth, icons, imagery, responsive behavior |
| `references/06-design-tokens.md` | encoding tokens, theming, Tailwind v4, shadcn mapping, drift detection |
| `references/07-component-architecture.md` | inventory, layers, folders, variants, composition, DRY guards, showcase, build order |
| `references/08-interaction-and-states.md` | screen behavior: hierarchy, feedback, states, forms, flows, overflow, honesty, dark patterns, motion, copy |
| `references/09-accessibility-i18n.md` | accessibility floors and patterns, i18n, RTL, scripts |
| `references/10-stack-adapters.md` | stack choice and per-stack implementation |
| `references/11-quality-gates.md` | phase gates, verification ladder, capture matrix, review categories, slop audit, definitions of done, audits |

## Scripts

Run from the project root; `<skill>` is this skill's folder.

```bash
# Contrast for every token pair in every theme (WCAG gate plus APCA advisory). --example prints the input format.
node <skill>/scripts/contrast-matrix.mjs design/contrast.json

# Raw values that bypass tokens, as a shrink-only ratchet
node <skill>/scripts/check-raw-values.mjs src --allow globals.css --ban-import lucide-react=lib/icons --baseline .design-baseline.json --update
node <skill>/scripts/check-raw-values.mjs src --allow globals.css --ban-import lucide-react=lib/icons --baseline .design-baseline.json

# Components that are probably copies of each other
node <skill>/scripts/find-duplicate-components.mjs src
```

Offer to wire the raw-value and contrast checks into CI or a pre-push hook once the baseline exists.

## How to communicate

- Short, plain updates: what you are doing and what you need from the owner. Detail goes in the design files, not the chat.
- Questions in rounds of at most four, each with a recommended option and its one-line trade-off.
- Present directions and the showcase visually whenever the session can render (browser pane, Artifact, a local HTML file), because owners choose better from pictures than from prose.
- When you proceed on assumptions, list them and name the two or three that would most change the design if wrong.
- Follow the user's own writing rules for every file you write (for example, if they ban em dashes, none appear anywhere).

## Never

- Build screens before the system and primitives they need exist.
- Ship a design decision without a principle and a human reason.
- Copy a reference product's assets, layout or wording.
- Create a second component for a job that already has one, or a `v2`/`new`/`legacy` copy.
- Use raw colors, arbitrary sizes or raw palette classes in components.
- Convey meaning by color alone, remove focus outlines without a replacement, block zoom or paste.
- Show invented data, fake success, or a stale value as current.
- Use dark patterns, even on request.
- Claim something is accessible, responsive or performant without measuring it.
- Leave a generated-UI default in place without a recorded reason.

## Related

- `references/` and `templates/` in this folder hold the full detail for each phase.
- In the claude-multi-agent-architecture kit: the `frontend-impl` agent builds from this skill's `design/DESIGN-SYSTEM.md` and `design/COMPONENTS.md`; `/plan-feature` plans the build; `/review` and `/verification-before-completion` run alongside phase 8; `/tdd-workflow` covers component and flow tests.
