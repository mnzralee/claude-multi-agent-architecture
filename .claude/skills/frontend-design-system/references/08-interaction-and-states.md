# Interaction, states, forms, flows and words

How screens behave. Every rule carries its reason, because a rule without a reason gets broken the first time it is inconvenient. IDs in brackets point to `04-human-interface-laws.md`.

## Contents

1. Hierarchy on a screen
2. Feedback and async work
3. The states every view must design
4. Forms and inputs
5. Flows, navigation and modality
6. Overflow, truncation and disclosure
7. Consequential actions and honesty
8. Dark patterns (banned)
9. Motion behavior
10. Writing in the interface

---

## 1. Hierarchy on a screen

- **One screen, one job, one primary action.** Two filled buttons force the user to guess which one the product wants. Everything else is secondary (outline, ghost, text) or behind a disclosure. [HIG-HIERARCHY, LAW-HICK, LAW-VON-RESTORFF]
- **The primary action sits where the eye ends.** Under the last field on desktop; bottom of the content (or pinned to the bottom edge) on mobile. Never above the thing it acts on, because people act after reading. [LAW-FITTS, NOR-MAPPING]
- **The title says what the screen is for, in the user's words.** A subtitle adds one fact the title cannot hold. A third paragraph of explanation means the screen is doing two jobs: split it or move detail into a disclosure. [NIE-2, NIE-8]
- **Order content by the decision it serves.** What the user needs to act comes first; reassurance, policy and support text come last at muted level. [LAW-SERIAL-POSITION, LAW-COGNITIVE-LOAD]
- **Three type levels per block at most** (primary, secondary, muted). A fourth level is a section boundary in disguise. Take size, weight and color together from one row of the type scale; mixing them is how a screen accumulates twenty type styles. [CRAFT-WEIGHT-NOT-SIZE, HIG-CLARITY]

## 2. Feedback and async work

- **Pressed state within 100 ms of the tap**, before any network call returns. Without it people tap again. [HIG-FEEDBACK]
- **Work over about 1 s shows progress in place.** The button keeps its label AND its width and gains a spinner, and is disabled for the duration. Never swap the whole screen for a spinner when the layout can stay, because the user loses their context. [NIE-1, LAW-DOHERTY]
- **A loading transition changes nothing but the control that started it.** No block appears, disappears or moves (CLS 0 across the transition). Layout jumps make people click the wrong thing. [HIG-FEEDBACK, CWV]
- **Double submit is impossible, not unlikely.** Disable on submit AND guard in the handler (`if (submitting) return`). Visual disabling alone fails on fast double taps and keyboard repeat. [NOR-CONSTRAINTS]
- **Success is explicit.** Say what happened and what happens next ("Password changed. You are still signed in on this device."). Silence after an action reads as failure. [SHN-CLOSURE]
- **A timeout is an unknown outcome, and the copy must say so.** When the client gives up waiting, the server may already have acted. Never say "nothing was sent" unless the server said so. Say what is known and make retry safe (idempotency keys). [NIE-1, honesty]
- **Optimistic UI only for safe, reversible actions** (like, star, reorder). Never for money, deletion or anything with side effects outside the app. Roll back visibly on failure. [LAW-DOHERTY vs honesty]

## 3. The states every view must design

A design that shows only the happy path is a third of a design. Specify each cell, or write "N/A: reason".

| Scope | States |
| --- | --- |
| Component | default, hover, focus-visible, active/pressed, disabled, read-only, selected, loading, error, success, invalid, empty |
| Screen | first-run, empty, no-results, loading (skeleton), partial, stale, error with retry, offline, permission-denied, rate-limited, long-running with progress, optimistic, conflict, session-expired, not-found |
| Content stress | zero, one, many, maximum items; shortest and longest strings; missing values; 30 to 40 percent text expansion (translation); very long single words and URLs |

