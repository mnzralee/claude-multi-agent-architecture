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

---

## Deployment Pipeline

### Overview
```
DOCKER-DEPLOY (build+push) → INFRA-IMPL (K8s rollout) → E2E-TESTER (smoke tests)
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    DEPLOYMENT PIPELINE                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   1. BUILD & PUSH                                                │
│   ┌─────────────┐                                               │
│   │docker-deploy│ → Build Docker image, run type checks,        │
│   │             │   push to container registry                   │
│   └──────┬──────┘                                               │
│          │                                                       │
│   2. ROLLOUT                                                     │
│   ┌─────────────┐                                               │
│   │  infra-impl │ → Update K8s manifests, apply rollout,        │
│   │             │   wait for healthy pods                        │
│   └──────┬──────┘                                               │
│          │                                                       │
│   3. SMOKE TEST                                                  │
│   ┌─────────────┐                                               │
│   │ e2e-tester  │ → Hit /health endpoint, run critical          │
│   │             │   path smoke tests, verify no regressions     │
│   └──────┬──────┘                                               │
│          │                                                       │
│   IF SMOKE FAILS → rollback to previous image tag                │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

### When to Use
- After all implementation and testing is complete for a work unit
- When promoting changes from local development to a cluster environment
- Never mid-development, run services locally until all work is verified

### Key Rules
- Always run `npx tsc --noEmit` before building the Docker image
- Verify the `/health` endpoint returns 200 after rollout
- On smoke test failure, roll back immediately before investigating

---

## Module-Scale Implementation

For large features that span backend, frontend, infrastructure, and database layers simultaneously.

### Overview
```
orchestrator → supervisor → [backend-impl, frontend-impl, infra-impl, db-specialist] (parallel) → tester → reviewer
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│               MODULE-SCALE IMPLEMENTATION                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ORCHESTRATOR (Main Claude)                                     │
│   ┌─────────────┐                                               │
│   │ architect   │ → Design module, define contracts between      │
│   │             │   layers (API schema, DB schema, UI wireframe) │
│   └──────┬──────┘                                               │
│          │                                                       │
│   SUPERVISOR (coordinates parallel tracks)                       │
│   ┌──────┴──────┐                                               │
│   │             │                                                │
│   ├─────────────┼─────────────┬─────────────┬─────────────┐     │
│   ▼             ▼             ▼             ▼             │     │
│ backend-     frontend-     infra-       db-specialist    │     │
│ impl         impl          impl         (schema +       │     │
│ (API +       (pages +      (K8s +        migrations)    │     │
│  services)    components)   Dockerfile)                  │     │
│   │             │             │             │             │     │
│   └─────────────┴─────────────┴─────────────┘             │     │
│          │                                                       │
│   INTEGRATION GATE                                               │
│   ┌─────────────┐                                               │
│   │   tester    │ → Integration tests across all layers         │
│   └──────┬──────┘                                               │
│          │                                                       │
│   QUALITY GATE                                                   │
│   ┌─────────────┐                                               │
│   │  reviewer   │ → Cross-layer consistency check               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   COMMIT (incremental, per file)                                 │
│   └─────────────────────────────────────────────────────────────┘
```

### When to Use
- New modules that touch 3+ layers (backend, frontend, DB, infra)
- Major refactors that require coordinated changes across the stack
- Features where the API contract, DB schema, and UI must be designed together

### Key Rules
- The architect defines shared contracts (API schemas, DB models) BEFORE parallel work begins
- Each parallel agent receives the shared contracts as input
- The supervisor monitors for contract violations during implementation
- Integration testing happens AFTER all parallel tracks complete, not during

---

## Error Escalation Protocol

When an agent gets stuck, follow this escalation ladder to avoid wasting context on hopeless retries.

### Escalation Ladder

```
┌─────────────────────────────────────────────────────────────────┐
│                   ERROR ESCALATION PROTOCOL                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ATTEMPT 1: Self-Reflection                                     │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Agent encounters error → re-reads error output →        │   │
│   │ reflects on what went wrong → retries with adjustment   │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│   ATTEMPT 2: Retry with New Strategy                             │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Same error persists → agent tries fundamentally         │   │
│   │ different approach (different algorithm, different API,  │   │
│   │ different library)                                       │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│   ATTEMPT 3: Kill Criteria Met → Reassign                        │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ 3 stuck iterations OR repeating same error → STOP       │   │
│   │ Agent reports: what was tried, what failed, hypothesis  │   │
│   │ Supervisor reassigns to different agent (e.g., debugger │   │
│   │ instead of impl, or Opus instead of Sonnet)             │   │
│   └──────────────────────────┬──────────────────────────────┘   │
│                              │                                   │
│   ATTEMPT 4: Escalate to Orchestrator                            │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ Reassigned agent also fails → escalate to orchestrator  │   │
│   │ Orchestrator can: redefine the task, change approach,   │   │
│   │ split into smaller sub-tasks, or escalate to human      │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
│   IF STILL FAILING → escalate to human with full diagnosis       │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

