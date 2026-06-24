---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Complexity Limits

## Overview

Complexity is the enemy of change. Every refactor, every bug fix, every audit pays a tax proportional to how complex the code you touch is. This rule sets enforceable thresholds for the dimensions of complexity that matter most: control-flow difficulty (cognitive complexity), structural size (function length, file length, nesting depth), and interface width (parameter count). It complements `.claude/rules/code-quality.md` (positive patterns), `.claude/rules/production-grade-code.md` (forbidden patterns), and `.claude/rules/clean-architecture.md` (layer rules).

This rule is path-scoped to TypeScript and JavaScript files. The thresholds and the refactorings behind them are stack-agnostic, the examples are written in TypeScript only for concreteness. If your project uses another language, port the same thresholds to that language's linter and document the per-language scope in your project CLAUDE.md.

---

## Core Principle

> "The single most important goal in software design is to reduce complexity, because complexity is the only thing that limits what we can build."
> John Ousterhout, *A Philosophy of Software Design*

Two kinds of complexity exist, per Brooks (1986) and Moseley and Marks (2006):

- **Essential complexity** is inherent to the problem. Financial reconciliation has irreducible cases. Identity verification has irreducible document types. Cannot be removed, only encapsulated.
- **Accidental complexity** is what we add ourselves: long parameter lists, deep nesting, shared mutable state, scattered responsibilities. **This is what the rule targets.**

Cap thresholds exist because human working memory is finite. A reader who must hold more than seven branching paths in mind loses the thread. Thresholds are not aspirational; they are the line beyond which review quality collapses.

---

## Primary Metric: Cognitive Complexity

Cognitive complexity (Campbell, SonarSource 2018) measures how hard a function is to **read**, not how many paths it has. Three scoring rules:

| Rule | Trigger | Increment |
|---|---|---|
| B1 (base) | Each break in linear flow (`if`, `for`, `while`, `switch`, `catch`, ternary) | +1 |
| B2 (boolean) | Each operator in a flattened boolean chain (`&&`, `\|\|`, `??`) | +1 each |
| B3 (nesting) | Control structure nested inside another control structure | +1 per nesting level, on top of B1 |

A 10-arm `switch` scores 1. A triply-nested `if-while-if` scores 1 + 2 + 3 = 6. This is why cognitive complexity tracks readability where cyclomatic complexity (McCabe 1976) does not.

**Empirical support**: Munoz Baron et al. (ESEM 2020) validated that cognitive complexity correlates with human-rated understandability where cyclomatic does not. Subsequent work (Lavazza et al., JSS 2023; ICSME 2024 on unit-test readability) extends this finding.

### Threshold

| Severity | Cognitive Complexity |
|---|---|
| OK | 0 to 10 |
| Warning | 11 to 15 |
| Hard limit (ESLint error) | 16+ |

Enforced by `sonarjs/cognitive-complexity` at threshold 15. See your project's lint configuration.

---

## Secondary Metric: Cyclomatic Complexity

McCabe's V(G) is retained as a cheap secondary signal. NIST guidance and decades of practice converge on 10 as the warning line. **Threshold: ESLint `complexity` rule at 15** (slightly above NIST 10 to avoid noise on legitimate switch-driven dispatch). Use as a backstop; cognitive complexity is the load-bearing metric.

---

## Size Limits

### Function length: 30 lines target, 60 lines hard limit

Robert Martin's *Clean Code* argues for under 20 lines as a target and "almost never" 100. The pragmatic norm in this kit is **30 lines target, 60 lines hard limit** (excluding signature line and closing brace). This aligns with the existing rule in `.claude/rules/code-quality.md`.

Use cases in `application/use-cases/<name>/handler.ts` that orchestrate multiple infrastructure ports may legitimately exceed 30 lines but **never** exceed 60. Extract inner logic into private methods or domain services per Fowler's **Extract Function** refactoring.

