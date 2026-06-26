# Agent Guide

This guide explains when to use each agent and how they work together.

---

## Agent Overview

### Strategic Tier (Opus)

These agents handle high-level decisions and sensitive analysis:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **architect** | System design | New features, API design, architectural decisions |
| **security** | Security audit | Auth code, data handling, before deployments |
| **code-quality-auditor** | Deep quality analysis | Periodic audits, pre-refactoring |

### Exploration Tier (Haiku)

Fast agents for research and documentation:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **researcher** | Find patterns | Understanding existing code, finding examples |
| **prompt-writer** | Generate prompts | Before spawning implementation agents |
| **work-recorder** | Documentation | Continuous logging throughout sessions |

### Implementation Tier (Sonnet)

Agents that write and modify code:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **backend-impl** | Backend code | API endpoints, services, data access |
| **frontend-impl** | Frontend code | Components, pages, hooks |
| **infra-impl** | Infrastructure | Kubernetes, Docker, CI/CD |
| **docker-deploy** | Container builds | Multi-stage images, transitive monorepo deps, registry push |
| **db-specialist** | Schema and migrations | ORM operations, migrations, data-integrity gotchas |
| **cqrs-specialist** | Event-driven code | Outbox commands, idempotent projectors, read models |

### Validation Tier (Sonnet, plus Opus critic)

Agents that verify and improve code:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **tester** | Write/run tests | After implementation, bug fixes |
| **e2e-tester** | End-to-end / smoke | Critical-path browser tests across viewports |
| **reviewer** | Code review | Before commits, PR review |
| **debugger** | Troubleshooting | When errors occur, tests fail |
| **watchdog** | Parallel safety monitor | Large refactors, multi-agent runs, drift detection |
| **evaluator** (Opus) | Rubric-based critic | Score output against acceptance criteria before accepting |
| **supervisor** | Coordination | Complex multi-agent tasks |

---

## Decision Tree: Which Agent?

```
What do you need to do?
│
├─ Plan something new?
│  └─ architect (Opus)
│
├─ Find existing code/patterns?
│  └─ researcher (Haiku)
│
├─ Write backend code?
│  └─ backend-impl (Sonnet)
│
├─ Write frontend code?
│  └─ frontend-impl (Sonnet)
│
├─ Configure infrastructure?
│  └─ infra-impl (Sonnet)
│
├─ Write or run tests?
│  └─ tester (Sonnet)
│
├─ Review code quality?
│  └─ reviewer (Sonnet)
│
├─ Fix a bug or error?
│  └─ debugger (Sonnet)
│
├─ Check security?
│  └─ security (Opus)
│
├─ Build/ship a container image?
│  └─ docker-deploy (Sonnet)
│
├─ Touch schema or migrations?
│  └─ db-specialist (Sonnet)
│
├─ Run end-to-end / smoke tests?
│  └─ e2e-tester (Sonnet)
│
├─ Monitor a risky run for regressions?
│  └─ watchdog (Sonnet)
│
├─ Judge output against a rubric before accepting?
│  └─ evaluator (Opus)
│
├─ Coordinate complex work?
│  └─ supervisor (Sonnet)
│
└─ Document work?
   └─ work-recorder (Haiku)
```

---

## Agent Combinations

### Feature Implementation

```
1. architect (plan the feature)
      ↓
2. researcher (find existing patterns) [parallel]
      ↓
3. backend-impl or frontend-impl (implement)
      ↓
4. tester (write tests)
      ↓
5. reviewer (quality check)
      ↓
6. security (if sensitive) [optional]
```

### Bug Fix

```
1. debugger (diagnose issue)
      ↓
2. backend-impl or frontend-impl (apply fix)
      ↓
3. tester (add regression test)
      ↓
4. reviewer (verify fix)
```

### Code Review

```
1. reviewer (quality check)
      ↓
2. security (security audit) [parallel]
      ↓
3. Compile report
```

