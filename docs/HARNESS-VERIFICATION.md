# Harness Verification

How to confirm your Claude Code harness actually does what its files claim, before you trust it. Pairs with the Show Your Work Rule in [`.claude/rules/ai-agent-engineering.md`](../.claude/rules/ai-agent-engineering.md) and the [Operating Standard](OPERATING-STANDARD.md).

## The failure mode this guards against

A declared subagent, a wired hook, a scoped rule: none of it is real until the runtime confirms it loaded. A well-written role file that the framework never parses as a subagent is, functionally, documentation. It can sit in a repo for months, get referenced in `CLAUDE.md`, and never once be dispatched, while the orchestrator silently falls back to a generic agent and compensates by pasting role context into prompts. It can work well enough that nobody notices the declared specialist was never real.

The general lesson: **the ground truth of a harness is what the runtime actually loads, not what your configuration claims.** Treat "it's in the config" as a hypothesis. The runtime's own report of what it loaded is the only evidence that closes it.

This class of bug is the agent-discovery analogue of the phantom-file guard in `ai-agent-engineering.md` (an agent claiming to have written a file that is not on disk). Both are caught the same way: stop trusting the claim, and re-check the artifact yourself.

## Check 1: agents actually load as native subagents

Native subagent discovery requires a `.md` file directly under `.claude/agents/` (not nested in a subdirectory) whose YAML frontmatter declares at minimum `name` and `description`. This kit's own agents conform to that shape, for example [`.claude/agents/architect.md`](../.claude/agents/architect.md), which opens with:

```yaml
---
name: architect
description: Use for system design, module planning, API contracts...
tools: Read, Grep, Glob, WebSearch
model: opus
---
```

If you fork or extend this kit, verify your additions the same way:

1. **List what the runtime actually sees.** Start a session and ask it to list its available subagent types, or check the agent picker in your tool. Compare that list against every file in `.claude/agents/`.
2. **Grep for the failure shape.** A file using prose metadata instead of YAML frontmatter (`- **Name**: my-agent` inside the body, no `---` block) will not parse as a subagent, no matter how detailed its content.
   ```bash
   for f in .claude/agents/*.md; do
     head -1 "$f" | grep -q '^---$' || echo "MISSING FRONTMATTER: $f"
   done
   ```
3. **Confirm `name` and `description` are both present**, not just one:
   ```bash
   for f in .claude/agents/*.md; do
     awk '/^---$/{c++; next} c==1' "$f" | grep -q '^name:' || echo "MISSING name: $f"
     awk '/^---$/{c++; next} c==1' "$f" | grep -q '^description:' || echo "MISSING description: $f"
   done
   ```
4. **Do not auto-fix and move on.** If a role was intentionally documentation-only (a fork-dispatch pattern where the orchestrator reads the file as a spec rather than the framework dispatching it natively), converting it to a native subagent is a behavior change, not a typo fix. Flag it and let a human decide which model is intended, per the Agent Autonomy Boundaries in `ai-agent-engineering.md`.

## Check 2: settings keys are real, not inert

`settings.json` and `settings.local.json` follow a defined schema. An unrecognized top-level key (a custom `agents` or `workflows` block someone hand-rolled) is silently ignored, not an error, so it can sit there for a long time looking load-bearing while doing nothing. Diff your keys against the documented schema for your Claude Code version, and if you find one that is not real, either wire it properly or delete it and move its intent into `CLAUDE.md` prose, which is honest about being a convention rather than an enforced config.

## Check 3: hooks fire on the event they claim, and fail safely

For every hook in `.claude/hooks/`, confirm two things independently:

- **It reads its event correctly.** Claude Code delivers the hook event as JSON on stdin, not as a command-line argument. A hook written to expect `sys.argv` will silently no-op forever. Test with the exact invocation Claude Code uses:
  ```bash
  echo '{"tool_name":"Write","tool_input":{"file_path":".env"}}' | python .claude/hooks/file-guard.py
  ```
