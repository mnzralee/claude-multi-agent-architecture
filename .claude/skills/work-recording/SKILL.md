---
name: work-recording
description: Transform development sessions into compelling engineering stories that capture not just what happened, but why it mattered and what was learned. Covers journal discipline, session templates (planning, bug hunt, feature build, multi-agent orchestration), and the mandatory end-of-day deliverable summary.
---

# Work Recording Skill

Transform development sessions into compelling engineering stories that capture not just what happened, but why it mattered and what was learned.

---

## Location: write to YOUR OWN journal

Each developer has their own append-only journal directory. Write to the authoring developer's namespace, never to another developer's.

```
you write to: docs/workrecords/work-record-YYYY-MM-DD.md
```

[CUSTOMIZE: adjust the path to match your project's docs layout. A common convention is `docs/<your-name>/workrecords/work-record-YYYY-MM-DD.md` for multi-developer projects.]

The path is determined by WHO is writing, not by which feature, service, or repo the work touched. The storytelling voice below requires first-person "I"; two developers cannot share an "I", so they cannot share a journal file. Cross-developer coordination lives at the spec, roadmap, and ADR layer, not by mingling daily journals.

See `.claude/rules/work-records.md` for the full per-developer-path rule, if your project uses one.

---

## Philosophy: The Engineering Story

**Work records are not logs. They are stories.**

Every session is a journey with:
- A **beginning** (context, challenge)
- A **middle** (investigation, discovery, implementation)
- An **end** (resolution, lessons learned)

The best work records read like a senior engineer explaining their day to a colleague over coffee: technical, insightful, and memorable.

---

## The Journal Principle: Write It Like Lecture Notes

Work records serve a dual purpose: they are both a professional engineering journal and lecture notes for the developer's future self. When writing, imagine revisiting this record months later to understand what happened, why, and what was learned.

### What to Capture

**Brainstorming and critical-thinking moments.** When multiple approaches are considered, document the reasoning chain: what options surfaced, what tradeoffs were weighed, and why one path was chosen over others. The rejected alternatives matter as much as the chosen one because they encode the constraints that shaped the decision.

**Decision-making rationale.** Every major decision should have its reasoning chain written out. Not "we chose X" but "we chose X because Y constraint and Z evidence, after ruling out A (too slow) and B (security risk)." A future reader should be able to reconstruct the logic without guessing.

**"What surprised us" moments.** Unexpected discoveries, architectural revelations, bugs that taught something about the system. These are often the most valuable parts of a work record because they reveal things that are not obvious from reading the code alone.

**Alternatives considered and rejected.** This is the context that evaporates fastest. Six months later, no one remembers why the team did not use the simpler approach unless it was written down.

### When to Write

**Continuously during the session, not just at end of day.** After each major milestone, decision, or discovery, append to the work record immediately. Context decays with every passing hour. The richest narrative comes from writing while the reasoning is still fresh.

**Mid-iteration sibling records are mandatory, not batched at iteration or session close.** In an orchestrated multi-agent loop, append a sibling work-record at each major milestone WITHIN the iteration, before the context is cleared. Batching at iteration close defeats the purpose: the `/clear` that ends an iteration discards the in-context narrative, so a single end-of-iteration dump flattens several distinct decisions into one lossy paragraph and silently drops the reasoning chain each milestone produced. Dispatch the work-recorder sibling (or append directly) on each trigger below, in-iteration, not at the boundary.

Practical triggers for mid-session updates (each one fires a sibling append, in-iteration):
- A research phase completes and changes your understanding
- A design decision is made after weighing alternatives
- An unexpected bug or constraint is discovered
- An agent or track completes a major work package
- The user provides feedback that shifts approach

### Voice and Style

Write in first-person singular ("I") as if the developer is writing their own journal. Use prose paragraphs for reasoning and context. Use tables and lists for structured data (commits, file counts, status). The narrative should flow like a story with clear cause-and-effect chains, not like a changelog. Never use "we" or third-person. The developer is the author.

---

## Session Types and Templates

### Type 1: The Planning Session

For sessions focused on architecture, design, and strategic planning.

```markdown
## Session N: [Theme] - The Architecture Session

**Developer:** [your name or handle]
**Focus Area:** [What's being planned]
**Model:** Claude [model]

---

### The Context: From [Current State] to [Target State]

[Opening narrative that sets up why this planning matters]

Session [N-1] ended with [previous milestone]. But [working/complete] and [goal] are
two very different states. The question wasn't "[basic question]" but "[deeper question]?"

This session represents [what kind of shift/transition].

---

### The Planning Philosophy: [Key Concept]

Before diving into [details], we invested significant effort in [approach]:
[explanation of why this approach matters].

**Why This Matters:**

[2-3 bullet points explaining the importance]

---

### The Architecture: [Pattern/Approach Name]

[Visual diagram using ASCII art]

```
                    ┌─────────────────────────┐
                    │     MAIN COMPONENT      │
                    └───────────┬─────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│  SUB-COMP A   │     │  SUB-COMP B   │     │  SUB-COMP C   │
└───────────────┘     └───────────────┘     └───────────────┘
```

**Key Design Decisions:**
1. [Decision 1 with rationale]
2. [Decision 2 with rationale]

---

### Critical Issues Identified

#### Issue 1: [Title] (SEVERITY)

**The Problem:**
[Narrative explaining the issue]

**Why This Is Critical:**
[Impact and consequences]

**The Solution:**
[Proposed approach]

---

### The Execution Plan: [N] Phases

| Phase | Focus | Parallel? |
|-------|-------|-----------|
| 1 | [Focus] | Yes/No |
| 2 | [Focus] | Yes/No |

**Work Package Breakdown:**
[Detailed breakdown of work items]

---

### Session Summary

| Artifact | Status | Description |
|----------|--------|-------------|
| [Artifact 1] | ✅ Complete | [Brief description] |
| [Artifact 2] | ✅ Complete | [Brief description] |

---

### Lessons Learned: The Value of Planning

[Reflection on what this session taught us]

**Key Insight:** [The one sentence takeaway]

---

### Next Steps

[What comes next, with clear action items]
```

---

### Type 2: The Bug Hunt Session

For debugging sessions: tell the detective story.

```markdown
## Session N: [Bug Title] - The Investigation

**Developer:** [your name or handle]
**Focus Area:** [Service/Component]
**Severity:** CRITICAL / HIGH / MEDIUM / LOW
**Model:** Claude [model]

---

### The Symptom

[Narrative description of what users experienced]

When [action], instead of [expected], the system [actual behavior].

---

### The Investigation Begins

**Initial Hypothesis:**
Our first guess was [hypothesis]. This seemed likely because [reasoning].

**What We Checked First:**
1. [First place looked] - [What we found]
2. [Second place looked] - [What we found]
3. [Third place looked] - [What we found]

**Dead End #1:**
We initially thought [wrong assumption]. After [investigation], we realized this
wasn't the issue because [evidence].

---

### The Discovery: "Aha!" Moment

After tracing through [code path], we found it.

**Root Cause:**
[Technical explanation with code references]

**The Code Path:**
```
UserAction → ServiceA.method() → HelperB.function() → 💥 BUG HERE
```

**Why This Existed:**
This bug was introduced because [historical context]. When [previous change] was
made, it created [side effect] that wasn't apparent until [trigger condition].

---

### The Fix

**What We Changed:**

Before:
```typescript
// The problematic code
[old implementation]
```

After:
```typescript
// The fixed code
[new implementation]
```

**Why This Fix Works:**
[Explanation of why this resolves the root cause]

**Alternatives Considered:**
- [Alternative 1] - Rejected because [reason]
- [Alternative 2] - Rejected because [reason]

---

### Verification

**How We Confirmed the Fix:**

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| [Test 1] | [Expected] | [Actual] | ✅ |
| [Test 2] | [Expected] | [Actual] | ✅ |

**Regression Check:**
[What we checked to ensure we didn't break anything else]

---

### Session Summary

- **Bug:** [One-line description]
- **Root Cause:** [One-line explanation]
- **Fix:** [One-line description of fix]
- **Impact:** [Users/systems affected]
- **Status:** ✅ RESOLVED

---

### Lessons Learned

**Technical:**
- [What this taught us about the codebase]

**Process:**
- [What this taught us about debugging]

**Prevention:**
- [How we can prevent similar bugs]

**Key Takeaway:** [One sentence summary]
```

---

### Type 3: The Feature Build Session

For implementing new features: tell the construction story.

```markdown
## Session N: Building [Feature Name]

**Developer:** [your name or handle]
**Focus Area:** [Component/Service]
**Feature Type:** New Feature / Enhancement / Refactor
**Model:** Claude [model]

---

### The Vision

[What we're building and why it matters]

**User Story:**
As a [user type], I want to [action] so that [benefit].

**Business Value:**
[Why this feature matters to the project]

---

### The Design

**Approach:**
[High-level description of how we'll build this]

**Architecture:**
```
┌─────────────────────────────────────────────────────┐
│                    NEW FEATURE                       │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐           │
│  │ UI      │──▶│ Service │──▶│ Storage │           │
│  └─────────┘   └─────────┘   └─────────┘           │
└─────────────────────────────────────────────────────┘
```

**Key Decisions:**
| Decision | Rationale |
|----------|-----------|
| [Decision 1] | [Why] |
| [Decision 2] | [Why] |

---

### The Build

**Phase 1: [Foundation]**
[What we built first and why]

| File | Purpose |
|------|---------|
| [path] | [purpose] |

**Phase 2: [Core Logic]**
[What we built next]

| File | Purpose |
|------|---------|
| [path] | [purpose] |

**Phase 3: [Integration]**
[How we connected everything]

---

### Challenges and Solutions

**Challenge 1: [Title]**
- **Problem:** [What we hit]
- **Solution:** [How we solved it]
- **Time Lost:** [Estimate if significant]

---

### Verification

**Test Coverage:**
| Type | Count | Pass | Fail |
|------|-------|------|------|
| Unit | N | N | 0 |
| Integration | N | N | 0 |
| E2E | N | N | 0 |

**Manual Testing:**
- [x] [Scenario 1] - Verified
- [x] [Scenario 2] - Verified

---

### Session Summary

- **Built:** [Feature name]
- **Files Created/Modified:** N
- **Tests Added:** N
- **Status:** ✅ COMPLETE / ⚠️ IN PROGRESS

---

### What's Next

[If feature is incomplete, what remains]
```

---

### Type 4: The Multi-Agent Orchestration Session

For sessions involving coordinated agent work.

```markdown
## Session N: [Objective] - Multi-Agent Orchestration

**Developer:** [your name or handle]
**Focus Area:** [Complex task requiring multiple agents]
**Orchestration Pattern:** Hierarchical / Parallel / Sequential
**Model:** Claude [model]

---

### The Challenge

[Why this task required multi-agent orchestration]

**Scope:**
- [N] distinct work streams
- [N] specialized agents needed
- [N] files estimated to change

---

### The Strategy

**Agent Hierarchy:**
```
                    ┌───────────────────┐
                    │   ORCHESTRATOR    │
                    │   (Main Claude)   │
                    └─────────┬─────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ AGENT-A       │   │ AGENT-B       │   │ AGENT-C       │
│ [Specialty]   │   │ [Specialty]   │   │ [Specialty]   │
└───────────────┘   └───────────────┘   └───────────────┘
```

**Why This Configuration:**
[Rationale for agent selection and structure]

---

### Execution Log

**Batch 1: [Description]**

| Agent | Task | Status | Key Result |
|-------|------|--------|------------|
| [Agent] | [Task] | ✅ Complete | [Result] |

**Batch 2: [Description]**

| Agent | Task | Status | Key Result |
|-------|------|--------|------------|
| [Agent] | [Task] | ✅ Complete | [Result] |

---

### Coordination Challenges

**Challenge: [Title]**
- **Situation:** [What happened]
- **Resolution:** [How we adapted]
- **Learning:** [What we learned about multi-agent work]

---

### Results Aggregation

**Total Work Accomplished:**
- Files modified: N
- Lines changed: ~N
- Tests passing: N

**Agent Performance:**
| Agent | Tasks | Success Rate | Notes |
|-------|-------|--------------|-------|
| [Agent] | N | 100% | [Notes] |

---

### Session Summary

- **Objective:** [What we aimed to do]
- **Agents Used:** [List]
- **Parallel Efficiency:** [Assessment]
- **Status:** ✅ COMPLETE

---

### Lessons for Future Orchestration

[What we learned about coordinating multiple agents]
```

---

## Writing Quality Checklist

Before completing a session record, verify:

### Narrative Quality
- [ ] Context is set in opening paragraphs
- [ ] Reader understands WHY this work matters
- [ ] Journey is documented, not just destination
- [ ] "Aha!" moments are captured
- [ ] Dead ends and failed approaches are included
- [ ] Lessons learned are actionable

### Technical Quality
- [ ] File paths are complete and accurate
- [ ] Code snippets have context
- [ ] Diagrams clarify (not confuse)
- [ ] Decisions have rationale
- [ ] Verification steps are documented

### Searchability
- [ ] Session title is descriptive
- [ ] Consistent terminology used
- [ ] Status clearly indicated
- [ ] Key terms are prominent

---

## End-of-Day Deliverable Summary Table (MANDATORY)

Every work record MUST end with this table. It is the single source of truth for what was delivered. Calculate durations from git commit timestamps (first and last commit per deliverable). Mark review boards and planning phases with * since they have no dedicated commits.

**How to calculate:** Run `git log --format="%ai | %s" --since="YYYY-MM-DD"` to get commit timestamps. Group commits by deliverable. Duration = last commit time minus first commit time for that group. For items with no commits (review boards, planning), estimate from the gap between the previous and next deliverable's commits.

**Time zone:** [CUSTOMIZE: replace with your local time zone, e.g. UTC, EST, IST, etc.]

```markdown
---

## End-of-Day Deliverable Summary

**Wall clock: HH:MM - HH:MM [TZ] (Xh XXm)**

| # | Deliverable | Duration | Commits | Key Numbers |
|---|-------------|----------|---------|-------------|
| 1 | [Deliverable name] | Xh XXm | N | [Quantified output] |
| 2 | [Deliverable name] | Xh XXm | N | [Quantified output] |
| ... | ... | ... | ... | ... |
| | **TOTAL** | **Xh XXm** | **N** | **[Summary stats]** |

*Estimated from inter-commit gaps (no dedicated commits for review boards/planning).
```

**Rules for this table:**
- One row per distinct deliverable (not per commit)
- Duration is commit-span time, not estimated effort
- Key Numbers column must have quantified metrics (file counts, instance counts, agent counts)
- Review boards get their own row (they are significant work even without commits)
- Planning and architecture work gets its own row if it spans 30 or more minutes
- The TOTAL row sums commits and shows wall clock duration
- Never fabricate hours. If you cannot determine duration from commits, mark with *

---

## Daily Summary Template

At end of day, compile the deliverable summary table above, plus:

```markdown
### The Day in Brief

[1-2 paragraph narrative of what was accomplished]

---

### Challenges Overcome

| Challenge | Solution | Learning |
|-----------|----------|----------|
| [Challenge] | [Solution] | [Learning] |

---

### Tomorrow's Focus

1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

---

### Day's Key Insight

[The one thing worth remembering from today's work]
```

---

## Command Reference

### Starting a Session
```
"Start work recording for: [Session Title - Theme]"
```

### Logging Events
```
"Log discovery: [What we found and why it matters]"
"Log decision: [Choice made] because [rationale]"
"Log challenge: [What went wrong] and [how we resolved it]"
"Log insight: [Technical or process insight]"
```

### Ending a Session
```
"Complete session with summary: [Objective achieved/status]"
"Key lesson: [One sentence takeaway]"
```

### Daily Compilation
```
"Compile daily summary"
```

---

## Integration with Other Skills

| Skill | Integration |
|-------|-------------|
| `/commit` | Log commits with context |
| `/debug` | Capture investigation narrative |
| `/review` | Document review findings |
| `/multi-agent-orchestration` | Track agent coordination |

---

## Remember

**The goal is not to write documentation. The goal is to tell the story of engineering.**

A reader should finish a session record and:
1. Understand what problem we faced
2. Follow our journey to the solution
3. Learn something they can apply elsewhere
4. Know what happened and WHY
