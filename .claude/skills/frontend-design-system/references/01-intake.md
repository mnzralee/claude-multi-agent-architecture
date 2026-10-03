# Phase 1: Intake (the questions that decide everything)

Good design starts with knowing who it is for and what they are trying to do. Taste without a brief produces generic work, because with nothing specific to respond to, every choice falls back to the most common default. The brief is what makes the design specific.

## Contents

1. Read before you ask
2. How to ask
3. Round 1: product and people
4. Round 2: brand and feel
5. Round 3: constraints and stack
6. Round 4: references (see `02-references-and-moodboard.md`)
7. The Design Read
8. When the owner says "just go"
9. Output: DESIGN-BRIEF.md

---

## 1. Read before you ask

Never ask what the project can tell you. Before the first question, look for:
- `package.json` and lockfiles (framework, styling, component library, icon set, motion library);
- existing tokens (`globals.css`, `tailwind.config.*`, `theme.*`, `tokens.*`), fonts, and brand assets (logo files, `public/`, `brand/`);
- project rules (`CLAUDE.md`, `.claude/rules/`, `.cursor/rules`, `AGENTS.md`, `DESIGN.md`, `PRODUCT.md`, a `docs/` design spec);
- the README and any product or requirements doc;
- the user's memory or knowledge base if the session has one (for example a second-brain index), for past brand decisions and preferences.

Record each answer you found with its source and status (DECIDED if the owner wrote it, OBSERVED if it is in code, INFERRED if you deduced it). Only ask the residual questions.

**If a locked design system already exists** (a design canon, a brand skill, an approved token set), it governs. Do not re-ask its decisions; this skill then supplies the process, the checks and the component discipline.

## 2. How to ask

- Use the `AskUserQuestion` tool when available: up to 4 questions per round, 2 to 4 options each, the recommended option first and labeled "(Recommended)", with a one-line description of the trade-off. The user can always pick "Other".
- Ask in rounds, gating questions first. Do not dump 20 questions in one message; people answer the first three well and the rest badly.
- Each question must change what you will do. If any answer leads to the same design, do not ask it.
- Offer a recommendation with every question, based on what you already know. The owner should be able to accept defaults quickly.
- Free-text questions (what the product is, brand adjectives) go in plain chat when options would be guesses.

## 3. Round 1: product and people (gating)

1. **What is it, in one sentence, and what is the single most important thing a user does with it?**
2. **Who are the primary users?** Role, expertise (novice, regular, expert), context of use (desk, on the move, one-handed, outdoors, under stress), and any vulnerable groups (children, elderly, low literacy, low vision). Each raises the care level.
3. **What are the top 3 jobs, in order of frequency?** These become the screens designed first and best [LAW-PARETO].
4. **Surface posture** (decides how expressive the design may be):

| Posture | Surface | Design priority |
| --- | --- | --- |
| Persuade | marketing site, landing page | memorable, narrative, conversion; expression high |
| Operate | product UI, dashboard, tool | scanability, speed, consistency; expression low, craft high |
| Read | docs, content, blog | typography, measure, navigation; expression medium |
| Experience | portfolio, brand world, campaign | immersion and identity; expression highest |

   A product often has two (Persuade for marketing, Operate for the app). Design each posture deliberately; do not let the marketing site's expression leak into the app's tables.
5. **Platforms and primary viewport.** Where are users actually? (mobile web, desktop web, both, PWA, native later). The primary viewport is designed first; the others are intentional, not collapsed.

Gate: do not leave Round 1 with users, top jobs or primary viewport unknown. If the owner does not know, propose them as ASSUMED and get a yes.

## 4. Round 2: brand and feel

6. **Brand adjectives.** Three to five words the product should feel like, and two or three it must never feel like. ("Calm, precise, trustworthy; never playful, never flashy.") The "never" list is often more useful than the "is" list.
7. **Existing brand assets.** Logo, colors, typefaces, illustration, photography. For each: locked (must use as is), flexible (evolve it), or none (create).
8. **Design dials** (1 to 10 each; offer presets):
   - **Expression** (1 quiet and conventional, 10 bold and experimental)
   - **Motion** (1 static, 10 cinematic)
   - **Density** (1 airy, 10 information-dense)

   Typical presets: enterprise tool 3/3/7; consumer app 5/5/4; fintech 3/3/5; marketing site 7/6/3; portfolio 9/7/2; docs 3/2/5. The dials become the first lines of the design system and stop every later decision from drifting.
9. **Theme.** Light, dark, both, or system-following. Decide by where and how the product is used (a trading desk at night, a field app in sunlight), not by category habit. Supporting both doubles the visual QA; say so.
10. **Competitors and the gap.** Who are the 2 or 3 closest alternatives, and how should we look and feel different from them? Distinctiveness is relative to the category.

## 5. Round 3: constraints and stack

11. **Stack.** Detected from the repo, or choose (see `10-stack-adapters.md` for the default recommendation). Component library preference (shadcn/ui, Radix, React Aria, Material, none).
12. **Accessibility target.** Default WCAG 2.2 AA. Raise to AAA elements for public sector, health or vulnerable users. Any legal regime (ADA, EN 301 549, the European Accessibility Act) named by the owner.
13. **Languages and scripts.** Which locales at launch and later; any right-to-left (Arabic, Hebrew, Urdu, Persian) or complex scripts (Devanagari, Thai, CJK). RTL must be designed from the first component, not retrofitted.
14. **Performance and devices.** Low-end Android on 3G, or modern laptops on fiber? This decides font weights, image budgets and how much motion is affordable.
15. **Scope of the first release.** The list of screens (this feeds the component inventory), and the timeline.
16. **Content.** Who writes the copy, and is real content available? Designing with real content avoids layouts that break on real data.

## 6. Round 4: references

Run `02-references-and-moodboard.md`: ask for 3 to 5 loved references and 1 or 2 disliked ones, offer a curated set by vibe if they have none, and analyze each.

## 7. The Design Read

Before leaving intake, write one short paragraph back to the owner and get a yes:

> **Design Read:** A [posture] [product] for [users] who mainly [top job], used [context]. It should feel [adjectives], never [anti-adjectives]. Dials: expression [n], motion [n], density [n]. [Theme]. Built on [stack], WCAG 2.2 [level], launching in [locales]. Closest alternatives are [competitors]; we differ by [gap].

This catches misunderstandings while they are cheap.

## 8. When the owner says "just go"

Proceed, but never silently. Fill every unknown with a reasoned assumption, mark it ASSUMED in the brief, list the assumptions at the top of your next message, and name the two or three that would most change the design if wrong. Still stop at the direction gate (phase 3): picking the visual direction is the owner's call.

## 9. Output: DESIGN-BRIEF.md

Write `design/DESIGN-BRIEF.md` (or the project's equivalent location) from `templates/design-brief.md`. Every answer carries its status: DECIDED, OBSERVED, INFERRED, ASSUMED or UNKNOWN. Unknowns that block design are listed as open questions.
