---
name: multi-agent-orchestration
description: Coordinate complex development tasks using hierarchical agent teams with supervisors, prompt writers, debuggers, and work recorders. Encodes the TDD-with-agents protocol, premature-completion red flags, and cross-agent file-race avoidance.
---

# Multi-Agent Orchestration Skill

Coordinate complex development tasks using hierarchical agent teams with supervisors, prompt writers, debuggers, and work recorders.

## When to Use This Skill

Use this skill when:
- A task requires multiple specialized agents working together
- Work needs parallel execution across different tracks
- Continuous documentation of progress is required
- Error recovery and debugging support is needed

## Architecture

```
                    ┌─────────────────────────────────┐
                    │         ORCHESTRATOR            │
                    │     (Main Claude, Opus)         │
                    │                                 │
                    │  - Reads plan documents         │
                    │  - Dispatches supervisors       │
                    │  - Aggregates final results     │
                    │  - Makes escalation decisions   │
                    │  - Re-runs acceptance commands  │
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

The model assignments shown (haiku for prompt-writer and work-recorder, sonnet for impl-agent and debugger) are a sensible default that puts the cheaper, faster model on the bookkeeping roles and the stronger model on the reasoning roles. [CUSTOMIZE: adjust per your cost and capability budget.]

## Agent Dispatch Protocol

### Step 1: Supervisor Receives Track Assignment

```markdown
## Track Assignment: [TRACK_NAME]

### Owned Work Packages
- WP-XX: [description]
- WP-YY: [description]

### Support Team
- prompt-writer: Generate optimized prompts before each dispatch
- [impl-agent]: Execute work packages (backend-impl, frontend-impl, etc.)
- debugger: On-call for error diagnosis
- work-recorder: Continuous progress logging

### Dependencies
- Depends on: [list of prerequisite tracks/WPs]
- Blocks: [list of dependent tracks/WPs]

### Success Criteria
- [ ] All WPs complete
- [ ] Zero compilation errors
- [ ] Work record updated
- [ ] Orchestrator re-ran acceptance command and got exit 0
```

### Step 2: Pre-Dispatch Prompt Generation

Before dispatching any implementation agent (the example below uses a TypeScript toolchain for concreteness; the discipline is stack-agnostic, substitute your own type-check, codegen, and test commands):

```
supervisor -> prompt-writer: "Generate prompt for WP-XX"
prompt-writer -> supervisor: {
  "prompt": "[optimized, context-rich prompt]",
  "contextFiles": ["path/to/file1.ts", "path/to/file2.ts"],
  "planned_files": ["path/to/file1.ts", "path/to/file2.ts"],
  "verification": ["npx tsc --noEmit", "your codegen command"],
  "forbidden_actions": [
    "NO push", "NO work-record edit", "NO destructive ops",
    "NO unused imports: import only symbols the code actually references"
  ],
  "estimatedTokens": 800
}
```

`planned_files` is the declared set of files this agent will modify. The supervisor uses it for race detection (see Cross-Agent Race Avoidance below).

**Every tester and implementation (backend-impl / frontend-impl / any domain implementer) dispatch brief MUST explicitly forbid unused imports.** An agent that writes `import { A, B } from '...'` and references only `A` leaves dead code that a Boy Scout rule and a dead-code detector (for example `knip`) would flag, and on a strict workspace the unused import can fail lint and break the pre-push gate. Spell it out in the brief, do not assume the agent infers it: "import only symbols this code references; remove any import left unused after the edit." The orchestrator confirms by grepping the diff for imported-but-unreferenced symbols before accepting COMPLETE.

### Step 3: Implementation Dispatch

```
supervisor -> impl-agent: [prompt from prompt-writer]
impl-agent -> supervisor: {
  "status": "COMPLETE" | "FAILED",
  "filesModified": ["path/to/file.ts"],
  "commitSha": "8b1d4a2",
  "verificationResult": "PASS" | "FAIL",
  "verificationOutputVerbatim": "<stdout/stderr block>",
  "error": null | "[error details]"
}
```

`commitSha` and `verificationOutputVerbatim` are mandatory artifacts. Reports without them are rejected (see Red-Flag Matrix). [CUSTOMIZE: point this at your own AI-agent engineering rule file if you keep one under `.claude/rules/`.]

### Step 4: Error Recovery

If implementation fails:

```
supervisor -> debugger: {
  "error": "[error message]",
  "context": "[what was attempted]",
  "files": ["affected files"]
}
debugger -> supervisor: {
  "rootCause": "[diagnosis]",
  "fix": "[recommended fix]",
  "files": ["files to modify"]
}
supervisor -> prompt-writer: "Generate fix prompt based on debugger analysis"
supervisor -> impl-agent: [fix prompt]
```

### Step 5: Progress Logging

After each significant action:

```
supervisor -> work-recorder: {
  "event": "task_complete" | "decision" | "error_resolved",
  "workPackage": "WP-XX",
  "details": {
    "filesModified": [...],
    "commitSha": "8b1d4a2",
    "verification": "PASS",
    "duration": "estimated"
  }
}
```

## Execution Patterns

(The YAML examples below use TypeScript-flavored verification steps for illustration. Replace `tsc`, the codegen step, `build`, and the test runner with your stack's equivalents.)

### Pattern 1: Sequential Track

```yaml
Track B - Code Migration:
  execution: sequential
  work_packages:
    - WP-03: # Must complete before WP-04
        agent: backend-impl
        verify: [tsc, codegen]
    - WP-04: # Must complete before WP-05
        agent: backend-impl
        verify: [tsc, codegen]
    - WP-05:
        agent: backend-impl
        verify: [tsc, codegen, build]
