# Software Engineering Review Board (SERB)

> **When to use**: after Claude proposes a plan, before you approve execution. In plan mode, choose "tell Claude what to change" and paste everything below the line. The board studies the actual codebase, researches current best practices, verifies live state, and refines the plan to a high bar before any code is written. Invocable as a skill too: `/review-board`.

This is a reusable, project-agnostic orchestration prompt. It runs a rigorous, multi-wave review: gather ground truth first, then critique from multiple specialist lenses, then synthesize into a refined, executable plan with a go/no-go. Every reviewer is read-only (single-writer, many-readers); the board advises, it does not implement.

---

Do not execute this plan yet. Use high reasoning effort. Run the Software Engineering Review Board: a multi-wave review that deeply studies the codebase, researches current best practices, verifies the live state of anything the plan touches, and refines the plan to a strong, executable standard before I approve it. The plan you just presented is the input. Review it as follows.

## WAVE 1: Discovery (4 parallel agents, read-only)

Their job is NOT to critique yet. It is to gather verified ground truth so the board operates on facts, not assumptions. Run all four in parallel.

### Agent 1: Codebase Deep Explorer
```
Read-only (researcher / Explore, "very thorough").

Build a ground-truth map of everything the plan touches. Do NOT assume file
contents, selectors, endpoints, or configs; FIND them in the source.

1. Find and read every file the plan references or implies.
2. For UI work: grep the actual component names, selectors, form fields, and
   route paths in the frontend source. Confirm which components actually render.
3. For backend work: verify actual endpoint paths, middleware chains, service
   dependencies, and data models.
4. For infra work: check the actual manifests, container files, env/config, and
   service ports.
5. Read recent git log (about 20 commits) for context, and the latest work record.
6. Read every .claude/rules/*.md so the board reviews against the project's own rules.
7. Check for existing similar work the plan might duplicate or should build on.

Output "Ground Truth Report": actual paths, selectors, endpoints; discrepancies
versus the plan's assumptions; existing patterns to follow.
```

### Agent 2: Best-Practices Researcher
```
Read-only. Use WebSearch; do not rely on training data alone (if web access is
unavailable, say so and reason from the official docs you can reach).

For every major technology or pattern in the plan, find:
1. Current best practices for that technology.
2. Common mistakes and pitfalls.
3. The enterprise/standard approach for that pattern.
4. Official docs for the specific versions this project uses.
5. Known issues or breaking changes for those versions.

Output "Industry Standards Report": best practice per area with source URLs,
anti-patterns to avoid, recommended tools, version-specific gotchas.
```

### Agent 3: Live-State Verifier
```
Read-only, but actually CHECK the live state with real, non-mutating commands
appropriate to the stack. Do not assume. (Examples, adapt to your project:
which ports are listening, which services/containers are up, current build/image
tags, health endpoints returning 200, disk space, required env and fixture files
present, git status clean or dirty, dependencies installed.)

Output "Live-State Report": every relevant component UP / DOWN / STALE, resource
availability, config verification, and definite blockers.
```

### Agent 4: Dependency & Risk Mapper
```
Read-only (Plan). Map every dependency chain, find every hidden assumption, and
think like a pessimist: what WILL go wrong?

1. Phase dependency graph: correct ordering? Anything wrongly parallelized?
2. Component/service dependency graph: the full call chain per operation.
3. Data-flow trace: the exact end-to-end path for each operation.
4. Failure modes: top 3 per phase, blast radius, recovery.
5. Hidden assumptions: every assumption the plan makes without verifying.
6. Time estimate reality check: optimistic / realistic / pessimistic.
7. Rollback strategy: the undo path per phase, and any point of no return.

Output "Risk & Dependency Report": dependency graph, risk matrix
(risk | probability | impact | mitigation), hidden-assumptions list, revised
time estimates, rollback plan per phase.
```

## WAVE 2: The Review Board (5 parallel specialists, read-only)

Wave 1 MUST complete first. Feed every Wave 2 agent the original plan PLUS all four Wave 1 reports. Each reports findings as CRITICAL / HIGH / MEDIUM / LOW with concrete `file:line` evidence and a proposed fix.

