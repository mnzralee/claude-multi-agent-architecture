---
name: work-recording
description: Session work documentation with narrative storytelling for comprehensive engineering records
---

# Work Recording Skill

Transform development sessions into compelling engineering stories.

---

## Philosophy: The Engineering Story

**Work records are not logs. They are stories.**

Every session is a journey with:
- A **beginning** (context, challenge)
- A **middle** (investigation, discovery, implementation)
- An **end** (resolution, lessons learned)

The best work records read like a senior engineer explaining their day to a colleague.

---

## Session Types & Templates

### Type 1: The Bug Hunt Session

For debugging sessions - tell the detective story.

```markdown
## Session N: [Bug Title] - The Investigation

**Developer:** [name]
**Focus Area:** [Service/Component]
**Severity:** CRITICAL / HIGH / MEDIUM / LOW

---

### The Symptom

When [action], instead of [expected], the system [actual behavior].

---

### The Investigation Begins

**Initial Hypothesis:**
Our first guess was [hypothesis].

**What We Checked:**
1. [First place looked] - [What we found]
2. [Second place looked] - [What we found]

**Dead End:**
We initially thought [wrong assumption]. After [investigation], we realized this
wasn't the issue because [evidence].

---

### The Discovery: "Aha!" Moment

**Root Cause:**
[Technical explanation with code references]

**Why This Existed:**
This bug was introduced because [historical context].

---

### The Fix

**Before:**
```[language]
// The problematic code
```

**After:**
```[language]
// The fixed code
```

---

### Verification

| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| [Test 1] | [Expected] | [Actual] | PASS |

---

### Lessons Learned

**Key Takeaway:** [One sentence summary]
```

---

### Type 2: The Feature Build Session

For implementing new features.

```markdown
## Session N: Building [Feature Name]

**Developer:** [name]
**Focus Area:** [Component/Service]
**Feature Type:** New Feature / Enhancement / Refactor

---

### The Vision

**User Story:**
As a [user type], I want to [action] so that [benefit].

---

### The Design

**Approach:**
[High-level description]

**Key Decisions:**
| Decision | Rationale |
|----------|-----------|
| [Decision 1] | [Why] |

---

### The Build

**Phase 1: [Foundation]**

| File | Purpose |
|------|---------|
| [path] | [purpose] |

**Phase 2: [Core Logic]**

| File | Purpose |
|------|---------|
| [path] | [purpose] |

---

### Challenges & Solutions

**Challenge 1: [Title]**
- **Problem:** [What we hit]
- **Solution:** [How we solved it]

---

### Verification

- [x] [Scenario 1] - Verified
- [x] [Scenario 2] - Verified

---

### Session Summary

- **Built:** [Feature name]
- **Files Created/Modified:** N
- **Status:** COMPLETE / IN PROGRESS
```

---

### Type 3: The Planning Session

For architecture and design work.

```markdown
## Session N: [Theme] - The Architecture Session

**Developer:** [name]
**Focus Area:** [What's being planned]

---

### The Context

[Opening narrative that sets up why this planning matters]

---

### The Architecture

```
┌─────────────────────────┐
│     MAIN COMPONENT      │
└───────────┬─────────────┘
            │
    ┌───────┼───────┐
    ▼       ▼       ▼
┌───────┐ ┌───────┐ ┌───────┐
│ SUB-A │ │ SUB-B │ │ SUB-C │
└───────┘ └───────┘ └───────┘
```

**Key Design Decisions:**
1. [Decision 1 with rationale]
2. [Decision 2 with rationale]

---

### The Execution Plan

| Phase | Focus | Dependencies |
|-------|-------|--------------|
| 1 | [Focus] | None |
| 2 | [Focus] | Phase 1 |

---

### Session Summary

| Artifact | Status | Description |
|----------|--------|-------------|
| [Artifact 1] | Complete | [Brief description] |
```

---

## Writing Guidelines

### Tone & Voice
- **Professional but accessible**
- **First person plural** - "We discovered..."
- **Active voice** - "We fixed the bug" not "The bug was fixed"

### Narrative Techniques
- **Start with the "why"**
- **Include "aha!" moments**
- **Acknowledge dead ends**
- **End with reflection**

### DO:
- Write as if explaining to a colleague
- Include the journey, not just the destination
- Capture the reasoning behind decisions
- Make it searchable with consistent terminology

### DON'T:
- Write dry, log-style entries
- Skip the "why"
- Omit failed approaches
- Include sensitive credentials

---

## Daily Summary Template

```markdown
## Daily Summary: [Date]

### The Day in Brief

[1-2 paragraph narrative]

---

### Sessions Completed

| Session | Focus | Outcome |
|---------|-------|---------|
| [N]: [Title] | [Focus] | COMPLETE |

---

### Key Achievements

- [Achievement with context]

---

### Challenges Overcome

| Challenge | Solution |
|-----------|----------|
| [Challenge] | [Solution] |

---

### Tomorrow's Focus

1. [Priority 1]
2. [Priority 2]

---

### Day's Key Insight

[The one thing worth remembering]
```

---

## Command Reference

### Starting a Session
```
"Start work recording for: [Session Title]"
```

### Logging Events
```
"Log discovery: [What we found and why it matters]"
"Log decision: [Choice made] because [rationale]"
"Log challenge: [What went wrong] and [how we resolved it]"
```

### Ending a Session
```
"Complete session with summary: [Objective achieved/status]"
"Key lesson: [One sentence takeaway]"
```

---

## Remember

**The goal is not to write documentation. The goal is to tell the story of engineering.**

A reader should finish a session record and:
1. Understand what problem we faced
2. Follow our journey to the solution
3. Learn something they can apply elsewhere
4. Know what happened and WHY
