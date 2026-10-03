# Quality gates, review and definition of done

A gate is a question that must be answered yes, with evidence, before moving on. "It should look right" is not evidence; a screenshot that was read, a measured value, or a script result is.

## Contents

1. Phase exit gates
2. The verification ladder
3. The capture matrix
4. The fifteen review categories
5. The slop audit
6. Severity
7. Definitions of done (component, screen, system)
8. Auditing an existing interface

---

## 1. Phase exit gates

| Phase | Exit gate (all must hold) |
| --- | --- |
| 1 Intake | Primary users, top tasks, platforms, accessibility target, locales and stack are known or explicitly ASSUMED with the owner's OK. `design/DESIGN-BRIEF.md` exists. |
| 2 References | 3 to 6 references analyzed, each with the principle borrowed and what is NOT copied. Anti-references noted. `design/REFERENCES.md` exists. |
| 3 Brand and directions | Brand principles and signature moments written. 2 or 3 directions that differ in kind. Signature (slop) test run on each. The owner chose one, recorded as a decision with their words. |
| 4 Design system | `design/DESIGN-SYSTEM.md` complete; every top-level choice has a rationale row; tokens in code; contrast matrix passes in every theme with no parity breaks. |
| 5 Showcase | Every token and every primitive in every state is visible on the showcase in both themes; screenshots read; the owner approved it. |
| 6 Components | `design/COMPONENTS.md` inventory complete; every shared component has a spec, a showcase entry, states, keyboard behavior and a test; guard scripts pass against baseline. |
| 7 Screens | Each screen composed only from the library; design loop run (3 options considered, 2 rejected with reasons); states matrix complete; the capture matrix passes. |
| 8 Ship | The fifteen review categories pass or are N/A with a reason; definition of done holds; known gaps listed. |

The owner approval gates (directions, showcase) are real stops. Do not build tokens before a direction is chosen, and do not build screens before the showcase is approved, because rework after those points multiplies.

## 2. The verification ladder

| Rung | What it proves | What it cannot prove |
| --- | --- | --- |
| 1 Read | the code intends something | anything about the rendered result |
| 2 Capture | screenshots across the matrix show the result | keyboard, focus, behavior over time |
| 3 Drive | keyboard walk, forced states, throttled network, reduced motion, scanner | real assistive tech, real devices |
| 4 Device | real phones, screen readers, real users | n/a |

State which rung each claim rests on. A claim from rung 1 about a rendered result is NOT RUN, never PASS.

Rendered checks worth scripting (Playwright or the browser tools in the session):
- No element where `scrollWidth > clientWidth` without a visible scrollbar; no horizontal page scroll.
- Touch targets at least 44 by 44 on touch layouts (`getBoundingClientRect`).
- Distinct computed font-size and weight pairs per screen (`getComputedStyle`), compared to the system's role count.
- Layout shift during loading transitions (CLS observer).
- axe-core with zero serious or critical violations.

## 3. The capture matrix