### Complex Multi-Track Work

```
1. architect (create plan)
      ↓
2. supervisor (manage Track A)  ─┬─  supervisor (manage Track B)
      ↓                          │         ↓
3. prompt-writer → impl-agent    │   prompt-writer → impl-agent
      ↓                          │         ↓
4. tester (verify)               │   tester (verify)
      ↓                          │         ↓
5. work-recorder (document)      └── work-recorder (document)
```

---

## Detailed Agent Descriptions

### architect (Opus)

**When to use:**
- Planning new modules or features
- Designing API contracts
- Making architectural decisions
- Before implementing anything spanning 3+ files

**What it does:**
- Analyzes requirements
- Designs system structure
- Creates implementation plans
- Identifies risks

**What it outputs:**
- Module overview
- File list with descriptions
- Interface definitions
- Implementation order
- Risk assessment

---

### researcher (Haiku)

**When to use:**
- Need to understand existing code
- Looking for similar implementations
- Finding coding patterns
- Quick codebase exploration

**What it does:**
- Searches codebase efficiently
- Identifies patterns
- Provides concise summaries
- Gathers reference material

**What it outputs:**
- File paths and line numbers
- Code snippets
- Pattern descriptions
- Quick summaries

---

### supervisor (Sonnet)

**When to use:**
- Complex tasks requiring multiple agents
- Parallel work streams
- Error recovery coordination
- Progress tracking

**What it does:**
- Manages work packages
- Dispatches sub-agents
- Handles errors
- Reports progress

**What it outputs:**
- Track status reports
- Aggregated metrics
- Error logs
- Completion reports

---

### prompt-writer (Haiku)

**When to use:**
- Before spawning any implementation agent
- When context is complex
- For multi-step tasks

**What it does:**
- Reads relevant code
- Generates optimized prompts
- Includes necessary context
- Sets clear criteria

**What it outputs:**
- Context-rich prompts
- File references
- Verification criteria

---

### backend-impl (Sonnet)

**When to use:**
- Implementing API endpoints
- Creating services/use cases
- Writing data access code
- Backend bug fixes

**What it does:**
- Writes backend code
- Follows architecture patterns
- Implements business logic
- Handles data persistence

**What it outputs:**
- Implemented code files
- Passing type checks
- Commits

---

### frontend-impl (Sonnet)

**When to use:**
- Creating components
- Building pages
- Implementing hooks
- Frontend bug fixes

**What it does:**
- Writes React/frontend code
- Creates UI components
- Manages state
- Handles forms

**What it outputs:**
- Implemented code files
- Passing type checks
- Commits

---

### infra-impl (Sonnet)

**When to use:**
- Creating deployment configs
- Writing Dockerfiles
- Configuring CI/CD
- Infrastructure changes

**What it does:**
- Writes infrastructure code
- Creates container configs
- Configures services
- Manages deployments

**What it outputs:**
- Infrastructure files
- Validated configs
- Commits

---

### tester (Sonnet)

**When to use:**
- After implementing features
- When fixing bugs (regression test)
- To improve coverage
- Verifying changes

**What it does:**
- Writes unit tests
- Writes integration tests
- Runs test suites
- Checks coverage

**What it outputs:**
- Test files
- Test results
- Coverage reports

---

### reviewer (Sonnet)

**When to use:**
- After implementation
- Before commits
- During PR review
- Quality checks

**What it does:**
- Reviews code quality
- Checks patterns
- Identifies issues
- Suggests improvements

**What it outputs:**
- Review report
- Categorized findings
- Recommendations

---

### debugger (Sonnet)

**When to use:**
- When errors occur
- Tests are failing
- Unexpected behavior
- Performance issues

**What it does:**
- Analyzes errors
- Traces code paths
- Identifies root causes
- Suggests fixes

**What it outputs:**
- Diagnosis report
- Root cause
- Fix recommendations

---

### security (Opus)