Enforced by `max-lines-per-function: ["warn", { max: 60, skipBlankLines: true, skipComments: true }]`.

### File length: 300 lines target, 600 lines hard limit

Long files are a god-class smell. The 300-line target in `code-quality.md` is the soft target; a 600-line hard limit prevents the worst cases without flagging the legitimate aggregation patterns (controllers with sibling actions, repository classes with one method per persisted relation).

**Exemptions** (allowed to exceed 600 lines without warning):

- `**/shared/di/container.ts` (DI wiring, no logic; large dependency-injection containers are mechanically long but contain no branching to reason about)
- `**/eslint.config.js`, `**/vitest.config.*`, `**/next.config.*` (configuration)
- `**/domain/errors/index.ts` (error-class barrel; logic is in the throw sites, not here)
- `**/dto/response/index.ts` or similar pure DTO barrels
- `**/application/use-cases/index.ts` (use-case barrel; pure re-export)
- `**/infrastructure/repositories/index.ts` (repository barrel; pure re-export)
- `**/infrastructure/services/index.ts` (services barrel; pure re-export; class implementations live in sibling files)
- `**/interface/controllers/index.ts` (controllers barrel; pure re-export; class implementations live in sibling files)
- `**/domain/value-objects/index.ts` (value-object barrel; pure re-export)
- `**/application/dto/{response,request}/index.ts` (DTO barrels; pure re-export; aliases extracted to a sibling `aliases.dto.ts`)
- `**/*.spec.ts`, `**/*.test.ts` (test fixtures grow legitimately)

When a barrel-file exemption is granted because of an architecture decision, record it in `docs/adrs` so the exemption is traceable.

Enforced by `max-lines: ["warn", { max: 600, skipBlankLines: true, skipComments: true }]` with an override for the exempted globs.

### Nesting depth: 3 levels max

ESLint `max-depth` default is 4. This kit enforces **3**. Beyond 3 levels, refactor with Fowler's **Replace Nested Conditional with Guard Clauses** or **Replace Conditional with Polymorphism**.

```typescript
// BAD: 4 levels deep
async function approve(user: User): Promise<void> {
  if (user) {
    if (user.status === 'APPROVED') {
      for (const account of user.accounts) {
        if (account.isActive) {
          await this.activate(account);
        }
      }
    }
  }
}

// GOOD: guard clauses, 1 level
async function approve(user: User): Promise<void> {
  if (!user || user.status !== 'APPROVED') return;
  const activeAccounts = user.accounts.filter(a => a.isActive);
  await Promise.all(activeAccounts.map(a => this.activate(a)));
}
```

### Parameter count: 3 max positional, then object

The existing `code-quality.md` rule says 3. ESLint default is 3. This rule inherits the stricter rule: **3 max positional parameters**. Beyond 3, use a typed input object per Fowler's **Introduce Parameter Object**. Eliminates long parameter lists and "data clumps" simultaneously. Enforced by `max-params: ["warn", 3]` in `eslint.config.js`.

---

## The Deep Modules Principle

Ousterhout (*A Philosophy of Software Design*) defines module depth as **functionality provided divided by interface width**. A deep module hides a lot of complexity behind a small public interface; a shallow module exposes most of its mechanics.

```typescript
// SHALLOW: 6 public methods exposing 6 implementation details
class AccountService {
  computeFee(amount: bigint): bigint { ... }
  computeBalance(transfers: Transfer[]): bigint { ... }
  formatAmount(amount: bigint): string { ... }
  validateAddress(address: string): boolean { ... }
  // ...
}

// DEEP: 1 public method orchestrating 6 internal helpers
class AccountService {
  async transfer(input: TransferInput): Promise<TransferResult> { ... }
  private computeFee(amount: Money): Money { ... }
  private computeBalance(transfers: Transfer[]): Money { ... }
  // helpers stay private
}
```

