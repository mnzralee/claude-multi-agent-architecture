# Accessibility and internationalization

Accessibility is part of the design, not a compliance pass at the end. Retrofitting it costs several times more than designing it in, and an inaccessible flow is a broken flow for a real person. Default target: **WCAG 2.2 level AA**, unless the brief or the law sets another.

## Contents

1. Numeric floors
2. The sixteen items every component spec answers
3. What a scanner cannot prove
4. Component-level patterns
5. Internationalization
6. Right-to-left and bidirectional text
7. Script-specific typography

---

## 1. Numeric floors

| Floor | Value | WCAG 2.2 |
| --- | --- | --- |
| Text contrast | 4.5:1; large text (24 px, or 18.66 px bold) 3:1 | 1.4.3 |
| Non-text contrast | 3:1 for control boundaries, focus indicators, meaningful icons, chart marks (pure decoration exempt) | 1.4.11 |
| Target size | at least 24 by 24 CSS px or equivalent spacing (aim for 44 by 44 on touch) | 2.5.8 |
| Reflow | no two-dimensional scrolling at 320 CSS px wide | 1.4.10 |
| Resize text | 200 percent with no loss of content or function | 1.4.4 |
| Text spacing | survives increased line, letter, word and paragraph spacing | 1.4.12 |
| Keyboard | everything operable, no trap | 2.1.1, 2.1.2 |
| Focus visible | always visible and not hidden behind sticky headers or footers | 2.4.7, 2.4.11 |
| Flashing | at most 3 flashes per second | 2.3.1 |
| Dragging | a single-pointer alternative to every drag | 2.5.7 |
| Status messages | announced without moving focus | 4.1.3 |
| Redundant entry | do not ask for the same information twice in a process | 3.3.7 |
| Accessible authentication | no cognitive test (memorizing, transcribing) without an alternative; allow paste and password managers | 3.3.8 |
| Consistent help | help mechanisms in the same place across pages | 3.2.6 |

WCAG 2.2 is also ISO/IEC 40500:2025 and is the legal baseline in most jurisdictions. APCA is a perceptual contrast model that is NOT part of current WCAG 3 drafts (whose contrast method is still undecided); use it only as a secondary design check (roughly Lc 90 for key numerals, 75 minimum for body, 60 other text, 45 large text and icons). WCAG 2.x ratios remain the gate. `scripts/contrast-matrix.mjs` reports both.

## 2. The sixteen items every component spec answers

| Item | The spec states |
| --- | --- |
| Semantic HTML | the element or role, landmarks, heading level |
| Keyboard | keys for each action (Tab, Shift+Tab, Enter, Space, arrows, Escape, Home, End) |
| Visible focus | the indicator (2 px ring, 3:1, offset) and that sticky elements never cover it |
| Focus order and management | order matches visual order; where focus goes when a dialog opens and closes, a route changes, an item is deleted, an error appears |
| Screen-reader semantics | roles, states (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-current`), properties, live regions |
| Labels and instructions | a visible label for each input; instructions before the field, not after |
| Target size | the hit area, padded if the glyph is smaller |
| Contrast | the token pairs used, from the contrast matrix |
| Text scaling | layout holds at 200 percent; text in rem |
| Reflow | works at 320 px |
| Reduced motion | the replacement for every animation |
| Non-color cues | the icon, text or shape that accompanies every color-coded state |
| Error identification | the message in text, tied to its field, with a suggestion |
| Accessible names | every control has a name that contains its visible label (voice-control users say what they see) |
| Status announcements | `role="status"` or `aria-live="polite"` for async results |
| Cognitive accessibility | plain words, consistent navigation, no unexplained time limits, no re-entry of data |

## 3. What a scanner cannot prove

Automated tools (axe, Lighthouse) catch roughly a third of issues. Before claiming anything is accessible, record:
1. **Keyboard-only walk** of every critical flow: tab order, visible focus, no trap, Escape closes overlays, focus returns to the trigger.
2. **Zoom to 200 percent and width 320 px**: nothing clips, nothing overlaps, no horizontal page scroll.
3. **Reduced motion and forced colors** (Windows High Contrast): state changes survive, focus is visible, custom controls stay visible.
4. **Screen reader pass** (VoiceOver, NVDA) where possible; otherwise write "screen reader: not tested". Never write "accessible" without measurement.

Report each criterion as automated, manual, or not tested. A reproduced manual finding outranks a scanner pass.

## 4. Component-level patterns

- **Semantic HTML first; ARIA only where HTML has no element.** A `<button>` gets focus, Enter and Space, and a role for free; a `<div onClick>` gets none. The first rule of ARIA: do not use ARIA if a native element does the job.
- **Dialogs:** focus moves into the dialog, is trapped while open, Escape closes, focus returns to the trigger, background is inert, the dialog has an accessible name (`aria-labelledby`).
- **Menus and listboxes:** arrow keys move, Enter selects, typeahead jumps, Escape closes. Use the headless library; do not hand-roll.
- **Tabs:** arrow keys between tabs, Tab into the panel, `aria-selected`, roving tabindex.
- **Forms:** `<label for>` or wrapping label; `fieldset` and `legend` for groups (radio sets, addresses); `aria-invalid` and `aria-describedby` for errors; error summary on submit takes focus.
- **Icon-only buttons:** `aria-label` (or visually hidden text); the icon itself `aria-hidden`.
- **Images:** meaningful `alt`; decorative `alt=""`; complex charts get a text summary or data table.
- **Skip link** to main content as the first focusable element on content-heavy pages.
- **Route changes in single-page apps:** move focus to the new page's heading (or announce the title) so screen-reader users know the page changed.
- **Focus styles:** use `:focus-visible` so the ring appears for keyboard users and not on every mouse click; never remove outlines without a replacement.
- **Touch:** no hover-only content; gestures have button alternatives.

## 5. Internationalization

Decide locales in the brief. Even a single-language product should be built i18n-ready, because retrofitting is expensive.
- No text in images.
- Logical CSS properties (`margin-inline-start`, `padding-block`, `inset-inline-end`) instead of left and right, from the first line.
- Allow 30 to 40 percent text expansion (German, Finnish); test with a pseudo-locale that lengthens and accents strings.
- Whole-sentence messages with placeholders and plural rules (ICU MessageFormat); never concatenate sentence fragments.
- Format dates, numbers, currency, lists and relative times with `Intl` (or the project's i18n library), never by hand.
- Give translators context: where the string appears, what each placeholder holds, length limits.
- Never machine-generate a translation where an official one is required.

## 6. Right-to-left and bidirectional text

- Set `dir` and `lang` on the document and on any embedded run in another language.
- Use `dir="auto"` or `<bdi>` for user-generated and mixed-direction text (names, amounts inside sentences).
- Mirror layout, navigation, progress direction and directional icons (arrows, back, forward).
- Do not mirror logos, media playback controls, clocks, checkmarks, or the digit order inside numbers.
- Verify every state in a flipped-direction screenshot pass. Read the rendering, not the source.

## 7. Script-specific typography

- Confirm the chosen families cover every script and diacritic in the locale list; pair with a companion family (for example a Noto family) via `unicode-range` where needed.
- No letter-spacing, italics or forced uppercase on joined scripts (Arabic, Devanagari).
- More line height for scripts with tall marks (Arabic, Thai, Devanagari).
- Never alter diacritics, vowel marks or ligatures; they are content.
- Specify which unit a length limit counts (code points, grapheme clusters or words); the answer differs by script.