```

### Pattern 2: Parallel Track (with planned_files declaration)

```yaml
Track A - Schema Cleanup:
  execution: parallel
  work_packages:
    - WP-01:
        agent: backend-impl
        verify: [codegen]
        planned_files:
          - apps/svc-orders/schema/order.schema
          - apps/svc-orders/src/domain/entities/order.entity.ts
    - WP-02: # Can run simultaneously with WP-01
        agent: backend-impl
        verify: [codegen]
        planned_files:
          - apps/svc-orders/schema/refund.schema
          - apps/svc-orders/src/domain/entities/refund.entity.ts
  sync_point: # Wait for all to complete
    verify: [tsc, build]
```

### Pattern 3: Cross-Track Dependency

```yaml
Track C - Verification:
  execution: sequential
  depends_on: [Track A, Track B]
  work_packages:
    - WP-10:
        agent: tester
        verify: [full_build]
    - WP-11:
        agent: tester
        verify: [integration_tests]
```

### Pattern 4: TDD-with-Agents (Red-Green-Refactor)

TDD is the single strongest pattern for agentic coding because each red-to-green cycle gives the agent unambiguous feedback (see the `/tdd-workflow` skill if you keep one). For orchestrated dispatch, Red-Green-Refactor becomes a verifiable protocol enforceable by the orchestrator via `git log` inspection.

```yaml
Track TDD - Feature with Tests First:
  execution: strict_sequential
  work_packages:
    - WP-T1:
        phase: RED
        agent: tester
        output_required:
          - file: "*.spec.ts"
          - commit_message_pattern: "test(scope): add failing test for <feature>"
          - test_output_verbatim: required
        verification:
          command: "<your test runner> run <path>"
          expected_exit: 1   # MUST fail
          reject_if: "test file missing OR test runner exits 0"
    - WP-T2:
        phase: GREEN
        agent: backend-impl   # or frontend-impl, or any domain implementer
        depends_on: [WP-T1]
        output_required:
          - commit_message_pattern: "feat(scope): implement <feature>"
          - test_output_verbatim: required
        verification:
          command: "<your test runner> run <path>"   # same command as WP-T1
          expected_exit: 0   # MUST pass now
    - WP-T3:
        phase: REFACTOR
        optional: true
        agent: backend-impl
        depends_on: [WP-T2]
        verification:
          command: "<your test runner> run <path>"
          expected_exit: 0   # still passing
  acceptance:
    command: "git log --oneline -3"
    pattern_required: "test(.*) .* feat(.*) .*"   # R then G visible in history