The deep version is **better** even though it has the same line count. Callers only see `transfer`. The complexity tax (fee math, balance math, address validation) is paid once inside the class, not at every call site.

**Anti-pattern: shallow class refactors**. Breaking a 600-line class into six 100-line classes is not a win if all six are now public. The interface count went up; complexity moved sideways, not down.

---

## Accidental vs Essential Complexity

| Complexity | Source | Example | Verdict |
|---|---|---|---|
| Essential | A domain has 4 document types, 3 verification states, 2 escalation paths | An identity-verification state machine | Cannot remove. Encapsulate in a domain service. |
| Essential | Settlement reconciliation needs idempotency + retry + dead-letter | A transactional outbox | Cannot remove. The event-driven outbox pattern is the encapsulation. |
| Accidental | A handler reads from 5 repositories and threads results through 8 conditionals | Long use-case handler | **Remove.** Push joins into the repository or a domain service. |
| Accidental | A controller mutates request state, calls a use case, then re-formats the response by reading the original request again | Common in older endpoints | **Remove.** Use immutable inputs. |
| Accidental | A 500-line `switch` on `entity.type` instead of polymorphism | Scattered across a service | **Remove.** Fowler's **Replace Conditional with Polymorphism**. |

When in doubt: ask whether the complexity would still be there if the developer were ideal. If yes, it is essential. If no, it is accidental and falls under this rule.

---

## Anti-Patterns Catalog

### God object / God use-case

Symptom: one class or one use case grows past 600 lines with 10+ unrelated responsibilities. A dependency-injection container is exempt (it has no branching to reason about); a mega-aggregate that funnels hundreds of unrelated use cases through one class is not. **Refactor**: Extract Class (Fowler).

### Feature envy

Symptom: method on class A uses three or more fields from class B and only one of its own. The method belongs on B. **Refactor**: Move Method.

### Shotgun surgery

Symptom: a one-line behavioural change requires edits in 8 files. **Detection**: change-coupling analysis (see next section). **Refactor**: consolidate the scattered responsibility into one module.

### Divergent change

Symptom: a single class changes for many unrelated reasons (a verification class is touched when unrelated billing rules change). Opposite of shotgun surgery. **Refactor**: Extract Class along the change-axis.

### Primitive obsession

Symptom: `string` for an address, `number` for a money amount, `Date` for a business date. Often partially addressed in `.claude/rules/production-grade-code.md` (deprecating raw-primitive aliases in favour of value objects). **Refactor**: introduce a value object from your shared domain package (for example `@org/core-domain`).

### Data clumps

Symptom: the same three or four parameters travel together through five functions. They want to be an object. **Refactor**: Introduce Parameter Object.

### Long parameter list

Already covered above. Over 3 positional args, use a typed input object.

### Switch-statement smell

Symptom: a `switch (entity.type)` repeated in three or more places. **Refactor**: Replace Conditional with Polymorphism. If polymorphism is overkill, at least centralize the switch in one factory.

### Refused bequest

Symptom: a subclass overrides most of its parent's methods to throw or no-op. **Refactor**: prefer composition; the inheritance was wrong.

### Speculative generality

Symptom: configuration options, hooks, or abstractions added "in case we need them later". YAGNI. **Refactor**: delete the unused branch.

### Dead code

Symptom: unreachable branches, unused exports, commented-out blocks. **Refactor**: delete. `git` remembers.

### Comments as deodorant

Symptom: a long comment explaining a confusing block of code. The comment is a code smell, not a fix. **Refactor**: Extract Function with a name that replaces the comment.

---

## Change-Coupling Awareness

Static analysis cannot see coupling that lives in git history. Two files that change together in 80% of commits are coupled, even if neither imports the other. Adam Tornhill's hotspot research (CodeScene, *Your Code as a Crime Scene*) shows that 1 to 2% of files account for 70% of dev activity, and these hotspots predict defects better than any code metric.

**Practical rule**: when a planned change touches three or more files in different services or modules, that is a signal of accidental change-coupling. Either:

