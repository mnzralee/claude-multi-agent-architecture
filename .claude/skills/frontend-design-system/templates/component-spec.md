# Component spec: <ComponentName>

```
layer: primitive | layout | states | pattern | domain
status: draft | built | deprecated (replacement)
path: <components/...>
```

## Purpose

One sentence: the job this component does. If it needs "and", it may be two components.

## Anatomy

Named parts (container, icon, label, helper, indicator), with an ASCII sketch if useful.

## Variants and API

| Prop | Type | Default | Notes |
| --- | --- | --- | --- |
| emphasis | 'primary' \| 'secondary' \| 'ghost' \| 'danger' | 'secondary' | one primary per view |
| size | 'sm' \| 'md' \| 'lg' | 'md' | |

Native attributes and ref pass through; `className` merges last via `cn()`.

## States

| State | Visual | Behavior | Token(s) |
| --- | --- | --- | --- |
| default | | | |
| hover (pointer fine only) | | | |
| focus-visible | 2 px ring, offset 2 | | focus-ring |
| active / pressed | | scale 0.97, 100 ms | |
| disabled | | not focusable or aria-disabled, with reason | |
| loading | label kept, spinner added, width fixed | aria-busy | |
| error / invalid | | aria-invalid, described by message | |

## Accessibility

Element or role; keyboard (keys and what they do); focus management; accessible name rule; ARIA states; target size; reduced-motion behavior.

## Tokens used

Semantic tokens only: <list>.

## Content rules

Label length, casing (sentence case), verbs, truncation and wrapping, translation expansion.

## Do and don't

- Do:
- Don't:

## Rationale

Choices that depart from the system default, each with a principle ID and reason.

## Tests

Behavior tests (what the user sees and can do), axe check, showcase entry with every variant and state in both themes.
