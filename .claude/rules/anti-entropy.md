# Anti-Entropy Standards

This rule carries only the non-negotiable core of the 8 anti-entropy rules. The full doctrine (worked examples, the complete anti-pattern catalog, sources, the pre-PR checklist) lives at `.claude/standards/ANTI-ENTROPY.md`, read on demand.

Code is a liability, not an asset; capability is the deliverable. Add less. Remove when you can. Improve what you touch.

1. **Boy Scout Rule.** Leave each touched file cleaner than you found it: a rename, an extracted helper, a deleted dead branch, in the same commit. A move/rename across files or a folder restructure gets its own `refactor(scope):` commit instead.
2. **Dead code, every branch.** Run this stack's dead-code analyzer on the touched workspace before PR; remove any unused export the feature itself produced. Full sweeps happen at milestone close and pre-release. Exception: published API surfaces need a deprecation cycle, never a silent delete.
3. **ADR on non-obvious decisions.** A new framework/runtime/dependency, a cross-service contract, reversing a prior decision, or naming a new bounded context each need an ADR at `docs/adrs/ADR-NNN-<kebab-title>.md`. ADRs are append-only; supersede, never edit history.
4. **Hotspot awareness.** A file with 2 or more of: 800+ lines, 20+ commits in 90 days, 10+ importers, a debt-register entry, 5+ TODO/FIXME markers is a hotspot. Refactor budget concentrates there; a hotspot getting MORE complex after a change is a review blocker.
5. **Characterize before refactoring untested code.** Pin current observed behavior with a test first, refactor with that test as the safety net, fix any exposed bug in a separate commit. Mandatory on hotspots, money/ledger paths, and anything under 50% coverage.
6. **Name the anti-pattern.** God Object, Feature Envy, Shotgun Surgery, Divergent Change, Speculative Generality, Premature Abstraction, Primitive Obsession, Long Method, Lazy Class, Comments as Compensation, Dead Code. A reviewer citing one of these by name gets a fix or an ADR justifying the exception, not silence.
7. **CUPID over SOLID when they conflict.** Prefer properties (a gradient) over principles (binary compliance): describable in one sentence without "and", new behavior as a new unit rather than a modification, no surprising overrides, small intention-revealing ports, dependencies pointing inward, domain-true names, idiomatic per language.
8. **Docs follow the schema, same commit.** The schema/types/validators are canonical; a doc that disagrees is wrong by definition and gets fixed in the same commit as the schema change, not after.

Related: `production-grade-code.md`, `code-quality.md`, `clean-architecture.md`, `context-budget.md` (the Ralph Loop), `deterministic-review.md`, `work-records.md`, `complexity-limits.md`.