1. The change is genuinely cross-cutting and needs explicit coordination (event schema bump, shared DTO change), or
2. There is a missing abstraction that should own this change. Extract it before proceeding.

This is detectable manually via `git log --since='3 months ago' --name-only --pretty=format:'COMMIT' | awk` patterns, or with tools like CodeScene. Not gated in CI, but worth surfacing in a review agent that maps risk before a change lands.

---

## Tooling

Enforcement runs through the linter. Recommended setup:

- `eslint-plugin-sonarjs` for cognitive complexity at threshold 15
- ESLint built-ins for `complexity`, `max-lines-per-function`, `max-lines`, `max-depth`, `max-params`
- `lizard` for periodic ad-hoc audits; it supports many languages, so it is useful when the codebase spans more than one

[CUSTOMIZE: pin the exact threshold values and exemption globs in your `eslint.config.js` (or your language's linter config) so the limits in this rule and the limits the tooling enforces never drift apart.]

---

## Checklist Before Commit

- [ ] Every changed function under 60 lines (target 30)
- [ ] Every changed file under 600 lines (target 300; check exemption list)
- [ ] No new nesting deeper than 3 levels
- [ ] No new functions with more than 3 positional parameters
- [ ] `sonarjs/cognitive-complexity` reports under 15 for every changed function
- [ ] If a god class or god use-case grew larger, an Extract Class ticket is filed
- [ ] If the change touched 3+ files in different services, the change-coupling was deliberate (not accidental)
- [ ] No silent catch blocks added to flatten complexity (see `.claude/rules/production-grade-code.md`)

---

## Related rules

- `.claude/rules/code-quality.md` (function/file size, naming, early returns)
- `.claude/rules/production-grade-code.md` (no silent fallbacks; complexity is no excuse)
- `.claude/rules/clean-architecture.md` (layer rules that prevent feature envy)
- `.claude/rules/deterministic-review.md` (review findings need evidence; complexity hotspots need git-coupling data)

---

## Sources

1. McCabe, T. J. (1976) "A Complexity Measure," IEEE Transactions on Software Engineering SE-2(4), 308-320. http://www.literateprogramming.com/mccabe.pdf
2. Brooks, F. P. (1986) "No Silver Bullet, Essence and Accidents of Software Engineering." https://www.cs.unc.edu/techreports/86-020.pdf
3. Moseley, B. and Marks, P. (2006) "Out of the Tar Pit." https://curtclifton.net/papers/MoseleyMarks06a.pdf
4. Campbell, G. A. (2018) "Cognitive Complexity, A new way of measuring understandability," SonarSource whitepaper. https://www.sonarsource.com/docs/CognitiveComplexity.pdf
5. Munoz Baron, M. et al. (2020) "An Empirical Validation of Cognitive Complexity as a Measure of Source Code Understandability," ESEM. https://arxiv.org/pdf/2007.12520
6. Ousterhout, J. (2018) *A Philosophy of Software Design*. Summary: https://www.mattduck.com/2021-04-a-philosophy-of-software-design.html
7. Martin, R. C. (2008) *Clean Code*. Functions chapter summary: https://gist.github.com/wojteklu/73c6914cc446146b8b533c0988cf8d29
8. Fowler, M. (2018) *Refactoring* 2nd ed. Catalog: https://refactoring.com/catalog/
9. Tornhill, A. "Change coupling, visualize the cost of change," CodeScene blog. https://codescene.com/blog/change-coupling-visualize-the-cost-of-change
10. ESLint `complexity` rule. https://eslint.org/docs/latest/rules/complexity
11. ESLint `max-lines-per-function` rule. https://eslint.org/docs/latest/rules/max-lines-per-function
12. ESLint `max-depth` rule. https://eslint.org/docs/latest/rules/max-depth
13. `sonarjs/cognitive-complexity` rule. https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/cognitive-complexity.md
