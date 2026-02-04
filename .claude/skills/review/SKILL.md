---
name: review
description: Code Review Skill for reviewing code following quality standards
---

# Code Review Skill

Review code following quality and security standards.

---

## Review Process

1. **Understand the change** - Read the PR description and commits
2. **Check for issues** - Security, bugs, performance, maintainability
3. **Verify patterns** - Ensure code follows project conventions
4. **Test coverage** - Check if tests cover the changes
5. **Provide feedback** - Clear, actionable comments

---

## Review Checklist by Area

### Security (CRITICAL)
- [ ] No hardcoded secrets, passwords, or API keys
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS prevention (output encoding)
- [ ] Authentication checks on protected endpoints
- [ ] Authorization checks (role-based access)
- [ ] No sensitive data in logs
- [ ] Secure error messages (no stack traces to client)

### TypeScript/JavaScript
- [ ] No `any` types - use proper type definitions
- [ ] No unused variables or imports
- [ ] Async/await error handling (try/catch)
- [ ] No console.log in production code
- [ ] Proper null/undefined checks
- [ ] No hardcoded strings (use constants)

### React/Frontend
- [ ] Components follow naming convention
- [ ] Hooks follow rules (no conditional hooks)
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Form validation implemented
- [ ] Accessibility (ARIA labels, keyboard nav)

### Backend/API
- [ ] DTOs defined for request/response
- [ ] Input validation with proper error messages
- [ ] Authentication middleware applied
- [ ] Error handling with proper status codes
- [ ] Transactions for multi-table operations

### Database
- [ ] Migrations are reversible
- [ ] Indexes on frequently queried columns
- [ ] No N+1 query patterns
- [ ] Transactions for related changes

---

## Comment Templates

### Request Change
```
**Issue:** [Brief description]

[Explanation of the problem]

**Suggestion:**
```suggestion
// Fixed code here
```
```

### Ask Question
```
**Question:** [Your question]

[Context or reason for asking]
```

### Approve with Note
```
**Note:** [Observation]

[Minor suggestion or future consideration - not blocking]
```

### Security Concern
```
**Security:** [Issue description]

[Explanation of risk]

**Required fix:**
[How to fix it]
```

---

## Common Issues to Flag

### Security
```typescript
// BAD: SQL injection risk
const query = `SELECT * FROM users WHERE id = '${userId}'`;

// GOOD: Parameterized query
const user = await db.user.findUnique({ where: { id: userId } });
```

### Error Handling
```typescript
// BAD: Swallowing errors
try {
  await doSomething();
} catch (e) {
  // Silent fail
}

// GOOD: Handle or propagate
try {
  await doSomething();
} catch (error) {
  logger.error({ error }, 'Failed to do something');
  throw error;
}
```

### Type Safety
```typescript
// BAD: any type
const data: any = response.data;

// GOOD: Proper typing
interface UserResponse {
  id: string;
  name: string;
}
const data: UserResponse = response.data;
```

---

## Review Response Format

```markdown
## Review Summary

**Status:** [Approve / Request Changes / Comment]

### What I Reviewed
- [List of files/features reviewed]

### Findings

#### Critical (Must Fix)
- [ ] [Issue 1 with file:line reference]
- [ ] [Issue 2 with file:line reference]

#### Important (Should Fix)
- [ ] [Issue with explanation]

#### Minor (Consider)
- [ ] [Suggestion or optimization]

### What Looks Good
- [Positive feedback on well-done aspects]

### Questions
- [Any questions about the implementation]
```

---

## Review Commands

```bash
# View PR changes
gh pr diff <number>

# View specific file changes
gh pr diff <number> -- path/to/file.ts

# View PR details
gh pr view <number>

# Checkout PR locally
gh pr checkout <number>

# Approve
gh pr review <number> --approve -b "LGTM!"

# Request changes
gh pr review <number> --request-changes -b "Please address the issues."

# Comment only
gh pr review <number> --comment -b "A few suggestions..."
```

---

## Apply to: $ARGUMENTS