Capture every screen in each declared combination:
- Viewports: 320 (reflow floor), 390 (common phone), 768 (tablet), 1024, 1280, 1440 (and the brief's primary viewport).
- Themes: light and dark (and high contrast if declared).
- Direction: LTR, plus an RTL pass if any RTL locale is planned.
- States: every row of the states matrix that can be forced.
- Zoom: 200 percent at 1280.
- Reduced motion: on.

Read every screenshot. Look for clipping, overlap, misalignment, orphaned words in headings, uneven spacing, contrast problems on images and gradients, and anything that looks like a default.

## 4. The fifteen review categories

Review a screen or feature against each, marking PASS, FAIL (with evidence) or N/A (with reason):

1. **Product fit**: solves the brief's job for the brief's users; nothing invented.
2. **Information hierarchy**: one primary action; squint test passes; at most three type levels per block.
3. **Navigation and flow**: way in, way back, way out; one shell per journey; step indicator from first to last step.
4. **Typography**: every style maps to a role; measure 45 to 75 characters; tabular numerals where numbers compare.
5. **Color and contrast**: semantic tokens only; contrast passes in both themes; no meaning by color alone.
6. **Layout and spacing**: scale steps only; group gaps smaller than between-group gaps; alignment to grid; no clipping.
7. **Component consistency**: library components only; no duplicates; same action, same name and look everywhere.
8. **Interaction states**: hover, focus-visible, active, disabled, loading, error, success all designed and built.
9. **Motion**: every animation has a purpose, correct duration and easing, interruptible, reduced-motion replacement.
10. **Responsiveness**: intentional at every captured width; touch targets; no hover-only actions.
11. **Accessibility**: keyboard walk, focus management, names, live regions, zoom, reflow; each reported automated, manual or not tested.
12. **Content clarity**: plain verbs, sentence case, specific numbers, useful errors and empty states, glossary terms.
13. **Performance**: LCP at most 2.5 s, INP at most 200 ms, CLS at most 0.1 on a mid-range phone; fonts and images budgeted.
14. **Trust and error handling**: honest states (unknown shown as unknown), safe retries, no dark patterns, consequential actions confirmed or undoable.
15. **Real-world usability**: only assessable with real-user evidence (sessions, analytics with sample size and period); otherwise "not assessable", never PASS.

## 5. The slop audit

Run on every direction, the showcase, and every new screen. For each item found, either remove it or point to the decision row that justifies it. Full list of tells: `03-brand-and-directions.md` section 6.

- [ ] Could this screen belong to any product in any industry? If yes, the brand is missing.
- [ ] Is the typeface an overused default with no recorded reason?
- [ ] Is the palette a common generated look (purple-blue gradient, cream plus terracotta, near-black plus one acid accent) with no recorded reason?
- [ ] Is content chopped into identical rounded cards with the same radius and the same grey shadow?
- [ ] Are there decorative gradients, glows, blobs or glass with no job?
- [ ] Tracked-out uppercase eyebrow labels above every heading? One word of every headline accented in color or italic?
- [ ] Numbered markers (01, 02, 03) on content that is not a sequence?
- [ ] Fade-and-slide-up on every section, hover lift on every card?
- [ ] Hero with a big number, a small label and a gradient accent by default?
- [ ] Icons in colored circles above three-column feature blurbs?
- [ ] Generic copy ("Unlock the power of", "Seamless", "Elevate your workflow", "Get started today")?
- [ ] Emoji used as icons? Arrows appended to every link?
- [ ] Un-customized component-library defaults (stock shadcn look)?

## 6. Severity

| Severity | Examples |
| --- | --- |
| Critical | wrong money or legal value shown; broken primary journey; data loss; a dark pattern in consent or cancellation |
| High | accessibility failure on a main path; contrast failure on body text; keyboard trap; missing error or empty state on a primary view |
| Medium | inconsistent component or spacing; missing secondary state; a convention broken without reason |
| Low | polish: optical alignment, a slightly off rhythm, copy that could be tighter |

The author of a change never lowers a severity found by review.

## 7. Definitions of done

**A component is done when:**
- [ ] It has a spec (purpose, anatomy, variants, props, states, keyboard, a11y, tokens, do and don't).
- [ ] It uses semantic tokens only; `check-raw-values` is clean for its files.
- [ ] Every variant and state renders on the showcase in both themes.
- [ ] Keyboard behavior and focus management work; accessible name rules hold; axe is clean.
- [ ] It has at least one behavior test.
- [ ] It is registered in `COMPONENTS.md`; no duplicate exists.

**A screen is done when:**
- [ ] It is composed only from library components (new needs went into the library first).
- [ ] One primary action; the title states the job; content ordered by the decision it serves.
- [ ] Loading, empty, error and populated states exist; unknown is shown as unknown.
- [ ] Contrast measured in both themes; no meaning by color alone.
- [ ] Text in rem; works at 200 percent zoom and 320 px with no clipping or page scroll.
- [ ] Targets 44 by 44 on touch with 8 px spacing; no hover-only actions.
- [ ] Pressed state, in-place progress, double submit impossible, explicit success.
- [ ] Every field has a visible label, the right `type`, `inputmode` and `autocomplete`; errors inline and summarized.
- [ ] Keyboard-only pass done; focus never lost; screen-reader names checked.
- [ ] Reduced motion honored; animations have a purpose.
- [ ] Captured across the matrix and every screenshot read.
- [ ] Slop audit clean or justified.

**The design system is done when:**
- [ ] Every top-level choice has a decision row with principle, human reason, evidence and rejected alternative.
- [ ] Tokens exist in all three layers as needed, with no unconsumed tokens.
- [ ] Contrast matrix passes in every theme with no parity breaks.
- [ ] The showcase shows everything and the owner approved it.
- [ ] Guards run in CI or pre-push with baselines committed.
- [ ] The brand's signature is identifiable on a screenshot with the logo removed.

## 8. Auditing an existing interface

When the project already has UI, audit before redesigning, so "better" is measured against a baseline.
1. Enumerate routes, screens and components. That count is the denominator for every finding ("12 of 340 routes", never a bare "12").
2. Run the guards: `check-raw-values.mjs` (raw value census), `find-duplicate-components.mjs` (duplicate census), contrast on the existing tokens.
3. Capture the matrix on the key screens.
4. Inventory: design language, type styles in use (count them), colors in use (count them), spacing values, component patterns, navigation, inconsistencies, accessibility issues, responsive weaknesses, visual debt, expensive effects, and what already works well (keep it).
5. Report in separate sections: AS-BUILT, INTENDED (if a system exists), PROBLEMS, INCONSISTENCIES, CONSTRAINTS, PROPOSED IMPROVEMENTS, each with counts.
6. Preserve what works. A redesign for novelty alone is not a reason.