- **A hook that can block completion (a `Stop` hook) is adversarially tested for the three safety properties before it is wired in**, not assumed to have them because the docstring says so:

  | Property | What to verify |
  |---|---|
  | Inert by default | Unset its enabling flag; confirm silent exit 0 |
  | Loop-safe | Enable it, simulate `stop_hook_active: true`; confirm it does not block a second time |
  | Fail-open | Feed it empty stdin and garbage non-JSON stdin; confirm exit 0 both times, never a hang or a crash that blocks the stop |

  This kit's `.claude/hooks/verification-gate.py` was verified this way before being wired into `settings.json`; see the exact commands in [docs/OPERATING-STANDARD.md](OPERATING-STANDARD.md#safe-enforcement-the-verification-gate). Run the same battery on any Stop hook you write, including the opt-in `checkpoint.sh` / `checkpoint.ps1`.

## Check 4: role docs describe the system that actually exists

Grep every agent role file for names that no longer resolve: a namespace that was renamed, a service that was migrated to a different stack, a framework version that has since moved on. This is stale documentation, not a functional bug, but it is exactly the kind of drift `.claude/rules/anti-entropy.md` calls Documentation Drift: a role file that confidently tells an agent to look for something that is not there wastes the agent's first several tool calls rediscovering reality. Fix it in its own reviewed commit per role; do not silently reword agent behavior while you are at it.

## The recursive pattern: verify the harness with the harness

Once the individual checks above pass, run a small multi-agent self-audit before you trust the harness as a whole, using the kit's own review-board pattern (`/review-board`, or a hand-assembled version for a smaller change):

- One reviewer adversarially probes the completion gate and any other blocking hook for the loop and failure paths above, trying to break it rather than confirm it.
- One reviewer fact-checks the operating standard (or whatever doctrine document you are shipping) for internal contradictions, for example a preamble claiming a tier never needs a given nudge while the document's own labels say otherwise.
- One reviewer audits your own findings report against the actual files, specifically to catch you overstating what was fixed versus what remains open.

This is not decoration. A doctrine document long enough to have numbered sections and cross-references is long enough to contradict itself somewhere, and the author is the person least likely to spot it, having just written it. An independent reviewer whose only job is to fact-check the document against itself catches that class of defect cheaply, before the document ships into every session's context. Equally important: an audit that never rejects anything is a rubber stamp. If every reviewer confirms every finding, tighten the review, not the confidence in the result; the value of independent reviewers is that they sometimes disagree with each other and with you.

When you close out a harness audit, report every finding, not a representative few, per section 10 of the Operating Standard, and disclose residual work you chose not to do rather than silently dropping it. A known, disclosed gap is cheaper than the same gap discovered later in production.

## Checklist

- [ ] Started a session and confirmed the runtime's own subagent list matches every file in `.claude/agents/`
- [ ] Grepped every agent file for missing frontmatter, missing `name`, or missing `description`
- [ ] Diffed `settings.json` / `settings.local.json` top-level keys against the real schema; no inert custom keys
- [ ] Tested every hook's stdin handling with the exact JSON shape Claude Code sends
- [ ] Adversarially tested every `Stop` (or otherwise blocking) hook for inert-by-default, loop-safety, and fail-open
- [ ] Grepped role docs for stale namespace, stack, or framework references
- [ ] For a substantial harness change, ran an independent multi-agent audit before trusting it, and disclosed every finding uncapped

## Related

- [docs/OPERATING-STANDARD.md](OPERATING-STANDARD.md), the doctrine this verification pattern enforces
- `.claude/rules/ai-agent-engineering.md`, the Show Your Work Rule and the phantom-file guard this pattern extends to agent discovery
- `.claude/rules/anti-entropy.md`, documentation drift prevention
- `.claude/skills/review-board/SKILL.md`, the multi-wave review pattern used for the recursive audit