**When to use:**
- Auth/authz code
- Data handling
- Before deployments
- Sensitive features

**What it does:**
- Checks OWASP Top 10
- Reviews auth implementation
- Identifies vulnerabilities
- Assesses risk

**What it outputs:**
- Security audit report
- Vulnerability findings
- Remediation guidance

---

### work-recorder (Haiku)

**When to use:**
- Throughout all sessions
- After significant events
- At session boundaries
- For decisions

**What it does:**
- Documents progress
- Captures decisions
- Records learnings
- Maintains narrative

**What it outputs:**
- Work record entries
- Session summaries
- Decision logs

---

### code-quality-auditor (Opus)

**When to use:**
- Periodic health checks
- Before major refactoring
- After significant growth
- Technical debt assessment

**What it does:**
- Analyzes architecture
- Assesses maintainability
- Identifies tech debt
- Reviews patterns

**What it outputs:**
- Quality audit report
- Scored dimensions
- Prioritized recommendations

---

### docker-deploy (Sonnet)

**When to use:**
- Building and shipping container images
- Multi-stage builds and transitive monorepo dependencies
- Pushing to a registry

**What it does:**
- Writes Dockerfiles and builds multi-stage images
- Pins digests and pushes to the registry
- Verifies the running build matches the intended digest

**What it outputs:**
- Built image and digest
- Push confirmation
- A common-failures checklist

---

### db-specialist (Sonnet)

**When to use:**
- Schema changes and migrations
- ORM operations and data-integrity gotchas

**What it does:**
- Designs schema changes and writes migrations
- Knows generate-vs-migrate semantics
- Never pushes schema straight to production, never casts the client to any

**What it outputs:**
- Migration files and a schema diff
- Data-integrity notes

---

### cqrs-specialist (Sonnet)

**When to use:**
- Event-driven and CQRS work
- Outbox commands, idempotent projectors, read models

**What it does:**
- Writes command/outbox handlers and projectors
- Enforces idempotency
- Never catches errors inside a transaction boundary

**What it outputs:**
- Command and projector code
- Idempotency keys and event-flow notes

---

### e2e-tester (Sonnet)

**When to use:**
- End-to-end and smoke testing of critical user paths
- Cross-viewport verification

**What it does:**
- Drives a browser (with a Playwright MCP when available)
- Runs page sweeps and smoke flows, captures screenshots

**What it outputs:**
- Pass/fail per flow
- Screenshots and a blocking-issues table

---

### watchdog (Sonnet)

**When to use:**
- Large refactors and multi-agent runs
- Drift detection in parallel with implementation

**What it does:**
- Monitors for security, breaking-change, dependency, and quality regressions
- Recommends pausing on critical drift (read-only, never edits)

**What it outputs:**
- Severity-tagged drift alerts (CRITICAL / WARNING / INFO)

---

### evaluator (Opus)

**When to use:**
- Scoring another agent's output against an explicit rubric before acceptance
- The critic half of the evaluator-optimizer loop

**What it does:**
- Judges work against acceptance criteria, adversarially and read-only
- Never produces or fixes the work, only scores it

**What it outputs:**
- A PASS / NEEDS_WORK / FAIL verdict
- Per-criterion gaps and a confidence level

---

## Model Selection Rationale

### Opus (Strategic)
- Highest capability
- Best for complex reasoning
- Used for critical decisions
- Higher cost, use selectively

### Haiku (Fast)
- Fastest model
- Good for simple tasks
- Low cost
- Used for exploration and docs

### Sonnet (Implementation)
- Balanced capability/speed
- Good for coding tasks
- Moderate cost
- Workhorse for most tasks

---

## Kill Criteria

When an agent is stuck, continuing to retry wastes context and produces no value. Use these kill criteria to decide when to stop an agent and reassign.

### When to Reassign an Agent

