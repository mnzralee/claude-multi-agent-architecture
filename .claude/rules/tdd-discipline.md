---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Test-Driven Development Discipline

> Companion to `.claude/rules/testing-pyramid.md` (what to test, ratios) and
> `.claude/skills/tdd-workflow/SKILL.md` (the cycle as a runnable skill).

## Overview

Test-Driven Development is the practice of writing a failing test before writing
the production code that makes it pass. It is the default working mode for new
behavior across project code, including agent-generated code. This rule defines
the cycle, the artifacts each step must produce, the boundaries where TDD does
not apply, and the additional discipline needed when an LLM coding agent
(Claude Code, subagents) is the participant writing the code.

---

## Core Principle

> Production code exists to satisfy a failing test, and only to satisfy a
> failing test.

This is Kent Beck's original framing in *Test-Driven Development: By Example*
(2002): Red ("write a little test that doesn't work"), Green ("make the test
work quickly, committing whatever sins necessary"), Refactor ("eliminate all of
the duplication created in merely getting the test to work"). The cycle is
intended to complete in 1 to 10 minutes; if Red or Green takes longer, the step
was too large.

Sources:
- Kent Beck, *Test-Driven Development: By Example*, Addison-Wesley 2002
- Martin Fowler, "Test Driven Development" ([URL](https://martinfowler.com/bliki/TestDrivenDevelopment.html))
- Robert C. Martin, "The Three Rules of TDD" ([URL](http://www.butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd))

Uncle Bob's tighter restatement (the Three Laws):
1. You are not allowed to write any production code unless it is to make a
   failing unit test pass.
2. You are not allowed to write any more of a unit test than is sufficient to
   fail (compilation failures count as failures).
3. You are not allowed to write any more production code than is sufficient to
   pass the one failing test.

This kit adopts Kent Beck's cycle as the contract and Uncle Bob's Three Laws
as the daily discipline.

---

## Rules

### Rule 1, Red before Green, always

**Why.** A test that has never failed has not been observed to fail. It cannot
prove the production code is what makes it pass; it may pass for unrelated
reasons (test always green, wrong assertion, missing `await`). A confirmed-red
step is the only evidence that a test discriminates.

**How.** Write the test. Run it. Watch it fail with the assertion you expect
(not with a compile error, not with "module not found"). Capture the failure
output. Only then write production code.

```bash
# RED: a failing assertion is required; compile-error red does not count
# [CUSTOMIZE: replace with your test runner and path]
npx vitest run src/__tests__/my-feature.spec.ts
# Expected: AssertionError, expected someValue received undefined
```

### Rule 2, Smallest production change that turns Red into Green

**Why.** Kent Beck's "Fake It Till You Make It" is not a joke. The smallest
change keeps the design open and forces additional tests to drive additional
behavior. Larger jumps re-introduce the speculative design that TDD exists to
prevent.

**How.** Hardcode return values, copy-paste, return literals, whatever turns
the bar green. The next failing test drives the generalization.

### Rule 3, Refactor only when green

**Why.** A failing test plus a refactor is two unknowns. If the refactor
introduces a new failure, you cannot tell whether the failure was already there
or was caused by the refactor. Refactoring under green changes structure
without changing behavior.

**How.** Verify all tests pass. Refactor. Re-run all tests. Commit. If a test
goes red during refactor, undo, then take a smaller refactor step.

### Rule 4, One behavior per test

**Why.** Per the F.I.R.S.T principles (Robert Martin, *Clean Code* ch. 9):
**Fast, Independent, Repeatable, Self-validating, Timely**. A test with two
behaviors fails for two reasons and is harder to read as a specification.

Sources:
- Robert C. Martin, *Clean Code* (2008), ch. 9 "Unit Tests"

**How.** One `it()` block per behavior. Multiple assertions are fine if they
verify the same behavior from different angles. If two assertions check
semantically different things, split into two tests.

The examples below use TypeScript/Vitest; the discipline is identical in any
language or test framework.

```typescript
// GOOD: one behavior, multiple corroborating assertions
it('constructs from a non-negative value', () => {
  const amount = Money.create(1_000n);
  expect(amount.units).toBe(1_000n);
  expect(amount.toString()).toBe('1000');
  expect(amount.isZero()).toBe(false);
});

// BAD: two behaviors in one test
it('constructs and rejects negative', () => {
  expect(Money.create(1_000n).units).toBe(1_000n);
  expect(() => Money.create(-1n)).toThrow(); // separate behavior, separate test
});
```

### Rule 5, Test the behavior, not the implementation

**Why.** Ian Cooper's "TDD, Where Did It All Go Wrong" (DevTernity 2017) argues
that decades of brittle test suites come from testing classes and methods
instead of *module behaviors*. The trigger for a new test is a new requirement,
not a new class. Tests of internals lock the design and prevent refactoring.

Sources:
- Ian Cooper, "TDD, Where Did It All Go Wrong" DevTernity 2017 ([YouTube](https://www.youtube.com/watch?v=EZ05e7EMOLM))

**How.** Drive tests from use-case acceptance criteria. Test the use-case
handler's public `execute(input)` method, not the private helpers it calls.
Treat the public port (`execute` method on the handler, the HTTP endpoint on
the controller) as the module boundary. Refactor freely inside that boundary
without rewriting tests.

### Rule 6, Mock at architectural seams only

**Why.** Martin Fowler's "Mocks Aren't Stubs" distinguishes classicist
(Detroit) TDD from mockist (London) TDD. A Clean Architecture codebase
(application ports / infrastructure adapters) has clear seams: the application
layer defines ports, infrastructure implements them. Mock the ports in
unit-tests of use cases. Do NOT mock the use case's internal collaborators
(value objects, pure domain functions); that produces brittle tests coupled
to private structure.

Sources:
- Martin Fowler, "Mocks Aren't Stubs" ([URL](https://martinfowler.com/articles/mocksArentStubs.html))

**How.**
```typescript
// GOOD: mock the port (architectural seam), use real domain objects
const userRepo: IUserRepository = {
  findByEmail: vi.fn().mockResolvedValue(null),
  save: vi.fn().mockResolvedValue(undefined),
};
const handler = new RegisterUserHandler(userRepo, new BcryptHashService());
// Real User entity, real Email value object, real Password validator

// BAD: mock everything including value objects
const email = { value: 'test@example.com' } as Email; // brittle
```

When a real implementation is heavy (a full ORM client, a cache client, an
external RPC), use a **Fake** (in-memory implementation of the port), not a
Mock. Fakes survive refactors; mocks fail every time a method signature changes.

### Rule 7, F.I.R.S.T applies to every test

| Letter | Property | Target |
|---|---|---|
| F | Fast | Unit under 100ms each; full unit suite per package under 30s |
| I | Independent | No shared state, no test order dependency |
| R | Repeatable | Runs locally, in Docker, in CI, on any developer's machine |
| S | Self-validating | Pass or fail; no manual log inspection |
| T | Timely | Written before or with the production code, not after |

A test that violates any letter is debt. Flaky integration tests are the most
common F.I.R.S.T violation; they must be quarantined and fixed, never retried.

---

## The Cycle, with verifiable artifacts

Each step must produce a checkable artifact. For agent-driven work, these
artifacts are the audit trail that proves TDD was followed.

```
┌────────────────────────────────────────────────────────────────────┐
│  RED                                                                │
│  1. Write failing test                                              │
│  2. Run: npx vitest run <path>  [CUSTOMIZE: your test runner]       │
│  3. Capture assertion-failure output (not compile/module error)     │
│  4. Stage and commit test file ONLY                                 │
│  Artifact: commit SHA + failing test run output                     │
├────────────────────────────────────────────────────────────────────┤
│  GREEN                                                              │
│  1. Write smallest production code                                  │
│  2. Run: npx vitest run <path>                                      │
│  3. Capture passing run output                                      │
│  4. Stage and commit production code                                │
│  Artifact: commit SHA + passing test run output                     │
├────────────────────────────────────────────────────────────────────┤
│  REFACTOR (optional, only if needed)                                │
│  1. Refactor without changing behavior                              │
│  2. Run: npx vitest run <path> (all stay green)                     │
│  3. Run: npx tsc --noEmit  (still type-clean)                       │
│  4. Stage and commit refactor                                       │
│  Artifact: commit SHA + still-green test run output                 │
└────────────────────────────────────────────────────────────────────┘
```

**The two-commit minimum** is the enforcement of TDD: if a feature arrives in
one commit, TDD was not followed.

---

## TypeScript / Vitest example (signatures only)

Implementing a new use case `ApproveSubmission` in a service named `svc-review`.
Adapt the paths and names to your own project layout.

### Step 1, RED, write the failing test

```typescript
// apps/svc-review/src/application/use-cases/approve-submission/handler.spec.ts
describe('ApproveSubmissionHandler', () => {
  it('approves a pending submission and emits an outbox event', async () => {
    // arrange: fake repos returning a PENDING submission
    // act: handler.execute({ submissionId, reviewerId })
    // assert: result.approved === true AND outboxRepo.create called with ApproveSubmission
  });
});
```

Run the test command from `apps/svc-review`. Expected: `Cannot find module
'./handler'`, then after stubbing the import: `expected approved === true,
received undefined`. That is Red.

Commit: `git commit -m "test(review): add failing spec for ApproveSubmission happy path"`

### Step 2, GREEN, minimal production code

```typescript
// apps/svc-review/src/application/use-cases/approve-submission/handler.ts
export class ApproveSubmissionHandler {
  async execute(input: ApproveSubmissionInput): Promise<{ approved: true }> {
    // resolve submission, throw SubmissionNotFoundError if missing
    // updateStatus to APPROVED inside a transaction
    // outboxRepo.create({ eventType: 'ApproveSubmission', payload }) inside same tx
    // return { approved: true }
  }
}
```

Run same test command. Expected: 1 passed. That is Green.

Commit: `git commit -m "feat(review): implement ApproveSubmission to satisfy spec"`

### Step 3, REFACTOR (if needed)

Extract the transaction body into a private method, run tests, commit
`refactor(review): extract submission lookup into private helper`.

Full DI wiring, container registration, and route mount are NOT part of the
TDD cycle; they ship in a separate `chore(review): wire ApproveSubmission into
container` commit. See "When NOT to TDD" below.

---

## When NOT to TDD

TDD applies to behavior with a decidable specification. It does not apply to:

| Boundary | Rationale |
|---|---|
| **Spike / exploratory code with planned discard** | The point of a spike is to learn what to build. Discard the spike, then TDD the real implementation. |
| **Pure configuration files** | `tsconfig.json`, `eslint.config.js`, Kubernetes manifests, environment files. No business behavior to assert. |
| **Prose documentation, work records, specs** | Markdown is not behavior. TDD does not apply to docs/, ADRs, or work records. |
| **Throwaway scripts (one-shot data migrations)** | The acceptance test IS the data state after running. Verify the post-state. |
| **Generated code (ORM client, API bindings, code-gen output)** | The generator is the contract; testing generated code tests the generator. |
| **Trivial wiring (DI container, route mount)** | Integration tests cover end-to-end wiring; per-line wiring tests are tautological. |
| **Style-only frontend changes (CSS, design tokens)** | No behavior change. Visual regression tools, not TDD, are the right tool. |

When in doubt: ask "could this code be wrong in a way a test could catch?"
If no, skip TDD. If yes, write the test first.

---

## TDD with AI agents (Claude Code, subagents)

The most common failure mode in 2024-2026 LLM coding practice is **agent
writes tests after the fact**, then claims TDD was followed. The result is
tests that match whatever the implementation happened to do, with no Red step
ever observed.

Sources:
- Alex Op, "Forcing Claude Code to TDD" ([URL](https://alexop.dev/posts/custom-tdd-workflow-claude-code-vue/))
- Jason Gorman / Codemanship, "Why Does TDD Work So Well In AI-assisted Programming?" ([URL](https://codemanship.wordpress.com/2026/01/09/why-does-test-driven-development-work-so-well-in-ai-assisted-programming/))
- Anthropic, "Building Effective AI Agents" ([URL](https://anthropic.com/research/building-effective-agents))

### The two-commit rule for agent work

**Every feature implemented by an agent must produce at least two commits in
this order:**

1. A `test(scope): ...` commit containing ONLY the test file(s).
2. A `feat(scope): ...` or `fix(scope): ...` commit containing the production
   code that satisfies those tests.

Refactor commits (a third commit, type `refactor(scope): ...`) are optional.

**Verification command** before merging or marking done:

```bash
# The most recent feat/fix commit must be preceded by a test commit
# touching the SAME scope. The test commit's test run must show >=1 failure
# and the feat/fix commit's test run must show 0 failures.

git log --oneline -5 -- apps/svc-review/src/application/use-cases/approve-submission/
# Expected ordering:
# 7f2a... feat(review): implement ApproveSubmission to satisfy spec
# 8b1d... test(review): add failing spec for ApproveSubmission happy path
```

If a feature commit is not preceded by a test commit for the same scope, TDD
was not followed. The reviewer agent or human reviewer treats this as a
blocking finding.

### Subagent isolation prevents test/implementation collusion

When a single agent writes the test AND the implementation in one context, the
test design is unconsciously shaped by the implementation it is already
planning. The recommended mitigation, drawn from the three-agent handoff
pattern:

- **The `tester` agent writes the failing test and commits it.** It is given
  the acceptance criteria, the port contract, and the file layout. It has no
  knowledge of the implementation strategy.
- **The `impl` agent is then dispatched with the failing-test commit SHA as
  context.** Its job is to make the test pass, then stop.
- **The `reviewer` agent verifies the two-commit rule and the diff before
  merge.**

This three-agent handoff is the orchestrated equivalent of the human pair
"driver writes test, navigator writes code." Both Kent Beck's original cycle
and Anthropic's "evaluator-optimizer" pattern in "Building Effective AI
Agents" recommend this separation.

### Tests as executable specs prevent intent drift

LLM agents are prone to **intent drift**: a vague prompt like "add login"
spawns many reasonable interpretations. A failing test with concrete inputs
and expected outputs pins the intent to one. Treat the failing-test commit as
the source of truth for what the feature does. If the implementation diverges
from the test, the test is the spec; the implementation is wrong.

### Agent loop self-correction via test feedback

Anthropic's guidance in "Building Effective AI Agents" calls out: "Code
solutions are verifiable through automated tests; Agents can iterate on
solutions using test results as feedback." The kit's `/tdd-workflow` skill
operationalizes this: the implementation agent runs the test suite after every
code change, captures the output, and uses pass/fail as the loop-termination
signal.

---

## Test naming convention

Use behavior-driven phrasing. The test name reads as a sentence describing
the behavior under test.

| Pattern | Example |
|---|---|
| `it('<verb> <object> when <condition>')` | `it('approves a pending submission when reviewer is authorized')` |
| `it('throws <Error> when <condition>')` | `it('throws SubmissionNotFoundError when id is unknown')` |
| `it('returns <value> for <input case>')` | `it('returns zero balance for an account with no transactions')` |

Given/When/Then comments inside the test body are optional; Arrange/Act/Assert
visible whitespace (blank lines) is preferred for short tests.

---

## Test doubles, in order of preference

Per Martin Fowler "Mocks Aren't Stubs", prefer the lightest-weight double that
will do.

1. **Real object**, value objects, pure functions, simple domain entities.
2. **Fake**, in-memory implementation of a port (e.g., `InMemoryUserRepo`).
   Survives refactors. Preferred over mocks for integration-test setup.
3. **Stub**, canned return values for a single test (`vi.fn().mockResolvedValue(...)`).
4. **Spy**, stub that records calls (used to assert "was called with X").
5. **Mock**, call-expectation-driven. Use only at the very edge (external HTTP
   call). Brittle; refactoring usually breaks them.
6. **Dummy**, placeholder for unused arguments.

Per the Chicago/classicist style, real domain objects plus faked ports is the
default. Avoid blanket mocking of every collaborator.

---

## Property-based testing (for invariants)

Example-based tests (the default `it(...)` form) check specific inputs.
Property-based testing checks that an invariant holds across hundreds of
generated inputs. Use `fast-check` for TypeScript / Vitest.

Sources:
- Nicolas Dubien, fast-check ([GitHub](https://github.com/dubzzz/fast-check))
- Hillel Wayne, "Property Testing with Complex Inputs" ([URL](https://www.hillelwayne.com/post/property-testing-complex-inputs/))

**When to add a property-based test** (in addition to example-based tests):

- Pure functions with mathematical invariants (e.g., addition commutativity).
- Serialization round-trips (`parse(serialize(x)) === x`).
- Validation logic (every value passing the validator can be re-validated).
- Idempotent operations (calling twice is the same as calling once).

```typescript
import fc from 'fast-check';
describe('Money property invariants', () => {
  it('round-trips through string for all non-negative bigints up to 10^18', () => {
    fc.assert(
      fc.property(fc.bigInt({ min: 0n, max: 10n ** 18n }), (n) => {
        const amount = Money.create(n);
        return Money.fromString(amount.toString()).units === amount.units;
      }),
    );
  });
});
```

When a property-based test fails, fast-check shrinks to the minimal failing
input automatically. Do NOT replace failing example-based tests with
property-based ones; keep both. Property-based tests catch edge cases; example
tests document intent.

---

## Mutation testing (for test-suite quality)

Code coverage is a necessary-but-insufficient signal. A test that executes a
line without asserting on its result still counts as covered. **Mutation
testing** introduces small changes (mutants) to the production code and asks:
does any test fail? Surviving mutants reveal weak or missing assertions. Target
for critical business logic (arithmetic, money, idempotency): mutation score
>= 80%. For general code: opportunistic.

```bash
npx stryker init && npx stryker run   # HTML report under reports/mutation/
```

Mutation testing is slow; do not run on every commit. Run on demand and during
release hardening.

---

## Checklist before claiming a feature complete

- [ ] At least one failing-test commit precedes the implementation commit for
      the same scope, verifiable in `git log`.
- [ ] Test names describe behavior, not method names.
- [ ] Tests pass: test runner exits 0.
- [ ] Types pass: `npx tsc --noEmit` exits 0.
- [ ] Lint passes: linter exits 0.
- [ ] Use case ports are mocked or faked; domain primitives are real.
- [ ] No test depends on test order (`it.concurrent` if independent).
- [ ] No skipped (`it.skip`) or focused (`it.only`) tests in the diff.
- [ ] For core invariant code (arithmetic, idempotency): at least one
      property-based test on the core invariant.
- [ ] For production-touching code: integration test exists in addition to
      unit tests.

---

## Related rules and skills

- `.claude/rules/testing-pyramid.md`, what to test at each layer, 70/20/10 split.
- `.claude/rules/production-grade-code.md`, no `any`, no silent fallbacks.
- `.claude/rules/code-quality.md`, naming, function size, AAA structure.
- `.claude/skills/tdd-workflow/SKILL.md`, the cycle as a runnable skill.
- `.claude/skills/multi-agent-orchestration/SKILL.md`, tester / impl-agent / reviewer handoff.
- `.claude/rules/deterministic-review.md`, review findings need evidence; passing-test commit IS evidence.

---

## References

1. Kent Beck. *Test-Driven Development: By Example*. Addison-Wesley, 2002.
2. Martin Fowler. "Test Driven Development." <https://martinfowler.com/bliki/TestDrivenDevelopment.html>
3. Martin Fowler. "Test Pyramid." <https://martinfowler.com/bliki/TestPyramid.html>
4. Martin Fowler. "Mocks Aren't Stubs." <https://martinfowler.com/articles/mocksArentStubs.html>
5. Robert C. Martin. *Clean Code*. Prentice Hall, 2008.
6. Robert C. Martin. "The Three Rules of TDD." <http://www.butunclebob.com/ArticleS.UncleBob.TheThreeRulesOfTdd>
7. Ian Cooper. "TDD, Where Did It All Go Wrong." DevTernity 2017. <https://www.youtube.com/watch?v=EZ05e7EMOLM>
8. Kent C. Dodds. "Write tests. Not too many. Mostly integration." <https://kentcdodds.com/blog/write-tests>
9. Anthropic. "Building Effective AI Agents." <https://anthropic.com/research/building-effective-agents>
10. Alex Op. "Forcing Claude Code to TDD." <https://alexop.dev/posts/custom-tdd-workflow-claude-code-vue/>
11. Jason Gorman / Codemanship. "Why Does TDD Work So Well In AI-assisted Programming?" <https://codemanship.wordpress.com/2026/01/09/why-does-test-driven-development-work-so-well-in-ai-assisted-programming/>
12. Hillel Wayne. "Property Testing with Complex Inputs." <https://www.hillelwayne.com/post/property-testing-complex-inputs/>
13. fast-check (Nicolas Dubien). <https://github.com/dubzzz/fast-check>
14. Stryker Mutator. <https://stryker-mutator.io/>
