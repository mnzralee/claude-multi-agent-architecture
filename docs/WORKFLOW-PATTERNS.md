# Workflow Patterns

This guide documents common workflow patterns for the multi-agent system.

---

## Pattern 1: Feature Implementation

The standard workflow for implementing new features.

### Overview
```
architect → researcher → implementer → tester → reviewer
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURE IMPLEMENTATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. PLANNING                                                    │
│   ┌─────────────┐                                               │
│   │  architect  │ → Module design, file list, API contracts     │
│   └──────┬──────┘                                               │
│          │                                                       │
│   2. RESEARCH (parallel with planning if needed)                 │
│   ┌─────────────┐                                               │
│   │ researcher  │ → Find existing patterns, similar code        │
│   └──────┬──────┘                                               │
│          │                                                       │
│   3. IMPLEMENTATION                                              │
│   ┌─────────────┐                                               │
│   │backend-impl │ → Backend code                                │
│   │   or        │                                               │
│   │frontend-impl│ → Frontend code                               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   4. TESTING                                                     │
│   ┌─────────────┐                                               │
│   │   tester    │ → Unit tests, integration tests               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   5. REVIEW                                                      │
│   ┌─────────────┐                                               │
│   │  reviewer   │ → Quality check, suggestions                  │
│   └──────┬──────┘                                               │
│          │                                                       │
│   6. SECURITY (if sensitive)                                     │
│   ┌─────────────┐                                               │
│   │  security   │ → Security audit                              │
│   └──────┬──────┘                                               │
│          │                                                       │
│   7. COMMIT                                                      │
│   └─────────────────────────────────────────────────────────────┘
```

### Example Usage

**User**: "Build a user registration feature"

**Flow**:
1. `architect` designs the registration flow, API endpoints, data models
2. `researcher` finds existing auth patterns in the codebase
3. `backend-impl` implements the registration endpoint
4. `frontend-impl` builds the registration form
5. `tester` writes unit tests for the service and component tests
6. `reviewer` checks code quality
7. `security` audits auth implementation
8. Commit with `/commit`

---

## Pattern 2: Bug Fix

The workflow for diagnosing and fixing bugs.

### Overview
```
debugger → implementer → tester → reviewer
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        BUG FIX                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. DIAGNOSIS                                                   │
│   ┌─────────────┐                                               │
│   │  debugger   │ → Analyze error, find root cause              │
│   └──────┬──────┘                                               │
│          │                                                       │
│   2. FIX IMPLEMENTATION                                          │
│   ┌─────────────┐                                               │
│   │backend-impl │ → Apply fix                                   │
│   │   or        │                                               │
│   │frontend-impl│                                               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   3. REGRESSION TEST                                             │
│   ┌─────────────┐                                               │
│   │   tester    │ → Add test for the bug                        │
│   └──────┬──────┘                                               │
│          │                                                       │
│   4. VERIFICATION                                                │
│   ┌─────────────┐                                               │
│   │  reviewer   │ → Verify fix is complete                      │
│   └──────┬──────┘                                               │
│          │                                                       │
│   5. COMMIT                                                      │
│   └─────────────────────────────────────────────────────────────┘
```

### Example Usage

**User**: "Fix: Users can't log in after password reset"

**Flow**:
1. `debugger` traces the login flow, checks password reset logic, finds root cause
2. `backend-impl` fixes the password hash comparison
3. `tester` adds regression test for password reset → login flow
4. `reviewer` verifies the fix and test coverage
5. Commit with `/commit`

---

## Pattern 3: Code Review

The workflow for reviewing code changes.

### Overview
```
reviewer + security → report
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      CODE REVIEW                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. QUALITY REVIEW                                              │
│   ┌─────────────┐                                               │
│   │  reviewer   │ → Check patterns, quality, bugs               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   2. SECURITY REVIEW (parallel)                                  │
│   ┌─────────────┐                                               │
│   │  security   │ → Check vulnerabilities, auth                 │
│   └──────┬──────┘                                               │
│          │                                                       │
│   3. COMPILE REPORT                                              │
│   └─────────────────────────────────────────────────────────────┘
```

### Example Usage

**User**: "/review PR #42"

**Flow**:
1. `reviewer` analyzes code quality, patterns, potential bugs
2. `security` checks for vulnerabilities (parallel)
3. Compile findings into review report

---

## Pattern 4: Multi-Track Orchestration

For complex tasks requiring parallel work streams.