Rules:
- **Four states minimum for every data view: loading, empty, error, populated.** Build them from ONE shared states set (`components/states`), never per screen, so every empty state in the product speaks the same language. [HIG-CONSISTENCY, DRY]
- **Skeletons over spinners for content.** A skeleton that matches the final layout makes the wait feel shorter and prevents layout shift. Spinners belong only inside the control that triggered work. [LAW-DOHERTY]
- **An empty state explains and offers the next action** ("No invoices yet. Create your first invoice."). It is the first screen every new user sees. [CRAFT-EMPTY-STATES, HIG-ONBOARDING]
- **An error state says what failed, what to do, and offers retry.** Never a raw status code: "a status code is not a diagnosis". [NIE-9]
- **Unknown is a state, not a value.** Absent data renders as visibly "Unknown" or "Unavailable", distinct from a real zero, a real "No", and empty. Showing a stale or default value for a consequential fact is a lie by omission. [NOR-CONCEPTUAL-MODEL, honesty]
- **Every state is reachable on purpose** (seed data, a flag, a throttled network, a role account) so it can be built and tested. A state nobody can force is a state nobody has seen.

## 4. Forms and inputs

- **Visible labels, always.** A placeholder is an example, never the label: it disappears on input, fails contrast, and breaks recall. Floating labels are fine only if the label stays visible. [NIE-6]
- **Set keyboard and autofill for every field.** It halves typing on mobile and lets password managers work.

| Field | Attributes |
| --- | --- |
| Email | `type="email" inputmode="email" autocomplete="email" autocapitalize="none" spellcheck="false"` |
| Phone | `type="tel" inputmode="tel" autocomplete="tel"` |
| One-time code | one input: `inputmode="numeric" autocomplete="one-time-code" pattern="[0-9]*"` |
| New password | `type="password" autocomplete="new-password"` plus show/hide toggle |
| Current password | `type="password" autocomplete="current-password"` |
| Name | `autocomplete="name"` (or `given-name`, `family-name`) |
| Address | `autocomplete="street-address"`, `postal-code`, `country` and so on |
| Amount | `inputmode="decimal"`, locale-aware parsing |

- **Prefer one field for a one-time code.** Split boxes only if pasting a full code into any box fills all of them, backspace moves back, the group has one label, and a wrong code clears with focus returned to the first box. A single wide field with letter spacing meets all of that for free. [NOR-CONSTRAINTS, LAW-POSTEL]
- **Validate when the user is done with a field** (on blur or submit), never on every keystroke while they type: being told you are wrong before you finish is hostile. Clear a field's error as soon as it is edited. [NIE-5]
- **Errors sit next to their field** with `aria-invalid="true"` and `aria-describedby`. A form with more than one error also gets a summary above the form linking to each field, and focus moves to it on failed submit. [NIE-9, WCAG 3.3.1]
- **Never discard what the user typed** on an error, a back navigation inside a flow, or a retry. Retyping is the most hated form experience. [NIE-3]
- **Ask only for what this step needs, and say why when it is not obvious** ("We use your phone number only for sign-in codes."). Every field costs completion rate. [LAW-COGNITIVE-LOAD, trust]
- **Accept liberally, display canonically.** Strip spaces from pasted codes, accept phone numbers with separators, trim emails. [LAW-POSTEL]
- **Error color differs from the resting state in hue AND weight AND words.** A slightly darker border is not a state change. [WCAG 1.4.1]
- **Enter submits a single-line form; Cmd or Ctrl plus Enter submits a textarea.** Keyboard users expect it.
- **Do not pre-disable the submit button.** A disabled button with no explanation hides what is wrong; let the user submit and show the errors. Disable only while the request is in flight, and send an idempotency key so a retry cannot double-charge.
- **Never block paste**, including in password and code fields. Password managers and accessibility tools depend on it.
- **Placeholders are example values** ("name@company.com"), never instructions or labels.

## 5. Flows, navigation and modality

