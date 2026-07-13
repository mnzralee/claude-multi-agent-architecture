# Customization Guide

How to adapt this kit for your project. The kit is opinionated but stack-agnostic: the disciplines apply to any language; the illustrative examples use TypeScript and Node.

## Quick setup

```bash
# Scaffold mode (any tool)
cp -r claude-multi-agent-architecture/.claude   /your/project/
cp    claude-multi-agent-architecture/CLAUDE.md /your/project/
cp    claude-multi-agent-architecture/AGENTS.md /your/project/
mkdir -p /your/project/docs/workrecords
cp /your/project/.claude/settings.local.json.example /your/project/.claude/settings.local.json
```

Then:

1. **Fill in `CLAUDE.md` and `AGENTS.md`.** Replace every `[CUSTOMIZE]` and `[PLACEHOLDER]` (project name, stack, services, structure). Keep `CLAUDE.md` short.
2. **Fill in the `context/` pack.** These are blank templates describing your project's overview, architecture, code standards, and UI context. Agents read them for grounding.
3. **Set permissions.** Adjust `.claude/settings.json` and put machine-specific allowances in `settings.local.json` (gitignored).

## Customizing permissions

Permissions are flat string arrays in `.claude/settings.json`: `allow`, `ask`, `deny`. Add what your project uses; keep the shared file safe-by-default and push broad or personal allowances to `settings.local.json`.

```json
{
  "permissions": {
    "allow": ["Bash(pnpm:*)", "Bash(make:*)", "Bash(cargo:*)"],
    "ask":   ["Bash(git checkout:*)"],
    "deny":  ["Bash(rm -rf:*)", "Bash(git push:*)", "Bash(curl:*)", "Read(.env)"]
  }
}
```

Use the narrowest matcher that works. `curl`/`wget` and destructive git stay denied by default; see `docs/SECURITY.md`.

## Customizing agents

Each subagent is a flat file `.claude/agents/<name>.md` that opens with YAML frontmatter, then a prose body. There is no separate registration step; Claude Code discovers agents from the `.claude/agents/` directory.

### Modify an existing agent

Edit its body to match your stack: role context, patterns, file structure, and commands. For example, to retarget `backend-impl` at Python/FastAPI, replace the TypeScript patterns with your own and update the commands (`uvicorn`, `pytest`, `mypy`). Do not change the frontmatter `name`.

### Add a new agent

Create `.claude/agents/<name>.md`:

```markdown
---
name: your-agent
description: Use this agent when ... Use proactively for ... (this string drives automatic delegation, so make it specific)
tools: Read, Grep, Glob, Edit, Write, Bash
model: sonnet
---

# Your Agent

## Role
What this agent owns, in one or two sentences.

## Operating rules
The non-negotiables: what it always does, what it never does.

## Output format
What it returns to the orchestrator (a distilled summary, not a transcript).

## Boundaries
What it must not do (no push, no destructive ops, no scope creep).
```

Then add it to `AGENTS.md`, `docs/AGENT-GUIDE.md`, and the agent list in `CLAUDE.md`. Pick the model per `docs/MODEL-ROUTING.md`: frontier for judgment, fast for high-volume search, balanced for implementation. Give it the minimum `tools`.

## Customizing skills

Each skill is `.claude/skills/<name>/SKILL.md` with `name` and `description` frontmatter. The directory name is the `/command`.

### Add a new skill

```markdown
---
name: your-skill
description: What this workflow does and when it fires.
---

# Your Skill

## When to use
## Workflow
## Examples
## Related
```

For side-effecting workflows (deploy, release) that should only run on explicit invocation, add `disable-model-invocation: true` to the frontmatter so the model does not auto-fire them.

## Customizing rules

Rules in `.claude/rules/` are enforcement docs. Add `paths:` frontmatter to scope a rule to file types:

```markdown
---
paths:
  - "**/*.ts"
  - "**/*.tsx"
---

# Your Rule
State the principle, what it requires, what it forbids, and how to verify.
```

## Global doctrine, local specialists

If you work across more than one project, you will hit a scoping question: does a piece of configuration belong in this project only, or in every session on the machine? Claude Code has two tiers for this: the **project tier** (`.claude/` inside a repo, loads only there) and the **user tier** (`~/.claude/`, loads in every session, everywhere). Putting everything in one tier is the mistake. Split by reach instead.

**Doctrine is universal; put it at the user tier.** The Operating Standard (`.claude/standards/OPERATING-STANDARD.md` and its loader `.claude/rules/operating-standard.md`) is not specific to this codebase. Conduct, the communication contract, the completion bar, the depth-first discipline, applies to any project you work on. Copy it once to `~/.claude/`, then keep a single source of truth by symlinking the global copy back to the versioned one in your kit repo, so the two can never drift:

