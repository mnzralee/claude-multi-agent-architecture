---
name: verification
description: Structured multi-phase verification of implementations before deployment, covering static analysis, testing, functional checks, security, and documentation
---

# Verification Skill

## Skill Metadata
- **Name**: verification
- **Description**: Structured multi-phase verification of implementations before deployment
- **User Invocable**: Yes (via `/verify`)

---

## Overview

This skill provides a structured approach to verifying that implementations are complete, correct, and ready for deployment. It ensures no step is missed before considering work done. The discipline is stack-agnostic; the examples below use TypeScript / Node.js as a concrete illustration, but the same phases apply to any language or runtime.

---

## Verification Checklist

### 1. Code Quality

#### Type Checking (TypeScript example)
```bash
# Backend service
npx tsc --noEmit -p apps/<service>/tsconfig.json

# Frontend app
cd apps/<frontend> && npx tsc --noEmit
```

For other typed languages, substitute the equivalent compiler invocation (e.g., `go build ./...` for Go, `mypy .` for Python with mypy, `cargo check` for Rust).

#### Linting
```bash
# Run lint across the workspace
npm run lint

# Or service-by-service
npm run lint --workspace=apps/<service>
```

### 2. Tests

#### Unit Tests
```bash
# Run all unit tests
npm test

# Check coverage
npm test -- --coverage
```

#### Integration Tests
```bash
# Run integration / end-to-end tests
npm run test:e2e
```

### 3. Functionality

#### Endpoint Verification
```bash
# Health check
curl http://localhost:<port>/health

# Test a specific endpoint
curl -X POST http://localhost:<port>/api/v1/<resource> \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"field": "value"}'
```

#### Database Verification
```bash
# Check pending migrations (adjust for your ORM / migration tool)
# Example using a generic migration CLI:
npx your-orm migrate status

# Verify the schema matches expectations
npx your-orm db pull --print
```

### 4. Security

#### Authentication Check
- [ ] Endpoints require authentication where appropriate
- [ ] Token validation works correctly
- [ ] Unauthorized requests return 401

#### Authorization Check
- [ ] Role-based or attribute-based access control is enforced
- [ ] Users cannot access other users' data
- [ ] Admin or privileged endpoints are properly restricted

### 5. Documentation

#### Code Documentation
- [ ] Complex functions have explanatory comments
- [ ] Public APIs are documented (inline or via a spec file)
- [ ] README updated if the change affects setup or usage

#### Work Records
- [ ] Work record updated in `docs/workrecords/`
- [ ] Implementation status updated
- [ ] Known issues documented

---

## Verification Workflow

### Phase 1: Static Analysis

```markdown
1. Run the type checker
   - Fix all type errors
   - Avoid untyped / any-typed values unless genuinely unavoidable

2. Run the linter
   - Fix all errors
   - Address warnings unless they are intentionally suppressed with a comment

3. Check for security issues
   - No hardcoded secrets or credentials
   - No exposed API keys or connection strings
```

### Phase 2: Test Execution

```markdown
1. Run unit tests
   - All tests pass
   - Coverage meets the project-defined threshold

2. Run integration tests
   - API-level tests pass
   - Database operations behave correctly

3. Manual testing
   - Critical user flows verified
   - Edge cases and error paths exercised
```

### Phase 3: Functional Verification

```markdown
1. Endpoint testing
   - All new or modified endpoints respond correctly
   - Response shapes match the documented contract
   - Error handling returns appropriate status codes and messages

2. UI verification (if applicable)
   - Components render without errors
   - Forms submit successfully and display validation feedback
   - Error states and empty states display correctly
```

### Phase 4: Documentation Review

```markdown
1. Code documentation
   - Non-obvious functions have clear comments
   - Complex logic has an explanation of the "why"

2. API documentation
   - New endpoints are documented with examples
   - Breaking changes are called out explicitly

3. Work records
   - The session or task is recorded
   - Status is updated to reflect current state
```

---

## Verification Report Template

```markdown
## Verification Report

**Feature / Fix**: [Name]
**Date**: [YYYY-MM-DD]
**Verifier**: [Agent / Developer]

### Summary
[Brief description of what was verified]

### Static Analysis
| Check | Status | Notes |
|-------|--------|-------|
| Type checker | Pass | No errors |
| Linting | Pass | 0 warnings |
| Security scan | Pass | No issues |

### Tests
| Suite | Pass | Fail | Coverage |
|-------|------|------|----------|
| Unit | 45 | 0 | 92% |
| Integration | 12 | 0 | N/A |

### Functional Verification
| Feature | Status | Notes |
|---------|--------|-------|
| [Feature 1] | Works | Tested with [scenario] |
| [Feature 2] | Works | Edge case verified |

### Documentation
| Doc | Status |
|-----|--------|
| Work record | Updated |
| API docs | Updated |
| README | N/A |

### Issues Found
[None / list any issues]

### Recommendation
- [x] Ready for deployment
- [ ] Needs fixes (list issues)
- [ ] Needs review (specify)
```

---

## Agents Involved

| Phase | Agent | Action |
|-------|-------|--------|
| 1 | tester | Run static analysis |
| 2 | tester | Execute tests |
| 3 | debugger | Functional testing |
| 4 | reviewer | Documentation review |
| N/A | security | Security verification |

---

## Invocation

### Manual
```
/verify [feature-name]
```

### Example
```
/verify user-registration
```

### Auto-invocation
Triggered automatically after implementation agents complete work, as part of the standard agent handoff protocol.

---

## Common Verification Failures

### Type Errors
```
Problem: Type errors during compilation
Solution: Fix type definitions; avoid untyped values
```

### Test Failures
```
Problem: Tests fail after changes
Solution: Update tests to reflect new behaviour, or fix the implementation
```

### Missing Documentation
```
Problem: Work record not updated
Solution: Update docs/workrecords/work-record-YYYY-MM-DD.md
```

### Missing Auth Guard
```
Problem: An endpoint is missing an authentication guard
Solution: Add the appropriate auth middleware or guard decorator for your framework
         (e.g., @UseGuards(JwtAuthGuard) in NestJS, auth middleware in Express)
```

---

## Pre-Deployment Checklist

```markdown
Before promoting to a higher environment (staging, production, etc.):

- [ ] All type checks pass without errors
- [ ] All linting passes
- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] Manual testing completed
- [ ] Security review passed
- [ ] Work record updated
- [ ] Implementation status updated
- [ ] No leftover TODO comments (or they are tracked in the issue tracker)
- [ ] No debug console.log / print statements committed
- [ ] Environment variables documented in .env.example or equivalent
- [ ] Migration scripts tested against a fresh schema
```
