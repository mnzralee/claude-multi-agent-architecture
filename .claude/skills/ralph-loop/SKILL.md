---
name: ralph-loop
description: Endless-iteration discipline for long-arc goals. Bounded iterations with /clear between, persistent state, a 9-agent review-board escalation when stuck, brownfield-first audits, show-your-work artifact requirement, two-failure-clear trigger, archetype-filename serialization, cross-arc isolation, and measurable 10/10 acceptance gates. Use when work spans more than 3 hours or risks context degradation.
---

# Ralph-Loop Skill

> The engineering discipline for endless iteration toward a goal. **Bounded iteration with rigor**, not non-stop execution. Synthesized from a 9-agent review-board pattern, cluster-of-failures investigation, and execution-and-reversal experience on long-arc work.

---

## When to Use This Skill

Invoke `/ralph-loop` (or expect auto-surface) when:

- Multi-iteration goals (any goal requiring more than 3 distinct work packages)
- Long-arc execution (more than 3h wall-clock OR risk of context degradation)
- High-stakes work where mistakes or assumptions are costly (infrastructure mutations, deployment-environment operations, production-grade refactors)
- "Get to X/X" goals (10/10 production-ready, full module close, acceptance-gate sweep)
- When the user invokes `/multi-agent-orchestration` for a multi-day scope
- When the user says "non-stop", "marathon", "endless work", "complete everything"

**Do NOT use for**: single-work-package fixes, one-shot operations, anything under 1h. Use the lighter `/multi-agent-orchestration` skill for those.

---

## Core Philosophy: Bounded Iteration, Not Non-Stop Execution

The single most important reframe: **"non-stop autonomous marathon" framings are structurally unviable** per industry consensus.

Sources (the evidence base for this reframe):
- Anthropic, "Effective context engineering for AI agents" (2026): context degrades past 50% utilisation
- arxiv 2603.24755 "SlopCodeBench": empirical anti-pattern accumulation in long-horizon coding tasks
- Alibaba Cloud, "From ReAct to Ralph Loop" (2025): 15-25% premature-completion rate without external verification chain
- Stark Insider, "Claude Code Autonomous Coding Time Hack" (2026): the "Dumb Zone" past 100K-150K tokens
- Anthropic Claude Code best-practices: `/clear` cadence canonical
- m.academy, "Clear the context window in Claude Code"

The Ralph-Loop pattern reframes long-arc work as:

> **A chain of 12-15 bounded iterations of 60-120 min each, separated by `/clear` and persistent state.** Each iteration owns ONE work package with explicit FAIL_TO_PASS + PASS_TO_PASS acceptance commands. Between iterations, in-context memory is cleared; persistent state in `.claude/progress/current-module.json` carries the handoff.

This is NOT a productivity tax. The 60-120 min boundary is where Anthropic's prompt cache TTL (5 min) is exhausted by definition AND where context degradation begins to compound. The `/clear` is the architectural reset that prevents the 15-25% premature-completion rate.

**Reframe checklist** (do this before any "marathon" or "non-stop" claim):
1. Is the work measurable across iterations (commit SHAs, test outputs)? If no, halt.
2. Is each iteration under 120 min? If no, split.
3. Is persistent state captured? If no, author hand-off doc first.
4. Are infrastructure or deployment-environment mutations gated to typed user auth? If no, fix scope.
5. Is the "10/10" claim measurable as boolean AND of commands? If no, redefine.

---

## The 12-15 Iteration Architecture

Iteration boundary is **work-package-level**:
- NOT arc-day-level (too long; 8-12h per arc day exceeds the 120 min cap)
- NOT function-level (too granular; shatters narrative discipline)
- Work-package level: each iteration owns ONE coherent work package with clear acceptance

Duration:
- 60-120 min target
- 30 min hard floor (used for fast-fail gates like ownership verification)
- 150 min hard ceiling (over this, split into two iterations)

Per iteration:
- Commit (one per file or coherent atomic unit; per `git-workflow.md`)
- `/clear` orchestrator context
- Update persistent state
- Author hand-off document for next iteration

Total iteration count by arc class:
- 21h-class arc: 12-15 iterations
- 8h-class arc: 3-5 iterations
- Focused sub-arc: 1-2 iterations

---

## Iteration Class Taxonomy

Six classes, each with a different acceptance pattern and authorization requirement. The examples below assume an illustrative TypeScript / Node / Vitest stack for concreteness; the discipline is stack-agnostic, so substitute your own build, test, and deploy commands.

| Class | Description | Acceptance command | User auth |
|---|---|---|---|
| **WORKSTATION** | Code work package, no infrastructure or deployment-environment touch (data adapter, controller, use case, test) | `npx vitest run <glob>` exit 0 | No |
| **ENV-RO** | Read-only deployment-environment query (a state snapshot or read call against a running environment) | `<query command> | grep -q expected` OR `curl -X POST $ENDPOINT ...` | No |
| **ENV-MUT** | Deployment-environment mutation (a state-changing call, role grant, role revoke) | operation id + post-state read-back diff against pre-snapshot | YES (typed) |
| **MESH-MUT** | Cluster-wide mesh apply (`kubectl apply` of a network or routing policy) | `kubectl get <policy>` + smoke curl (200/403/handshake-fail) | YES (typed) |
| **IMG-DEPLOY** | Image build + push + rollout (`kubectl set image`) | `kubectl rollout status --timeout=60s` + health endpoint 200 | YES (typed) |
| **DOCS** | ADR + work record + runbook authoring | file-exists + grep-for-required-section | No |