```

### TDD Dispatch Discipline (R-G-R verification protocol)

1. **Never let the impl agent write the test for its own code.** Dispatch tester first, in its own sub-agent context, with no knowledge of the planned implementation.
2. **Verify RED before dispatching GREEN.** Orchestrator runs the test command and confirms exit 1 with the expected assertion failure (not a syntax error, except for the very first test in a new file).
3. **The GREEN agent's acceptance command IS the test command.** Do not let the GREEN agent decide what "passing" means. Use the exact test-runner invocation.
4. **REFACTOR is optional but the test command MUST still pass.** If REFACTOR breaks the test, treat it as a regression and re-dispatch debugger plus impl.
5. **The R-G-R commits go into separate file-by-file commits.** The test file, the impl file, and any refactor are each their own commit. [CUSTOMIZE: align with your `.claude/rules/git-workflow.md` if you keep one.]

Reference: Anthropic's Claude Code best practices identify TDD as the highest-leverage agentic pattern (https://code.claude.com/docs/en/overview). RL-trained reasoning models are specifically good at code because code has built-in verifiable success conditions.

## Work Recorder Integration

The work-recorder agent maintains continuous documentation:

### Event Types

| Event | Trigger | Log Content |
|-------|---------|-------------|
| `track_start` | Supervisor begins track | Track name, WPs, team |
| `wp_start` | Work package begins | WP ID, assigned agent |
| `prompt_generated` | Prompt-writer completes | Target agent, token estimate, planned_files |
| `impl_complete` | Implementation done | Files modified, commit SHA, verification |
| `error_occurred` | Any failure | Error details, context |
| `error_resolved` | Debugger fix applied | Root cause, resolution |
| `wp_complete` | Work package done | Summary, metrics |
| `track_complete` | All WPs done | Aggregate metrics |

### Log Format

```markdown
## Track: [TRACK_NAME]

### WP-XX: [Title]
**Status:** COMPLETE
**Agent:** backend-impl
**Commit:** 8b1d4a2
**Duration:** [estimate]

**Files Modified:**
| File | Change |
|------|--------|
| path/to/file.ts | [description] |

**Verification:**
- [x] npx tsc --noEmit, PASS
- [x] <your codegen command>, PASS

**Issues Encountered:**
- [Issue description], RESOLVED via debugger

---
```

## Quality Gates

Each work package must pass through quality gates:

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Prompt    │--->│   Impl      │--->│  Verify     │--->│   Log       │
│   Writer    │    │   Agent     │    │  (tester)   │    │ (recorder)  │
└─────────────┘    └─────────────┘    └──────┬──────┘    └─────────────┘
                                             │
                                    FAIL?    │    PASS?
                                      │      │      │
                                      ▼      │      ▼
                               ┌──────────┐  │  Continue
                               │ Debugger │--┘  to next WP
                               └──────────┘
```

## Premature Completion Red Flags

Production teams report 15-25% of agentic coding tasks complete prematurely when no external loop forces verification (Alibaba Cloud, "From ReAct to Ralph Loop"). The orchestrator MUST reject any sub-agent report containing these patterns and re-dispatch with explicit "produce evidence" instructions.

### The Red-Flag Matrix

| Pattern in Report | Why It's a Lie | Required Orchestrator Action |
|---|---|---|
| "Should work" / "Looks good" / "I believe it works" | No verification ran | Reject; demand the verification command output |
| No commit SHA cited | Nothing was committed | Run `git log -1 --oneline`; if no relevant commit, reject |
| `git status` not clean at "complete" | Half-staged or unstaged work | Reject; demand clean tree or commit-and-report |
| "Tests pass" with no test output block | Test never ran OR result fabricated | Re-run the test command from orchestrator scope |
| New `import` from `@org/*` not in package.json | Possible hallucinated package | grep `package.json`; 19.7% of LLM package suggestions are fabricated (USENIX Security 2025) |
| Cited files not present on disk | Phantom files | `ls` the cited paths; reject if missing |
| Line numbers beyond file length | Imagined locations | Read file at offset; reject if out of range |
| "I noticed X also needs fixing, so I fixed it too" | Scope creep | Reject extra changes; re-dispatch with original scope only |
| New `any`, `@ts-ignore`, silent catch | Violates production-grade-code standard | grep diff for these; reject if present |

