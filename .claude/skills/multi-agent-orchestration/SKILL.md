---
name: multi-agent-orchestration
description: Enterprise-grade multi-agent orchestration with hierarchical sub-agents, work recording, and error recovery
---

# Multi-Agent Orchestration Skill

Coordinate complex development tasks using hierarchical agent teams.

## When to Use This Skill

Use this skill when:
- Task requires multiple specialized agents working together
- Work needs parallel execution across different tracks
- Continuous documentation of progress is required
- Error recovery and debugging support is needed

## Architecture

```
                    ┌─────────────────────────────────┐
                    │         ORCHESTRATOR            │
                    │     (Main Claude - Opus)        │
                    │                                 │
                    │  - Reads plan documents         │
                    │  - Dispatches supervisors       │
                    │  - Aggregates final results     │
                    │  - Makes escalation decisions   │
                    └─────────────┬───────────────────┘
                                  │
          ┌───────────────────────┼───────────────────────┐
          │                       │                       │
          ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   SUPERVISOR    │     │   SUPERVISOR    │     │   SUPERVISOR    │
│   Track Lead    │     │   Track Lead    │     │   Track Lead    │
│                 │     │                 │     │                 │
│ Owns: WP-01,02  │     │ Owns: WP-03-06  │     │ Owns: WP-10-12  │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
    ┌────┴────┐             ┌────┴────┐             ┌────┴────┐
    │ Support │             │ Support │             │ Support │
    │  Team   │             │  Team   │             │  Team   │
    └─────────┘             └─────────┘             └─────────┘

Support Team per Supervisor:
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│prompt-writer │ │ impl-agent   │ │  debugger    │ │work-recorder │
│  (haiku)     │ │  (sonnet)    │ │  (sonnet)    │ │   (haiku)    │
│              │ │              │ │              │ │              │
│ Generates    │ │ Executes     │ │ On-call for  │ │ Logs all     │
│ context-rich │ │ actual work  │ │ failures     │ │ activities   │
│ prompts      │ │ packages     │ │              │ │              │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## Agent Dispatch Protocol

### Step 1: Supervisor Receives Track Assignment

```markdown
## Track Assignment: [TRACK_NAME]

### Owned Work Packages
- WP-XX: [description]
- WP-YY: [description]

### Support Team
- prompt-writer: Generate optimized prompts before each dispatch
- [impl-agent]: Execute work packages
- debugger: On-call for error diagnosis
- work-recorder: Continuous progress logging

### Success Criteria
- [ ] All WPs complete
- [ ] Zero compilation errors
- [ ] Work record updated
```

### Step 2: Pre-Dispatch Prompt Generation

Before dispatching any implementation agent:

```
supervisor → prompt-writer: "Generate prompt for WP-XX"
prompt-writer → supervisor: {
  "prompt": "[optimized, context-rich prompt]",
  "contextFiles": ["path/to/file1.ts"],
  "verification": ["build command", "test command"]
}
```

### Step 3: Implementation Dispatch

```
supervisor → impl-agent: [prompt from prompt-writer]
impl-agent → supervisor: {
  "status": "COMPLETE" | "FAILED",
  "filesModified": ["path/to/file.ts"],
  "verificationResult": "PASS" | "FAIL",
  "error": null | "[error details]"
}
```

### Step 4: Error Recovery

If implementation fails:

```
supervisor → debugger: {
  "error": "[error message]",
  "context": "[what was attempted]",
  "files": ["affected files"]
}
debugger → supervisor: {
  "rootCause": "[diagnosis]",
  "fix": "[recommended fix]",
  "files": ["files to modify"]
}
supervisor → prompt-writer: "Generate fix prompt based on debugger analysis"
supervisor → impl-agent: [fix prompt]
```

## Execution Patterns

### Pattern 1: Sequential Track

```yaml
Track B - Code Migration:
  execution: sequential
  work_packages:
    - WP-03: # Must complete before WP-04
        agent: backend-impl
        verify: [build, test]
    - WP-04: # Must complete before WP-05
        agent: backend-impl
        verify: [build, test]
```

### Pattern 2: Parallel Track

```yaml
Track A - Independent Tasks:
  execution: parallel
  work_packages:
    - WP-01:
        agent: backend-impl
        verify: [build]
    - WP-02: # Can run simultaneously with WP-01
        agent: frontend-impl
        verify: [build]
  sync_point: # Wait for all to complete
    verify: [full build, all tests]
```

### Pattern 3: Cross-Track Dependency

```yaml
Track C - Verification:
  execution: sequential
  depends_on: [Track A, Track B]
  work_packages:
    - WP-10:
        agent: tester
        verify: [full build]
```

## Quality Gates

Each work package must pass through quality gates:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Prompt    │───▶│   Impl      │───▶│  Verify     │───▶│   Log       │
│   Writer    │    │   Agent     │    │  (tester)   │    │ (recorder)  │
└─────────────┘    └─────────────┘    └──────┬──────┘    └─────────────┘
                                             │
                                    FAIL?    │    PASS?
                                      │      │      │
                                      ▼      │      ▼
                               ┌──────────┐  │  Continue
                               │ Debugger │──┘  to next WP
                               └──────────┘
```

## Error Recovery Protocol

### Level 1: Agent Self-Recovery
- Implementation agent attempts fix based on error message
- Retry limit: 1

### Level 2: Debugger Intervention
- Supervisor invokes debugger with full context
- Debugger provides root cause analysis
- New prompt generated with fix instructions

### Level 3: Supervisor Escalation
- If debugger cannot resolve, supervisor reports to orchestrator
- Orchestrator may: reassign, modify scope, or pause track

### Level 4: Orchestrator Decision
- Orchestrator evaluates cross-track impact
- May adjust dependencies or execution order
- Documents decision in work record

## Metrics Collection

Each supervisor collects:

```json
{
  "track": "Track B",
  "metrics": {
    "workPackagesTotal": 4,
    "workPackagesComplete": 4,
    "subAgentInvocations": 12,
    "promptsGenerated": 4,
    "debuggerInvocations": 1,
    "errorsEncountered": 1,
    "errorsResolved": 1,
    "filesModified": 5,
    "linesChanged": 120
  }
}
```

## Integration with Other Skills

This skill works with:
- `/commit` - After track completion
- `/review` - Before final commit
- `/debug` - Extended debugging if needed
- `/verification-before-completion` - Comprehensive verification

## Example Invocation

```markdown
/multi-agent-orchestration

## Plan: Feature Implementation

### Tracks
1. Track A - Backend (sequential)
2. Track B - Frontend (sequential, depends on A)
3. Track C - Testing (sequential, depends on B)

### Execution
[Orchestrator dispatches supervisors for each track]
[Supervisors coordinate their support teams]
[Work recorder maintains continuous log]
[Final report aggregated by orchestrator]
```
