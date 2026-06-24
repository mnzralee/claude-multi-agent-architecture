---
name: tdd-workflow
description: Test-Driven Development workflow for implementing features with tests first; enforces the two-commit audit trail (failing-test commit, then green commit) and shows-your-work verification for agent-driven work.
---

# TDD Workflow Skill

## Skill Metadata
- **Name**: tdd-workflow
- **Description**: Test-Driven Development workflow with two-commit audit trail and test-runner-based verification
- **User Invocable**: Yes (via `/tdd`)
- **Companion rule**: `.claude/rules/tdd-discipline.md` (the why and the boundaries)

---

## Overview

This skill implements the canonical Red-Green-Refactor cycle (Kent Beck, 2002) with the additions required for AI-agent-driven development. The discipline is stack-agnostic; examples below use TypeScript / Node / Vitest / Zod, but the cycle and audit rules apply equally to any language and test runner.

1. Each phase ends with a **commit**, producing an audit trail.
2. The trail is **verifiable** via `git log` and re-running the test at each commit SHA.
3. Subagents are **isolated** so the test author and the implementation author do not collude through a shared context window.
4. Every claim of "passing" must be backed by a verbatim **test runner output block**, never narrative.

The cycle target is 1 to 10 minutes per micro-iteration (Beck). If a phase takes longer, the step was too large; split it.

Adapt the runner commands to your project's test toolchain. The examples below use Vitest; substitute Jest, Mocha, pytest, go test, or your framework's equivalent.

---

## TDD Cycle (with audit commits)

```
RED                              GREEN                          REFACTOR
┌─────────────────────────────┐  ┌──────────────────────────┐  ┌─────────────────────────┐
│ 1. Write failing test       │  │ 1. Smallest prod change  │  │ 1. Restructure          │
│ 2. Run tests, see RED       │  │ 2. Run tests, see GREEN  │  │ 2. Run tests, GREEN     │
│ 3. Capture failure output   │  │ 3. Capture pass output   │  │ 3. Run type-check       │
│ 4. Commit TEST FILE ONLY    │--│ 4. Commit PROD CODE     ─│--│ 4. Commit refactor      │
│    test(scope): add spec    │  │    feat(scope): implement│  │    refactor(scope): ... │
│                             │  │                          │  │                         │
│ Artifact: SHA + red output  │  │ Artifact: SHA + green    │  │ Artifact: SHA + green   │
└─────────────────────────────┘  └──────────────────────────┘  └─────────────────────────┘
```

---

## Workflow Steps

### Step 1, RED: Write the failing test

**Objective**: produce a test that describes the new behavior and fails for the right reason (an assertion failure, not a missing module).

```typescript
// apps/<service>/src/application/use-cases/<feature>/handler.spec.ts
import { describe, it, expect, vi } from 'vitest';
import { ApproveSubmissionHandler } from './handler';

describe('ApproveSubmissionHandler', () => {
  it('approves a pending submission and emits an outbox command', async () => {
    const submissionRepo = {
      findById: vi.fn().mockResolvedValue({ id: 'sub-1', status: 'PENDING' }),
      updateStatus: vi.fn().mockResolvedValue(undefined),
    };
    const outboxRepo = { create: vi.fn().mockResolvedValue({ id: 'cmd-1' }) };
    // [CUSTOMIZE: replace with your transaction/unit-of-work primitive]
    const db = { $transaction: async (fn: any) => fn({}) };

    const handler = new ApproveSubmissionHandler(submissionRepo, outboxRepo, db);
    const result = await handler.execute({ submissionId: 'sub-1', actorId: 'u-1' });

    expect(result.approved).toBe(true);
    expect(outboxRepo.create).toHaveBeenCalled();
  });
});
```

**Verify RED**:
```bash
# [CUSTOMIZE: replace with your runner invocation]
npx vitest run src/application/use-cases/<feature>
# Expected: AssertionError OR Cannot find module './handler'
# Both qualify as RED for the FIRST test in a new file (compile failures count
# per Uncle Bob's Three Laws). After the file exists, subsequent RED steps
# MUST be assertion failures, not compile errors.
```

