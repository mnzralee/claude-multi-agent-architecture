# AI Orchestration Decision Gate

## Overview

Multi-agent orchestration is powerful and expensive. The single most common failure in agentic engineering is reaching for a swarm when a single prompt would do, or fanning out parallel writers when the work is tightly coupled. This rule is the gate every orchestration decision passes through before any sub-agent is spawned.

It is the strategic companion to `.claude/rules/ai-agent-engineering.md` (which governs how a dispatch is executed once you have decided to dispatch) and `.claude/skills/multi-agent-orchestration/SKILL.md` (the choreography). This rule governs whether you orchestrate at all, and in what shape.

The framing comes directly from Anthropic's "Building Effective Agents" (2024) and "How we built our multi-agent research system" (2025), tempered by Cognition's "Don't Build Multi-Agents" (2025). The synthesis of those three is the kit's default posture.

---

## Core Principle

> Do the simplest thing that is verifiably correct. Add agents only when the task is genuinely parallel and read-heavy. When agents must write, exactly one writes.

Every increment of orchestration (an extra agent, an extra parallel branch, an extra hop) buys capability at the cost of latency, tokens, and coordination fragility. The gate forces you to justify that cost before paying it.

---

## Gate 1: Does this need an agent at all?

Anthropic's distinction: a **workflow** is a system where LLM steps are orchestrated through predefined code paths; an **agent** is a system where the LLM directs its own process and tool use. Most tasks are workflows.

Ask, in order:

1. **Can a single prompt with the right context solve this?** If yes, do that. No sub-agents.
2. **Can a fixed sequence of steps solve this?** If yes, write the steps (a workflow), do not hand control to an autonomous agent.
3. **Is the path genuinely unpredictable, requiring the model to decide what to do next based on intermediate results?** Only then is an agent (autonomous loop) justified.

> Heuristic: if you can describe the diff in one sentence, skip the plan and just make it. If you can describe the steps in advance, write a workflow, not an agent.

---

## Gate 2: If you orchestrate, pick the smallest pattern that fits

These are the five composable workflow primitives. Prefer the earliest one that fits; do not jump to "orchestrator with autonomous workers" by default.

| Pattern | What it is | Use when | Avoid when |
|---|---|---|---|
| **Prompt chaining** | Decompose into fixed sequential steps, each feeding the next | The task has clean sequential subtasks (outline, then draft, then polish) | Steps are independent (chaining adds needless latency) |
| **Routing** | Classify the input, send it to a specialized handler | Distinct categories of input are better handled separately (bug vs feature vs question) | Categories overlap or a single handler is already good enough |
| **Parallelization** | Run independent subtasks at once, then aggregate (sectioning), or run the same task N times for a vote (voting) | Subtasks are independent and read-heavy, or you want multiple perspectives on one judgment | Subtasks share state or one feeds another |
| **Orchestrator-workers** | A lead model dynamically decomposes and dispatches to workers, then synthesizes | The number and shape of subtasks is not known in advance (open-ended research, codebase-wide search) | The work is a fixed pipeline (use chaining) or tightly coupled (single-thread it) |
| **Evaluator-optimizer** | A generator produces, a separate critic scores against a rubric, loop until it passes | You have clear acceptance criteria and iteration measurably improves the output | There is no clear evaluation signal, or one pass is good enough |

See `docs/WORKFLOW-PATTERNS.md` for diagrams and `.claude/skills/evaluator-optimizer/SKILL.md` for the generator-critic loop.

---

## Gate 3: Single-writer, many-readers

This is the load-bearing constraint that reconciles Anthropic ("parallel sub-agents win on breadth-first read-mostly tasks") with Cognition ("parallel agents that share work fragment decisions and corrupt state").

> Sub-agents may search, read, analyze, and advise in parallel without limit. Exactly one agent performs mutations (file writes, commits, migrations, API mutations) on one thread at a time.

Concretely:

