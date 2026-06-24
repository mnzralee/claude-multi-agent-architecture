# Context Budget Management

## Core Principle

Context is a finite resource. Manage it deliberately to maximize Claude Code's effectiveness across sessions and inside sub-agents.

---

## Always-Loaded Tier (every session, every turn)

| Layer | Target |
|---|---|
| Root `CLAUDE.md` | Under 600 lines / ~30 KB. Anthropic's ideal is 200 lines; complex projects may warrant somewhat above that, but treat it as a hard ceiling. |
| Universal `.claude/rules/*.md` (no `paths:` frontmatter) | Under 30 KB combined. Reserve this tier for rules that apply to every file in the project. |
| Auto-memory `MEMORY.md` | First 200 lines or 25 KB, whichever comes first. Keep entries concise; move detail to topic files. |

Total always-loaded baseline target: under 60 KB. Above that, Claude begins ignoring instructions buried deep in the noise.

---

## Lazy-Loaded Tier

| Mechanism | Loads When |
|---|---|
| Nested `CLAUDE.md` (e.g., `apps/api/CLAUDE.md`) | Claude reads a file inside that subtree |
| Path-scoped `.claude/rules/*.md` (with `paths:` frontmatter) | Claude opens a file matching the glob |
| Skills (`.claude/skills/`) | User invokes `/skill-name` OR Claude judges the skill relevant from its description |
| Sub-agent `AGENT.md` | A sub-agent of that type is invoked |

Use these tiers aggressively. Anything that applies to less than 100% of files should be path-scoped or promoted to a skill.

---

## Sub-Agent Context Optimization

### Use the prompt-writer first

The prompt-writer agent (fast, small model) generates context-optimized prompts for every sub-agent dispatch. Skipping this step causes sub-agents to thrash on incomplete context. See root `CLAUDE.md` for the prompt-writer pattern.

### Progressive knowledge loading

```
Tier 1 (always in sub-agent):    Agent name, role, model           ~1 KB
Tier 2 (on dispatch):            AGENT.md instructions             ~3-5 KB
Tier 3 (on demand, via tools):   File contents Claude reads        ~varies
```

Never paste the full root `CLAUDE.md` or a project master plan into a sub-agent prompt. Reference by path and let the sub-agent Read the file when it actually needs it.

---

## The Ralph Loop (long sessions)

When a session approaches 50% of the context window, refresh:

```
1. PICK       Select the next task from the plan
2. IMPLEMENT  Write the code
3. VALIDATE   Run tests, type check, lint
4. COMMIT     git commit the working state (per file-by-file discipline)
5. RESET      Spawn a new sub-agent or new session for the next task
```

The reset prevents context degradation: the quality drop that occurs when early instructions get compressed during auto-compaction. Committing before the reset ensures no work is lost.

---

## Anti-Patterns

| Anti-Pattern | Impact | Fix |
|---|---|---|
| Pasting full `CLAUDE.md` into every sub-agent prompt | Wastes ~30 KB per agent | Reference by path; prompt-writer selects relevant slices |
| Deep investigation before any code | Consumes 40%+ of context on research | Time-box research, then implement |
| Not committing between features | Cannot reset context without losing work | Commit after each logical unit (per `git-workflow.md`) |
| Universal rules over 300 lines each | Permanent cost every session | Path-scope or split into focused topic files |
| Repeating context in conversation | Redundant token usage | Reference files by path; do not paste content |
| Skipping HTML block comments in `CLAUDE.md` | Maintainer notes consume context | Use `<!-- ... -->`; Anthropic strips these before injection |

---

## Metrics to Watch

| Metric | Target |
|---|---|
| Root `CLAUDE.md` line count | Under 600 |
| Universal rules combined size | Under 30 KB |
| Path-scoped rules as share of total rules | At least 50% |
| Sub-agent prompt size | Under 2 KB per agent |
| Session quality | Maintain past 50 messages without degradation |

---

## Related rules

- `.claude/rules/work-records.md` (append-only journals reduce in-conversation context)
- `.claude/rules/git-workflow.md` (file-by-file commits enable Ralph Loop resets)
- `.claude/rules/deterministic-review.md` (evidence-based review reduces context spent on hallucinations)
