# Anti-Entropy Standards

## Overview

Software entropy is the gradual drift from coherent design toward incoherence under continuous change. This rule sets the BEHAVIORAL discipline that prevents drift, focusing on what is not already enforced by `production-grade-code.md` (forbidden patterns), `clean-architecture.md` (layer rules), or `code-quality.md` (positive style). The Pragmatic Programmer puts it bluntly: a single broken window left unrepaired signals that no one is watching, and other windows soon follow.

These standards are stack-agnostic. The examples below assume a TypeScript / Node toolchain for concreteness, but the discipline applies to any language: substitute your own dead-code analyzer, your own schema-of-record, and your own module conventions.

---

## Core Principle: Code Is a Liability

> "Code is liability, useful features are assets." Software Engineering at Google, Winters/Manshreck/Wright, 2020.

Capability is the deliverable, not lines of code. Every line added must be carried forever: reviewed, tested, ported through framework upgrades, kept consistent. The Boy Scout Rule and YAGNI both follow. Add less. Remove when you can. Improve what you touch.

---

## Rule 1: The Boy Scout Rule (Opportunistic Refactoring)

> "Always leave the code behind in a better state than you found it." Martin Fowler, Opportunistic Refactoring (bliki, 2011).

When a use case, controller, or module is touched for a feature or fix, leave it cleaner than found: a renamed variable, an extracted helper, a deleted dead branch. This is opportunistic, not scheduled.

| Cleanup | OK in feature commit? |
|---|---|
| Rename a local variable, extract a helper in the same file | Yes |
| Delete commented-out code in the file being edited | Yes |
| Fix an obviously wrong type annotation in the same function | Yes |
| Move a function to a different module, rename a public export | No, separate `refactor(scope):` commit |
| Restructure a folder | No, dedicated planning, plus a review gate if it crosses 3+ services |

When NOT to refactor: tests failing on the file (get to green first); coverage thin (add a characterization test first, Rule 5); change would balloon the diff past mental review capacity.

---

## Rule 2: Dead Code Elimination on Every Branch

Dead code confuses readers, gets imported by accident, survives migrations because reviewers assume "someone uses it," and inflates bundles. Speculative Generality is in Fowler's catalog precisely because unused abstractions hide the real shape of the system.

### Tooling