The user-auth column is non-negotiable: blanket session-start approval equals INTENT, not blast-radius confirmation. Each destructive operation surfaces verbatim at dispatch moment.

---

## Section 5: Pre-Iteration Discipline (Brownfield-First)

**Critical lesson**: brownfield audits keep finding work mostly done. Session map encodes intent; disk encodes reality; **disk wins**.

The brownfield pattern fired three times in 24h on a long-arc run:
1. Data adapters mostly already there
2. A service was intentionally external-provider-only (its in-memory fallback was not a hazard)
3. At arc onset, the deployment-environment integration, role grants, and state snapshot were ALL already authored

Pre-iteration checklist (run every iteration, no exceptions):

1. **Read existing artifacts on disk BEFORE authoring new ones**: `ls`, `find`, `grep` the relevant tree
2. **Verify all assumptions via grep/query/kubectl (NOT inference)**: when an assumption surfaces, run a command to confirm
3. **Run pre-flight script**: `scripts/<arc>-pre-flight.sh` exits 0 only if substrate ready (container daemon, env files, ports, disk, memory, repo cleanliness, files present, hooks executable)
4. **Read most recent work record**: today's siblings give context the persistent state file does not capture
5. **Check cross-arc collision points**: latest concurrent push timestamp; conflicting file paths
6. **Verify acceptance command exists**: it must be declared upfront in the prompt-writer brief, not invented at completion time

### Brownfield-first extends to LIVE ENVIRONMENT STATE, not just disk

Disk is not the only substrate that encodes reality ahead of intent. On any iteration that may touch a live deployment environment (ENV-MUT, or an ENV-RO whose finding feeds a later mutation), the live environment state is a brownfield surface in exactly the same way the working tree is. A planning brief that lists resources to add or identifiers to register, drafted against a session map rather than the live environment, can collide with state that was ALREADY applied in a prior iteration or a prior arc; the mutation then fails on a duplicate-resource guard, and the iteration burns on a misframing the disk audit could never have surfaced.

The pattern that fired three times on the long-arc run (work mostly already done) has an environment analogue: at arc onset the integration was found already applied. The disk-side `ls`/`grep` audit cannot see this; only an environment-state snapshot can.

Therefore, at planning-open for any environment-touching iteration, capture a quick state snapshot BEFORE authoring the mutation plan, and diff the planned changes against what the environment already exposes:

```bash
# Live state inventory at planning-open (the environment-state brownfield audit)
<your snapshot command> > pre-state.snapshot
# Diff planned changes against already-applied ones; any intersection means
# the mutation would fail on a duplicate-resource guard. Migrate-first,
# do not re-apply.
```

The rule is symmetric with disk: **session map encodes intent; the live environment encodes reality; the environment wins.** An already-applied change is the environment equivalent of a file that already exists on disk; never re-author it, reconcile against it. This is the environment-state extension of the disk-first principle.

---

## Section 6: Per-Iteration TDD R-G-R (Two-Commit Minimum)

Per `.claude/rules/tdd-discipline.md`:

1. **Test commit first**: `test(scope): add failing test for <feature>`; must show at least one failure when run
2. **Impl commit next**: `feat(scope): <feature>` or `fix(scope): <feature>`; the test command MUST now exit 0
3. **Optional refactor commit**: tests still pass

The orchestrator verifies via `git log --oneline -3` showing: test, then impl, then optional refactor.

R-G-R is the highest-leverage agentic pattern per Anthropic Claude Code best practices: "each red-to-green cycle gives Claude unambiguous feedback". For agent dispatch, this becomes a strict protocol:
- Dispatch the `tester` agent to write the failing test first
- Verify the test fails (orchestrator runs the test runner and confirms exit 1)
- Dispatch the impl agent to make it pass
- Acceptance command equals the same test invocation returning exit 0

Exemptions from TDD per `tdd-discipline.md`:
- Prose / documentation
- Configuration
- Generated code
- Trivial dependency-injection wiring (1-line container additions)

---

## Section 7: Show-Your-Work Artifact Requirement

Per `.claude/rules/ai-agent-engineering.md`, every "complete" claim MUST include at least one of:

| Artifact Type | Format |
|---|---|
| Commit SHA | 7+ chars, must exist in `git log` |
| Test output | Verbatim block including PASS/FAIL, file path, test count |
| Type-check output | Verbatim type-checker result (empty equals pass) |
| Command result | Verbatim stdout/stderr, exit code |
| File diff stat | `git diff --stat` output |
| Screenshot path | Absolute path to a captured screenshot |

**Narrative-only reports are REJECTED.** The orchestrator MUST re-dispatch with explicit "produce evidence" instructions.

This follows the SWE-bench Verified methodology: success is measured by test-suite pass against held-out tests, not by self-assessment. The Aider model: conformance suites and reproducible test output are the success signal.

---

## Section 8: Premature-Completion Red-Flag Matrix (REJECT on Sight)

Production teams using Claude Code report 15-25% of agentic coding tasks complete prematurely when no external loop forces verification (Alibaba Cloud production data). The orchestrator MUST reject any sub-agent report containing these patterns and re-dispatch with explicit "produce evidence" instructions.

