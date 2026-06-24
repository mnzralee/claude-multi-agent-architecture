# Model Routing

Per-agent model selection is the single biggest cost lever in a multi-agent system, and it costs you nothing in quality when done right. A search agent does not need a frontier model; a security auditor does. Routing each role to the right tier can cut total spend by roughly an order of magnitude versus running everything on the top model.

This is why every agent in `.claude/agents/<name>.md` declares an explicit `model:`. Never leave a high-volume agent on the default, because it then inherits the (expensive) main-session model.

## The tiers

The kit uses three capability tiers. The exact model names evolve; use the alias (`opus`, `sonnet`, `haiku`) so the kit tracks the current best model in each tier automatically. `inherit` is also valid where you genuinely want the agent to match the main session.

| Tier | Alias | Optimized for | Cost |
|------|-------|---------------|------|
| Frontier | `opus` | Hard reasoning, design, judgment, security | Highest |
| Balanced | `sonnet` | Implementation, testing, debugging, review | Moderate |
| Fast | `haiku` | Search, extraction, formatting, classification | Lowest |

## How this kit routes each agent

| Agent | Model | Why |
|-------|-------|-----|
| architect | `opus` | Design and trade-off reasoning is where frontier capability pays off |
| security | `opus` | Missing a vulnerability is expensive; judgment quality matters most here |
| code-quality-auditor | `opus` | Deep cross-cutting analysis and prioritization |
| evaluator | `opus` | A weak critic is worse than no critic; judgment is the whole job |
| supervisor | `sonnet` | Coordination and synthesis, frequent calls |
| backend-impl | `sonnet` | Implementation workhorse |
| frontend-impl | `sonnet` | Implementation workhorse |
| infra-impl | `sonnet` | Implementation workhorse |
| docker-deploy | `sonnet` | Build and deploy mechanics |
| db-specialist | `sonnet` | Schema and migration mechanics |
| cqrs-specialist | `sonnet` | Event-driven implementation |
| tester | `sonnet` | Test authoring and execution |
| e2e-tester | `sonnet` | Browser-flow authoring |
| reviewer | `sonnet` | Frequent, structured checking |
| debugger | `sonnet` | Root-cause analysis |
| watchdog | `sonnet` | Continuous monitoring, runs often |
| researcher | `haiku` | High-volume search; speed and cost dominate |
| prompt-writer | `haiku` | Short, frequent, mechanical context assembly |
| work-recorder | `haiku` | Background documentation, runs constantly |

## The routing principle, in one rule

> Put frontier models where a wrong answer is expensive (design, security, critique). Put fast models where the work is high-volume and low-judgment (search, format, document). Put the balanced model on everything in between (implementation, testing, review).

## Effort, not folklore

Reasoning depth on current models is controlled by the `/effort` setting (low, medium, high, xhigh, max) and per-agent `effort:` frontmatter, not by trigger words in prose. Older guidance about typing "think hard" or "ultrathink" is deprecated; thinking is adaptive by default. Reserve high effort for architecture, hard concurrency bugs, and security review; keep mechanical edits at low effort.

## Cost discipline

- Routing models per role is the primary lever. Apply it before reaching for any other optimization.
- Fan-out multiplies cost (Anthropic measured roughly 15x token use for a parallel research system versus a single chat). Fan out only for genuinely parallel, read-heavy work. See `.claude/rules/ai-orchestration-decision-gate.md`.
- Sub-agents return distilled summaries (roughly 1 to 2K tokens), never raw transcripts. This keeps the orchestrator context small and cheap.

## Related

- `.claude/rules/ai-orchestration-decision-gate.md`, when to orchestrate and the cost gate
- `.claude/rules/context-budget.md`, per-agent prompt-size limits
- `docs/AGENT-GUIDE.md`, the full per-agent reference
- `docs/WORKFLOW-PATTERNS.md`, the orchestration patterns these models serve