The package-name and type-suppression rows use TypeScript and npm conventions as concrete examples. Adapt the "hallucinated package" check to your package manager's manifest (for example `requirements.txt`, `go.mod`, `Cargo.toml`, `pom.xml`) and the type-suppression check to your language's escape hatches.

### File-Existence Artifact Requirement (the phantom-file guard)

Phantom files are a named failure mode: a sub-agent reports creating or editing a file that is not on disk, or quotes a line count that does not match reality. To close this, every sub-agent COMPLETE claim that asserts a file was created or modified MUST carry two verbatim artifacts per asserted path:

| Artifact | Command | Proves |
|---|---|---|
| Existence + metadata | `ls -la <path>` | The file is actually on disk (not a phantom), with size and mtime |
| Line count | `wc -l <path>` | The file has real content of the claimed shape, not an empty or truncated stub |

A report asserting a file change WITHOUT both artifacts for that path is narrative-only and is REJECTED on sight, same bar as a missing commit SHA.

**The orchestrator MUST re-run `ls -la <path>` and `wc -l <path>` ITSELF for every asserted path before trusting the report.** The agent's own pasted output is not sufficient: a fabricated report can fabricate the `ls`/`wc` block too. The orchestrator re-running the commands from its own scope is the deterministic check; if `ls` reports "No such file or directory", or `wc -l` disagrees materially with the agent's claim, the file is a phantom and the dispatch is FAILED.

### Detection Rule

