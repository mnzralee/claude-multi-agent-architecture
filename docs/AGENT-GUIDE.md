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

### Validation Tier (Sonnet)

Agents that verify and improve code:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **tester** | Write/run tests | After implementation, bug fixes |
| **reviewer** | Code review | Before commits, PR review |
| **debugger** | Troubleshooting | When errors occur, tests fail |
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
