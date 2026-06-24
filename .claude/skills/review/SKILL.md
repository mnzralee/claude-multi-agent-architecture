---
name: review
description: Code review skill covering security, correctness, type safety, and maintainability for any software project
---

# Code Review Skill

Review code changes following enterprise-grade engineering standards. The checklists, comment templates, and command patterns here apply to any software project regardless of stack (examples use TypeScript / Node / React; the discipline is stack-agnostic).

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
- [ ] Components follow naming convention (PascalCase)
- [ ] Hooks follow rules (no conditional hooks)
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Empty states handled
- [ ] Form validation implemented
- [ ] Accessibility (ARIA labels, keyboard nav)
- [ ] Responsive design verified
- [ ] Error handling uses the project's centralized error module
- [ ] API routes use the shared error handler utility, not inline ad-hoc error construction
- [ ] Components use the project's API call wrapper, never raw `new Error(message)` directly
- [ ] Error messages come from the project's error-code registry, no duplicated message strings
- [ ] Form errors use the shared form-error handler for consistent toast and field display

### Backend/API
- [ ] DTOs defined for request/response
- [ ] Input validation with proper error messages
- [ ] Authentication middleware applied
- [ ] Structured logging at key points
- [ ] Error handling with proper status codes
- [ ] Multi-tenant queries are scoped to the correct tenant
- [ ] Transactions for multi-table operations

### [CUSTOMIZE: additional language/runtime]
Add a section here for each additional language or runtime your project uses (Go, Python, Java, etc.). For each, list:
- [ ] Authorization check is FIRST operation
- [ ] All inputs validated
- [ ] Errors wrapped with context
- [ ] Events or side-effects emitted for state changes
- [ ] Idempotency handled for non-idempotent operations

### Database
- [ ] Migrations are reversible
- [ ] Indexes on frequently queried columns
- [ ] Foreign keys properly defined
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

// GOOD: Parameterized query (using your ORM)
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

### React Performance
```tsx
// BAD: Creating function on every render
<Button onClick={() => handleClick(item.id)}>Click</Button>

// GOOD: Memoized callback
const handleItemClick = useCallback((id: string) => {
  handleClick(id);
}, [handleClick]);
```

### Async State
```tsx
// BAD: Not handling loading/error
const { data } = useQuery(...);
return <div>{data.name}</div>; // Crashes if data is undefined

// GOOD: Handle all states
const { data, isLoading, isError } = useQuery(...);
if (isLoading) return <Skeleton />;
if (isError) return <ErrorState />;
return <div>{data.name}</div>;
```

---

## Review Commands

### Get PR Diff
```bash
# View PR changes
gh pr diff <number>

# View specific file changes
gh pr diff <number> -- path/to/file.ts

# View PR details
gh pr view <number>
```

### Checkout PR Locally
```bash
# Checkout PR branch
gh pr checkout <number>

# Run tests locally
npm test

# Build locally
npm run build
```

### Add Review Comments
```bash
# Start review
gh pr review <number>

# Approve
gh pr review <number> --approve -b "LGTM!"

# Request changes
gh pr review <number> --request-changes -b "Please address the security concern."

# Comment only
gh pr review <number> --comment -b "A few suggestions..."
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

## Apply to: $ARGUMENTS