- **One flow, one shell, one progress model.** Every screen of a journey the user experiences as one task uses the same header, content column, step indicator position and button position. Internal boundaries (a different route, component or API) must never show through as a layout change, or one journey looks like two products. The step indicator starts at the first step the user takes and counts to the end. [HIG-CONSISTENCY, LAW-GOAL-GRADIENT]
- **Show where the user is in a multi-step flow** (step indicator with count) and let them go back without losing answers. [NIE-1, NIE-3]
- **There is always a way out:** visible cancel or back, and a support route on every terminal or failure screen. No dead ends. [HIG-USER-CONTROL]
- **A modal is for a short, focused decision needed now.** Everything else is a page or a sheet. [HIG-MODALITY]
- **Preserve state across reload where the flow allows it.** Where it deliberately does not (security), say so before the user starts.
- **Navigation follows conventions** (logo home top-left, primary nav consistent across pages, current location marked with `aria-current`). Innovation belongs in the product, not in where the menu lives. [LAW-JAKOB]
- **Filters, sort, pagination and tabs live in the URL** so back, refresh and share work. [NIE-3]
- **Restore scroll position on Back**, and keep focus where the user left it. Losing your place in a long list is a top complaint.
- **Lists over about 50 rich items get virtualized** or paginated, so scrolling stays smooth on mid-range phones.
- **Links navigate, buttons act.** A `<button>` that navigates or an `<a>` that submits breaks keyboard, screen reader and middle-click expectations. [NOR-SIGNIFIER]

## 6. Overflow, truncation and disclosure

Nothing may be silently clipped. If content exceeds its container there are exactly three honest answers:
1. **Wrap**, when the content is prose.
2. **Scroll the container**, when the content is a table or image, and the scroll is obvious.
3. **Collapse behind a control**, when there is more than the screen should carry at rest.

The disclosure contract:
- The trigger is a `button` labeled with what opens ("Show 3 more documents"), not "More".
- Expanded state is visible and wired with `aria-expanded`.
- Nothing decision-critical lives only behind a collapse.
- A truncated string gets a title AND a way to read it in full (tooltip that also opens on focus and tap, or a disclosure). Hover alone excludes keyboard and touch users.

Check: at each target width, no element's `scrollWidth` exceeds its `clientWidth` without a visible scrollbar, and the page never scrolls horizontally. Measure; do not eyeball.

Tooltips: open on hover AND focus, dismiss with Escape, stay open while hovered (WCAG 1.4.13), and contain no interactive content (that makes it a popover).

## 7. Consequential actions and honesty

- **Destructive actions use the verb** ("Delete project", "Cancel subscription"), never "OK" or "Yes". Styled as destructive, never the default focus, never icon-only. [HIG-USER-CONTROL, NIE-5]
- **Prefer undo over confirmation for frequent actions**; confirmation dialogs get clicked through by habit. Use typed confirmation ("type the project name") only for irreversible, high-impact actions.
- **A confirmation names the object and the consequence** ("Delete 'Q3 report'? This removes it for everyone and cannot be undone.").
- **Every displayed value has a source.** A number the backend did not return is never shown as if it did. Counts state their denominator ("12 of 340"). Scores explain themselves in place (what was measured, threshold, when). [NOR-CONCEPTUAL-MODEL]
- **Show data age where it matters** ("Updated 2 min ago"), and show "Unavailable" when loading fails, never the last cached value without saying so.
- **Never convey status by color alone.** Color plus icon plus words. About 1 in 12 men has a color vision deficiency. [WCAG 1.4.1]

## 8. Dark patterns (banned)

These trade long-term trust for a short-term metric. They are defects, at HIGH severity, even if a stakeholder asks for them; offer a compliant variant instead.

confirmshaming ("No thanks, I like paying more"); asymmetric accept and reject (big Accept, tiny Reject); pre-ticked consent or upsells; cancellation harder than sign-up; hidden costs revealed at the last step; false urgency and fake scarcity timers; nagging (repeated prompts after a "no"); trick questions (double negatives); obstructed opt-out; bundled consent (one checkbox for many purposes); disguised ads; forced continuity without reminder.

Consent rules: equal prominence for accept and reject, nothing pre-ticked, one purpose per consent, opting out as easy as opting in.

## 9. Motion behavior

