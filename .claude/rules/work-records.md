# Work Record Standards

## Location: per-developer journals

Each developer maintains their own append-only journal under their own namespace.

```
developer-alice writes to: docs/workrecords/alice/work-record-YYYY-MM-DD.md
developer-bob writes to:   docs/workrecords/bob/work-record-YYYY-MM-DD.md
NEVER:                      /root/, a shared docs/ root, or another developer's folder
```

**Rule**: a work record's location is determined by its author, not by the feature, repo, or service the work touched. The storytelling convention below requires first-person singular ("I"); two developers cannot share an "I", so they cannot share a journal file.

**Cross-developer coordination** happens at the architecture-decision-record (ADR) / plan layer, not by mingling daily journals. When two developers both make progress on the same calendar day, each writes their own work into their own dated file. Cross-references in prose are encouraged ("the other developer's stream also advanced today; see their journal at `docs/workrecords/<username>/work-record-YYYY-MM-DD.md`"), but the narrative voice never crosses files.

**Append protection**: agents must never append new content to another developer's journal file, even when the work being recorded touches shared code. If a session is running under one developer's context and the work being captured belongs to that developer, it goes to that developer's file and nowhere else.

## Author identification

This rule depends on knowing which developer is the author of any given session. The orchestrator must therefore declare the authoring developer explicitly:

- At session start, the orchestrator's session context declares `author: <username>`.
- Every work-recorder dispatch prompt must include an `author: <username>` field. The work-recorder agent is required to return `pause_for_human` if the dispatch prompt omits it.
- Cross-references to another developer's journal are encouraged in prose, but never substitute for explicit author declaration in agent dispatch.

If you are starting a session and the author identity is ambiguous, ask the user before writing anything to a work record. Never guess.

---

## Cross-developer collaboration

The per-developer rule applies cleanly to four common collaboration scenarios:

| Scenario | Where the narrative goes |
|---|---|
| Session continues work the other developer started | Author's own journal (today's date). Optional retrospective cross-link in the originator's journal. |
| Other developer contributes prose mid-session | Each writes their own first-person perspective in their own journal, cross-linking. |
| Agent runs autonomously under one developer's session executing work the other developer assigned | The orchestrating developer's journal (the session running the agent). Reference the assigner in prose. |
| Pair-programming with both developers contributing reasoning | Each developer writes their own perspective in their own journal. Treat as one event with two narratives. |

The unifying principle: the "I" in a journal entry is the journal owner. Other developers appear in third person, by name, with cross-references to their journals. Never edit another developer's journal even during close collaboration.

---

## CRITICAL: Never Overwrite, Always Append

Work records are append-only logs. Once a section is written, it is never edited to remove or rewrite history.

**Exception**: if a session's work record was left incomplete due to context limits, missing sections may be added in the next session with a note: "Added in next session, context limit prevented completion."

---

## Stream-based organization

A project with multiple parallel workstreams (feature streams, infrastructure streams, release-readiness streams, etc.) benefits from labeling each day's work by the stream it belongs to. Streams organize parallel work so a single developer running two parallel streams in one day stays internally consistent.

**Identity convention**:

- The session's primary identity is a **stream-day label** drawn from the active session map in `.claude/plans/` or the stream roadmap. Pick a label that is short and unambiguous: for example `feat-auth-D3`, `infra-D7`, or `release-rc1-D2`.
- Within one developer's dated work record, if that developer is running two streams in parallel, split them as top-level sections: `# Stream 1: <name>`, `# Stream 2: <name>`. Each stream's sub-sections nest under that heading.
- Single-stream days do not need the split; the file is implicitly that stream.
- Cross-developer streams do not share a file. Each developer writes their own streams into their own dated journal.

**Cross-stream isolation rule**: when one developer's dated file carries two parallel streams, each stream's sub-sections must reference only that stream's work. Never edit another stream's sub-sections even if the work touches overlapping code. The per-developer-path rule combined with cross-stream isolation together preserve traceability when multiple contributors append in parallel.

---

## Narrative Format

Work records use **storytelling narrative**, not dry bullet lists.

Every section should answer:
1. **Why** a decision was made (not just what)
2. **What alternatives** were considered and rejected
3. **What surprised us**: unexpected bugs, architectural revelations
4. **What patterns emerged**: recurring issues that became systemic fixes

Voice: first-person singular ("I") as if the developer is writing their own journal. Prose paragraphs for reasoning and context, tables and lists for structured data (commits, file counts, status). Never "we" or third-person.

---

## Structure

```markdown
# Work Record - YYYY-MM-DD

**Developer**: <Full Name> (`<username>`)
**Branch**: `<branch-name>` (across all relevant packages; or call out specifics)
**Active stream(s)**: <stream name and day label, e.g., feat-auth-D3>

---

## <Stream-day label> - <Descriptive Theme>

[Opening narrative: context, motivation, what the day's shape is dictated by]

---

### Sibling A - <focus or milestone name>

[Storytelling prose explaining WHY, what alternatives, what surprised, what pattern emerged]

[Code snippets where they illuminate]

---

### Sibling B - <next focus>

[...]

---

### Commits

| # | Repo / Package | Hash | Message |
|---|----------------|------|---------|

---

### Carry-Forward Items

| # | Item | Priority | Details |
|---|------|----------|---------|

---

### End-of-Day Deliverable Summary

(See work-recording skill for the mandatory table format)
```

When one developer's dated file carries multiple parallel streams (same author, two streams in one day), prefix each stream with a top-level `# Stream N: <name>` heading and place its `## <Stream-day label>` plus siblings beneath. The `### Sibling N (Stream M):` qualifier is also acceptable for sub-sections under a stream. Cross-developer streams use separate files, not shared `# Stream N` headings.

---

## Required Elements

1. **Header** with date (filename), developer, branch, active stream(s)
2. **Stream-day label** in the primary section heading
3. **Decision rationale** for architectural choices
4. **Complete commit log** organized by repository or package
5. **End-of-day deliverable summary table** (per work-recording skill)
6. **Carry-forward items** for next session
7. **Environment state** at session end (running services, known issues, any outstanding blockers)

---

## Continuous mid-session updates

Append after every major milestone, decision, or discovery. Context decays with every passing hour. The richest narrative comes from writing while the reasoning is still fresh. Never batch storytelling at end of day.

Practical triggers for mid-session updates:

- A research phase completes and changes your understanding
- A design decision is made after weighing alternatives
- An unexpected bug or constraint is discovered
- An agent or track completes a major work package
- The user provides feedback that shifts approach

---

## Sibling counter

Siblings within a stream count from A (or from 1) and increment monotonically within that stream on that date. Reset per stream per date. No global sibling counter.

---

## Related rules

- `git-workflow` (commit discipline that keeps the work record's commit log accurate)
- `ai-agent-engineering` (agent dispatch patterns; the `author:` field requirement originates there)
- `depth-first-impact-analysis` (the investigation pattern that generates the most narrative-worthy content for work records)
- `context-budget` (why mid-session appending is mandatory: context limits make end-of-day batching lossy)