| Signal | Threshold | Action |
|--------|-----------|--------|
| Stuck iterations | 3+ attempts with no meaningful progress | Kill and reassign |
| Repeating same error | Identical error output on consecutive attempts | Kill and reassign |
| Context degradation | Agent hallucinates file paths, APIs, or types that do not exist | Kill immediately |
| Circular fixes | Fix for error A introduces error B; fix for B reintroduces A | Kill and escalate |
| Scope creep | Agent keeps expanding the task beyond the original request | Kill and re-scope |

### Escalation Ladder

```
REFLECT → RETRY → REASSIGN → ESCALATE

Step 1: REFLECT
  Agent encounters error. It re-reads the error output, reflects on what
  went wrong, and retries with an adjusted approach.

Step 2: RETRY
  Same error persists. Agent tries a fundamentally different strategy
  (different algorithm, different API, different library).

Step 3: REASSIGN
  Kill criteria met. Agent reports what was tried and what failed.
  Supervisor reassigns to a different agent:
  - impl stuck on types → reassign to debugger
  - Sonnet stuck on reasoning → escalate to Opus
  - Frontend stuck on state → reassign to architect for redesign

Step 4: ESCALATE
  Reassigned agent also fails. Escalate to orchestrator.
  Orchestrator can: redefine the task, split it into smaller pieces,
  change the approach entirely, or escalate to human.
```

### Anti-Pattern: Infinite Retry Loop

Never let an agent retry the same approach more than twice. If the approach is wrong, more attempts will not make it right. Reassignment to a fresh agent with a different perspective is always more productive than a fourth retry.

---

## Output Validation Gates

Before passing a sub-agent's output to the next stage, the orchestrator (or supervisor) validates it against quality gates. This prevents cascading failures where one agent's bad output corrupts the entire pipeline.

### Validation Checks

| Gate | Check | Failure Action |
|------|-------|----------------|
| **Compilation** | Run `npx tsc --noEmit` or equivalent type check | Block. Send errors back to the impl agent for fixing. |
| **Test Suite** | Run existing tests to check for regressions | Block. Send failing test output to the impl agent. |
| **Security Scan** | Check for hardcoded secrets, missing auth guards | Block. Flag to security agent for review. |
| **Style Check** | Run linter, check naming conventions | Warn. Allow to proceed but flag for cleanup. |
| **Contract Compliance** | Verify output matches the architect's spec (API schema, types) | Block. Send discrepancy to the impl agent. |
| **File Scope** | Verify agent only modified files within its assigned scope | Block. Revert out-of-scope changes. |

### Implementation Pattern

```
┌─────────────────────────────────────────────────────────────────┐
│                   VALIDATION GATE                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   SUB-AGENT completes work                                       │
│          │                                                       │
│          ▼                                                       │
│   ┌─────────────┐                                               │
│   │ Type Check  │ → PASS / FAIL                                 │
│   └──────┬──────┘                                               │
│          │ PASS                                                  │
│          ▼                                                       │
│   ┌─────────────┐                                               │
│   │ Test Suite  │ → PASS / FAIL                                 │
│   └──────┬──────┘                                               │
│          │ PASS                                                  │
│          ▼                                                       │
│   ┌─────────────┐                                               │
│   │ Security    │ → PASS / WARN / FAIL                          │
│   └──────┬──────┘                                               │
│          │ PASS                                                  │
│          ▼                                                       │
│   OUTPUT ACCEPTED → pass to next stage                           │
│                                                                  │
│   ON FAILURE: return to sub-agent with specific error context    │
│   └─────────────────────────────────────────────────────────────┘
```

### Key Rules
- Gates run in order; a failure at any gate blocks subsequent gates
- Failure context must be specific: include the exact error message, file, and line number
- The sub-agent gets at most 2 attempts to pass a gate before kill criteria apply
- Security gate failures are always blocking, never warnings

---

## Progressive Knowledge Loading

Agents do not need all context upfront. Loading everything at once wastes tokens and degrades performance. Use a 3-tier activation model to load knowledge progressively.