**Capture the failure output verbatim**. This is the artifact you will paste into the output report.

**Commit (test file ONLY)**:
```bash
git add apps/<service>/src/application/use-cases/<feature>/handler.spec.ts
git commit -m "test(<scope>): add failing spec for <Feature> happy path"
```

### Step 2, GREEN: Minimal production code

**Objective**: simplest possible change that turns the bar green. Hardcoding, copy-paste, literal returns; all permitted. The next failing test forces generalization.

```typescript
// apps/<service>/src/application/use-cases/<feature>/handler.ts
export class ApproveSubmissionHandler {
  constructor(
    private readonly submissionRepo: ISubmissionRepository,
    private readonly outboxRepo: IOutboxRepository,
    // [CUSTOMIZE: replace with your ORM/transaction primitive]
    private readonly db: { $transaction: Function },
  ) {}

  async execute(input: { submissionId: string; actorId: string }) {
    return this.db.$transaction(async (tx: unknown) => {
      const sub = await this.submissionRepo.findById(input.submissionId);
      if (!sub) throw new SubmissionNotFoundError(input.submissionId);
      await this.submissionRepo.updateStatus(sub.id, 'APPROVED', tx);
      await this.outboxRepo.create(
        { commandType: 'ApproveSubmission', payload: { id: sub.id } },
        tx,
      );
      return { approved: true };
    });
  }
}
```

**Verify GREEN**:
```bash
npx vitest run src/application/use-cases/<feature>
# Expected: 1 passed
npx tsc --noEmit
# Expected: no errors
```

**Capture the passing output verbatim**. Required artifact for the output report.

**Commit (production code)**:
```bash
git add apps/<service>/src/application/use-cases/<feature>/handler.ts
git commit -m "feat(<scope>): implement <Feature> to satisfy spec"
```

### Step 3, REFACTOR: Improve under green

**Objective**: clean up structure without changing behavior. Skip if no refactor is needed.

```bash
# After refactoring, re-verify all stays green
npx vitest run src/application/use-cases/<feature>
npx tsc --noEmit
npx eslint src/application/use-cases/<feature>
```

**Commit (refactor, if any)**:
```bash
git add apps/<service>/src/application/use-cases/<feature>/
git commit -m "refactor(<scope>): extract <thing> into private helper"
```

---

## The "show your work" rule (THE critical addition for agent use)

After every TDD micro-cycle, the skill MUST produce this evidence block:

```
RED  commit:  <sha>  test(<scope>): add failing spec for <Feature>
              test output: 1 failed (AssertionError)
GREEN commit: <sha>  feat(<scope>): implement <Feature> to satisfy spec
              test output: 1 passed
REFACTOR commit (optional): <sha>  refactor(<scope>): ...
              test output: 1 passed
```

**Verification command** that an agent or reviewer can run independently:

```bash
# Show the last few commits touching the use case
git log --oneline -5 -- apps/<service>/src/application/use-cases/<feature>/

# Expected: feat commit must come AFTER a test commit for the same scope.
# If the feat commit appears with no preceding test commit, TDD was not followed.
```

### Show failing test output verbatim

The RED commit's artifact is the **verbatim test runner stdout/stderr** containing the assertion failure. Narrative like "the test failed as expected" is REJECTED. The orchestrator (or reviewer agent) re-runs the test command at the RED commit SHA and confirms a non-zero exit with the expected assertion message. Without this verbatim block, the dispatch is treated as failed and re-dispatched.

This matches the `.claude/rules/ai-agent-engineering.md` "Show Your Work" requirement: every claim ships with a verifiable artifact, never with narrative alone.

### Rollback rule

If the audit shows a `feat(...)` commit with no preceding `test(...)` commit, the implementation agent must:

1. Revert the implementation commit (`git revert <sha>`).
2. Write the failing test first.
3. Commit the test (verify RED, capture output).
4. Re-apply the implementation (verify GREEN, capture output).
5. Commit again with a fresh SHA.

This is non-negotiable for production-touching code.

---

## Subagent isolation protocol (prevents test-implementation collusion)

When this skill is invoked in a multi-agent orchestration:

```
┌──────────────────────────────────────────────────────────────────────┐
│  ORCHESTRATOR receives "implement feature X via TDD"                  │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Phase 1: DISPATCH `tester` AGENT                                     │
│                                                                       │
│  Input: acceptance criteria, port contract, file layout               │
│  Forbidden: implementation strategy, "how" the code works             │
│  Output: failing test file + commit SHA + test runner red output      │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Phase 2: DISPATCH `impl` AGENT                                       │
│                                                                       │
│  Input: failing test commit SHA + the test file + port contract       │
│  Goal: make the test pass with minimal change, commit, stop           │
│  Output: implementation commit SHA + test runner green output         │
└──────────────────────────────────────────────────────────────────────┘
                                  │
                                  ▼
┌──────────────────────────────────────────────────────────────────────┐
│  Phase 3: DISPATCH `reviewer` AGENT                                   │
│                                                                       │
│  Input: both commit SHAs + the diff                                   │
│  Verify: test commit precedes impl commit; test asserts behavior;     │
│          impl is minimal; both runs produced expected output          │
│  Output: APPROVED / REJECTED with evidence                            │
└──────────────────────────────────────────────────────────────────────┘
```

This three-agent handoff is the orchestrated equivalent of the human pair "driver writes test, navigator writes code." Both Kent Beck's original cycle and Anthropic's "evaluator-optimizer" pattern in *Building Effective AI Agents* recommend this separation.

Reference: `.claude/skills/multi-agent-orchestration/SKILL.md`.

---

## Test patterns by component

### Use case handler tests (most common pattern in layered backend)

```typescript
describe('<UseCase>Handler', () => {
  // Happy path
  it('does <expected behavior> when <condition>', async () => {});

  // Edge cases
  it('handles <edge case>', async () => {});

  // Error cases (typed DomainError subclasses)
  it('throws <SpecificError> when <invariant violated>', async () => {});

  // Idempotency (mandatory for outbox-producing use cases)
  it('is idempotent when called twice with the same idempotencyKey', async () => {});
});
```

### Integration tests (real database, mocked external HTTP)

Wire the real use case with in-memory or test-database repositories, real domain primitives, and mocked external services. The shape: stand up the infrastructure once per suite, reset state between tests, assert on side-effects (rows written, events emitted) not just return values.

### Controller / route handler tests

```typescript
describe('<Resource>Controller', () => {
  it('POST /resource returns 201 with valid input', () => {});
  it('POST /resource returns 400 with invalid input (schema rejects)', () => {});
  it('POST /resource returns 401 without token', () => {});
  it('POST /resource returns 403 when role insufficient', () => {});
});
```

### Frontend component tests (Vitest + Testing Library)

```typescript
describe('<Component>', () => {
  it('renders the empty state', () => {});
  it('calls onSubmit with form values', async () => {});
  it('shows loading state while submitting', () => {});
  it('shows error message on submission failure', () => {});
});
```

---

## When to skip TDD

See companion rule `.claude/rules/tdd-discipline.md` "When NOT to TDD" section. Summary: spike code with planned discard, configuration files, prose docs, throwaway scripts, generated code, trivial dependency-injection wiring, style-only frontend changes.

When this skill is invoked on a task that falls under "skip TDD", respond with a short note ("this task is out of TDD scope per `tdd-discipline.md`, proceeding without R-G-R cycle") and then proceed with the appropriate workflow.

---

## Invocation

### Manual
```
/tdd <feature-name>
```

### Example
```
/tdd approve-submission
```

---

## Output report format

````markdown
## TDD Session: <feature-name>

