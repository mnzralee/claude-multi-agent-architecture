# Root Cause Analysis

Use this template when debugging issues to document the investigation and fix.

```markdown
### Root Cause Analysis: [Issue Title]

#### Symptom
[What was observed, error messages, unexpected behavior, test failures]

#### Investigation Steps
1. [First thing checked] → [what was found]
2. [Second thing checked] → [what was found]
3. [Third thing checked] → [ROOT CAUSE IDENTIFIED]

#### Root Cause
[The actual underlying issue, not the symptom, but WHY it happened]

#### Fix Applied
[What was changed to resolve the issue]

```typescript
// Before (broken)
const result = await service.process(data);

// After (fixed)
const validated = schema.parse(data);
const result = await service.process(validated);
```

#### Verification
- [ ] Fix resolves the original symptom
- [ ] No regression in related functionality
- [ ] Test added to prevent recurrence

#### Prevention
- [What systemic change prevents this class of bug]
- [Rule or check to add to CI/review process]

#### Time Spent
- Investigation: [time]
- Fix: [time]
- Verification: [time]
```

## Guidelines

- Document the INVESTIGATION PATH, not just the answer
- Include dead ends, they prevent future investigators from repeating them
- Always include a prevention measure, fixing one bug should prevent the whole class
- Add a test that would have caught this issue
- Note the root cause category: configuration, logic, race condition, missing validation, etc.
