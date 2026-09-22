# AI Agent Engineering Standards

This rule carries only the non-negotiable dispatch and verification core. The full doctrine (sources, worked failure examples, the complete premature-completion red-flag table, the extended always-serialize list) lives at `.claude/standards/AI-AGENT-ENGINEERING.md`, read on demand, not every turn.

Agents prove their work with artifacts. They do not narrate completion.

1. **Prompt-writer first.** For every non-trivial dispatch, generate the prompt via `prompt-writer` before dispatching: task scope, verified file paths, acceptance criteria as runnable commands, forbidden actions, output contract.
2. **Bounded tool set.** Each sub-agent runs with the minimum tools its task needs.
3. **Show your work.** Every report needs an artifact: a commit SHA, verbatim test/type-check output, a command result, a diff, or `ls -la` + `wc -l` per asserted file path. Narrative without artifact is rejected.
4. **Phantom-file guard.** Before trusting any COMPLETE claim that asserts a file was created or changed, re-run `ls -la <path>` and `wc -l <path>` yourself, from your own scope. Do not trust the agent's pasted block.
5. **Self-correction, not self-retry.** On failure: debugger (root cause, no edits) -> prompt-writer (fix brief) -> impl agent -> re-run acceptance. Two consecutive failures on the same work package is a hard stop: `/clear` and re-plan.
6. **Single-writer, many-readers.** Parallel dispatch only for disjoint file sets and read-only research. Any commit step in a repo with active pre-commit hooks serializes across agents regardless of file-set disjointness. Full always-serialize list (DI containers, barrels, schema files, lockfiles, `CLAUDE.md`/rules, work-record journals) is in the full doctrine.
7. **TDD is R-G-R, verified.** `tester` writes the failing test first, confirm it fails, then an impl agent makes it pass. `git log --oneline -3` must show the sequence before the package is COMPLETE.
8. **Autonomy boundaries.** Sub-agents never push, never edit the work record (only `work-recorder`, only the authoring developer's own file), never run destructive ops or touch credentials without explicit approval, never promote artifacts to staging or production, never self-restart or self-extend their own task scope. On any approval-gated action, return `pause_for_human` with the proposed action, rationale, and rollback.

Reject on sight: "should work" / "looks good" language, no commit SHA, `git status` not clean at "complete", "tests are passing" with no pasted output, new workspace-package imports with no lockfile change, file references you have not verified, line numbers you have not confirmed against the real file length.

Related: `deterministic-review.md` (same evidence bar), `context-budget.md` (per-agent prompt size), `git-workflow.md` (file-by-file commits), `production-grade-code.md`, `ai-orchestration-decision-gate.md`, `security-untrusted-content.md`, `tdd-discipline.md`.