### Audit trail
| Phase | Commit SHA | Message | Test result |
|---|---|---|---|
| RED | 8b1d... | test(<scope>): add failing spec for <Feature> | 1 failed (AssertionError) |
| GREEN | 7f2a... | feat(<scope>): implement <Feature> to satisfy spec | 1 passed |
| REFACTOR | a3c5... | refactor(<scope>): extract helper | 1 passed |

### Test output verbatim (RED)
```
FAIL  src/application/use-cases/<feature>/handler.spec.ts > Handler > approves and emits command
AssertionError: expected undefined to be true
  ...
Test Files  1 failed (1)
     Tests  1 failed (1)
```

### Test output verbatim (GREEN)
```
 PASS  src/application/use-cases/<feature>/handler.spec.ts (1 test)

Test Files  1 passed (1)
     Tests  1 passed (1)
```

### Implementation files
- apps/<service>/src/application/use-cases/<feature>/handler.ts
- apps/<service>/src/application/use-cases/<feature>/handler.spec.ts

### Verification (re-runnable)
```bash
git log --oneline -3 -- apps/<service>/src/application/use-cases/<feature>/
npx vitest run src/application/use-cases/<feature>
```

### Coverage (vitest --coverage)
- Statements: 96%
- Branches: 92%
- Functions: 100%
````

---

## Failure modes detection

### "Agent wrote tests after the fact"

Symptom: `git log` shows a single commit containing both test and production code. Or shows `feat(...)` first, then a later `test(...)` commit for the same scope.

Action: REJECT. Revert. Restart from RED.

### "Test never actually failed"

Symptom: the test commit's runner output shows 0 failures.

Action: REJECT. The test is not driving anything. Either it has the wrong assertion or the production code already satisfied it. Tighten the assertion.

### "Test failed for the wrong reason"

Symptom: the test commit's runner output shows `Cannot find module` or `SyntaxError` rather than `AssertionError`.

Action: ACCEPTABLE only for the very first test in a new file (per Uncle Bob's "compilation failures count as failures"). For subsequent tests, the failure must be an assertion failure.

### "Narrative pass, no output block"

Symptom: agent reports "tests pass" without pasting verbatim runner output.

Action: REJECT. Re-dispatch with explicit "produce test output block" instructions. The orchestrator independently re-runs the command and confirms exit 0.

### "Implementation is too large"

Symptom: the GREEN commit changes 200+ lines for a single test.

Action: REJECT. The test was too coarse-grained. Split into smaller tests, each driving a small slice of implementation.

---

## Commands

```bash
# [CUSTOMIZE: adapt these to your test toolchain]

# Vitest (TypeScript / Node)
npx vitest run                                    # all packages
npx vitest run --project <service>               # one service
npx vitest run path/to/file.spec.ts              # one file
npx vitest                                        # watch mode (TDD inner loop)
npx vitest run --coverage                        # with coverage report

# Type and lint after green
npx tsc --noEmit
npx eslint <path>

# Frontend (Vitest + Testing Library)
cd <frontend-app> && npm test                    # unit/component tests
cd <frontend-app> && npx playwright test         # end-to-end

# Jest alternative
npx jest --testPathPattern=<path>
npx jest --coverage

# pytest (Python)
pytest path/to/test_feature.py -v
pytest --cov=src

# go test
go test ./path/to/package/... -v
go test ./... -cover
```

---

## Related

- `.claude/rules/tdd-discipline.md`, companion rule (the why and the boundaries).
- `.claude/rules/testing-pyramid.md`, what to test at each layer.
- `.claude/rules/production-grade-code.md`, typed errors used in failure-case tests.
- `.claude/rules/ai-agent-engineering.md`, the "show your work" protocol that this skill operationalizes.
- `.claude/skills/multi-agent-orchestration/SKILL.md`, agent dispatch protocol.
- `.claude/agents/tester/AGENT.md`, agent that writes the RED commit.
- `.claude/agents/reviewer/AGENT.md`, agent that audits the trail.
