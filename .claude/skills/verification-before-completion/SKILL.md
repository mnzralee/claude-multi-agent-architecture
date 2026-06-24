---
name: verification-before-completion
description: Comprehensive five-level validation checklist that every agent must pass before declaring any task or work package complete.
---

# Verification Before Completion Skill

Never mark a task as complete without thorough verification. This skill ensures quality gates are passed before any agent reports success upward. The commands below assume a TypeScript/Node monorepo with Vitest or Jest; the discipline is stack-agnostic and every level maps cleanly onto any compiled language or test runner.

## When to Use This Skill

Use this skill:
- Before marking any work package as COMPLETE
- Before committing code changes
- Before reporting success to a supervisor or orchestrator agent
- Before moving to the next task

## The Verification Protocol

### Level 1: Compilation Verification

```bash
# TypeScript compilation
npx tsc --noEmit

# Schema tool generation (if the data model changed)
# [CUSTOMIZE: replace with your ORM or codegen command, e.g. prisma generate, drizzle-kit generate, graphql-codegen]
<your-schema-tool> generate

# Service-specific build
npm run build --workspace=apps/<service-name>
```

**Pass Criteria:**
- [ ] Zero TypeScript errors (or zero compiler errors in your language)
- [ ] Zero schema-generation errors
- [ ] Build completes successfully

### Level 2: Static Analysis

```bash
# Linting
npm run lint

# Type coverage (if configured)
npm run type-coverage
```

**Pass Criteria:**
- [ ] No new linting errors introduced
- [ ] Type coverage maintained or improved

### Level 3: Unit Tests

```bash
# Run unit tests for affected files
npm test -- --testPathPattern="<affected_file>"

# Run full service tests
npm test -- --projects=<service-name>
```

**Pass Criteria:**
- [ ] All existing tests pass
- [ ] New tests added for new functionality
- [ ] No test regressions

### Level 4: Integration Verification

```bash
# Start service locally
npm run start:dev --workspace=apps/<service-name>

# Health check
curl http://localhost:<PORT>/health
```

**Pass Criteria:**
- [ ] Service starts without errors
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
| Schema change | ✓ | ✓ | ✓ | ✓ | ✓ |
| Service code | ✓ | ✓ | ✓ | ✓ | ✓ |
| Utility function | ✓ | ✓ | ✓ | - | - |
| Type definition | ✓ | ✓ | - | - | - |
| Comment/docs | ✓ | - | - | - | - |

## Pre-Commit Checklist

Before running `/commit`:

```markdown
## Pre-Commit Verification

### Code Quality
- [ ] No TODO/FIXME added without a tracked ticket
- [ ] No console.log in production code
- [ ] No hardcoded secrets
- [ ] No commented-out code blocks

### TypeScript
- [ ] `npx tsc --noEmit` passes
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

When reporting to a supervisor agent:

```json
{
  "workPackage": "WP-XX",
  "status": "VERIFIED | FAILED",
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
  "testsPassed": 15,
  "coverageChange": "+2%"
}
```

## Failure Handling

If any verification level fails:

```markdown
## Verification Failure Report

### Level Failed: L3 - Unit Tests

### Error Details
[test output]

### Analysis
[What caused the failure]

### Next Steps
- [ ] Fix the issue
- [ ] Re-run verification from L1
- [ ] Do not proceed until all levels pass
```

## Integration with Multi-Agent System

The tester agent uses this skill for every work package:

```
supervisor -> tester: "Verify WP-03 completion"

tester -> [runs all verification levels]

tester -> supervisor: {
  "workPackage": "WP-03",
  "status": "VERIFIED",
  "levels": { ... },
  "recommendation": "PROCEED | FIX_REQUIRED"
}
```

## Quick Verification Commands

```bash
# Full verification suite (if a verify script is configured)
npm run verify

# Or manually:
# [CUSTOMIZE: replace the schema-tool line with your own codegen command]
<your-schema-tool> generate && \
npx tsc --noEmit && \
npm run lint && \
npm test

# For a specific service:
cd apps/<service-name> && \
npx tsc --noEmit && \
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