Before accepting any sub-agent "COMPLETE" status, the orchestrator runs these deterministic checks ITSELF (never trusting the agent's pasted output):

1. **`git log -5 --oneline`**, does the expected commit appear?
2. **The agent's declared acceptance command**, does it exit 0?
3. **`git status --porcelain`**, is the tree clean (or only contains files for the next planned dispatch)?
4. **`ls -la <path>` and `wc -l <path>` for every asserted file path**, does each file exist on disk with the claimed shape? (phantom-file guard above)

If any check fails, the dispatch is failed. Invoke the debugger -> prompt-writer -> impl recovery chain (see Error Recovery Protocol below).

## Cross-Agent Race Avoidance Protocol

Parallel dispatch is permitted ONLY when the union of all `planned_files` across simultaneously-dispatched agents contains no duplicates. The orchestrator MUST verify this before launching the wave.

### Always-Serialize List

The following files are ALWAYS serialization points. Never dispatch two agents to modify them in parallel, even if the agents claim disjoint sections. The list below is a starting set of common "central registry" archetypes; [CUSTOMIZE: add any file in your project that is auto-loaded, globally imported, or guarded by a shared pre-commit hook]:

- `**/container.ts` (dependency-injection container; central registry)
- `**/index.ts` (barrel exports)
- `**/schema.*` (a shared, generated, or root schema file)
- `**/eslint.config.js` (or your linter config; lint-staged collapse risk)
- `**/package.json` (or your dependency manifest; lockfile races)
- `**/CLAUDE.md` and `.claude/rules/*.md` (auto-loaded context)
- `docs/workrecords/work-record-YYYY-MM-DD.md` (append-only journal; only work-recorder may write, and only via Edit append, never Write; each developer's journal is a separate Always-Serialize entry, never share a file across authors)

### planned_files declaration step

Every prompt-writer brief MUST include a `planned_files` array declaring the files the agent will modify. The supervisor computes the union across all parallel dispatches in the current wave. If the union contains duplicates, or if any file is on the Always-Serialize List and another in-flight agent also lists it, the supervisor serializes the conflicting dispatches.

### Lesson Learned: archetype-file collisions

Two safe parallel cases and one failure case make the rule concrete.

Safe case: two agents dispatched in parallel across disjoint service trees (one service's internal endpoints versus another service's internal endpoints). Result: both succeeded, no conflicts, roughly 40% wall-clock saving over sequential. The `planned_files` union had an empty intersection.

Failure case: two agents dispatched in parallel both targeted `container.ts` in different services with similar refactor intent. Result: the lint-staged hook ran against both pending changes concurrently, the lint cache invalidation collapsed mid-commit, and the orchestrator had to manually un-stage and re-serialize. The `planned_files` union contained `container.ts` in both services, but the orchestrator did not check.

Generalization: even when the file paths differ by service, refactors that touch the same archetype file (`container.ts` in any service) tend to invoke the same downstream hooks. Treat archetype filenames as a soft serialization signal and dispatch one-at-a-time when in doubt. Cognition's principle holds: "single-agent architectures with intelligent scaffolding are more robust" for tightly coupled work (https://cognition.ai/blog/dont-build-multi-agents).

## Error Recovery Protocol

### Level 1: Agent Self-Recovery
- Implementation agent attempts a fix based on the error message
- Retry limit: 1

### Level 2: Debugger Intervention
- Supervisor invokes debugger with full context
- Debugger provides root cause analysis (5-Whys, no edits)
- New prompt generated with fix instructions

### Level 3: Supervisor Escalation
- If the debugger cannot resolve, the supervisor reports to the orchestrator
- The orchestrator may: reassign, modify scope, or pause the track

### Level 4: Orchestrator Decision
- Orchestrator evaluates cross-track impact
- May adjust dependencies or execution order
- Documents the decision in the work record
- After 2 consecutive failures on the same WP, `/clear` and re-plan with a fresh sub-agent context

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
    "linesChanged": 120,
    "verificationsPassed": 8,
    "redFlagRejects": 0
  }
}
```

## Integration with Existing Skills

This skill works with the following (rename to match the skills you actually keep):
- `/commit`, after track completion
- `/review`, before final commit
- `/debug`, extended debugging if needed
- `/verify`, comprehensive verification
- `/tdd-workflow`, when a work package implements business logic (call this skill from within an orchestrated track using Pattern 4 above)
- `/verification-before-completion`, run before accepting any COMPLETE status from a sub-agent (mandatory per the Red-Flag Matrix)
- `/systematic-debugging`, invoked by the orchestrator when an agent reports failure OR when the orchestrator's verification command fails on accepted work

### Enforced By Rules

If you keep a `.claude/rules/` layer, point these at your own files. The skill describes HOW; the rules define MUST.

- An AI-agent engineering rule, encoding the dispatch protocol, the show-your-work rule, and the self-correction loop as a mandatory standard.
- A deterministic-review rule, applying the same evidence bar to any automated review board.
- A context-budget rule, keeping sub-agent prompts under a fixed size (for example 2 KB).
- A TDD-discipline rule, the two-commit minimum that Pattern 4 enforces.
- A git-workflow rule, the file-by-file commit discipline that makes commit SHAs a meaningful artifact.

## Example Invocation

```markdown
/multi-agent-orchestration

## Plan: Legacy Model Cleanup

### Tracks
1. Track A - Schema Cleanup (parallel)
2. Track B - Code Migration (sequential, depends on A)
3. Track C - Verification (sequential, depends on B)