### Overview
```
orchestrator → supervisors → sub-agents
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                 MULTI-TRACK ORCHESTRATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ORCHESTRATOR (Main Claude)                                     │
│   ┌─────────────┐                                               │
│   │ Parse plan  │                                               │
│   │ Assign tracks│                                               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   ┌──────┴─────────────────┬─────────────────────┐              │
│   ▼                        ▼                      ▼              │
│   TRACK A                  TRACK B                TRACK C        │
│   ┌─────────────┐         ┌─────────────┐        ┌─────────────┐│
│   │ supervisor  │         │ supervisor  │        │ supervisor  ││
│   └──────┬──────┘         └──────┬──────┘        └──────┬──────┘│
│          │                       │                       │       │
│   ┌──────┴──────┐         ┌──────┴──────┐        ┌──────┴──────┐│
│   │             │         │             │        │             ││
│   ▼             ▼         ▼             ▼        ▼             ▼│
│ prompt-      impl-      prompt-      impl-     prompt-      impl-│
│ writer       agent      writer       agent     writer       agent│
│   │             │         │             │        │             ││
│   ▼             ▼         ▼             ▼        ▼             ▼│
│ debugger    tester     debugger    tester    debugger    tester ││
│                                                                  │
│   WORK RECORDER (continuous documentation)                       │
│   └─────────────────────────────────────────────────────────────┘
```

### Example Usage

**User**: "Execute the legacy migration plan"

**Flow**:
1. Orchestrator parses the plan document
2. Spawns supervisors for each track
3. Each supervisor:
   - Uses `prompt-writer` before each dispatch
   - Spawns `impl-agent` for work packages
   - Invokes `debugger` on errors
   - Logs to `work-recorder`
4. Orchestrator aggregates results

---

## Pattern 5: Exploration & Research

For understanding unfamiliar code or finding patterns.

### Overview
```
researcher → document findings
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    EXPLORATION                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. SEARCH                                                      │
│   ┌─────────────┐                                               │
│   │ researcher  │ → Find relevant files, patterns               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   2. ANALYSIS                                                    │
│   ┌─────────────┐                                               │
│   │ researcher  │ → Understand code flow, dependencies          │
│   └──────┬──────┘                                               │
│          │                                                       │
│   3. DOCUMENTATION                                               │
│   ┌─────────────┐                                               │
│   │work-recorder│ → Document findings                           │
│   └─────────────┘                                               │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

### Example Usage

**User**: "How does the payment processing work?"

**Flow**:
1. `researcher` finds payment-related files
2. `researcher` traces the payment flow
3. Report findings with file paths and explanations

---

## Pattern 6: Refactoring

For improving code structure without changing behavior.

### Overview
```
code-quality-auditor → architect → implementer → tester → reviewer
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      REFACTORING                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. AUDIT                                                       │
│   ┌─────────────┐                                               │
│   │code-quality │ → Identify issues, tech debt                  │
│   │  auditor    │                                               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   2. PLAN                                                        │
│   ┌─────────────┐                                               │
│   │  architect  │ → Design refactoring approach                 │
│   └──────┬──────┘                                               │
│          │                                                       │
│   3. IMPLEMENT                                                   │
│   ┌─────────────┐                                               │
│   │backend-impl │ → Apply refactoring                           │
│   │   or        │                                               │
│   │frontend-impl│                                               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   4. TEST                                                        │
│   ┌─────────────┐                                               │
│   │   tester    │ → Verify behavior unchanged                   │
│   └──────┬──────┘                                               │
│          │                                                       │
│   5. REVIEW                                                      │
│   ┌─────────────┐                                               │
│   │  reviewer   │ → Verify improvement                          │
│   └─────────────┘                                               │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

---

## Pattern 7: Error Recovery

When implementation fails and needs debugging.

### Overview
```
error → debugger → prompt-writer → implementer → retry
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR RECOVERY                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   IMPLEMENTATION FAILS                                           │
│          │                                                       │
│          ▼                                                       │
│   1. DIAGNOSIS                                                   │
│   ┌─────────────┐                                               │
│   │  debugger   │ → Analyze error, find root cause              │
│   └──────┬──────┘                                               │
│          │                                                       │
│   2. GENERATE FIX PROMPT                                         │
│   ┌─────────────┐                                               │
│   │prompt-writer│ → Create context-rich fix prompt              │
│   └──────┬──────┘                                               │
│          │                                                       │
│   3. APPLY FIX                                                   │
│   ┌─────────────┐                                               │
│   │ impl-agent  │ → Implement fix                               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   4. VERIFY                                                      │
│   ┌─────────────┐                                               │
│   │   tester    │ → Confirm fix works                           │
│   └──────┬──────┘                                               │
│          │                                                       │
│   IF STILL FAILING → escalate to orchestrator                    │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

---

## Best Practices

### 1. Always Use prompt-writer
Before spawning implementation agents, generate optimized prompts.

### 2. Verify Before Proceeding
Don't skip verification steps. Use `/verification-before-completion`.

### 3. Document Throughout
Use `work-recorder` to maintain continuous documentation.

### 4. Handle Errors Gracefully
Follow the error recovery pattern when things fail.

### 5. Use Parallel Execution
When work is independent, run agents in parallel for efficiency.

### 6. Match Model to Task
- Opus for strategy
- Haiku for speed
- Sonnet for implementation