- **Reads parallelize freely.** Fan out researchers, reviewers, auditors, and critics. They return distilled findings, never raw transcripts (see Gate 5).
- **Writes serialize.** When implementation is needed, one implementation agent owns the change. If two file-sets are truly disjoint and must proceed in parallel, the orchestrator still serializes the commit step (a shared git index and pre-commit hooks are a shared mutable resource). See `.claude/rules/ai-agent-engineering.md` for the commit-race rule.
- **No two agents edit the same file, barrel, DI container, schema, or lockfile concurrently.** Those are always serialization points.

---

## Gate 4: Cost is real; scale effort to the task

Anthropic's multi-agent research system used about 15x the tokens of a single chat for the same wall-clock work. Fan-out is justified when the task value and parallelism are high, and wasteful otherwise.

- **Right-size the fleet.** One agent for a simple task. Fan out only for genuinely parallel, breadth-first work. Do not fan out for coding a single feature or for tightly-coupled changes.
- **Route models per role (the primary cost lever).** Put the orchestrator/planner and the final synthesizer on a frontier model; put search, extraction, formatting, and classification on a fast cheap model; put the critic/verifier on a frontier model (judgment quality matters there). See `docs/MODEL-ROUTING.md`. This alone can cut cost by an order of magnitude.
- **Scale thinking with effort, not folklore.** On current models, control reasoning depth with the `/effort` setting (low, medium, high, xhigh, max) or per-agent `effort:` frontmatter. Do not rely on deprecated trigger words. Use higher effort for architecture, debugging hard races, and security review; low effort for mechanical edits.
- **Surface the multiplier.** Before spawning a fleet, state roughly how many agents and why. A fan-out the user did not ask for is a cost they did not authorize.

---

## Gate 5: Every spawn has a contract

Per Anthropic's guidance, vague sub-agent instructions are the top cause of duplicated and misaligned work. Every sub-agent spec must state:

1. **Objective** in one sentence.
2. **Output format** (what it returns, and that it returns a distilled summary of roughly 1 to 2K tokens, not its raw transcript).
3. **Allowed tools and sources** (the minimum set).
4. **Boundaries** (what it must not do: no push, no destructive ops, no scope creep).

A sub-agent whose job cannot be stated in one sentence is mis-scoped; split it or fold it back into the caller.

---

## What this rule forbids

- Spawning sub-agents for a task a single prompt handles.
- Building an autonomous agent loop where a fixed workflow suffices.
- Parallel agents that write to overlapping files or share a commit step.
- Fan-out without a stated agent count and rationale.
- Sub-agents that return raw transcripts up to the orchestrator instead of distilled summaries.
- Leaving a high-volume search agent on the expensive default model.

---

## Pre-Orchestration Checklist

- [ ] Could a single prompt or a fixed workflow do this? (If yes, stop here.)
- [ ] If orchestrating, have I picked the smallest pattern that fits?
- [ ] Are all parallel agents read-only, with a single writer for mutations?
- [ ] Have I routed models by role (cheap for search, frontier for reasoning/critique)?
- [ ] Does every spawn have objective, output format, tools, and boundaries?
- [ ] Have I stated the agent count and rough cost before fanning out?

---

## Related Rules and Skills

- `.claude/rules/ai-agent-engineering.md`, how a dispatch is executed and verified once decided
- `.claude/skills/multi-agent-orchestration/SKILL.md`, the orchestration choreography
- `.claude/skills/evaluator-optimizer/SKILL.md`, the generator-critic loop
- `.claude/skills/plan-feature/SKILL.md`, the Explore -> Plan -> Code -> Commit flow and the one-sentence skip heuristic
- `.claude/rules/context-budget.md`, per-agent prompt-size limits
- `docs/WORKFLOW-PATTERNS.md`, diagrams of the five primitives and the kit patterns
- `docs/MODEL-ROUTING.md`, per-role model tiers and the cost rationale

---

## Sources

- Anthropic, "Building Effective AI Agents" (2024), https://www.anthropic.com/research/building-effective-agents
- Anthropic, "How we built our multi-agent research system" (2025), https://www.anthropic.com/engineering/multi-agent-research-system
- Anthropic, "Effective context engineering for AI agents", https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Cognition (Walden Yan), "Don't Build Multi-Agents" (2025), https://cognition.ai/blog/dont-build-multi-agents
- Anthropic, "Best practices for Claude Code", https://code.claude.com/docs/en/best-practices
