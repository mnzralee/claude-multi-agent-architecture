# Claude Multi-Agent Architecture

A production-grade, spec-conformant starter kit for building serious software with [Claude Code](https://code.claude.com). Clone it (or install it as a plugin) and any project gets a disciplined multi-agent setup: specialized subagents, evidence-driven orchestration, enforcement rules, reusable skills, and real hooks, all distilled from a large real-world codebase and the published research on effective agents.

> The point of this kit is not "more agents." It is *correct* agents: prove work with artifacts, orchestrate only when it helps, and keep exactly one writer at a time.

## What you get

- **19 specialized subagents** in spec-conformant flat files (`.claude/agents/<name>.md`), each with explicit model routing and a minimal tool set: architect, researcher, supervisor, prompt-writer, backend-impl, frontend-impl, infra-impl, docker-deploy, db-specialist, cqrs-specialist, tester, e2e-tester, reviewer, debugger, security, code-quality-auditor, evaluator, watchdog, work-recorder.
- **18 enforcement rules** in `.claude/rules/`, including the evidence-driven `ai-agent-engineering` discipline, the `ai-orchestration-decision-gate`, clean architecture, TDD, complexity limits, anti-entropy, security standards, and the untrusted-content boundary.
- **18 skills** invoked with `/name`: plan-feature, multi-agent-orchestration, review-board (the multi-wave Software Engineering Review Board), evaluator-optimizer, ralph-loop, tdd-workflow, commit, pr, review, systematic-debugging, verification, and more.
- **Real, executable hooks**: a `PreToolUse` file guard that blocks secret writes, a `PostToolUse` auto-format pass, and an opt-in `Stop` checkpoint. Wired correctly so they actually fire.
- **A context/ pack, governance gates, work-record templates, and a review-board prompt** for multi-agent plan validation.
- **Cross-tool `AGENTS.md`** so the same conventions carry to Cursor, Codex, Gemini, and others.

## Install

### Option A: clone-and-copy (any tool, zero install)

```bash
git clone https://github.com/mnzralee/claude-multi-agent-architecture
cp -r claude-multi-agent-architecture/.claude   /your/project/
cp    claude-multi-agent-architecture/CLAUDE.md /your/project/
cp    claude-multi-agent-architecture/AGENTS.md /your/project/
mkdir -p /your/project/docs/workrecords
```

Then open `CLAUDE.md` and `AGENTS.md` and replace the `[CUSTOMIZE]` placeholders (project name, stack, services). Adjust `.claude/settings.json` permissions, and copy `.claude/settings.local.json.example` to `.claude/settings.local.json` for your machine-specific allowances.

### Option B: install as a Claude Code plugin

This repo ships a plugin manifest (`.claude-plugin/plugin.json`) and a marketplace (`.claude-plugin/marketplace.json`). Add the marketplace, then install:

```
/plugin marketplace add mnzralee/claude-multi-agent-architecture
/plugin install claude-multi-agent-architecture
```

The plugin contributes the agents, skills, and hooks without copying files into your repo.

## Quick use

```bash
/plan-feature        # Explore -> Plan -> Code -> Commit
/commit              # conventional, file-by-file commit
/review              # quality + security review
/tdd-workflow        # red-green-refactor with an audit trail
# Subagents are invoked automatically by task, or explicitly:
#   "use the architect agent to design the payments module"
```

## How it is built (the philosophy)

Three principles, each backed by published research, separate this kit from a pile of agent files:

1. **Decide before you orchestrate.** Most tasks are workflows, not agents. The `ai-orchestration-decision-gate` rule forces "could a single prompt or fixed workflow do this?" before any fan-out, then picks the smallest of the five effective-agent patterns that fits. (Anthropic, *Building Effective Agents*; Cognition, *Don't Build Multi-Agents*.)
2. **Single writer, many readers.** Parallel subagents read, analyze, and review freely; exactly one agent mutates files or commits at a time. This reconciles "parallel reads win" with "parallel writes corrupt state."
3. **Prove work with artifacts.** "Done" means a commit SHA, verbatim test output, or a passing check, never "looks good." The orchestrator re-runs the acceptance command itself, and a phantom-file guard catches files an agent claims to have written but did not. (`ai-agent-engineering` rule.)

## Repository structure

```
claude-multi-agent-architecture/
  CLAUDE.md                     # project instructions (customize)
  AGENTS.md                     # cross-tool agent config
  README.md
  LICENSE                       # MIT
  CONTRIBUTING.md
  .claude-plugin/
    plugin.json                 # plugin manifest
    marketplace.json            # single-plugin marketplace
  .claude/
    settings.json               # safe-by-default permissions + real hooks
    settings.local.json.example # personal/machine overrides (gitignored)
    agents/<name>.md            # 19 subagents, flat files, YAML frontmatter
    skills/<name>/SKILL.md      # 18 skills
    rules/<name>.md             # 18 enforcement rules
    hooks/                      # file-guard.py, auto-format.py, checkpoint.sh/.ps1, hooks.json
    prompts/review-board.md     # multi-agent review board
    workflows/feature-flow.example.js
    governance/quality-gates.json
    templates/work-record/      # session documentation templates
    progress/                   # cross-session state
  context/                      # fill-in templates for your project's context
  docs/
    AGENT-GUIDE.md              # when to use which agent
    WORKFLOW-PATTERNS.md        # orchestration patterns, diagrammed
    MODEL-ROUTING.md            # per-agent model tiers and cost rationale
    SECURITY.md                 # permission hygiene + untrusted-content posture
    CUSTOMIZATION.md            # how to adapt for your project
    workrecords/                # your session records land here
```

## Model routing

Per-agent model selection is the biggest cost lever. The kit routes frontier models (`opus`) to design, security, and critique; the balanced model (`sonnet`) to implementation, testing, and review; and the fast model (`haiku`) to search, prompt-writing, and documentation. See [docs/MODEL-ROUTING.md](docs/MODEL-ROUTING.md).

## Orchestration patterns

Swarm, council, watchdog, evaluator-optimizer, and the five Anthropic primitives (prompt-chaining, routing, parallelization, orchestrator-workers, evaluator-optimizer), each with when-to-use and when-not-to-use notes, are diagrammed in [docs/WORKFLOW-PATTERNS.md](docs/WORKFLOW-PATTERNS.md).

## Conforms to the current Claude Code spec

Subagents are flat `.claude/agents/<name>.md` files with YAML frontmatter (`name`, `description`, `tools`, `model`). Skills are `.claude/skills/<name>/SKILL.md`. Hooks are real `settings.json` event arrays (`PreToolUse`, `PostToolUse`, `Stop`) that read their event from stdin. Reasoning depth uses `/effort`, not deprecated trigger words. The kit is packaged as both a scaffold and a plugin.

## Documentation

- [docs/CUSTOMIZATION.md](docs/CUSTOMIZATION.md) - adapt the kit to your project
- [docs/AGENT-GUIDE.md](docs/AGENT-GUIDE.md) - when to use which agent
- [docs/WORKFLOW-PATTERNS.md](docs/WORKFLOW-PATTERNS.md) - orchestration patterns
- [docs/MODEL-ROUTING.md](docs/MODEL-ROUTING.md) - model tiers and cost
- [docs/SECURITY.md](docs/SECURITY.md) - security posture

## License

MIT. See [LICENSE](LICENSE). Use and adapt freely.

## Attribution

Created by Manazir Ali. Architecture grounded in Anthropic's published guidance on effective agents, context engineering, and Claude Code best practices, plus the counterpoint from Cognition on single-threaded robustness. Distilled from real production multi-agent use.
