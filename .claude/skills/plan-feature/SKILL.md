---
name: plan-feature
description: The Explore to Plan to Code to Commit workflow for any non-trivial change. Forces understanding and an explicit plan before edits, with a one-sentence skip heuristic for trivial work. Use when starting a feature, a refactor, or any change whose steps are not obvious. Pairs with plan mode.
---

# Plan a Feature

> The canonical agentic-coding loop, in four phases: Explore, Plan, Code, Commit. Anthropic's own guidance is that jumping straight to code is the most common way agents go wrong. This skill makes the loop explicit.

## When to use this

Invoke `/plan-feature` (or just follow this loop) for any change where the steps are not already obvious: a new feature, a multi-file refactor, a behavior change, a bug whose cause is unknown.

**The one-sentence skip heuristic:** if you can describe the entire diff in one sentence ("rename `getUser` to `fetchUser` across the repo", "bump the timeout from 5s to 30s"), skip planning and just make the change, then verify. Planning a trivial edit is waste. Everything else gets the loop.

## Phase 1: Explore (understand before touching)

Do not write code yet. Build an accurate model of the current state.

- Read the relevant files, tests, and types. Follow the real call paths, do not assume them.
- Find the existing patterns: how does this codebase already solve similar problems? Match them.
- Identify the blast radius: what else depends on what you are about to change? (See `.claude/rules/depth-first-impact-analysis.md`.)
- For verbose or wide exploration, dispatch a read-only `researcher` sub-agent so the main context stays clean (see `.claude/rules/ai-orchestration-decision-gate.md`).

Exit criterion: you can state, in plain language, what exists today and why the change is needed.

## Phase 2: Plan (make the approach explicit and reviewable)

Write the plan down before editing. Use plan mode (Shift+Tab to enter it, so the model proposes without making changes) for anything non-trivial.

A good plan states:

- **Goal**: the one-sentence outcome.
- **Approach**: the chosen design, and why, over the alternative you rejected.
- **Steps**: the ordered changes, each small enough to verify on its own.
- **Files**: the specific files each step touches (this is also the parallel-conflict map if you delegate).
- **Acceptance criteria as commands**: the exact `npm test`, `npx tsc --noEmit`, or curl that proves each step (see `.claude/rules/ai-agent-engineering.md`).
- **Risks and rollback**: what could break, and how you back out.

For high-stakes or contested designs, get the plan reviewed before coding: a `reviewer` or `architect` sub-agent, or the review-board prompt (`.claude/prompts/review-board.md`). Cheaper to fix a plan than a diff.

## Phase 3: Code (execute one verifiable step at a time)

- Implement one step. Run its acceptance command. Confirm it passes before the next step.
- Prefer test-first where it fits: write the failing test, then make it pass (see `.claude/skills/tdd-workflow/SKILL.md`).
- Keep changes small and incremental. A 600-line diff that "should work" is worse than six 100-line diffs that each verifiably do.
- If you correct the same problem twice without progress, stop. Clear the cluttered context, re-read, and re-plan with a fresh prompt rather than piling on more attempts.

## Phase 4: Commit (capture verifiable units)

- Commit after each logical, verified unit of work, not once at the end. See `.claude/skills/commit/SKILL.md`.
- Each commit message is descriptive and conventional (`type(scope): subject`), explains the why, and carries no AI attribution.
- Before declaring done, run the definition-of-done gate: `.claude/skills/verification-before-completion/SKILL.md`. Paste the actual lint/build/test output; do not claim green from memory.

## Anti-patterns

- Editing before exploring (you will fight the codebase's existing patterns).
- A plan with no acceptance commands (you cannot prove the steps).
- A single giant commit at the end (no rollback granularity, no reviewable units).
- Planning a one-sentence change (waste; just do it and verify).

## Related

- `.claude/rules/ai-orchestration-decision-gate.md`, when to delegate exploration vs do it inline
- `.claude/rules/depth-first-impact-analysis.md`, mapping the blast radius in Phase 1
- `.claude/skills/tdd-workflow/SKILL.md`, the red-green-refactor cycle for Phase 3
- `.claude/skills/commit/SKILL.md` and `.claude/skills/verification-before-completion/SKILL.md`, Phase 4 gates
- `.claude/prompts/review-board.md`, reviewing a plan before coding