Use a dead-code analyzer suited to your language. For TypeScript, prefer `knip` (not `ts-prune`, which is in maintenance mode per `effectivetypescript.com`) across all workspaces. [CUSTOMIZE: substitute your stack's equivalent, for example `vulture` for Python, `deadcode` for Go, or `cargo-machete` for unused dependencies in Rust.]

```bash
cd apps/core && npx knip --include files,exports,types,dependencies
cd apps/worker && npx knip
```

### Cadence

| Cadence | Action |
|---|---|
| Per feature branch | Run the analyzer on touched workspace before PR. Remove dead exports the feature itself produced. |
| Per session close | New unused exports get a `chore(scope): remove dead code` commit. |
| Per milestone close | Full sweep across all workspaces, one `refactor(scope): dead code sweep` per workspace. |
| Pre-release promotion | Mandatory full sweep, zero unused exports outside `index.ts` barrels. |

What counts as dead code: unused exports, unreferenced files, fully-rolled-out feature flags (delete flag AND alternate branch), deprecated paths with no consumer, `// TODO` older than 90 days with no ticket, `// eslint-disable` blocks whose underlying violation has been fixed.

Exception: published API surfaces (a library export, a versioned contract, a plugin interface) may have external consumers you cannot see. Removing one requires a deprecation cycle: mark it deprecated in the documentation, give consumers a window to migrate, then remove. Do not silently delete anything another team or system might depend on.

---

## Rule 3: ADR Cadence (Architecture Decision Records)

ADRs prevent the most expensive entropy: the "why did we do it this way?" question asked six months later by an engineer who then rebuilds the wrong thing. Michael Nygard's 2011 template is canonical.

| Trigger | ADR required? |
|---|---|
| New framework, runtime, database, or major dep bump | Yes |
| Cross-service contract (event schema, REST contract) | Yes |
| Reversing a prior decision | Yes, supersede the old ADR |
| Choosing between two viable patterns when non-obvious | Yes |
| Naming a new bounded context, module, or service | Yes |
| Internal use-case implementation detail | No, lives in the code |

```markdown
# ADR-NNN: <Short title>

## Status
proposed | accepted | rejected | deprecated | superseded by ADR-NNN

## Context
What issue motivates this decision? Forces at play, technical and otherwise.

## Decision
What change is being made? Active voice.

## Consequences
What becomes easier or more difficult? Positive, negative, neutral. Be honest about trade-offs.
```

Location: `docs/adrs/ADR-NNN-<kebab-title>.md`. ADRs are append-only. To reverse, write a new ADR and set the old one to `superseded by ADR-NNN`. Never edit a historical ADR's Decision or Consequences.

---

## Rule 4: Hotspot Awareness

Adam Tornhill (Your Code as a Crime Scene, 2nd ed., Pragmatic Bookshelf 2024) defines a hotspot as the intersection of HIGH COMPLEXITY and HIGH CHANGE FREQUENCY. ThoughtWorks Technology Radar Vol 33 (Nov 2025) cites this method as the recommended way to prioritize tech-debt paydown.

A file is a hotspot if it meets two or more of: more than 800 lines (2.5x the `code-quality.md` target); more than 20 commits in the last 90 days; imported by more than 10 sites; flagged as a recognized-debt item in your project's debt register; more than 5 `// TODO` or `// FIXME` markers.

```bash
# 20 most-changed TypeScript files in the last 90 days
git log --since="90 days ago" --name-only --pretty=format: \
  | grep -E "\.(ts|tsx)$" | sort | uniq -c | sort -rn | head -20
```

What hotspot awareness changes: refactor budget concentrates on hotspots, not on prettifying stable code; new features added to a hotspot trigger a heightened review tier; a hotspot becoming MORE complex after a change is a review blocker.

---

## Rule 5: Characterization Tests Before Risky Refactors

> "Legacy code is code without tests." Michael Feathers, Working Effectively with Legacy Code (Prentice Hall, 2004).

When refactoring code with no test coverage, write a CHARACTERIZATION TEST first: pin down CURRENT observed behavior (not desired behavior). Refactor with the test as safety net. In a separate commit, fix any behaviors the test exposed as wrong.

```typescript
// Step 1: characterize what the code DOES today
it("characterization: 1000 units with 0.2% fee deducts 2 units", async () => {
  const result = await handler.execute({ from, to, amount: 1000n });
  expect(result.feeDeducted).toBe(2n);          // observed today, even if surprising
  expect(result.recipientCredited).toBe(998n);
});
// Step 2: refactor with this test passing
// Step 3: if a behavior is actually a bug, fix in a separate commit with a NEW
// test asserting correct behavior; mark the characterization as superseded.
```

Mandatory when: the file is a hotspot (Rule 4); the change touches money flow, persisted ledger state, or an irreversible external side effect; the function has under 50% line coverage; the use case is on the critical path of active work.

---

## Rule 6: Anti-Pattern Catalog (Named, Not Just "Bad Code")

Naming the pattern is half the fix. Reviewers and authors should reach for these names in PR feedback. The catalog merges Fowler's smells (Bloaters, OO Abusers, Change Preventers, Dispensables, Couplers) with patterns observed in practice.

| Anti-Pattern | Symptom | Example | Refactor |
|---|---|---|---|
| God Object | One class with more than ~5 unrelated public methods | A service that owns a 200-use-case aggregate | Extract bounded contexts; split into smaller use cases per domain noun |
| Feature Envy | Method on class A reads more from class B than from A | One service computing logic that belongs to another service's data | Move method to the class whose data it uses |
| Shotgun Surgery | One change requires edits in 5+ files | Adding a new event type touches the writer, the projector, the webhook, and the docs separately | Introduce a single event registry module; consumers reflect over it |
| Divergent Change | One file gets edited for many unrelated reasons | A bloated `index.ts` that re-exports and runs bootstrap and configures DI | Split the file by responsibility |
| Speculative Generality | Abstraction with one caller, "for future use" | Generic `Strategy<T>` interface implemented once | Inline the abstraction back to a concrete class |
| Premature Abstraction | Reusable framework built before three concrete cases exist | Custom event-bus written when only two services emit events | Use the simpler concrete pattern; abstract when the third caller arrives |
| Primitive Obsession | `string` and `bigint` where a value object belongs | Raw `bigint` amounts instead of a `Money` value object | Introduce a value object with construction-time invariants |
| Long Method | Function exceeds 30 lines (per `code-quality.md`) | A 200-line use case handler | Extract private methods or a domain service |
| Lazy Class | Class that does almost nothing | A wrapper class that exposes one method of its dependency | Inline the class |
| Comments as Compensation | Comment exists to explain unclear code | "// gets active users" above `filter(u => u.s === 'A')` | Rename; delete the comment |
| Dead Code | Unused export, unreached branch, unreferenced file | Helper functions left behind after a migration replaced their caller | Delete (Rule 2) |

When a `reviewer` or `code-quality-auditor` PR comment cites one of these names, the author either refactors to remove the smell or opens an ADR (Rule 3) explaining why the pattern is justified.

---

## Rule 7: SOLID, Pragmatically (or CUPID If You Prefer)

SOLID (Robert C. Martin, Clean Architecture, Prentice Hall 2017) remains a useful checklist, but Dan North's CUPID (dannorth.net/cupid-for-joyful-coding, 2022) is a more honest framing: PROPERTIES (gradient) not PRINCIPLES (binary compliance).

| Concern | Heuristic |
|---|---|
| Single Responsibility (S) / Unix philosophy (U) | Module describable in one sentence without "and" |
| Open-Closed (O) | New behavior arrives as a new use case or value object, not a modification |
| Liskov (L) / Predictable (P) | Subtypes and overrides do not surprise the caller |
| Interface Segregation (I) / Composable (C) | Ports have small, intention-revealing surface area |
| Dependency Inversion (D) | Enforced by `clean-architecture.md`: dependencies point inward |
| Domain-based (D) | Names, folders, and value objects come from the project's shared domain language |
| Idiomatic (I) | Each language reads like itself; idioms are not fought |

When SOLID and CUPID conflict, prefer CUPID. "Joyful code" maps better to the multi-session, multi-developer reality of a long-lived codebase than "is this compliant?".

---

## Rule 8: Documentation Drift Prevention

Documentation drifts faster than code rots. Three defenses:

1. **Schema-as-truth.** Your schema definitions, validation schemas (for example Zod validators), API contracts, and source-language types are canonical. Markdown that contradicts them is wrong by definition. When a design doc disagrees with the schema-of-record, the schema wins and the doc is updated in the same commit.
2. **Executable docs.** Prefer code samples that compile (for example TypeScript blocks validated by `eslint-plugin-markdown`) over prose claims about API shape.
3. **Doc co-location.** A CLAUDE.md sub-file lives WITH the folder it documents. Folder renamed or removed, doc updated in the same PR.

| Change | Required doc update |
|---|---|
| New service | The service-inventory CLAUDE.md plus the project's module register |
| Module status change | The project's module status register |
| New ADR | Index entry under `docs/adrs/README.md` |
| Schema change | Same commit updates the schema-of-record plus any design doc that references it |
| API contract change | The API contract doc (for example OpenAPI) plus consumer-side type imports |

---

## Tensions With Other Rules

- **Boy Scout vs file-by-file commits** (`git-workflow.md`): small in-place cleanups ship inside the feature commit; larger restructures get their own `refactor(scope):` commit in the same PR.
- **Dead-code analyzer aggressiveness vs speculative generality**: if an export has no consumer TODAY and no ADR references it, delete. YAGNI in tool form.
- **Hotspot refactor vs velocity cap**: cap hotspot fold-ins to BLOCKING and CRITICAL findings; MEDIUM findings become tracked carry-forwards in the project's debt register.
- **Comment deletion vs existing comments**: rename in this commit, delete the compensating comment in the same commit. Do not bulk-delete comments without renames; that loses information.

---

## Checklist (Before PR)

- [ ] Did I leave each file I touched cleaner than I found it (Rule 1)?
- [ ] Did I run the dead-code analyzer on the touched workspace and remove any new dead exports I introduced (Rule 2)?
- [ ] If I made an architectural choice non-obvious to a future reader, did I write an ADR (Rule 3)?
- [ ] If I touched a hotspot, did I check that complexity did not increase (Rule 4)?
- [ ] If I refactored a use case with thin coverage, did I write characterization tests first (Rule 5)?
- [ ] If a reviewer cites an anti-pattern name from Rule 6, did I either fix it or write an ADR justifying it?
- [ ] If documentation referenced what I changed, did I update it in the same PR (Rule 8)?

---

## Sources

- Fowler, Opportunistic Refactoring, https://martinfowler.com/bliki/OpportunisticRefactoring.html (2011)
- Hunt and Thomas, The Pragmatic Programmer, broken windows / software entropy (Addison-Wesley 1999, 20th anniv. 2019)
- Martin, Clean Architecture (Prentice Hall 2017), SOLID
- North, CUPID for joyful coding, https://dannorth.net/cupid-for-joyful-coding/ (2022)
- Nygard, Documenting Architecture Decisions (2011), template at https://github.com/joelparkerhenderson/architecture-decision-record
- Feathers, Working Effectively with Legacy Code (Prentice Hall 2004), seams and characterization tests
- Ousterhout, A Philosophy of Software Design (2nd ed. 2021), deep modules
- Winters, Manshreck, Wright (eds.), Software Engineering at Google (O'Reilly 2020), https://abseil.io/resources/swe-book
- Tornhill, Your Code as a Crime Scene (2nd ed., Pragmatic Bookshelf 2024), https://www.adamtornhill.com/articles/crimescene/codeascrimescene.htm
- Cunningham, WyCash Portfolio Management System (OOPSLA 1992), original tech debt metaphor
- Kruchten, Nord, Ozkaya, Technical Debt: From Metaphor to Theory and Practice, IEEE Software 29(6) 2012, https://www.sei.cmu.edu/documents/360/2012_019_001_58818.pdf
- ThoughtWorks Technology Radar Vol 33 (Nov 2025) and Vol 34 (Apr 2026), https://www.thoughtworks.com/radar
- Knip, https://knip.dev; ts-prune EOL note at https://effectivetypescript.com/2023/07/29/knip/
- Refactoring Guru code smells (Fowler-derived), https://refactoring.guru/refactoring/smells

---

## Related Rules

- `.claude/rules/production-grade-code.md` (forbidden patterns: no `any`, no silent fallbacks)
- `.claude/rules/code-quality.md` (positive patterns: naming, function size)
- `.claude/rules/clean-architecture.md` (layer rules, dependency direction)
- `.claude/rules/context-budget.md` (the Ralph Loop and refactor-as-you-go)
- `.claude/rules/deterministic-review.md` (review findings need evidence)
- `.claude/rules/work-records.md` (append-only narrative journal)
- `.claude/rules/complexity-limits.md` (the complexity budget hotspots draw down)
