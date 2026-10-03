# Human interface laws: the reason behind every pixel

Every design decision in this skill must cite at least one ID from this file (or from the project's own rules) plus the human reason it matters in THIS product. "Looks clean", "modern", "premium", "trendy" and "Linear does it" are not reasons. A reference product is evidence of a principle, never the principle itself.

Each entry has: **the law**, **why it is true about people**, **apply** (concrete moves), **check** (how to prove it on the rendered screen).

## Contents

1. Apple Human Interface Guidelines (HIG-*)
2. Norman's design principles (NOR-*)
3. Nielsen's ten heuristics (NIE-*)
4. Shneiderman's golden rules (SHN-*)
5. Gestalt perception (GES-*)
6. Cognitive and behavioral laws (LAW-*)
7. Visual craft heuristics (CRAFT-*)
8. Ergonomic numbers you can cite
9. Rams' taste filter (RAMS)
10. The decision rationale protocol

---

## 1. Apple Human Interface Guidelines

Apple's HIG is the most mature public body of interface reasoning. It is written for Apple platforms, but its principles are about human perception and control, so they translate to the web. Translate the intent, not the iOS chrome: do not put an iOS tab bar on a desktop web app.

**HIG-HIERARCHY. Controls and chrome serve the content; the content is the hero.**
- Why: attention is the scarcest resource on screen. Every element that is not the user's content competes with it.
- Apply: one primary action per view. Chrome (nav, toolbars) recedes in weight and color. The thing the user came for gets the strongest contrast, size or position. Secondary information steps down by a full scale step plus weight or color, never by 1 or 2 px.
- Check: squint test (blur the screenshot to about 5 px). The first thing you still see must be the primary content or the primary action.

**HIG-CLARITY. Text is legible at every size, icons are precise, adornments are subtle and purposeful.**
- Why: a user who has to decode the interface is not doing their task.
- Apply: body text at least 16 px on mobile, contrast at least 4.5:1, icons from one family at one stroke weight, every decoration justified in the rationale table.
- Check: contrast matrix script passes; distinct type styles per screen counted (near the system's step count, not 20).

**HIG-DEFERENCE. Fluid motion and a crisp, beautiful interface help people understand and interact with content without competing with it.**
- Why: decoration that draws the eye away from content raises cognitive load and lowers trust.
- Apply: translucency, gradients and motion appear only where they explain layering or change. Use them once, not everywhere.
- Check: list every effect on the screen; each has a purpose row (layering, focus, state change) or it is removed.

**HIG-DEPTH. Distinct visual layers and realistic motion convey hierarchy and position.**
- Why: people understand the interface through a spatial model (what is on top, what slid in from where). Depth that matches that model reduces "where am I" errors.
- Apply: a defined elevation scale (canvas, raised, overlay, modal) with a consistent light source. A sheet slides from the edge it lives at and returns there.
- Check: every overlay can be traced to its elevation token; enter and exit directions agree.

**HIG-CONSISTENCY. Adopt platform conventions and stay internally consistent.**
- Why: users transfer knowledge from every other app they use (see LAW-JAKOB). Inconsistency forces relearning.
- Apply: standard controls behave standardly (links look like links, checkboxes check). The same action has the same name, icon and position everywhere. One component per job.
- Check: run `find-duplicate-components.mjs`; grep for the same verb with different labels ("Save", "Update", "Apply" for one action).

**HIG-HARMONY. Shapes and corners echo each other; nested shapes are concentric.**
- Why: the eye reads mismatched curvature as error, even when the user cannot say why.
- Apply: radius tokens only. Nested radius = parent radius minus the inset. Optionally upgrade to continuous corners with `@supports (corner-shape: squircle)`.
- Check: inspect every nested rounded element; inner radius equals outer radius minus padding.

**HIG-FEEDBACK. Every action gets an immediate, perceptible response.**
- Why: without a response within about 100 ms, people assume the input was lost and repeat it (double submits, rage clicks).
- Apply: pressed state on pointer down; work over about 1 s shows progress in place (the button keeps its label and width and gains a spinner); explicit success ("Saved") and explicit failure with a next step.
- Check: throttle the network to Slow 3G and click everything; nothing is silent, nothing double-submits.

**HIG-USER-CONTROL. People initiate and control actions; the interface advises, warns and can be undone.**
- Why: a sense of control drives trust; surprise actions destroy it.
- Apply: no auto-advancing carousels without pause; no action on hover alone; destructive actions confirm or offer undo (prefer undo for frequent actions); cancel is always visible.
- Check: every destructive action has a confirmation or undo; every flow has a visible way out.

**HIG-MODALITY. Use a modal only for a short, focused task or a decision that must be made now.**
- Why: a modal blocks everything else and hides context the user may need to decide.
- Apply: if it needs scrolling, multiple steps, or reference to the page behind, it is a page or a side sheet, not a modal. Alerts are rare and important; a message on every visit is content, not an alert.
- Check: count modals per flow; each one passes the "decision needed now" test.

**HIG-PERMISSIONS. Ask for a permission at the moment it is needed, after explaining why.**
- Why: a permission prompt on page load has no context, so people deny it, and denial is often permanent.
- Apply: an in-page explanation before the system prompt; a graceful denied state that explains how to re-enable.
- Check: load each page fresh; no permission prompt fires before a user action.

**HIG-INCLUSION. Design for the full range of people: abilities, languages, devices, literacy.**
- Why: an exclusion is a defect for a real person, and accessible design is better design for everyone (curb-cut effect).
- Apply: see `09-accessibility-i18n.md`. Plain words, no meaning by color alone, text resizes, RTL-ready layout with logical properties.
- Check: keyboard-only pass, 200% zoom pass, RTL pseudo-locale pass, reduced-motion pass.

**HIG-ONBOARDING. Teach by doing; delay sign-up; never front-load a tutorial.**
- Why: people skip tutorials and forget them; they learn by acting with a goal.
- Apply: let people reach value before account creation where possible; contextual hints at the moment of first use; skippable everything.
- Check: count screens between landing and first value; each must be necessary.

---

## 2. Norman's design principles (The Design of Everyday Things)

**NOR-DISCOVERABILITY. People can work out what actions are possible and the current state.**
- Why: an action that cannot be seen does not exist for most users.
- Apply: primary actions visible, not hidden in menus or behind hover. Gestures always have a visible alternative.
- Check: a first-time viewer can name the three main actions within 5 seconds.

**NOR-AFFORDANCE and NOR-SIGNIFIER. Things look like what they do.**
- Why: flat design removed signifiers, and users stopped knowing what was clickable (measured by NN/g in flat-UI studies).
- Apply: buttons look pressable (fill or border plus label); links are distinguishable from text by more than color (underline or weight); draggable items show a handle; inputs look like inputs (a visible boundary at 3:1).
- Check: grayscale screenshot; can you still tell every interactive element from static text?

**NOR-MAPPING. The relationship between control and effect is natural.**
- Why: natural mapping removes the need for labels and memory.
- Apply: controls sit next to what they affect; ordering of controls matches the ordering of results; sliders move in the direction of the change.
- Check: for every control, the affected element is within one visual group.

**NOR-CONSTRAINTS. Prevent errors by making wrong actions impossible.**
- Why: preventing an error is cheaper than explaining it.
- Apply: date pickers instead of free text where the format matters; disable impossible options with a reason; input masks and `inputMode`; prevent double submit in the handler, not just visually.
- Check: try to break each form; every impossible state is unreachable or explained.

**NOR-FEEDBACK.** Same as HIG-FEEDBACK; cite either.

**NOR-CONCEPTUAL-MODEL. The interface communicates a simple, correct model of how the system works.**
- Why: people predict behavior from their model; a wrong model produces confident errors.
- Apply: name things by the user's nouns, not the database's ("notifications", not "webhook config"). Show system status that matters to the model (pending, synced, failed).
- Check: ask "what do you think happens if you press this?" against the actual behavior.

**NOR-GULFS. Bridge the gulf of execution (how do I do it?) and the gulf of evaluation (did it work?).**
- Apply: clear entry points close the first; clear results and status close the second.

---

## 3. Nielsen's ten usability heuristics

**NIE-1 Visibility of system status.** Keep people informed with timely feedback. Why: uncertainty causes repetition and abandonment. Apply: progress, saved state, sync freshness ("Updated 2 min ago"), step counts in multi-step flows.

**NIE-2 Match between system and the real world.** Speak the user's language and follow real-world order. Why: translation costs attention. Apply: domain vocabulary from the brief's glossary; dates and numbers in locale format.

**NIE-3 User control and freedom.** Clearly marked exits; undo and redo. Why: people make mistakes and explore; fear of being trapped stops exploration. Apply: back never loses data; cancel everywhere; undo toasts for destructive list actions.

**NIE-4 Consistency and standards.** Same words, same actions, same places. Why: see LAW-JAKOB. Apply: one glossary, one component per job, one position for primary action.

**NIE-5 Error prevention.** Better than good error messages. Why: errors cost time and trust. Apply: constraints, confirmations for consequential actions, sensible defaults, inline validation on blur.

**NIE-6 Recognition rather than recall.** Make options visible. Why: recognition is far easier than recall for human memory. Apply: show recent items, visible labels (never placeholder-as-label), keep the info needed to decide on the same screen.

**NIE-7 Flexibility and efficiency of use.** Accelerators for experts that novices do not see. Why: frequent users deserve speed without punishing new users. Apply: keyboard shortcuts with a discoverable list, command palette for dense tools, bulk actions.

**NIE-8 Aesthetic and minimalist design.** Every extra unit of information competes with the relevant units. Why: attention is finite. Apply: cut before you compress; progressive disclosure for detail.

**NIE-9 Help users recognize, diagnose and recover from errors.** Plain language, precise problem, constructive solution. Why: a vague error leaves the user stuck. Apply: "That code did not match. Check the latest email and try again." not "Invalid input". No error codes as the message.

**NIE-10 Help and documentation.** Contextual, task-focused, searchable. Apply: inline help at the point of confusion, not a separate manual.

---

## 4. Shneiderman's eight golden rules (the parts not covered above)

**SHN-UNIVERSAL. Design for novices and experts, for diverse abilities and contexts.** Why: one user base contains both. Apply: progressive disclosure plus accelerators.

**SHN-CLOSURE. Design dialogs to yield closure.** Why: people need to know a task is finished before they move on. Apply: a clear end state with what happened and what is next; a receipt for consequential actions.

**SHN-LOCUS. Support internal locus of control.** Why: people want to feel they drive the system. Apply: no surprise navigation, no unrequested changes, predictable results.

**SHN-MEMORY. Reduce short-term memory load.** Why: working memory holds about four chunks. Apply: never make people copy a value from one screen to another; keep context visible across steps.

---

## 5. Gestalt perception

The eye groups before the brain reads. Use grouping as your cheapest structure.

**GES-PROXIMITY. Things close together are read as related.** Apply: the gap inside a group is always smaller than the gap between groups (for example 8 inside, 24 between). Equal spacing everywhere destroys structure. Check: label-to-field distance is smaller than field-to-next-label distance.

**GES-SIMILARITY. Things that look alike are read as the same kind.** Apply: same component for the same role; never style a non-interactive element like a button. Check: no two different behaviors share one look.

**GES-COMMON-REGION. Things inside a shared boundary are read as a group.** Apply: use a card or background region only when the contents answer one question. One card, one decision. Check: name each card by the question it answers.

**GES-CONTINUITY and GES-ALIGNMENT. The eye follows lines and edges.** Apply: align to a grid; one strong left edge per column; avoid ragged starts. Check: draw the vertical alignment lines on the screenshot; count them and reduce.

**GES-FIGURE-GROUND. People separate the subject from the background.** Apply: overlays get scrim and elevation; the active item contrasts with inactive ones.

**GES-COMMON-FATE. Things that move together are read as a group.** Apply: animate related items together; stagger only to show order.

**GES-PRAGNANZ. People read complex shapes in the simplest form.** Apply: simple, regular shapes and layouts; irregularity only as a deliberate focal point.

---

## 6. Cognitive and behavioral laws

**LAW-FITTS. Time to hit a target grows with distance and shrinks with size.**
- Why: motor control physics.
- Apply: big targets for frequent and primary actions; primary action near where the pointer or thumb already is; screen edges and corners are infinitely deep on desktop; minimum touch target 44 by 44 px (24 by 24 is the WCAG 2.2 AA floor). Keep destructive actions away from frequent ones.
- Check: measure hit areas in devtools; nothing interactive under 44 px on touch layouts without padded hit area.

**LAW-HICK. Decision time grows with the number and complexity of choices.**
- Apply: limit choices at each step; highlight a recommended option; group long lists; progressive disclosure for advanced options.
- Check: count first-level choices per screen; each beyond 5 to 7 needs grouping or a default.

**LAW-CHUNKING (Miller). Working memory holds a few chunks (about 4, not "7 plus or minus 2" in practice).**
- Apply: format long numbers in groups (card numbers, codes, IBANs), split long forms into meaningful sections, keep related info together. Do not misuse this as "max 7 nav items".

**LAW-COGNITIVE-LOAD. Intrinsic load is the task; extraneous load is your interface. Remove extraneous load.**
- Apply: remove decoration, duplicate info, unclear labels; keep only what serves the current decision.

**LAW-JAKOB. Users spend most of their time on other products, so they expect yours to work the same way.**
- Apply: put logo top-left linking home, search where search lives, cart top-right, settings under the avatar. Innovate in the product's core value, not in where the back button is.
- Check: list every convention broken; each needs a recorded reason.

**LAW-TESLER (conservation of complexity). Every system has irreducible complexity; someone must carry it.**
- Apply: the system should carry it (smart defaults, inference, autofill), not the user.

**LAW-DOHERTY. Productivity soars when the system responds in under about 400 ms.**
- Apply: optimistic UI for safe actions, skeletons that match the final layout, prefetch on hover or intent, never block input on animation.
- Check: INP p75 at most 200 ms; perceived response under 400 ms for every primary action.

**LAW-POSTEL. Be liberal in what you accept, conservative in what you send.**
- Apply: accept phone numbers with spaces and dashes, emails with trailing spaces, pasted codes with spaces; normalize silently; display in one canonical format.

**LAW-PEAK-END. People judge an experience by its most intense moment and its end, not the average.**
- Apply: deliberately design the peak moments (first success, key completion) and every ending (success screens, receipts, error ends, cancellations). These are where the brand lives (see `03-brand-and-directions.md`).
- Check: list the product's peaks and ends; each has an authored design, not a default component.

**LAW-AESTHETIC-USABILITY. People perceive attractive designs as easier to use and forgive small problems.**
- Apply: polish is functional, not vanity. But it masks usability problems in testing, so test tasks, not opinions.

**LAW-VON-RESTORFF (isolation). The item that differs is remembered.**
- Apply: make exactly one thing different per view (the primary action, the key number). If everything is emphasized, nothing is.

**LAW-SERIAL-POSITION. People remember the first and last items best.**
- Apply: put the most important nav items at the ends of the bar; key info at the start and end of lists and pages.

**LAW-ZEIGARNIK. People remember unfinished tasks.** Apply: show progress on incomplete setup ("3 of 5 done"); never use it to nag.

**LAW-GOAL-GRADIENT. Effort increases as people near a goal.** Apply: show progress; make the first step feel already started; keep the last step short.

**LAW-OCCAM. Among equal options, choose the one with fewest assumptions.** Apply: remove until it breaks, then add the last thing back.

**LAW-PARETO. Roughly 80 percent of use comes from 20 percent of features.** Apply: design the frequent paths first and best; the rest can take one extra click.

**LAW-SELECTIVE-ATTENTION (banner blindness). People ignore things that look like ads or decoration.** Apply: never style critical information like a promo banner; do not put essential info in carousels.

**LAW-CHOICE-OVERLOAD.** Too many options lead to no choice. Apply: curated defaults, comparison views for big decisions.

---

## 7. Visual craft heuristics

These are working rules that experienced product designers apply. Each still needs a reason row when it shapes a top-level decision.

- **CRAFT-WEIGHT-NOT-SIZE.** Create hierarchy with weight and color first, size second. Why: size jumps break rhythm and waste space; weight and color steps are subtler and scale better.
- **CRAFT-DEEMPHASIZE.** To make one thing stand out, quiet its neighbors rather than shouting louder. Why: emphasis is relative.
- **CRAFT-LABEL-LAST.** A value that explains itself (an email, a date, a price) does not need a label. Why: labels add noise; use them where the data is ambiguous.
- **CRAFT-SPACE-FIRST.** Start with more space than you think, then remove. Why: cramped layouts are the most common amateur tell; it is easier to tighten than to loosen.
- **CRAFT-FEWER-BORDERS.** Separate with spacing, background shift or shadow before borders. Why: borders everywhere create visual noise and a grid of boxes.
- **CRAFT-SYSTEM-CONSTRAINTS.** Choose from predefined scales (space, type, color, radius, shadow), never ad hoc. Why: constraints make decisions fast and consistent.
- **CRAFT-GRAYSCALE-FIRST.** Design the layout and hierarchy in grayscale, add color last. Why: it forces hierarchy through space, weight and contrast, so color becomes meaning, not crutch.
- **CRAFT-NO-GRAY-ON-COLOR.** On a colored background, use a tint or shade of that hue for secondary text, not gray. Why: gray on color looks dirty and washed out.
- **CRAFT-SHADOW-LIGHT.** Shadows imply one light source above; small and tight for low elevation, large and soft for high. Two-layer shadows (a tight one plus a soft one) read as real. Why: inconsistent light sources read as fake.
- **CRAFT-ALIGN-NUMBERS.** Tabular numerals and right alignment for any column of numbers. Why: comparison by eye.
- **CRAFT-MEASURE.** Running text at 45 to 75 characters per line. Why: longer lines lose the return sweep; shorter lines break rhythm.
- **CRAFT-LINE-HEIGHT.** Larger text needs less line height (headings about 1.1 to 1.25, body about 1.5). Why: optical density.
- **CRAFT-EMPTY-STATES.** An empty state is a first impression and an invitation to act, not a blank. Why: new users always see it first.
- **CRAFT-ONE-BOLD-MOVE.** Spend boldness in one place per view; keep everything around it quiet. Why: LAW-VON-RESTORFF.

---

## 8. Ergonomic numbers you can cite

| Topic | Number | Source |
| --- | --- | --- |
| Touch target | 44 by 44 pt (Apple), 48 by 48 dp (Material); WCAG 2.2 AA floor 24 by 24 CSS px, AAA 44 | HIG, Material, WCAG 2.5.8 and 2.5.5 |
| Spacing between targets | at least 8 px | HIG, Material |
| Text contrast | 4.5:1 body, 3:1 large text (24 px, or 18.66 px bold) | WCAG 1.4.3 |
| Non-text contrast | 3:1 for control boundaries, focus indicators, meaningful icons | WCAG 1.4.11 |
| Body text on mobile | at least 16 px (also stops iOS zoom on input focus) | HIG, Safari behavior |
| Line length | 45 to 75 characters | typographic tradition, Bringhurst |
| Response feels instant | under 100 ms | Nielsen, Miller (response time limits) |
| Flow is kept | under 1 s | same |
| Attention is lost | over 10 s (needs progress with estimate) | same |
| Doherty threshold | under 400 ms | Doherty and Thadani |
| Interaction to Next Paint | at most 200 ms at p75 | Core Web Vitals |
| LCP and CLS | at most 2.5 s and at most 0.1 at p75 | Core Web Vitals |
| Motion durations | feedback 100 to 200 ms, transitions 200 to 300 ms, large spatial 300 to 500 ms, exits shorter than entrances | HIG, Material motion |
| Flashing | no more than 3 per second | WCAG 2.3.1 |
| Reflow | no 2D scroll at 320 CSS px | WCAG 1.4.10 |
| Zoom | content works at 200 percent | WCAG 1.4.4 |

---

## 9. Rams' taste filter

After a design is complete, run it past Dieter Rams' ten principles of good design: innovative, useful, aesthetic, understandable, unobtrusive, honest, long-lasting, thorough down to the last detail, environmentally friendly (here: light on bytes, battery and attention), and as little design as possible. Any element that fails "useful", "honest" or "as little as possible" is a candidate for removal. Then apply the Chanel rule: look once more and remove one accessory.

---

## 10. The decision rationale protocol

**No reason, no ship.** Every top-level design decision (typeface, palette, radius, elevation, density, layout model, navigation model, motion language, iconography, imagery, voice) and every decision that departs from a convention gets a row in `design/DECISIONS.md`:

| Field | Content |
| --- | --- |
| ID | D-001, D-002, ... |
| Decision | What was decided, specifically (values, not adjectives) |
| Principle | One or more IDs from this file, the project's rules, or `09-accessibility-i18n.md` |
| Human reason | Why it matters for THESE users doing THESE tasks, citing the brief |
| Evidence | DECIDED (owner said), OBSERVED (research or data), INFERRED (from brief), ASSUMED (needs validation) |
| Alternatives rejected | At least one, with why it lost |
| Revisit if | The condition that would reopen the decision |

Good row:
> D-007 | Primary action pinned to the bottom of the viewport on mobile, full width, 52 px tall | LAW-FITTS, HIG-HIERARCHY | Brief Q6: drivers update delivery status one-handed between stops; bottom third is the natural thumb zone | INFERRED | Top-right header action (lost: unreachable one-handed on 6.1 in phones); floating action button (lost: covers list content) | Revisit if analytics show desktop dominates.

Bad rows (reject these):
> "Inter, because it is clean and modern." (no principle, no user reason, a default)
> "Purple gradient hero, looks premium." (adjective, no human reason)
> "Cards with 16 px radius like Linear." (a reference is not a reason; name the principle borrowed)

Component-level choices inside an approved system (a specific gap, an icon choice) are recorded in the component spec, not in DECISIONS.md, but still need a one-line reason when they depart from the system default.
