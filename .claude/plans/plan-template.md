# Implementation Plan: [Feature/Module Name]

**Date**: YYYY-MM-DD
**Session**: N
**Status**: draft | review | approved | in-progress | complete
**Phase**: planning | implementation | verification
**Estimated Effort**: [hours/days]

---

## Context & Motivation

[Why this work is needed. What problem does it solve? What triggered it?]

## Scope

### In Scope
- [ ] Item 1
- [ ] Item 2

### Out of Scope
- Item that explicitly will NOT be done
- Deferred work (with reason)

---

## Architectural Decisions

| ID | Decision | Rationale | Alternatives Considered |
|----|----------|-----------|------------------------|
| D1 | [What was decided] | [Why] | [What else was considered] |
| D2 | | | |

---

## Implementation Tracks

### Track 1: [Name]
**Owner**: [agent or developer]
**Files to create/modify**:
- `path/to/file.ts`, [what changes]
- `path/to/other.ts`, [what changes]

**Dependencies**: None | Track 2 must complete first
**Estimated complexity**: Low | Medium | High

### Track 2: [Name]
**Owner**: [agent or developer]
**Files to create/modify**:
- `path/to/file.ts`, [what changes]

**Dependencies**: Track 1 (needs API contract)
**Estimated complexity**: Low | Medium | High

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| [What could go wrong] | Low/Med/High | Low/Med/High | [How to prevent/handle] |

---

## Success Criteria

- [ ] Criterion 1 (measurable)
- [ ] Criterion 2 (measurable)
- [ ] All tests pass
- [ ] No type errors (`tsc --noEmit`)
- [ ] Health endpoints return 200

---

## Rollback Plan

**Point of no return**: [What step, if any, cannot be undone]
**Rollback steps**:
1. [Step to undo]
2. [Step to undo]

---

## Q&A / Open Questions

| # | Question | Answer | Status |
|---|----------|--------|--------|
| 1 | [Question] | [Answer or TBD] | Open/Resolved |

---

## Progress Log

| Date | Update |
|------|--------|
| YYYY-MM-DD | Plan created |