| Pattern in Report | Why It's a Lie | Required Orchestrator Action |
|---|---|---|
| "Should work" / "Looks good" / "I believe it works" | No verification ran | Reject; demand verification command output |
| No commit SHA cited | Nothing was committed | Run `git log -1 --oneline`; if no relevant commit, reject |
| `git status` not clean at "complete" | Half-staged or unstaged work | Reject; demand clean tree or commit-and-report |
| "Tests pass" with no test output block | Test never ran OR result fabricated | Re-run the test command from orchestrator scope |
| New `@org/*` or external import not in the manifest | Possible hallucinated package; 19.7% of LLM package suggestions are fabricated (USENIX Security 2025) | Grep the dependency manifest; reject if missing |
| Cited files not present on disk | Phantom files | `ls` the cited paths; reject if missing (arxiv 2501.19012 "Importing Phantoms") |
| Line numbers beyond file length | Imagined locations | Read file at offset; reject if out of range |
| "I noticed X also needs fixing, so I fixed it too" | Scope creep | Reject extra changes; re-dispatch with original scope only |
| New `any`, `@ts-ignore` (or your language's escape hatch), silent catch | Violates `production-grade-code.md` | grep diff for these; reject if present |
| Brief vocabulary drifted from actual schema | Agent followed brief without reading the schema; field names or enum values invented | Reject; agent must read the canonical source (the schema, the type definition, the value object) BEFORE coding |

### Detection rule (run after every "iteration complete" claim)

Three deterministic checks:

1. **`git log -5 --oneline`**: does the expected commit appear?
2. **The agent's declared acceptance command**: does it exit 0?
3. **`git status --porcelain`**: is the tree clean?

If any check fails, the dispatch is FAILED. Invoke the Self-Correction Loop.

---

## Section 9: Two-Failure to /clear Trigger

After 2 consecutive failures on the same work package, the orchestrator does NOT let the failing agent retry a third time. Instead:

```
Failure detected (1st time)
   |
   v
debugger sub-agent: 5-Whys root-cause analysis (no edits)
   |
   v
prompt-writer: generate fix prompt with root cause + acceptance criteria
   |
   v
impl agent: apply fix
   |
   v
re-run acceptance command
   |
   +-- PASS -> proceed
   |
   +-- FAIL (2nd consecutive failure) -> /clear orchestrator context AND re-plan with fresh sub-agent
```

Per Claude Code best practices: "if you've corrected Claude more than twice on the same issue in one session, the context is cluttered with failed approaches".

The Ralph-Loop pattern enforces this discipline by making `/clear` the iteration boundary anyway; even successful iterations end with `/clear`. The two-failure trigger just moves the `/clear` forward.

---

## Section 10: Archetype-Filename Serialization (ALWAYS-Serialize List)

The lint-staged collapse risk: even when path-strings differ across services, **archetype filenames invoke shared lint hooks at commit time**. The lint-staged hook runs against the FULL staged index, not just the changed paths. When agent A and agent B stage different `container.ts` files concurrently, the lint hook runs once on the union and any lint or formatter change cascades into BOTH commits.

This bit a real parallel orchestration during a multi-agent wave. The lesson (now codified in `.claude/rules/ai-agent-engineering.md`):

**ALWAYS-Serialize List** (single-writer-per-repo at commit step):

- `**/container.ts` (dependency-injection container; central registry)
- `**/index.ts` (barrel exports / boot)
- the root schema or migration definition for your ORM
- `**/eslint.config.js` (or your linter's config)
- `**/package.json` (or your dependency manifest; lockfile races)
- `**/CLAUDE.md` and `.claude/rules/*.md` (auto-loaded context)
- `docs/workrecords/work-record-YYYY-MM-DD.md` (append-only journal; only the work-recorder may write)
- `app.ts` (per service; route registration centre)

**Tool-chain serialization beyond planned_files**: disjoint `planned_files` is necessary but NOT sufficient for safe parallel dispatch. The commit-time tool-chain (pre-commit hooks, lint-staged, formatter, git hooks) operates on the entire staged index AND on the working tree at commit time. Parallel agents may dispatch in the same repo if and only if:

1. Their `planned_files` are disjoint (necessary), AND
2. The orchestrator serializes their commit calls (sufficient): one agent's `git commit` completes fully before the next agent's `git add + git commit` sequence begins

In practice, **same-repo agents are dispatched sequentially through the commit phase** even when their feature work was done in parallel. Authoring can parallelize; committing serializes.

---

## Section 11: Cross-Agent Race Avoidance Protocol

Per `.claude/rules/ai-agent-engineering.md`:

1. **planned_files declared upfront** in every prompt-writer brief (the declared file set the agent will modify)
2. **Orchestrator computes the union** of planned_files across all parallel dispatches in the current wave
3. **If the union has duplicates** OR **includes an ALWAYS-Serialize archetype**, serialize the conflicting dispatches
4. **Read-only research can parallelize**; Edit/Write require disjoint file sets
5. **DI containers, barrel exports, central type registries** are ALWAYS serialization points (the multi-file equivalent of a shared mutable variable)

Parallel dispatch is allowed ONLY when:
- **Disjoint file sets**: sub-agents touch non-overlapping files
- **Read-only research**: sub-agents only Read/Grep/WebSearch, never Edit/Write
- **Explicit serialization point**: a synthesis agent reconciles outputs before the next wave begins

Parallel dispatch is FORBIDDEN when:
- Two sub-agents would edit the same file
- One sub-agent's output is the next sub-agent's input (serialize them)
- The work is fundamentally sequential (TDD: write failing test, then implement, then refactor)

When in doubt, **serialize**. Cognition's principle (https://cognition.ai/blog/dont-build-multi-agents): "single-agent architectures with intelligent scaffolding are more robust" for tightly coupled work.

---

## Section 12: Review-Board Escalation When Stuck (9-Agent 3-Wave)

When work goes off the rails (3+ iterations failing OR scope ambiguity OR an infrastructure mutation pending OR a plan-amendment needed), invoke the canonical **Super Engineer Review Board**.

Canonical structure per `.claude/prompts/review-board.md`:

```
WAVE 1: GROUND TRUTH (4 parallel agents)
- Codebase Deep Explorer (Explore subagent, "very thorough")
- Industry Best Practices Researcher (general-purpose + WebSearch; cite every URL, recent sources only)
- Live Infrastructure Verifier (Explore + Bash; verbatim command outputs)
- Dependency & Risk Mapper (Plan subagent; 30+ risks, hidden assumptions, time estimates)

WAVE 2: THE BOARD (5 parallel agents; consume Wave 1 reports)
- Chief Architect (Opus): structural integrity, phase ordering, completeness
- Testing & Reliability Lead: selector audit, flakiness, assertions
- Security & Compliance Lead: credentials, data isolation, OWASP, audit trail
- DevOps & Infrastructure Lead: networking, rollout, resource conflicts
- Quality & Standards Lead: enterprise scorecard, industry gaps, what "great" looks like

WAVE 3: SYNTHESIS (orchestrator)
- Aggregate findings (dedupe, consensus-weight)
- Top 20 critical findings
- Refined plan
- GO / YELLOW / RED verdict
- Quality scorecard
```

**Fold-in cap**: only BLOCKING + CRITICAL findings amend the plan; MEDIUM/LOW become carry-forwards.

**Risk-tiered review board** (3-4 agents) is acceptable ONLY for low-blast-radius work. When in doubt, run the full 9-agent board. The cost of 9 dispatches is far less than the cost of recovering from a fundamental misframing.

When to invoke the review board:
- ExitPlanMode for any plan touching production (mandatory per CLAUDE.md)
- Before any refactor crossing 3+ services or 500+ LOC
- Before any infrastructure change (K8s manifests, container images, ingress)
- When two consecutive iterations fail on the same work package (signals a plan-level issue)
- When the user redirects scope significantly

Wave 1 agent dispatch must include `WebSearch` for the Industry Research agent (not training data alone). Wave 1 Agent 3 must run REAL commands (kubectl, curl, psql), not assumptions.

Wave 2 agents consume Wave 1 verbatim reports. Findings without `Evidence` are inadmissible.

Wave 3 synthesis dedups findings, resolves conflicts (the agent grounded in evidence wins), and refines the plan to incorporate BLOCKING + CRITICAL fixes only.

---

## Section 13: Investigation-Caveats-Are-Load-Bearing

When an investigation gives a recommendation AND a caveat, **the caveat constrains what the recommendation actually means**. The caveat that seemed parenthetical at planning often constrains the actual fix surface.

Examples of the pattern:

| Recommendation | Caveat | Discovered constraint |
|---|---|---|
| "Add the schema annotation" | "but don't enable the multi-schema preview feature" | The annotation requires the preview feature to even PARSE; the recommendation alone is infeasible |
| "Hot-fix the cluster policy breach" | "the mesh strict-reject needs a 24h soak" | A marathon ending at partial-accept means the strict-mesh axis is post-marathon |
| "Wire the data client into the billing service" | "it is intentionally external-provider-only in this environment" | The wiring would BREAK the intended configuration |

**Rule**: re-read investigation findings AT EXECUTION TIME, not just at planning time. Caveats are load-bearing.

Translation: if an expert says "do X, but don't do Y", and you discover that X structurally requires Y, then **you can't do X**. The discovery is information, not a workaround.

---

## Section 14: User-Typed-Auth Gating for Blast-Radius Operations

The discipline for high-blast-radius operations:

- **Cluster mutations**: typed confirmation at dispatch moment (NOT just blanket session-start approval)
- **Deployment-environment mutations**: explicit auth per operation (a state-changing call, role grants, secret rotation, etc.)
- **Multi-step destructive ops**: per-step auth
- **Blanket approval** (for example, "you have permission and access") equals INTENT, not blast-radius confirmation

An auto-mode classifier can enforce this; pre-empting is cleaner UX. Each destructive operation surfaces verbatim:

| Element | What to surface |
|---|---|
| Exact command | The literal kubectl/query/psql invocation |
| Scope | Resources affected (namespace, cluster, environment) |
| Rollback path | Specific rollback command + recovery time objective |
| Recovery if remediation fails | Worst-case recovery plan |

Example surfacing pattern (a live environment mutation):

```
About to execute a LIVE environment mutation.
Command: EXECUTE=1 <your deploy/apply command> --network <env>
Scope: adds 3 resources to [CUSTOMIZE: target identifier] on [CUSTOMIZE: environment name]
Rollback path: reverse-apply within a 2-min window OR snapshot rollback script
Recovery time objective: 5 min if executed within 2 min of the original change; 45-60 min if downstream contamination has begun
Type 'yes proceed with this mutation against the live <env>' to authorize.
```

---

## Section 15: Cross-Arc Isolation (Multiple Developers or Arcs Concurrent)

Per `.claude/rules/work-records.md` arc-isolation rule:

- Each arc owns a `# Arc N: <name>` heading in the dated work record
- Never edit another arc's siblings even on overlap
- Pre-iteration: `git fetch && git rebase origin/<dev-branch>` to absorb concurrent pushes
- Post-commit: `git pull --rebase origin <dev-branch>` before push
- Lock file convention (lightweight etiquette): `.claude/locks/<arc>-active.lock` with a heartbeat

Lock file schema:

```
arc-id: <e.g., Ralph-Loop-Arc-1>
started-at: <ISO timestamp>
expected-duration-hours: <int>
last-heartbeat: <ISO timestamp>
last-iteration: <iteration-id>
last-outcome: <SUCCESS|FAILED|ABORTED>
owner: <e.g., the developer or agent id>
```

Update the lock at every iteration boundary. Other arcs check the lock before starting overlapping work.

Conflict resolution: if pre-flight detects a collision in marathon-owned files, the orchestrator PAUSES, files a cross-arc-conflict note, and surfaces the verbatim conflicting hunks to the user with a resolution choice. It does NOT auto-resolve via `--theirs`/`--ours`.

---

## Section 16: 10/10 Definition Discipline (Measurable Acceptance Gates)

The user's "10/10 production-ready" claim must be measurable, not aspirational.

Per the Quality Lead findings from the review board:

- Each criterion equals a boolean test command exit code
- Gate equals the AND of all dimensions (any single red means not 10/10)
- Excluded items become an explicit DEFERRED list with reasoning
- Honest naming: "YELLOW-7 baseline" (7 of 10 OWASP green; 3 deferred) is more credible than an aspirational "10/10"

Canonical example: a multi-criterion engineering-shippable gate, where each criterion is a deterministic shell command exit code. The examples below assume an illustrative TypeScript / Playwright / curl stack; substitute your own:

```bash
# Each criterion is a deterministic shell command exit code.
npx playwright test e2e/main-flow.spec.ts --grep "lands on /home" --reporter=line  # Criterion 1
curl -sf -X POST $ENDPOINT/quote -d '{"name":"example"}' | jq -e '.tier and .amount'  # Criterion 2
# ... more criteria
# Marathon-shippable = all commands exit 0
```

Items explicitly NOT in 10/10 must be enumerated with reason:
- "Criterion 9 partial: mesh in partial-accept, NOT strict-mesh; activation post-marathon at T+24h per soak window"
- "Criterion 11 partial: observability stack deployed but dashboards may be empty until synthetic traffic generates"

What 10/10 explicitly does NOT include:
- External-dependency items (third-party verification provider, live payment keys, legal incorporation)
- Post-marathon scope (later-milestone cluster items, production promotion)
- Items deferred to a later milestone per a documented ADR

Counting any of these toward 10/10 is **architecturally dishonest**.

---

## Section 17: Work-Record Continuous Append (Storytelling Journal)

Per `.claude/rules/work-records.md`:

- **Append continuously, not batched at session end**
- Storytelling voice (first-person singular "I", never "we")
- Each sibling answers **7 mandatory narrative prompts**:
  1. **What surprised**: one specific surprise (a constraint, behavior, test-failure shape)
  2. **What pattern emerged**: a cross-iteration pattern observation
  3. **What carry-forwards added**: a numbered list, one line each
  4. **What was deferred and why**: an explicit defer list with reason
  5. **Cross-arc isolation status**: the other arc's latest push SHA; collision risk
  6. **Reversibility log**: did the rollback path get exercised? If no, declare "rollback path not exercised" explicitly
  7. **One named insight**: Insight #N, continuing the running counter

Trigger: when you have roughly 10 min of fresh decisions, append. The richest narrative comes from writing while the reasoning is still fresh.

**Mid-iteration sibling records are MANDATORY, not optional.** A sibling work-record MUST be appended at each major milestone WITHIN an iteration, not batched at iteration close. Batching at iteration close (or worse, at `/clear`) loses the reasoning chain the milestone produced: the `/clear` that ends the iteration discards the in-context narrative, and a single end-of-iteration dump flattens several distinct decisions into one lossy paragraph. The mid-iteration sibling captures each milestone while its reasoning is still in context. Dispatch the work-recorder sibling (or append directly) immediately on each trigger below; do not defer to the iteration boundary.

Mid-iteration update triggers (each one fires a sibling append, in-iteration):
- A research phase completes and changes your understanding
- A design decision is made after weighing alternatives
- An unexpected bug or constraint is discovered
- An agent or track completes a major work package
- The user provides feedback that shifts approach
- A reversal commit lands (capture the honest narrative)

Voice: like a senior engineer explaining their day to a colleague over coffee. Technical, insightful, memorable. NOT a changelog.

---

## Section 18: Hand-Off Document Template (Per Iteration Close)

Template for `.claude/plans/handoff-iter-N-to-N+1.md`:

```markdown
# Hand-off: Iteration N to Iteration N+1

> **Closed**: <iso-timestamp UTC>
> **Closing iteration label**: <e.g., RL-ITER-5 = environment mutation execution>
> **Opening iteration label**: <e.g., RL-ITER-6 = billing webhook wiring>
> **Marathon elapsed**: <hh:mm of total budget>
> **Orchestrator**: <agent name or "manual">

---

## 1. Closing iteration commits + acceptance verification

| # | Repo | Commit SHA | Subject | Acceptance command output |
|---|---|---|---|---|

**Pre-push gate state at iteration close**:
- type-check: green / red (verbatim last line)
- lint: green / red
- test: <count> pass / <count> fail
- em-dash check: green / red
- git status: clean / NOT-clean

## 2. Failed approaches + 5-Whys root cause

| # | What was tried | Why it failed | 5-Whys root cause | What replaced it |
|---|---|---|---|---|

(If no failures: state "no failed approaches; iteration succeeded first try" explicitly.)

## 3. Open work packages for next iteration

| # | WP | Scope (1 sentence) | Files (planned_files declared upfront) | Acceptance command |
|---|---|---|---|---|

## 4. Persistent state file pointers

| Artifact | Path |
|---|---|
| Marathon STATUS | `.claude/progress/current-module.json` |
| Work record | `docs/workrecords/work-record-YYYY-MM-DD.md` |
| Carry-forward register | `.claude/plans/roadmap-findings-register.md` |
| 10/10 gate worksheet | `.claude/plans/10-CRITERION-GATE.md` |

## 5. Cross-arc collision check

| Check | Latest known state |
|---|---|
| Other arc's infra-ops HEAD | <sha7> "subject" |
| Other arc's parent repo HEAD | <sha7> "subject" |
| Same-file collision risk | <specific paths or "none"> |
| Submodule pointer drift | <output> |

## 6. Next-iteration prompt brief (for prompt-writer)

> Task scope (one imperative sentence): <e.g., "Wire the payment port to the billing webhook route">
> Specific file paths verified to exist (up to 10): <list>
> Acceptance criteria as commands: <list>
> Forbidden actions: NO push, NO work-record edit, NO destructive ops
> Output contract: commit SHA + verbatim acceptance command stdout

```

Length cap: under 250 lines. Deleted after the next iteration absorbs it.

---

## Section 19: File-By-File Commit Discipline

Per `.claude/rules/git-workflow.md`:

- Conventional `type(scope): subject` format
  - Types: `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `security`
  - Scopes: per service or module (`auth`, `billing`, `wallet`, `infra`, etc.)
- Subject under 72 characters
- **No AI attribution ever** (no "Co-Authored-By: Claude" or similar)
- Formal voice, imperative mood ("add" not "added")
- One file per commit (unless changes form a coherent atomic unit)
- Body explains WHY, not WHAT

Bad commit pattern (REJECT):
```
git add .
git commit -m "fix: various fixes"
```

Good commit pattern:
```
git add src/application/dto/request/index.ts
git commit -m "fix(account): remove deprecated value from DTO enum"

git add src/application/use-cases/documents/index.ts
git commit -m "fix(account): update switch statement for new document handling"

git add src/infrastructure/repositories/document.repository.ts
git commit -m "refactor(account): simplify document type mapping"
```

Each commit should be atomic and self-explanatory. The chain of commits should be a narrative of the day's work; no commit should be a "various fixes" black box.

---

## Section 20: Pre-Push Gate Discipline (HARD-FAIL Pattern)

Per Industry Research and pre-push gate discipline:

- 7-gate (build + type-check + lint + unit + integration + scanners + em-dash sweep)
- All GREEN before push
- **HARD-FAIL on a missing precondition** (database up), do not auto-boot
- Per-iteration push for code work-package iterations; SKIP the gate via `--no-verify` only for infrastructure-mutation iterations (the gate verifies code, not environment state)
- Each `--no-verify` must be logged in persistent state

Pre-push gates catch **architectural framing errors at the cheapest layer**. A real insight from a long-arc run:

> Pre-push gate 2 (the type-checker) caught `Property 'DATABASE_URL' does not exist on type '...'`. The billing service's env config genuinely does NOT expose DATABASE_URL because the service is intentionally external-provider-only per the investigation. My framing as a "completeness gap" was structurally wrong; the in-memory fallback in the container is the intentional design.

The pre-push gate's type-check found this within seconds; the alternative was 30+ minutes debugging at deploy time. The 7-gate is not just a quality bar; it is a **structural-soundness oracle**.

---

## Section 21: "What Great Looks Like" Checklist

Borrowed from the review-board Quality Lead:

| Item | Description | Marathon scope | Post-marathon scope |
|---|---|---|---|
| Pre-flight script per iteration | Idempotent, exit 0 on green, validates environment | YES, mandatory per iteration | Production: scheduled timer unit |
| Migration apply uses a dedicated CI/CD role | Not the human developer; separate from runtime role | OPTIONAL (per documented deferral) | Production: two-role pattern per CIS database benchmark |
| Per-migration rollback SQL | Reverse-migration diff committed alongside | OPTIONAL during marathon | YES post-marathon |
| Boot probes report to centralized observability | OTel span + metric on probe latency | PARTIAL (structured log only) | YES with OTel SDK |
| Test data seeded via factories | Not hardcoded fixtures with embedded secrets | YES, mandatory | Production: factory pattern + contract tests |
| Schema-per-service explicit search path | `SET search_path TO <schema>` in code (defense in depth) | OPTIONAL (URL parameter sufficient in a dev environment) | Production: explicit |
| Pre-push gate parallel execution | Build-cache invalidation isolated per workspace | YES (existing build config) | Production: CI matrix |
| Observability dashboards exist BEFORE deployment | Dashboards-as-code committed pre-deploy | YES (manifests in repo) | Production: GitOps |

---

## Section 22: Investigation Patterns (What to Verify Before Acting)

**The investigation reframe rule**: when an initial finding gives a recommendation, verify that the recommendation matches the actual access pattern.

Case study: a morning audit reported "the signer needs the admin role" for a live environment mutation. The review-board Risk Mapper found the actual gate is an ownership check (`msg.sender == contractOwner` in the access library), NOT a role grant. The morning audit's framing would have led to: grant the role, attempt the mutation, get a revert at the ownership check.

**Pre-mutation investigation checklist** (run before any cluster or environment mutation iteration):

1. **Read the actual gate code** (not the assumption). For an access library: the relevant guard function. For a mesh: the policy CRD's access field. For a database role: the role-privilege table.
2. **Verify the actor's current capability**. For an environment: read the current owner and match against the signer. For a cluster: `kubectl auth can-i <verb> <resource> --as=<sa>`.
3. **Capture a pre-state snapshot**. Environment: your snapshot script. Cluster: `kubectl get <resource> -o yaml > pre-state.yaml`.
4. **Identify all rollback paths**. Within a 2-min window? Within 60s? Catastrophic? Estimate the recovery time objective.
5. **Surface verbatim to the user** with the 4 above bound to specific commands.

This pre-mutation investigation is the **single highest-value 30 minutes** in any long-arc work. It catches structural misframings that would otherwise burn 6-12h of downstream work.

---

## Section 23: Cost-Benefit Synthesis (When the Marathon Is Worth It)

Long-arc work is expensive in time AND in context budget. Use this checklist before committing to a Ralph-Loop marathon:

| Question | If yes, marathon | If no, focused sub-arc |
|---|---|---|
| Is the goal time-sensitive? | YES | Defer to next session |
| Is 80% of the work already authored? | YES | Author iteration cycles first |
| Are the cluster mutations gated to typed auth (NOT auto-execute)? | YES | Re-scope |
| Do you have user availability throughout the window for typed-auth gates? | YES | Defer |
| Is the substrate verified healthy (cluster, environment, repos)? | YES | Run pre-flight first |
| Is the 10/10 definition measurable as boolean AND of commands? | YES | Redefine acceptance |
| Are carry-forwards triaged into "in-marathon" vs "post-marathon"? | YES | Triage first |
| Is the other arc holder frozen during the window? | YES OR coordinated | Defer |

If ANY answer is no, defer the marathon to a smaller focused arc. The cost of a premature marathon is 5-10x the cost of waiting one session.

---

## Section 24: Related Skills, Rules, Memories

### Skills (invoke as needed during Ralph-Loop iterations)

- `/multi-agent-orchestration`: the hierarchical dispatch protocol; this skill builds on it
- `/tdd-workflow`: the R-G-R two-commit pattern enforced per code work package
- `/commit`: file-by-file commit discipline
- `/work-recording`: storytelling journal pattern
- `/verification-before-completion`: comprehensive validation checklist
- `/systematic-debugging`: 5-Whys root-cause analysis
- `/interactive-live-testing`: a See-Decide-Act-Verify browser-driven loop
- `/debug`: escalation when stuck
- `/review`: code review
- `/verify`: verify a change works
- `/run`: launch and drive the app to verify

### Rules (auto-load; enforce per iteration)

- `.claude/rules/ai-agent-engineering.md`: dispatch protocol, race avoidance, premature-completion red flags
- `.claude/rules/tdd-discipline.md`: two-commit minimum
- `.claude/rules/anti-entropy.md`: Boy Scout rule, dead-code elimination
- `.claude/rules/deterministic-review.md`: evidence bar for the review board
- `.claude/rules/context-budget.md`: Ralph Loop + sub-agent prompt size
- `.claude/rules/work-records.md`: append-only, arc-isolation
- `.claude/rules/git-workflow.md`: file-by-file commits, no AI attribution
- `.claude/rules/production-grade-code.md`: no `any`, no escape hatches, no silent fallbacks
- `.claude/rules/security-standards.md`: secrets never in source, OWASP coverage
- `.claude/rules/complexity-limits.md`: function-size, file-size caps

### Memories (load at session start; cite when applying)

- `feedback_super_engineer_review_board_full`: the canonical 9-agent 3-wave board
- `feedback_velocity_methodology_pivot`: BLOCKING + CRITICAL fold-in only
- `feedback_brownfield_first_plans`: disk encodes reality
- `feedback_canonical_source_not_fallback`: refactor to use the canonical source unconditionally
- `feedback_explicit_blast_radius_confirm`: typed user auth at dispatch moment
- `feedback_work_record_storytelling`: narrative journal voice
- `feedback_always_run_work_recording_in_parallel`: continuous append
- `feedback_no_premature_end_of_day`: the user closes the day, not the orchestrator
- `feedback_pre_push_clean_gate`: push-when-green-only
- `feedback_no_em_dashes`: language-specification enforcement
- `feedback_arc_session_numbering`: arc-day identity
- `feedback_classifier_blocks_secrets_path_writes`: don't bypass the auto-mode classifier

---

## Section 25: Quickstart Workflow

For a fresh long-arc invocation:

```
1. PLAN MODE
   - Brownfield audit (ls + grep + query + kubectl)
   - Draft plan in plan file
   - Run the canonical 9-agent review board if production-touching
   - Wave 1 ground truth (4 agents parallel)
   - Wave 2 board (5 agents parallel)
   - Wave 3 synthesis + verdict
   - ExitPlanMode for user approval

2. ITERATION LOOP (per work package)
   - Pre-flight script exits 0
   - prompt-writer dispatches the brief (planned_files declared)
   - impl agent executes (TDD R-G-R if new behavior)
   - Show-Your-Work artifact returned (commit SHA + verbatim output)
   - Orchestrator re-runs acceptance command (verify exit 0)
   - work-recorder appends a Sibling
   - git commit file-by-file with a conventional subject
   - git push (or batch per iteration group)
   - /clear orchestrator context
   - Update persistent state
   - Author hand-off doc
   - Next iteration absorbs the hand-off

3. STUCK PROTOCOL
   - 1 failure on a work package: debugger + prompt-writer + impl chain
   - 2 consecutive failures: /clear + re-plan with a fresh agent
   - 3+ failures OR scope ambiguity: invoke the canonical 9-agent review board

4. CLOSE PROTOCOL
   - All iterations complete (or honestly deferred)
   - Final acceptance gate (multi-criterion or equivalent)
   - Independent review-board Wave 4 verification (5 agents re-run criteria)
   - User typed acceptance per criterion
   - Final work-record close + commits + push
   - ADRs amended with as-built state
   - Carry-forwards triaged
```

---

## Section 26: Sources and Citations

All claims in this skill cite at least one source per `.claude/rules/deterministic-review.md` "deterministic evidence" rule.

**Primary sources (industry consensus)**:
- Anthropic, "Effective context engineering for AI agents" (2026): https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, "Building Effective AI Agents" (2024-12-19): https://www.anthropic.com/research/building-effective-agents
- Anthropic, "How we built our multi-agent research system": https://www.anthropic.com/engineering/multi-agent-research-system
- Anthropic, "Best practices for Claude Code": https://code.claude.com/docs/en/best-practices
- Cognition (Walden Yan), "Don't Build Multi-Agents": https://cognition.ai/blog/dont-build-multi-agents
- Alibaba Cloud, "From ReAct to Ralph Loop" (2025): https://www.alibabacloud.com/blog/602799
- Stark Insider, "Claude Code Autonomous Coding Time Hack" (2026): https://www.starkinsider.com/2026/05/claude-code-autonomous-coding-time-hack.html
- Thomas Wiegold, "The Ralph Loop": https://thomas-wiegold.com/blog/ralph-loop-how-recursive-ai-agents-work/
- Karpathy on context engineering: https://x.com/karpathy/status/1937902205765607626
- OpenAI, "Introducing SWE-bench Verified": https://openai.com/index/introducing-swe-bench-verified/
- m.academy, "Clear the context window in Claude Code": https://m.academy/lessons/clear-context-window-claude-code/

**Academic sources**:
- Spracklen et al., "We Have a Package for You! Package Hallucinations" (USENIX Security 2025): https://www.usenix.org/system/files/conference/usenixsecurity25/sec25cycle1-prepub-742-spracklen.pdf
- "Importing Phantoms: Measuring LLM Package Hallucination Vulnerabilities" (arxiv 2501.19012): https://arxiv.org/html/2501.19012v1
- "Boosting LLM Reasoning via Spontaneous Self-Correction" (arxiv 2506.06923): https://arxiv.org/pdf/2506.06923
- SlopCodeBench (arxiv 2603.24755): https://arxiv.org/pdf/2603.24755

**Tooling and patterns**:
- Aider documentation, "Repository map": https://aider.chat/docs/repomap.html
- Simon Willison, "2025: The year in LLMs": https://simonwillison.net/2025/Dec/31/the-year-in-llms/
- Galileo, "7 AI Agent Failure Modes": https://galileo.ai/blog/agent-failure-modes-guide
- GitHub, "Best practices for using Copilot coding agent": https://docs.github.com/copilot/how-tos/agents/copilot-coding-agent/best-practices-for-using-copilot-to-work-on-tasks
- Linkerd Server policy: https://linkerd.io/2/features/server-policy/
- Buoyant, mesh ramp documentation (cited via Linkerd docs)

---

## Final Note

This skill is a distillation, not a constraint. The point is to internalize the patterns so well that they become reflexive: brownfield-first, planned_files declared, acceptance commands as truth, /clear between iterations, narrative work record, file-by-file commits, no AI attribution, hard pre-push gates, typed user auth for blast-radius operations, caveats are load-bearing, 10/10 measurable not aspirational, scope reduction with documented reasoning is not failure.

When in doubt, re-read this skill. When stuck, invoke the canonical 9-agent review board. When tempted to claim "complete" without artifacts, run the acceptance command. When tempted to declare 10/10, count the green boolean exits.

The goal is not perfection. The goal is **discipline that prevents the 15-25% premature-completion rate** that production teams report when no external verification chain exists. This skill is that external chain.
