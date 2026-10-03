# Phase 3: Brand soul, signature and design directions

A design system makes a product consistent. A brand makes it recognizable. This phase decides what makes the UI unmistakably ours, before any token is written, because tokens encode a direction and changing direction after tokens and components exist is expensive.

## Contents

1. What "ours" means
2. Brand principles
3. Uniqueness levers
4. Signature moments (peak and end)
5. Design directions
6. AI slop tells (the signature test)
7. Distinctiveness tests
8. Voice
9. Output

---

## 1. What "ours" means

A UI is ours when someone could recognize it with the logo removed. That comes from four layers:
1. **Principles**: what we believe and therefore always or never do.
2. **Signature**: two or three visual and behavioral choices that repeat everywhere (a type voice, a color story, a shape language, a motion signature).
3. **Moments**: a few authored peaks and endings where the brand is felt, not just seen [LAW-PEAK-END].
4. **Voice**: how the product talks.

Consistency comes from the design system; distinctiveness comes from these four. A system without them is a well-organized template.

## 2. Brand principles

Write 5 to 7 principles. Each is one sentence plus its consequences ("so we always X, we never Y"). A principle with no consequence is a slogan.

Pattern, from an in-house fintech example:
- **Dignity is the deliverable.** So every surface leads with what the person CAN do; we never shame, never gray out a frozen account without showing what still works.
- **Honesty is the brand.** So we show available versus total, holds, real fees and data freshness; we never fake success or hide a number; red means danger only (a debit is not an error, so it is not red).
- **Quiet confidence over hype.** So no hype words, no confetti, no slot-machine motion; restraint and polish are the trust signal.
- **Motion serves meaning, settles, and respects the budget.** So we animate only causality, continuity or status change, once, and every authored moment has a reduced-motion equivalent.
- **Inclusion is the product, not a setting.** So every glyph has a word, every color a sign, RTL from the first commit, plain language at about a sixth-grade level.

Notice how each one directly produces design rules. That is the test of a good principle.

## 3. Uniqueness levers

Distinctiveness can come from many places. Choose 2 or 3 levers, push them, and keep everything else quiet and disciplined [CRAFT-ONE-BOLD-MOVE]. Spreading boldness across every lever produces noise.

| Lever | Examples of a deliberate choice |
| --- | --- |
| Subject vernacular | the domain's own artifacts as UI: a receipt, a ticket stub, a ledger line, a map, a blueprint, a lab label |
| Typography voice | a distinctive display face for brand moments; a strict three-voice system; numerals as a hero element |
| Color story | an unexpected canvas (warm paper, deep ink, a tinted neutral); one accent used with discipline; a culturally meaningful hue |
| Shape language | a corner personality (continuous squircle, sharp zero radius, a notch, a cut corner), applied everywhere with concentric nesting |
| Signature component | one component that IS the product (the balance card, the boarding pass, the score dial), designed with obsessive care |
| Motion signature | one authored transition used at key moments (a container transform into a receipt, a settle not a spin) |
| Layout signature | an asymmetric grid, a persistent rail, an editorial column, a bento rhythm |
| Data display | how numbers, charts and statuses look (tabular mono amounts, sparkline style, status chips) |
| Imagery and illustration | a photographic rule, an illustration style, a texture (paper grain, risograph, technical line) |
| Voice and microcopy | a recognizable way of speaking in buttons, errors and empty states |
| Sound and haptics | a single subtle confirmation on the key action (native and PWA) |

Where to find the lever: the brief's adjectives, the competitor gap, and the subject's physical world (see `02-references-and-moodboard.md` section 7). The most distinctive choices come from the subject, not from other apps.

## 4. Signature moments (peak and end)

People remember the most intense moment and the ending, not the average [LAW-PEAK-END]. Default components at those moments waste the brand.

List the product's moments and author each one:

| Moment | Typical examples | What "authored" means |
| --- | --- | --- |
| First impression | landing hero, first app open | opens with the most characteristic thing in the subject's world, not a stock hero |
| First success | first project created, first payment received, account approved | a designed screen with specific copy, one meaningful animation, something keepable (a receipt, a shareable card) |
| Key completion | checkout done, transfer sent, report published | closure: what happened, what is next, a receipt; never a bare toast |
| Empty states | no data yet | an invitation to act in the brand's voice |
| Worst ends | payment failed, account suspended, rejected, offline | plain truth, what the person CAN still do, a concrete support path; never a dead end |
| Leaving | cancel, delete account, sign out | respectful, easy, no guilt (no confirmshaming) |

Build these last (they need a solid system to stand out against), but design them now so the system can support them.

## 5. Design directions

Unless an approved design language already governs, produce **two or three directions that differ in kind** on at least two of: typography, color strategy, layout model, interaction philosophy, motion language. A recolor is not a direction.

Each direction is a short brief (use `templates/design-directions.md`):

| Field | Content |
| --- | --- |
| Name | two or three evocative words ("Ledger and Light") |
| Visual concept | one paragraph, tied to the subject |
| Typography | families and roles, with the reason |
| Color strategy | canvas, neutrals, accent, semantic approach; 4 to 6 named values |
| Layout philosophy | model, grid, density; an ASCII wireframe of the key screen |
| Interaction philosophy | how it responds, how much it guides |
| Motion language | what moves, how, and what never moves |
| Uniqueness levers | which 2 or 3, and the signature move |
| References | 1 to 3, each as principle borrowed |
| Why it fits | cites the brief (users, posture, adjectives, dials) |
| Risks and trade-offs | honest costs: build effort, accessibility risk, performance |

