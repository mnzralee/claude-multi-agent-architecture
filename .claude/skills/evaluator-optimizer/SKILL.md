---
name: evaluator-optimizer
description: A generator-plus-critic loop that improves output against an explicit rubric before acceptance. Use when you have clear acceptance criteria and iteration measurably helps (specs, prompts, important docs, tricky implementations). Includes a seed eval set for regression-testing prompt and rule changes.
---

# Evaluator-Optimizer Loop

> Generate, then have an independent critic score against an explicit rubric, then refine, until it passes or the budget is spent. One of Anthropic's five effective-agent patterns, and the one most starter kits omit. It is how you get measurably better output instead of one-shot output you hope is good.

## When to use this

Invoke `/evaluator-optimizer` when both are true:

1. **You can state acceptance criteria.** There is a rubric, a spec, a set of must-haves, or a clear definition of done.
2. **Iteration helps.** A first pass is rarely the best pass for this kind of artifact: a specification, an API design, a security-sensitive change, an important document, a prompt you will reuse.

Do not use it when there is no clear evaluation signal, or when a single pass is obviously good enough. Adding a critic loop to a trivial task is the over-engineering this kit warns against (see `.claude/rules/ai-orchestration-decision-gate.md`).

## The loop

```
1. RUBRIC      Define explicit, checkable acceptance criteria up front.
2. GENERATE    A generator produces the artifact against the rubric.
3. EVALUATE    The `evaluator` agent (frontier, read-only) scores each criterion: PASS / FAIL + concrete gap.
4. DECIDE      All blocking criteria pass        -> accept.
               Gaps remain and rounds remain     -> feed the evaluator's gaps back to the generator, go to 2.
               Budget spent and gaps remain       -> stop, hand back with the open gaps named (do not pretend done).
```

Keep it to **1 to 2 refinement rounds** by default. More than that usually means the rubric is wrong or the task is mis-scoped, not that another round will help.

## Roles

- **Generator**: the implementation or authoring agent (or the main thread). Produces and revises.
- **Critic**: the `evaluator` agent (`.claude/agents/evaluator.md`). Read-only, frontier model, scores against the rubric, never edits. Keep these two separate; a generator grading its own work is not an evaluation.

## Writing a good rubric

A rubric is a short list of criteria, each independently checkable and ideally backed by a command or a concrete check:

- Binary where possible ("all exported functions have explicit return types": yes/no), not vague ("code is clean").
- Tied to evidence ("`npx tsc --noEmit` exits 0", "the failing test from step 1 now passes").
- Separated into **blocking** (correctness, security, meets-the-requirement) and **advisory** (style, naming). Only blocking criteria gate acceptance.

## LLM-as-judge and the seed eval set

For prompts, rules, and skills you will reuse, you want to know whether a change made them better or worse, not just whether one example looked fine. This skill ships a small seed set of example tasks in `seed-tasks.md`. Use it as a lightweight regression harness:

1. When you change a rule, a skill, or an agent's prompt, run a sample of the seed tasks through the affected path.
2. Have the `evaluator` agent score the outputs with a fixed rubric (LLM-as-judge).
3. Compare against the previous version's scores. A change that lowers scores on the seed set is a regression, even if the one case you were looking at improved.

This is the same principle behind held-out test suites: trust the measured signal, not self-assessment. Expand `seed-tasks.md` with the cases your project actually cares about; twenty good examples beat two hundred shallow ones.

## High-stakes work gets a human checkpoint

Automated evaluation reduces error; it does not eliminate it. For changes that are expensive to get wrong (migrations, security boundaries, anything touching money or auth, production mutations), the loop ends at a human approval, not at the critic's PASS. The evaluator's job there is to surface the risks clearly so the human decision is well-informed.

## Anti-patterns

- The generator evaluating its own output (not an independent signal).
- A rubric of vague adjectives instead of checkable criteria.
- Looping more than twice (fix the rubric or re-scope instead).
- Treating the critic's PASS as a substitute for human sign-off on high-stakes changes.
- Skipping the seed set when changing a reused prompt or rule, then being surprised by a regression elsewhere.

## Related

- `.claude/agents/evaluator.md`, the critic that scores against the rubric
- `.claude/rules/ai-orchestration-decision-gate.md`, when the loop is worth it vs over-engineering
- `.claude/skills/verification-before-completion/SKILL.md`, the per-change definition-of-done gate
- `.claude/rules/deterministic-review.md`, the evidence-strength bar for the critic's findings
- `seed-tasks.md` (in this skill folder), the regression-test example set