- **Motion explains a change** (where something came from or went, what caused what, what state changed). If an animation communicates none of these, remove it. [HIG-DEFERENCE, HIG-DEPTH]
- **Animate by frequency.** Actions people do many times a day (keyboard shortcuts, command palette, list navigation) get little or no animation, because a delay repeated 100 times a day is friction. Occasional UI gets standard motion. Rare moments (first success, onboarding completion) may carry authored delight.
- **Durations:** press feedback 100 to 160 ms; tooltips 125 to 200 ms; dropdowns and popovers 150 to 250 ms; state changes 150 to 300 ms; modals, sheets and drawers 200 to 500 ms; a focal entrance at most 500 to 800 ms, once. Exits at about 60 to 70 percent of the entrance. Stagger 30 to 80 ms between items. Longer needs a stated reason.
- **Easing:** ease-out to enter and to exit (the movement starts fast, so the UI feels responsive), ease-in-out for things moving on screen, linear only for constant motion like progress. Avoid plain ease-in for UI, it feels sluggish. Useful curves: `cubic-bezier(0.23, 1, 0.32, 1)` (strong ease-out), `cubic-bezier(0.77, 0, 0.175, 1)` (ease-in-out), `cubic-bezier(0.32, 0.72, 0, 1)` (drawers). Put them in motion tokens.
- **Physical details:** pressed buttons scale to about 0.97; never animate from `scale(0)` (start at about 0.95 plus opacity); popovers grow from their trigger (`transform-origin` at the trigger), dialogs stay centered; springs with low bounce (0.1 to 0.3) if any.
- **Animate only compositor properties:** `transform`, `opacity` (and `clip-path`, `filter` with care, blur under 20 px). Never `transition: all`; list the properties. Animating `width`, `height`, `top`, `left` or `margin` causes layout work and jank on mid-range phones.
- **Interruptible and non-blocking.** Prefer CSS transitions (they retarget mid-flight) over keyframes for interactive state; use `@starting-style` for entry transitions. Nothing essential waits for an animation, and no animation blocks input.
- **Tooltips:** a short delay before the first opens; once one is open, neighbors open instantly.
- **Spinners:** wait about 150 to 300 ms before showing one (fast responses then never flash a spinner), and once shown keep it at least 300 to 500 ms (no flicker).
- **Reduced motion is a hard switch.** Under `prefers-reduced-motion: reduce`, drop the movement and keep the state change (fade or instant swap). "None" is wrong when the motion carried meaning. Parallax, scroll-jacking, large zooms and loops are removed. Autoplay over 5 s needs a pause control.
- **One orchestrated moment beats scattered effects.** Fade-and-slide-up on every section and hover lifts on every card are generic defaults and read as generated.
- **Hover effects only under `@media (hover: hover) and (pointer: fine)`** so touch devices do not get sticky hover states.
- **Pause off-screen loops** and use `will-change` only during an active animation.

## 10. Writing in the interface

Words are interface. They get the same rigor as spacing.

- **Plain, short, active.** Sentence case for titles, buttons and labels. Why: sentence case reads faster and feels human; Title Case Everywhere reads like a form.
- **Buttons are verbs that say what happens:** "Save changes", "Send invite", "Delete project". Never "OK", "Submit", "Yes". The same action keeps the same name through the flow: the "Publish" button produces a "Published" toast.
- **Name things by the user's nouns**, from the brief's glossary, never the system's internals.
- **Errors say what happened and what to do, without blame or apology:** "That card was declined. Try another card or contact your bank." not "Error 402" or "Oops! Something went wrong."
- **Numbers and times are specific:** "This code works for 10 minutes", not "soon".
- **Whole sentences with placeholders** so they translate; never build a sentence by concatenation.
- **No filler, no hype, no exclamation marks in system copy.** Tone matches brand and audience, decided once in the voice section of the design system.
- **Empty and error moments give direction, not mood.** An empty screen is an invitation to act.
- **Typographic details:** an ellipsis on menu items that open a further step ("Rename…") and on in-progress states ("Saving…"); curly quotes in prose; a non-breaking space between a number and its unit ("10 MB"); `translate="no"` on brand names so browser translation does not mangle them.
- **Placeholder data is a tell.** "John Doe", "Acme", "Lorem ipsum", "99.99%" and invented precise figures make a design look fake. Use realistic content from the domain, clearly marked as sample.