### Tier 1: Metadata (Always Loaded)

Minimal information loaded for every agent at spawn time:
- Agent name and role (from AGENT.md header)
- Project name and tech stack (from CLAUDE.md quick reference)
- Current task description
- Relevant file paths (5-10 files maximum)

**Token cost**: ~500-1,000 tokens

### Tier 2: Instructions (Loaded on Trigger)

Detailed instructions loaded when the agent's task requires domain-specific knowledge:
- Full AGENT.md content
- Relevant rule files (e.g., `clean-architecture.md` for backend-impl)
- Relevant skill definitions (e.g., `/commit` when ready to commit)
- Current module spec (if implementing a specific module)

**Trigger**: When the orchestrator dispatches the agent for a specific task
**Token cost**: ~2,000-5,000 tokens

### Tier 3: Resources (Loaded on Demand)

Heavy reference material loaded only when the agent explicitly needs it:
- Full file contents of existing implementations (for reference patterns)
- Database schema definitions
- API specifications
- Test fixtures and factories
- Work records from previous sessions

**Trigger**: Agent requests additional context, or prompt-writer includes it based on task analysis
**Token cost**: ~5,000-20,000 tokens

### Implementation

The `prompt-writer` agent is the gatekeeper for progressive loading. When generating a prompt for a sub-agent:

1. Always include Tier 1 (metadata)
2. Include Tier 2 (instructions) relevant to the specific task
3. Include Tier 3 (resources) only for files the sub-agent will directly read or modify
4. Never include the full CLAUDE.md, extract only the relevant sections

### Why This Matters

A sub-agent with 5,000 tokens of focused context outperforms one with 50,000 tokens of unfocused context. The prompt-writer's job is to maximize signal-to-noise ratio, not to maximize information volume.

---

## Ralph Loop for Long Sessions

Long sessions (exceeding 50% of the context window) suffer from context degradation: the agent starts forgetting earlier instructions, hallucinating file paths, or repeating mistakes it already fixed. The Ralph Loop pattern prevents this.

### The Pattern

```
PICK TASK → IMPLEMENT → VALIDATE → COMMIT → RESET CONTEXT
     ↑                                            │
     └────────────────────────────────────────────┘
```

### How It Works

1. **Pick Task**: Select the next work item from the task list or progress tracker
2. **Implement**: Complete the task using the appropriate agent(s)
3. **Validate**: Run validation gates (type check, tests, review)
4. **Commit**: Create a git commit for the completed work
5. **Reset Context**: Spawn a fresh sub-agent for the next task instead of continuing in the degraded context

### Why "Reset Context" Matters

After a commit, the current sub-agent's context contains:
- All the false starts and debugging from the previous task
- Stale file contents from before edits were applied
- Error messages that are no longer relevant
- Accumulated context noise from tool calls

A fresh sub-agent starts clean with only the current state of the codebase. It reads the files as they are now, not as they were 30 tool calls ago.

### When to Apply

| Indicator | Action |
|-----------|--------|
| Session is past 50% context window | Start using Ralph Loop for all remaining tasks |
| Agent starts referring to stale file content | Immediately reset context |
| Agent suggests a fix that was already tried and failed | Immediately reset context |
| Task count remaining is > 5 | Plan for Ralph Loop from the start |

### Implementation

The orchestrator manages the loop:

```
For each task in task_list:
  1. Use prompt-writer to generate context-optimized prompt
  2. Spawn fresh sub-agent with that prompt (Tier 1 + Tier 2 context only)
  3. Sub-agent implements and validates
  4. Sub-agent commits
  5. Orchestrator reads commit result
  6. Orchestrator moves to next task (sub-agent context is discarded)
```

### Key Insight

The orchestrator's context grows linearly (it only tracks task completion status), while each sub-agent's context stays small and fresh. This allows sessions to scale to 50+ tasks without degradation.