```bash
# macOS / Linux
ln -sf /path/to/claude-multi-agent-architecture/.claude/standards/OPERATING-STANDARD.md \
       ~/.claude/standards/OPERATING-STANDARD.md
ln -sf /path/to/claude-multi-agent-architecture/.claude/rules/operating-standard.md \
       ~/.claude/rules/operating-standard.md

# Windows (PowerShell, run as Administrator, or enable Developer Mode for unprivileged symlinks)
New-Item -ItemType SymbolicLink -Path "$HOME\.claude\standards\OPERATING-STANDARD.md" `
  -Target "C:\path\to\claude-multi-agent-architecture\.claude\standards\OPERATING-STANDARD.md"
```

Launch with the standard applied everywhere using `.claude/bin/claude-standard` (or the `.ps1` variant) pointed at your global copy, or alias it in your shell profile so every `claude` invocation, in any directory, carries the doctrine in its system prompt.

**Specialist agents are project-specific; keep them at the project tier.** Your `.claude/agents/*.md` roles know this project's services, stack, and namespaces. Making them global would surface them inside unrelated projects, where they are noise at best and actively wrong at worst (a `db-specialist` tuned to one project's schema conventions giving advice inside a project with a different database entirely). Copy or adapt agents per project, per the "Customizing agents" section above.

Global conduct, local expertise. Standardize the behavior everywhere; scope the knowledge to where it is true. See [docs/OPERATING-STANDARD.md](OPERATING-STANDARD.md) for why this split matters and [docs/HARNESS-VERIFICATION.md](HARNESS-VERIFICATION.md) for how to confirm both tiers actually loaded.

## Cross-session state

Claude Code sessions are ephemeral. Persist progress in JSON under `.claude/progress/` so a new session (or the `work-recorder`) can resume. The kit ships `current-task.json.example`; copy it to `current-task.json` (gitignored) and adapt:

```json
{
  "completedItems": ["..."],
  "currentItem": "feature-x",
  "currentPhase": "implementation",
  "status": "in-progress",
  "blockers": [],
  "lastUpdated": "[DATE]"
}
```

A carry-forward registry is also useful, listing pending items discovered mid-session with priority and status, so nothing is silently dropped between sessions.

## Work-record discipline

Work records under `docs/workrecords/work-record-YYYY-MM-DD.md` are the project's engineering memory.

- **Append-only.** Once written, history is not rewritten. Failures and reversed decisions stay, because their context is valuable later. The only exception is completing a section a context limit cut short, with a note saying so.
- **Narrative, not bullets.** Each entry explains why a decision was made, what alternatives were rejected, what surprised you, and what patterns emerged. A future reader should understand the reasoning, not just the diff.
- **End with metrics.** Commits, files changed, modules touched, agents spawned, bugs found and fixed, carry-forward items.

The `work-recorder` agent and the templates in `.claude/templates/work-record/` automate the structure.

## From kit to production: grow as you go

You do not need everything on day one. Add components as pain points emerge.

| Stage | Add | Signal |
|-------|-----|--------|
| Solo, week 1 | architect, backend-impl (or frontend-impl), tester, reviewer, debugger; rules: git-workflow, code-quality, production-grade-code | Getting the basic loop working |
| Growing, month 1-2 | researcher, prompt-writer, security; skills: plan-feature, pr, work-recording; `progress/` state | Repeating context to agents; cross-session memory needed |
| Scale, month 3+ | supervisor, docker-deploy, db-specialist, cqrs-specialist, e2e-tester, watchdog, evaluator, code-quality-auditor; the orchestration rules and review board | Multi-track parallel work; recurring classes of error |

Add a specialist when you keep giving the same context to a generalist. Add a rule when a class of error keeps recurring. Add a skill when a multi-step task repeats.

## Removing components

To drop an agent, skill, or rule you do not need, delete its file (and remove references from `AGENTS.md` / `CLAUDE.md` / `docs/AGENT-GUIDE.md`). For a small project, keeping architect, one implementer, tester, and debugger is enough to start.

## Troubleshooting

- **Agent not invoked**: check the `description` frontmatter (it drives delegation); make it specific and action-oriented. Confirm the file is in `.claude/agents/` with valid YAML.
- **Skill not firing**: confirm the `name` frontmatter matches the directory, and the file is `SKILL.md`. For auto-fire, the `description` must signal when it applies.
- **Hook not running**: confirm Python is on PATH (for the `.py` hooks) and the command in `settings.json` resolves `$CLAUDE_PROJECT_DIR`. The hooks read their event from stdin; test with `echo '{"tool_name":"Write","tool_input":{"file_path":".env"}}' | python .claude/hooks/file-guard.py`.
- **Permission denied**: check the matcher in `settings.json` and any conflicting `deny` rule (deny wins).

## Related

- `docs/AGENT-GUIDE.md`, when to use which agent
- `docs/MODEL-ROUTING.md`, model tiers and cost
- `docs/OPERATING-STANDARD.md`, doctrine vs. capability and the portable behavioral contract
- `docs/HARNESS-VERIFICATION.md`, verify your agents, hooks, and rules actually load
- `docs/SECURITY.md`, permission hygiene and the untrusted-content boundary
- `docs/WORKFLOW-PATTERNS.md`, orchestration patterns
