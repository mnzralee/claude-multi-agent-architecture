# Review Board Prompt

> **When to use**: after Claude proposes a plan, before you approve execution. In plan mode, choose "tell Claude what to change" and paste everything below the line. The board reviews the plan against ground truth and refines it to a high bar before any code is written.

This is a reusable, project-agnostic prompt. It runs a multi-wave review: gather facts first, then critique, then synthesize. It uses this kit's agents and follows the single-writer, many-readers rule (every reviewer is read-only).

---

Do not execute this plan yet. Use high reasoning effort. Run a Review Board over the plan you just proposed: a rigorous, multi-wave review that studies the actual codebase, checks relevant best practices, and refines the plan to a strong standard before I approve it. The plan you presented is the input. Review it as follows.

## Wave 1: Discovery (parallel, read-only)

The job of this wave is to gather ground truth, not to critique yet. Dispatch these read-only agents in parallel. Each returns a distilled summary, not a transcript.

- **Codebase explorer** (`researcher`): find and read every file the plan references or implies. Do not assume file contents, selectors, endpoints, or configs; find them in the source. Report what actually exists versus what the plan assumes.
- **Pattern and convention scout** (`researcher`): how does this codebase already solve similar problems? Surface the existing patterns the plan should match instead of inventing new ones.
- **Risk and blast-radius mapper** (`reviewer`): list everything that depends on what the plan changes (callers, consumers, schemas, configs). Identify what breaks silently if the plan is wrong.
- **Best-practice check** (`architect`, may use WebSearch if enabled): is the proposed approach sound? Note one or two stronger alternatives if they exist, with the trade-off.

## Wave 2: Critique (parallel, read-only)

Using Wave 1's verified facts, dispatch specialized critics in parallel. Each reports findings by severity (Critical, Important, Minor) with concrete file:line evidence, and proposes the fix.

- **architect**: design soundness, layering, coupling, whether the plan fits the existing architecture.
- **security**: auth, input handling, secrets, and untrusted-content exposure introduced by the plan.
- **reviewer**: correctness gaps, missing error handling, missing tests, edge cases the plan ignores.
- **code-quality-auditor**: complexity, maintainability, and whether the plan over-engineers or under-specifies.

## Wave 3: Synthesis

Reconcile all findings into a single refined plan. Do not just list complaints; produce the improved plan.

Output in this structure:

```
VERDICT: approve as-is | approve with changes | revise and re-review

Blocking issues (must fix before execution):
1. <issue> -> <required change> (evidence: file:line)

Improvements (should apply):
- <improvement>

Refined plan:
<the updated step-by-step plan, with an acceptance command per step>

Open questions for the human:
- <anything genuinely needing my decision>
```

Hold to the evidence bar: every finding cites real code or a real source, never an assumption. If the plan is already strong, say so plainly rather than manufacturing objections. Remember that exactly one agent will implement the approved plan; the board only reads and advises.