### Kill Criteria (When to Stop Retrying)
- **3+ stuck iterations**: Agent has tried 3 times with no meaningful progress
- **Repeating the same error**: Agent produces identical output on consecutive attempts
- **Context degradation**: Agent starts hallucinating file paths or APIs that do not exist
- **Circular fixes**: Agent's fix for error A introduces error B, and fixing B reintroduces A

### Reassignment Rules
- `backend-impl` stuck on a type error → reassign to `debugger` for diagnosis
- `frontend-impl` stuck on state management → reassign to `architect` for redesign
- Any Sonnet agent stuck on complex reasoning → escalate to Opus agent
- Infrastructure failures → reassign to `infra-impl` with explicit environment context

---

## Swarm Pattern

A self-organizing task queue for large-scale work where many independent tasks need processing.

### Overview
```
orchestrator → task queue → [worker-1, worker-2, worker-3, ...] (self-organizing)
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                       SWARM PATTERN                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ORCHESTRATOR                                                   │
│   ┌─────────────┐                                               │
│   │ Break work  │ → Decompose into independent task items       │
│   │ into tasks  │   (each task is self-contained)               │
│   └──────┬──────┘                                               │
│          │                                                       │
│   TASK QUEUE (JSON artifact in .claude/progress/)                │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │ { "PENDING": [...], "IN_PROGRESS": [...],               │   │
│   │   "COMPLETED": [...], "FAILED": [...] }                 │   │
│   └──────┬──────────────────────────────────────────────────┘   │
│          │                                                       │
│   WORKERS (claim tasks from queue)                               │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐          │
│   │worker-1 │  │worker-2 │  │worker-3 │  │worker-N │          │
│   │(impl)   │  │(impl)   │  │(impl)   │  │(impl)   │          │
│   └────┬────┘  └────┬────┘  └────┬────┘  └────┬────┘          │
│        │            │            │            │                  │
│   Each worker:                                                   │
│   1. Claims next PENDING task → moves to IN_PROGRESS             │
│   2. Implements the task                                         │
│   3. Moves to COMPLETED (or FAILED with reason)                  │
│   4. Claims next task                                            │
│                                                                  │
│   HEARTBEAT TIMEOUT: 5 minutes                                   │
│   If a worker has not updated progress in 5 min,                 │
│   task returns to PENDING pool for another worker to claim.      │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

### When to Use
- Large refactors (e.g., rename a type across 50 files)
- Bulk migrations (e.g., update all services to a new config pattern)
- Independent code generation tasks (e.g., create tests for 20 modules)
- Any work that decomposes into 10+ independent, similarly-shaped tasks

### Key Rules
- Tasks must be truly independent, no ordering dependencies
- Each task must be self-contained with all context needed to execute
- Heartbeat timeout prevents abandoned tasks from blocking progress
- Failed tasks include a reason so the orchestrator can decide: retry, reassign, or skip

---

## Council Pattern

Multiple agents propose competing solutions. A leader evaluates and selects the best approach.

### Overview
```
orchestrator → [proposer-1, proposer-2, proposer-3] (parallel) → leader (evaluate) → selected approach
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      COUNCIL PATTERN                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ORCHESTRATOR                                                   │
│   ┌─────────────┐                                               │
│   │ Define the  │ → Frame the decision with constraints,        │
│   │ question    │   requirements, and evaluation criteria        │
│   └──────┬──────┘                                               │
│          │                                                       │
│   PROPOSERS (parallel, each works independently)                │
│   ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│   │ proposer-1  │  │ proposer-2  │  │ proposer-3  │            │
│   │ (architect) │  │ (architect) │  │ (researcher) │           │
│   │             │  │             │  │              │            │
│   │ Approach A: │  │ Approach B: │  │ Approach C:  │            │
│   │ e.g., event │  │ e.g., REST  │  │ e.g., hybrid │           │
│   │ sourcing    │  │ polling     │  │ with queue   │            │
│   └──────┬──────┘  └──────┬──────┘  └──────┬──────┘            │
│          │                │                │                     │
│          └────────────────┼────────────────┘                     │
│                           │                                      │
│   LEADER (evaluates all proposals)                               │
│   ┌─────────────┐                                               │
│   │  architect   │ → Score each proposal against criteria:      │
│   │  (Opus)      │   complexity, performance, maintainability,  │
│   │              │   risk, alignment with existing architecture  │
│   └──────┬──────┘                                               │
│          │                                                       │
│   OUTPUT: Selected approach + rationale for decision             │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