### Execution
[Orchestrator dispatches supervisors for each track]
[Supervisors coordinate their support teams]
[Work recorder maintains continuous log]
[Final report aggregated by orchestrator]
```

---

## Interactive Live Testing Integration

When a task involves deployment verification or UI testing, use an interactive live-testing skill within the orchestration. The testing agent follows the **See, Decide, Act, Verify** loop:

1. Navigate to the page via a browser-driving tool (for example Playwright, headless, from the app directory)
2. Screenshot and READ the image
3. Decide the next action based on what is visible
4. If a bug is found, fix it, commit, rebuild, redeploy, and re-test
5. If working, screenshot the evidence and proceed

### Dispatching a Live Testing Track

```yaml
Track T - Live UI Testing:
  execution: sequential
  depends_on: [deployment tracks]
  agent: interactive-live-tester
  work_packages:
    - WP-T1: Setup (port-forwards or local server, verify health)
    - WP-T2: Login + navigate to feature pages
    - WP-T3: Seed data through UI (forms, dialogs)
    - WP-T4: Verify rendering (list, detail, empty, error states)
    - WP-T5: Check the data pipeline (DB state, message queue, projector logs)
    - WP-T6: Fix bugs found, rebuild, redeploy, retest
  artifacts:
    - <screenshot output dir>/*.png (screenshot evidence)
    - Work record narrative with findings
```

### Bug Fix Cycle Within Orchestration

When a live testing agent finds a bug:
1. **Do NOT escalate to orchestrator**, fix it inline
2. Commit with a descriptive message referencing the live test
3. Rebuild only the affected artifact (disable layer caching if a stale layer caused the bug)
4. Redeploy to your environment
5. Re-establish any port-forward or tunnel the deploy tore down
6. Re-test the same action
7. Log the bug in the work record findings table

### Common Infrastructure Commands

The commands below assume a container-orchestrator deployment for illustration. [CUSTOMIZE: replace with your own deploy, log, and database-inspection commands. Substitute your namespace, service name, port, and credentials wherever a placeholder appears.]

```bash
# Port-forwards (die on pod restart, re-establish after deploy)
kubectl port-forward -n <namespace> deploy/<service-a> <port>:<port> &
kubectl port-forward -n <namespace> deploy/<service-b> <port>:<port> &

# Quick rebuild cycle
docker build --no-cache -t <svc>:<tag> -f <Dockerfile> . && \
docker save <svc>:<tag> | <import into local cluster> && \
kubectl set image deployment/<svc> <svc>=<svc>:<tag> -n <namespace> && \
kubectl rollout status deployment/<svc> -n <namespace> --timeout=60s

# Database state check
kubectl exec -n <data-namespace> <db-pod> -- psql -U <db-user> -d <db-name> -c "<SQL>"

# Service logs
kubectl logs -n <namespace> deploy/<svc> --tail=10
```

### Gotchas Learned from Production Testing

These are real, transferable failure modes from live UI testing. The "Fix" column names the class of fix; adapt the specifics to your stack.

| Issue | Symptom | Root Cause | Fix |
|-------|---------|-----------|-----|
| Port-forward dead | Connection refused | Pod restarted after deploy | Kill the stale forward and re-establish it |
| Test driver not found | `Cannot find module` | Wrong working directory | Run from the app directory |
| Stale build cache | Old component rendering | Hot-reload did not pick up the change | Clear the build cache and restart the dev server |
| Route shadowing | Literal path resolves as "not found" | A parameterized route was matched before the literal one | Declare literal routes BEFORE parameterized catch-alls |
| Enum in DB query | "Invalid value for argument" | Passing a sentinel like "ALL" into an enum filter | Skip the filter for "ALL"/empty values |
| Auth token rejected | "Invalid token payload" | A claim in the token did not map to the field the service expected | Bridge the claim in the auth middleware |
| API response shape | Page crash | The client expects a flat object, the API wraps it in a key | Unwrap in the fetch function |
| Stale build artifact | A generated count is one behind | A recursive copy nested into an existing directory | Remove the target directory before copying |
| Wrong database | "Table does not exist" | Different DB name or password than expected | Check the connection string inside the container |

---

## Lessons Learned (running log)

### Parallel dispatch boundaries

- Two agents across two different service trees (one service's internal endpoints versus another's): parallel SUCCESS (roughly 40% wall-clock saving). The `planned_files` union had an empty intersection.
- Two agents across two services' `container.ts` refactors: parallel FAILURE (lint-staged collapse). The `planned_files` union contained `container.ts` in both services; the archetype-filename collision invoked shared lint hooks.
- Resolution: added the Always-Serialize List plus the `planned_files` declaration to the parallel dispatch protocol.

(Add future lessons as new agentic failure modes are discovered.)
