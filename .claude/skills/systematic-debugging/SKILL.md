---
name: systematic-debugging
description: Methodical problem-solving approach for diagnosing and resolving code issues
---

# Systematic Debugging Skill

A structured approach to debugging that ensures thorough diagnosis before attempting fixes.

## When to Use This Skill

Use this skill when:
- An implementation agent fails with an error
- Tests are failing unexpectedly
- Runtime behavior doesn't match expectations
- Build or compilation errors occur

## The Debugging Protocol

### Phase 1: Error Capture

**DO NOT** attempt to fix anything until you understand:

```markdown
## Error Analysis

### Exact Error
```
[paste exact error message]
```

### Error Location
- File: [path/to/file.ts]
- Line: [line number]
- Function: [function name]

### Error Type
- [ ] Compilation error
- [ ] Runtime error
- [ ] Test failure
- [ ] Build failure
- [ ] Infrastructure error

### Trigger
What action caused this error?
```

### Phase 2: Context Gathering

Before diagnosing, gather context:

```bash
# Recent changes
git log --oneline -10

# Changes in affected file
git diff HEAD~5 -- [file_path]

# Related files
grep -r "[error_pattern]" --include="*.ts"
```

### Phase 3: Root Cause Analysis

Use the "5 Whys" technique:

```markdown
## Root Cause Analysis

1. **Why did the error occur?**
   [Direct cause - e.g., "Property 'x' does not exist on type 'Y'"]

2. **Why does property 'x' not exist?**
   [e.g., "The type definition was changed"]

3. **Why was the type definition changed?**
   [e.g., "Schema migration removed the field"]

4. **Why wasn't the code updated?**
   [e.g., "The dependent service wasn't identified"]

5. **Why wasn't it identified?**
   [ROOT CAUSE - e.g., "No automated dependency check"]
```

### Phase 4: Impact Assessment

```markdown
## Impact Assessment

### Direct Impact
- [File/component directly affected]

### Cascade Impact
- [Other components that depend on the affected code]

### Test Impact
- [Tests that will fail due to this issue]

### User Impact
- [How this affects end users if deployed]
```

### Phase 5: Fix Strategy

**Only after completing phases 1-4:**

```markdown
## Fix Strategy

### Approach
[Description of the fix approach]

### Files to Modify
1. `path/to/file1.ts` - [what to change]
2. `path/to/file2.ts` - [what to change]

### Code Changes
```[language]
// BEFORE
[problematic code]

// AFTER
[fixed code]
```

### Verification Steps
1. [Step to verify fix works]
2. [Step to verify no regressions]
```

### Phase 6: Prevention

```markdown
## Prevention

### Why This Happened
[Brief explanation]

### How to Prevent
- [ ] Add test case for this scenario
- [ ] Add type check
- [ ] Add documentation
- [ ] Update dependency tracking
```

## Common Error Patterns

### TypeScript Compilation Errors

| Error | Likely Cause | Investigation |
|-------|--------------|---------------|
| Property 'x' does not exist | Type changed, typo | Check interface definition |
| Cannot find module | Missing import, path error | Check tsconfig paths |
| Type 'X' is not assignable | Type mismatch | Check both type definitions |
| Argument of type 'X' | Function signature changed | Check function definition |

### Runtime Errors

| Error | Likely Cause | Investigation |
|-------|--------------|---------------|
| Cannot read property of undefined | Null reference | Add null checks |
| Maximum call stack exceeded | Infinite recursion | Check recursive calls |
| Connection refused | Service down | Check infrastructure |

### Test Failures

| Error | Likely Cause | Investigation |
|-------|--------------|---------------|
| Expected X but got Y | Logic change | Check test assumptions |
| Timeout | Slow operation, infinite loop | Add logging, check loops |
| Mock not called | Code path changed | Update test mocks |

## Debugger Agent Output Format

```markdown
## Debugging Report

### Error Summary
[One sentence description]

### Root Cause
[Identified root cause from 5 Whys analysis]

### Affected Components
| Component | Impact Level | Fix Required |
|-----------|--------------|--------------|
| [file/service] | HIGH/MED/LOW | Yes/No |

### Recommended Fix

#### Files to Modify
1. `[path]` - [change description]

#### Code Changes
```[language]
// File: [path]
// Line: [n]

// Replace:
[old code]

// With:
[new code]
```

#### Verification
```bash
[verification commands]
```

### Prevention
[How to prevent this in future]
```

## Integration with Multi-Agent System

When called by supervisor:

```
supervisor → debugger: {
  "error": "[error message]",
  "context": {
    "workPackage": "WP-03",
    "agent": "backend-impl",
    "files": ["path/to/file.ts"],
    "recentChanges": "[git diff output]"
  }
}

debugger → supervisor: {
  "status": "DIAGNOSED",
  "rootCause": "[explanation]",
  "fix": {
    "files": ["path/to/file.ts"],
    "changes": "[code changes]",
    "verification": ["build command"]
  },
  "prevention": "[suggestion]"
}
```

## Anti-Patterns

### DON'T:
- Jump to fixing without understanding the error
- Make multiple changes at once
- Assume the error message is the root cause
- Skip verification after fix
- Ignore prevention analysis

### DO:
- Follow the phases in order
- Isolate the exact error location
- Understand the full impact
- Fix one thing at a time
- Verify thoroughly
- Document for future reference