### When to Use
- Architectural decisions with multiple viable approaches
- Technology selection (e.g., which database, which messaging system)
- Performance optimization where trade-offs are unclear
- Design disagreements that need structured evaluation

### Key Rules
- Each proposer works independently with no knowledge of other proposals
- Proposals must include: approach description, pros/cons, estimated effort, risks
- The leader must score against predefined criteria, not personal preference
- The decision rationale is documented for future reference

---

## Watchdog Pattern

A safety monitor runs in parallel with implementation agents, continuously checking for regressions.

### Overview
```
[implementation agents] (parallel with) → watchdog (continuous monitoring)
```

### Detailed Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     WATCHDOG PATTERN                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   PARALLEL EXECUTION                                             │
│                                                                  │
│   ┌─────────────────────────┐  ┌─────────────────────────┐      │
│   │   IMPLEMENTATION TRACK  │  │    WATCHDOG TRACK        │      │
│   │                         │  │                          │      │
│   │   backend-impl          │  │   security agent         │      │
│   │   frontend-impl         │  │   ┌─────────────────┐   │      │
│   │   infra-impl            │  │   │ After each impl  │   │      │
│   │                         │  │   │ commit, watchdog  │   │      │
│   │   (normal work)         │  │   │ checks for:       │   │      │
│   │                         │  │   │                   │   │      │
│   │                         │  │   │ - Security vulns  │   │      │
│   │                         │  │   │ - Breaking changes│   │      │
│   │                         │  │   │ - Test regression │   │      │
│   │                         │  │   │ - Type errors     │   │      │
│   │                         │  │   │ - Style violations│   │      │
│   │                         │  │   └────────┬──────────┘   │      │
│   │                         │  │            │              │      │
│   │                         │  │   IF ISSUE DETECTED:      │      │
│   │                         │  │   → Flag to supervisor    │      │
│   │                         │  │   → Can trigger rollback  │      │
│   │                         │  │   → Can pause impl track  │      │
│   └─────────────────────────┘  └─────────────────────────┘      │
│                                                                  │
│   └─────────────────────────────────────────────────────────────┘
```

### When to Use
- High-risk changes (auth, payments, data migrations)
- Large multi-file refactors where regressions are likely
- When working on a codebase with limited test coverage
- Compliance-sensitive code that must pass security review

### Key Rules
- The watchdog never modifies code, it only observes and reports
- Watchdog findings are categorized: CRITICAL (blocks progress), WARNING (address before merge), INFO (nice to fix)
- CRITICAL findings immediately pause the implementation track
- The watchdog runs after each logical commit, not on every file save
