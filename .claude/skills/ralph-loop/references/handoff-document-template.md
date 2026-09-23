# Ralph-Loop: Hand-Off Document Template

Reference for `.claude/skills/ralph-loop/SKILL.md`, Section 18. Read this at the close of every iteration, when authoring `.claude/plans/handoff-iter-N-to-N+1.md`.

Template for `.claude/plans/handoff-iter-N-to-N+1.md`:

```markdown
# Hand-off: Iteration N to Iteration N+1

> **Closed**: <iso-timestamp UTC>
> **Closing iteration label**: <e.g., RL-ITER-5 = environment mutation execution>
> **Opening iteration label**: <e.g., RL-ITER-6 = billing webhook wiring>
> **Marathon elapsed**: <hh:mm of total budget>
> **Orchestrator**: <agent name or "manual">

---

## 1. Closing iteration commits + acceptance verification

| # | Repo | Commit SHA | Subject | Acceptance command output |
|---|---|---|---|---|

**Pre-push gate state at iteration close**:
- type-check: green / red (verbatim last line)
- lint: green / red
- test: <count> pass / <count> fail
- em-dash check: green / red
- git status: clean / NOT-clean

## 2. Failed approaches + 5-Whys root cause

| # | What was tried | Why it failed | 5-Whys root cause | What replaced it |
|---|---|---|---|---|

(If no failures: state "no failed approaches; iteration succeeded first try" explicitly.)

## 3. Open work packages for next iteration

| # | WP | Scope (1 sentence) | Files (planned_files declared upfront) | Acceptance command |
|---|---|---|---|---|

## 4. Persistent state file pointers

| Artifact | Path |
|---|---|
| Marathon STATUS | `.claude/progress/current-module.json` |
| Work record | `docs/workrecords/work-record-YYYY-MM-DD.md` |
| Carry-forward register | `.claude/plans/roadmap-findings-register.md` |
| 10/10 gate worksheet | `.claude/plans/10-CRITERION-GATE.md` |

## 5. Cross-arc collision check

| Check | Latest known state |
|---|---|
| Other arc's infra-ops HEAD | <sha7> "subject" |
| Other arc's parent repo HEAD | <sha7> "subject" |
| Same-file collision risk | <specific paths or "none"> |
| Submodule pointer drift | <output> |

## 6. Next-iteration prompt brief (for prompt-writer)

> Task scope (one imperative sentence): <e.g., "Wire the payment port to the billing webhook route">
> Specific file paths verified to exist (up to 10): <list>
> Acceptance criteria as commands: <list>
> Forbidden actions: NO push, NO work-record edit, NO destructive ops
> Output contract: commit SHA + verbatim acceptance command stdout

```
