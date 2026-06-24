---
name: review-board
description: Run the multi-wave Software Engineering Review Board (SERB) over a proposed plan before execution. A read-only board of specialist agents gathers ground truth, critiques from architecture/testing/security/devops/quality lenses, then synthesizes a refined, executable plan with a go/no-go. Use for high-stakes or cross-cutting plans, or when the developer asks to "review the plan", "run the review board", or "SERB this".
---

# Software Engineering Review Board (SERB)

> A rigorous, multi-wave plan review. Gather verified ground truth, critique from five specialist lenses in parallel, then synthesize one refined plan with a go/no-go. Every reviewer is read-only; the board advises, it does not implement.

## When to use

Invoke `/review-board` (or paste `.claude/prompts/review-board.md` after a plan in plan mode) when:

- The plan is high-stakes (touches auth, money, migrations, production, or a wide blast radius).
- The change is cross-cutting and a surface decision would miss ripples (pair with `.claude/rules/depth-first-impact-analysis.md`).
- You want an enterprise-grade refinement of a plan before committing to execution.

Skip it for one-sentence changes; the cost is not worth it there (see `.claude/rules/ai-orchestration-decision-gate.md`).

## How to run

The full agent specifications live in `.claude/prompts/review-board.md`. Read that file and execute it against the current plan. In brief, it is three waves:

1. **Wave 1: Discovery (4 parallel, read-only)** gathers ground truth, not critique:
   - Codebase Deep Explorer (actual paths, selectors, endpoints versus the plan's assumptions)
   - Best-Practices Researcher (current standards and pitfalls per technology, via WebSearch)
   - Live-State Verifier (real, non-mutating checks of what is actually up)
   - Dependency & Risk Mapper (dependency graph, failure modes, hidden assumptions, rollback)
2. **Wave 2: The Board (5 parallel specialists, read-only)** critiques against the Wave 1 ground truth: Chief Architect, Testing & Reliability Lead, Security & Compliance Lead, DevOps & Infrastructure Lead, Quality & Standards Lead. Each returns CRITICAL/HIGH/MEDIUM/LOW findings with `file:line` evidence and the fix.
3. **Wave 3: Synthesis** deduplicates and ranks findings, resolves conflicts using ground truth, and delivers the aggregate findings table, the refined executable plan, a Go/No-Go (GREEN/YELLOW/RED), and a quality scorecard.

## Rules

- Wave 1 completes before Wave 2 launches (the board needs verified facts). Within a wave, run agents in parallel.
- Every agent reads actual files, not just the plan summary. Best-practice research and live-state checks are required.
- Single-writer, many-readers: every reviewer is read-only. The board does not implement. After approval, exactly one agent executes the refined plan.
- Findings meet the evidence bar in `.claude/rules/deterministic-review.md`: every finding cites real code or a real source, never an assumption. If the plan is already strong, say so plainly rather than manufacturing objections.
- Do not execute the plan. Return the full review plus the refined plan; the human decides when to go.

## Related

- `.claude/prompts/review-board.md`, the full agent specifications to execute
- `.claude/rules/deterministic-review.md`, the evidence bar every finding must meet
- `.claude/rules/depth-first-impact-analysis.md`, the cross-layer ripple trace the architect lens applies
- `.claude/rules/ai-orchestration-decision-gate.md`, when a board is worth the cost
- `.claude/agents/evaluator.md`, the lighter-weight single-critic alternative for smaller artifacts