Then:
1. **Run the signature test** (section 6) on each direction. Any default with no reason is replaced or justified.
2. **Self-check against a parallel prompt:** imagine the same request for a different product in a different industry. If you would produce the same direction, it is a default, not a choice; revise it and say what changed.
3. **Recommend one**, with reasons, then present the alternatives fairly enough that the owner could pick them.
4. **Stop for the owner's choice.** Record it in `design/DECISIONS.md`: chosen, rejected, the owner's words, the date.

If possible, show directions visually (a small rendered sample of the key screen per direction, or a style tile: type specimen, swatches, a button, a card, a heading), because owners choose better from pictures than from prose.

While the direction is pending, only do direction-independent work: information architecture, flows, the states matrix, the component inventory, copy inventory.

## 6. AI slop tells (the signature test)

These patterns appear in generated interfaces regardless of subject. That is the problem: they signal that no decision was made for THIS product. None is banned outright (the owner's explicit request always wins), but each one present needs a recorded reason from the brief, or it is replaced.

**Color**
1. Purple, indigo or violet gradients (especially on white), purple or blue glows on buttons, neon gradients.
2. Warm cream background (near #F4F1EA) with a high-contrast serif and a terracotta, clay or brass accent (near #D97757, #B08947) and espresso text.
3. Near-black background with a single acid-green or vermilion accent.
4. Tinted near-black (#0B0B0B, #111) standing in for a considered dark surface; one accent used everywhere.

**Typography**
5. Default faces as the voice: Inter, Roboto, Arial, system UI; convergence on Space Grotesk, Geist, Fraunces or Instrument Serif.
6. A tracked-out ALL-CAPS eyebrow label above every heading.
7. One word of each headline accented with a different color, italic, weight or family.
8. Monospace for small labels as a "technical" costume.

**Layout and structure**
9. The SaaS card kit: content chopped into identical rounded cards, one radius on everything, the same `rgba(0,0,0,.1)` shadow under each; three equal icon-heading-text feature cards; nested cards.
10. Centered hero over a dark mesh or gradient blob; centering everything.
11. The hero-metric template: big number, small label, supporting stats, gradient accent.
12. Numbered markers (01, 02, 03, "Step 1") on content that is not a sequence.
13. Broadsheet cosplay: hairline rules, zero radius, newspaper columns, decorative grid lines, when the subject is not editorial.
14. Repeating one layout family (zigzag rows over and over); bento grids with filler cells.

**Effects and motion**
15. Gradient text, glassmorphism or blur as decoration, outer glows, colored halos, thick colored left-border stripes, offset brutalist shadows out of context.
16. Fade-and-slide-up on every section, hover lift on every card, infinite micro-loops, custom cursors, scroll cues.

**Content and chrome**
17. Emoji or unicode glyphs as icons; mixed icon sets; icons in colored circles.
18. Fake content: div-built fake screenshots, fake terminals and dashboards, decorative sparklines and progress rings standing in for real content.
19. Placeholder data and words: John Doe, Acme, Nexus, 99.99%, invented precise specs; "Unlock", "Elevate", "Seamless", "Unleash", "Next-gen", "Supercharge".
20. Separator tells: "A · B · C" meta strings, labels built as a word, a spaced em dash, then a fragment, em dashes in UI copy, a "→" appended to every link.
21. Agency chrome: status dots, BETA or version pills in the hero, vertical rotated text, poetic section labels.
22. Component-library defaults left as is (stock shadcn look); unthemed selection, caret and scrollbars.
23. Vague copy: "Submit", "Continue", "Something went wrong" with no fix.

## 7. Distinctiveness tests

Run on each direction, on the showcase, and on finished key screens:
- **Logo-removed test:** remove the logo and name. Would a user still know it is ours? If not, the signature is too weak.
- **Competitor-swap test:** put a competitor's name on it. Does it still fit just as well? If yes, it is not distinctive.
- **Category-swap test:** would this design work unchanged for a different industry? If yes, it is not grounded in the subject.
- **Squint test:** blur to 5 px. Is the hierarchy clear and is the one bold move visible?
- **Remove-one-accessory test:** take one decorative element away. If nothing is lost, keep it away.

## 8. Voice

Define voice once, in the design system:
- **We are / we are not** pairs, three of them ("plain, not dumbed down", "confident, not loud", "warm, not cute").
- **Glossary:** the product's nouns and verbs, and the words we never use (with replacements).
- **Patterns:** how we write buttons, errors, empty states, confirmations, success messages, with one example each.
- **Banned:** hype words, exclamation marks in system copy, blame in errors, anything that would read as a dark pattern.

## 9. Output

- `design/BRAND-SOUL.md` from `templates/brand-soul.md`: principles, levers, signature moments, voice.
- `design/DIRECTIONS.md` from `templates/design-directions.md`.
- The owner's choice recorded in `design/DECISIONS.md`.
