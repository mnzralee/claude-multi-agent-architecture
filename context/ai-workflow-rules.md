# AI Workflow Rules

## Approach

Describe the overall development approach here. For example: build the project
incrementally using a spec-driven workflow. Context files define what to build,
how to build it, and the current state of progress. Always implement against
these specs and do not infer or invent behavior from scratch.

This discipline is stack-agnostic. The examples below use TypeScript / Node /
Express / Vitest / Zod for concreteness, but the rules apply equally to any
language or framework.

## Scoping Rules

- Work on one feature unit at a time.
- Prefer small, verifiable increments over large speculative changes.
- Do not combine unrelated system boundaries in a single implementation step.

## When to Split Work

Split an implementation step if it combines:

- [CUSTOMIZE: Concern one, e.g. UI changes and background task changes]
- [CUSTOMIZE: Concern two, e.g. multiple unrelated API routes]
- [CUSTOMIZE: Concern three, e.g. behavior not clearly defined in the context files]

If a change cannot be verified end to end quickly, the scope is too broad. Split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files.
- If a requirement is ambiguous, resolve it in the relevant context file before
  implementing.
- If a requirement is missing, add it as an open question in
  `context/progress-tracker.md` before continuing.

## Protected Files

Do not modify the following unless explicitly instructed:

- [CUSTOMIZE: e.g. `components/ui/*` -- generated UI library components]
- [CUSTOMIZE: e.g. any third-party library internals]
- [CUSTOMIZE: e.g. auto-generated migration files]

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes affect any of
the following:

- System architecture or service boundaries
- Storage model decisions
- Code conventions or standards
- Feature scope

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope.
2. No invariant defined in `context/architecture.md` was violated.
3. `context/progress-tracker.md` reflects the completed work.
4. The project's build command passes (e.g. `npm run build` or `[CUSTOMIZE: your build command]`).
