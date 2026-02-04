---
name: verification-before-completion
description: Comprehensive validation checklist before declaring any task complete
---

# Verification Before Completion Skill

Never mark a task as complete without thorough verification.

## When to Use This Skill

Use this skill:
- Before marking any work package as COMPLETE
- Before committing code changes
- Before reporting success to supervisor/orchestrator
- Before moving to the next task

## The Verification Protocol

### Level 1: Compilation Verification

```bash
# TypeScript/JavaScript
npx tsc --noEmit

# Or your build command
npm run build
```

**Pass Criteria:**
- [ ] Zero compilation errors
- [ ] Build completes successfully

### Level 2: Static Analysis

```bash
# Linting
npm run lint

# Type checking
npm run type-check
```

**Pass Criteria:**
- [ ] No new linting errors introduced
- [ ] Type coverage maintained

### Level 3: Unit Tests

```bash
# Run unit tests for affected files
npm test -- --testPathPattern="[affected_file]"

# Run full test suite
npm test
```

**Pass Criteria:**
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] No test regressions

### Level 4: Integration Verification

```bash
# Start application
npm run start

# Health check
curl http://localhost:3000/health
```

**Pass Criteria:**
- [ ] Application starts without errors
- [ ] Health check returns 200 OK
- [ ] No runtime errors in logs

### Level 5: Functional Verification

For specific changes, verify the actual functionality:

```markdown
## Functional Test Checklist

### Change: [description of change]

- [ ] Primary functionality works
- [ ] Edge cases handled
- [ ] Error scenarios handled
- [ ] Related functionality not broken
```

## Verification Matrix

| Change Type | L1 | L2 | L3 | L4 | L5 |
|-------------|----|----|----|----|-----|
| Schema change | Yes | Yes | Yes | Yes | Yes |
| Service code | Yes | Yes | Yes | Yes | Yes |
| Utility function | Yes | Yes | Yes | - | - |
| Type definition | Yes | Yes | - | - | - |
| Comment/docs | Yes | - | - | - | - |

## Pre-Commit Checklist

Before committing:

```markdown
## Pre-Commit Verification

### Code Quality
- [ ] No TODO/FIXME added without ticket
- [ ] No console.log in production code
- [ ] No hardcoded secrets
- [ ] No commented-out code blocks

### TypeScript
- [ ] Build passes
- [ ] No `any` types introduced
- [ ] All new functions have return types

### Tests
- [ ] Unit tests pass
- [ ] New tests for new code
- [ ] No test files skipped

### Documentation
- [ ] Work record updated
- [ ] API changes documented
- [ ] Breaking changes noted
```

## Verification Report Format

When reporting to supervisor:

```json
{
  "workPackage": "WP-XX",
  "status": "VERIFIED" | "FAILED",
  "levels": {
    "L1_compilation": "PASS",
    "L2_static": "PASS",
    "L3_unit": "PASS",
    "L4_integration": "PASS",
    "L5_functional": "PASS"
  },
  "issues": [],
  "filesModified": ["path/to/file.ts"],
  "testsRun": 15,
  "testsPassed": 15
}
```

## Failure Handling

If any verification level fails:

```markdown
## Verification Failure Report

### Level Failed: L3 - Unit Tests

### Error Details
```
[test output]
```

### Analysis
[What caused the failure]

### Next Steps
- [ ] Fix the issue
- [ ] Re-run verification from L1
- [ ] Do not proceed until all levels pass
```

## Quick Verification Commands

```bash
# Full verification suite (if configured)
npm run verify

# Or manually:
npm run build && \
npm run lint && \
npm test
```

## Anti-Patterns

### DON'T:
- Skip verification "because the change is small"
- Ignore failing tests
- Suppress linting errors
- Mark as complete before verification
- Assume it works without testing

### DO:
- Run full verification for every change
- Fix failures before proceeding
- Document verification results
- Update tests when behavior changes
- Report honest status

## Integration with Other Skills

| Skill | When to Use |
|-------|-------------|
| `/commit` | After verification passes |
| `/debug` | When verification fails |
| `/review` | After verification, before merge |