### Agent 5: Chief Architect (frontier model)
```
Senior distributed-systems architect. Review structural integrity, phase ordering
versus the dependency graph, completeness versus ground truth, alignment with
.claude/rules/, and rollback safety. Apply the depth-first impact analysis: does
the plan trace cross-layer ripples, or decide from the surface?

Output: severity-tagged findings plus a revised phase order if needed.
```

### Agent 6: Testing & Reliability Lead (balanced model)
```
Principal test engineer. Review the test strategy against the testing pyramid:
selector/contract audit (VERIFIED / LIKELY / BROKEN / UNKNOWN per assertion
versus ground truth), timing analysis (replace every hardcoded wait with an
event-based alternative), a flakiness score 1-5 per step, assertion gaps, and
test-data management. Cross-reference Wave 1's best-practice research.

Output: assertion/selector audit table, timing issues with fixes, flakiness
scorecard, missing assertions, gaps versus industry practice.
```

### Agent 7: Security & Compliance Lead (frontier model)
```
Senior security architect. Review credential exposure in every file the plan
touches, data isolation (test versus production), artifact security (do logs,
screenshots, traces, or dumps leak sensitive data? are they gitignored?),
untrusted-content exposure, OWASP relevance, and audit-trail completeness.

Output: critical security issues, a credential audit table, data-isolation
analysis, compliance gaps, and a security checklist for every future run.
```

### Agent 8: DevOps & Infrastructure Lead (balanced model)
```
Principal DevOps engineer. Cross-reference the plan against the actual infra
state from Wave 1: networking and routing reliability, build/deploy strategy,
image/artifact management, health-check sequencing, and resource conflicts.
Write the actual startup and cleanup scripts if the plan needs them.

Output: infrastructure gaps (plan assumes X, reality is Y), networking concerns,
build/deploy issues, startup script, cleanup script.
```

### Agent 9: Quality & Standards Lead (frontier model)
```
Distinguished quality engineer. Score the plan on an enterprise scorecard, 1 to
10 each (naming, independence, retry/idempotency, reporting, CI/CD readiness,
observability, assertion density, coverage, edge cases, compliance). Compare with
Wave 1's research for industry gaps. Assess plan quality: are time estimates
realistic and success criteria measurable? Describe what "great" looks like here.

Output: enterprise scorecard table, industry-gap analysis, plan-quality
assessment, concrete improvements ordered by impact.
```

## WAVE 3: Synthesis & Refinement

After all Wave 2 agents return, use high reasoning effort and:

### 1. Deduplicate and rank
Merge all findings into one table. Remove duplicates. Mark consensus (how many agents flagged each issue). Final severity: CRITICAL > HIGH > MEDIUM > LOW.

### 2. Resolve conflicts
Where agents disagree, reason about who is right based on Wave 1 ground truth, and document the reasoning.

### 3. Deliver these outputs

**A. Aggregate findings table** | # | Finding | Severity | Flagged by | Fix |

**B. Top critical findings** (ordered by impact, consensus-weighted).

**C. Refined plan**: the improved plan with all critical and high fixes applied:
- corrected phase order, missing steps added, broken assumptions replaced with verified alternatives;
- concrete commands (not pseudocode) with real paths and verified references from ground truth;
- realistic time estimates (optimistic / realistic / pessimistic);
- measurable success criteria; a rollback plan per phase; health-check gates between phases.

**D. Go / No-Go**: GREEN (execute as refined), YELLOW (apply the listed fixes first, then execute), or RED (fundamental issues, replan).

**E. Quality scorecard** | Metric | Current | After fixes | Target |

## RULES

1. Wave 1 completes BEFORE Wave 2 launches; Wave 2 needs the ground truth.
2. Within each wave, run all agents in parallel.
3. Every agent reads actual files, not just the plan summary.
4. Best-practice research is required (Wave 1 Agent 2): use WebSearch, not training data alone.
5. Live-state checks are required (Wave 1 Agent 3): run real, non-mutating commands.
6. The refined plan must be executable: real commands, verified paths, verified references.
7. Every reviewer is read-only. The board does not implement; exactly one agent implements the approved plan afterward.
8. Do not execute the plan. Return the full review plus the refined plan. I decide when to go.
