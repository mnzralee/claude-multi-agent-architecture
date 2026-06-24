# AI Agent Engineering Standards

## Overview

AI coding agents (Claude Code sub-agents, in this kit's case) are deterministic only when the prompt is deterministic and the verification chain is deterministic. Everything else is luck. This rule encodes the dispatch, self-correction, and verification protocols that turn agent output from "looks right" into "verifiably right".

It is the engineering-of-agents analogue to `.claude/rules/deterministic-review.md` (which governs review quality) and `.claude/rules/context-budget.md` (which governs context spend). Where those rules govern review and resource, this rule governs *production*.

This rule assumes a representative TypeScript / Node toolchain (Vitest, `tsc`) in its examples for concreteness, but the discipline is stack-agnostic: substitute your own test runner, type-checker, and package manager commands and the protocol is unchanged.

---

## Core Principle

> Agents prove their work with artifacts. They do not narrate completion.

Every claim a sub-agent makes ("implemented", "fixed", "tested") MUST be backed by a verifiable artifact: a commit SHA, verbatim test output, a passing type-check, a curl response, a screenshot. Narrative without artifact is rejected.

This is the same bar industry-leading reasoning models meet on SWE-bench Verified, where success is measured by test-suite pass against held-out tests, not by self-assessment ([OpenAI, "Introducing SWE-bench Verified"](https://openai.com/index/introducing-swe-bench-verified/)). Self-assessment by an LLM is unreliable: production teams using Claude Code report 15-25% of tasks complete prematurely without an external loop forcing verification ([Alibaba Cloud, "From ReAct to Ralph Loop"](https://www.alibabacloud.com/blog/602799)).

---

## Dispatch Protocol

A sub-agent dispatch is a three-step pipeline. Skipping any step is a protocol violation.

### Step 1: Prompt-Writer First

For every non-trivial dispatch, the orchestrator first calls the `prompt-writer` agent (a fast, small model, ~1-2 KB output) to generate the context-rich prompt. Anthropic's own engineering team frames this as "context engineering" rather than prompt engineering: "the delicate art and science of filling the context window with just the right information for the next step" ([Anthropic, "Effective context engineering for AI agents"](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents); [Karpathy on X](https://x.com/karpathy/status/1937902205765607626)).

The generated prompt MUST include:

- **Task scope** (one sentence, imperative)
- **Specific file paths** (absolute, verified to exist)
- **Acceptance criteria** (the deterministic verification commands)
- **Forbidden actions** (NO push, NO work-record edit, NO credential change)
- **Output contract** (what the agent must return to the orchestrator)

### Step 2: Bounded Tool Set

Each dispatched agent runs with the *minimum* tool set required for its task. Per Claude Code best practices, "scope permissions for batch operations" with `--allowedTools` and per-agent tool restrictions ([Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)). For example: `architect` has no Edit/Write/Bash; `tester` has Bash limited to the test runner, `git add`, `git commit`.

### Step 3: Acceptance Criteria as Commands

Acceptance criteria are *commands*, not English. Bad: "ensure tests pass". Good: `npx vitest run apps/svc-billing/src/application/use-cases/refund/ --reporter=verbose`. The orchestrator (or supervisor) re-runs the command after the agent reports and treats a non-zero exit as a failed dispatch, regardless of what the agent narrative claims.

---

## Show Your Work Rule

Every sub-agent report to its supervisor or to the orchestrator MUST contain at least one of:

| Artifact Type | Format |
|---|---|
| Commit SHA | `bd848a2` (7+ chars, must exist in `git log`) |
| Test output | Verbatim block including `PASS`/`FAIL`, file path, test count |
| Type-check output | Verbatim `npx tsc --noEmit` result (empty = pass) |
| Command result | Verbatim stdout/stderr, exit code |
| File diff | `git diff --stat` output |
| File existence | `ls -la <path>` + `wc -l <path>` per asserted file path |
| Screenshot path | Absolute path to a `[CUSTOMIZE: screenshot output dir]/*.png` with caption |

Narrative reports without an artifact are treated as failed. The orchestrator MUST reject them and re-dispatch with explicit "produce evidence" instructions.

This follows the Aider model: conformance suites and reproducible test output are the success signal, not self-evaluation ([Simon Willison, "2025: The year in LLMs"](https://simonwillison.net/2025/Dec/31/the-year-in-llms/); [Aider docs](https://aider.chat/)).

### File-existence verification after every dispatch (the phantom-file guard)

Phantom files are a named failure mode in this rule's red-flag table: an agent reports creating or editing a file that is not on disk, or quotes a line count that does not match reality ([arxiv, Importing Phantoms](https://arxiv.org/html/2501.19012v1)). Every sub-agent COMPLETE claim that asserts a file was created or modified MUST therefore carry, per asserted path, the verbatim output of both `ls -la <path>` (existence + size + mtime) and `wc -l <path>` (real content of the claimed shape, not an empty or truncated stub). A file-asserting report missing either artifact is narrative-only and is rejected on the same bar as a missing commit SHA.

The agent's pasted `ls`/`wc` block is NOT itself sufficient: a fabricated report can fabricate that block too. **The orchestrator MUST re-run `ls -la <path>` and `wc -l <path>` ITSELF, from its own scope, for every asserted path, before trusting the report.** If `ls` reports "No such file or directory" or `wc -l` disagrees materially with the claim, the file is a phantom and the dispatch is FAILED; invoke the Self-Correction Loop. This is the same trust-then-verify discipline the rule applies to commit SHAs and test output: the orchestrator re-runs the declared check rather than accepting the agent's narrative.

---

## Self-Correction Loop

When an agent reports failure or when the orchestrator's verification command fails, follow this loop. Do NOT let the failing agent attempt the fix on its own retry.

```
Failure detected
   |
   v
debugger agent: 5-Whys root cause analysis (no edits)
   |
   v
prompt-writer agent: generate fix prompt with root cause + acceptance criteria
   |
   v
impl agent (backend-impl / frontend-impl / domain-impl): apply fix
   |
   v
re-run acceptance command
   |
   +-- PASS -> proceed
   |
   +-- FAIL twice in a row -> escalate to orchestrator, /clear and re-plan
```

Two consecutive failures on the same work package triggers a hard stop. Per Claude Code best practices: "if you've corrected Claude more than twice on the same issue in one session, the context is cluttered with failed approaches" ([Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)). The pattern there is `/clear` and re-plan with a fresh prompt; for orchestrated work, it means re-dispatch with a fresh sub-agent context after the debugger and prompt-writer have refined the brief.

This loop matches the reflexion-style verification chain documented in recent academic work, where LLMs cannot reliably self-correct without external feedback ([Spontaneous Self-Correction, arxiv 2506.06923](https://arxiv.org/pdf/2506.06923)).

---

## Parallel Dispatch Boundaries

The Cognition team's "Don't Build Multi-Agents" essay warns: "decision-making ends up being too dispersed and context isn't able to be shared thoroughly enough between the agents" ([Cognition, "Don't Build Multi-Agents"](https://cognition.ai/blog/dont-build-multi-agents)). Anthropic's research-system retrospective concurs: parallel sub-agents work for breadth-first read-mostly tasks but underperform when "all agents share the same context or involve many dependencies between agents" ([Anthropic, "How we built our multi-agent research system"](https://www.anthropic.com/engineering/multi-agent-research-system)).

This kit resolves the tension empirically. Parallel dispatch is allowed only when:

1. **Disjoint file sets**: sub-agents touch *non-overlapping* files. Verify with `git ls-files` against each agent's planned scope.
2. **Read-only research**: sub-agents only Read/Grep/WebSearch, never Edit/Write.
3. **Explicit serialization point**: a synthesis agent (orchestrator) reconciles outputs before the next wave begins.

Parallel dispatch is *forbidden* when:

1. Two sub-agents would edit the same file or same DI container (a representative failure: two parallel agents racing on a shared `container.ts`).
2. One sub-agent's output is the next sub-agent's input (serialize them).
3. The work is fundamentally sequential (TDD: write failing test, then implement, then refactor).

When in doubt, serialize. Cognition's principle holds: "single-agent architectures with intelligent scaffolding are more robust" for tightly coupled work ([Cognition](https://cognition.ai/blog/dont-build-multi-agents)).

---

## Premature Completion Red Flags

Detect and reject these patterns in sub-agent reports:

| Red Flag | Why It's a Lie | Required Response |
|---|---|---|
| "Should work" / "Looks good" / "I believe" | No verification ran | Reject; demand command output |
| No commit SHA in report | Nothing was committed | Reject; demand `git log -1 --oneline` |
| `git status` not clean at "complete" | Half-staged work | Reject; demand clean tree or commit |
| "Tests are passing" with no test output | Test never ran or agent invented result | Reject; re-run the test command from orchestrator |
| New imports of workspace (`@org/*`) packages without lockfile change | Possible hallucinated package | grep `package.json` to confirm; 19.7% of LLM package recommendations are fabricated ([USENIX, Package Hallucinations](https://www.usenix.org/system/files/conference/usenixsecurity25/sec25cycle1-prepub-742-spracklen.pdf)) |
| References to files not present on disk | Phantom files | Orchestrator re-runs `ls -la <path>` + `wc -l <path>` itself per asserted path (do NOT trust the agent's pasted block); reject if missing or line count disagrees ([arxiv, Importing Phantoms](https://arxiv.org/html/2501.19012v1)). See File-existence verification under Show Your Work Rule |
| Line numbers that exceed file length | Imagined locations | Read file at offset; reject if out of range |
| Brief vocabulary drifted from actual schema (field name, enum value, selector) | Agent followed the brief literally without reading the canonical source; field names or enum values invented | Reject; agent must read the canonical source (the schema, the type definition, the value-object source) BEFORE coding and flag the drift in the report; the brief is updated to match the schema, NOT the code coerced to match the brief. A representative failure: a brief referenced a field name and a status enum value that the actual schema never defined, and the agent invented matching code rather than reading the source. |

These are not theoretical. The "kitchen sink session" and "trust-then-verify gap" are explicitly named failure patterns in Claude Code's own best practices ([Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)).

---

## TDD with Agents

Test-driven development is the single strongest pattern for working with agentic coding tools per Anthropic: "each red-to-green cycle gives Claude unambiguous feedback" ([Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)). For agent dispatch, this becomes a strict protocol:

1. **Dispatch `tester` agent to write the failing test first.** Output: a `*.spec.ts` file + commit SHA with message `test(scope): add failing test for <feature>`.
2. **Verify the test fails.** Orchestrator runs `npx vitest run <path>` and confirms FAIL (exit code 1, expected assertion failure).
3. **Dispatch `backend-impl` (or sibling) to make it pass.** Acceptance command: the same `vitest run` returning exit 0.
4. **Verify R-G-R in git history.** `git log --oneline -3` should show: test commit, impl commit, optional refactor commit.

The orchestrator MUST verify R-G-R appears in the git log before declaring the work package complete. Per the TDD discipline encoded in `.claude/rules/tdd-discipline.md`, this is already the recommended flow; this rule promotes it to a verifiable protocol.

---

## Cross-Agent Race Avoidance

Lessons distilled from real multi-agent races (parallel agents colliding on a shared DI container, lint-staged sweeping one agent's staged work into another's commit):

- Each agent's planned file list is declared upfront in its prompt-writer brief.
- Before dispatching parallel agents, orchestrator computes the *union of planned files*. If the union has duplicates, serialize.
- Per Galileo's failure-mode survey: "multi-agent communication breakdowns" are one of the seven named failure modes, prevented by "standardized JSON schemas and role contracts; centralized control plane" ([Galileo, "7 AI Agent Failure Modes"](https://galileo.ai/blog/agent-failure-modes-guide)).
- DI containers, barrel exports, and central type registries are *always* serialization points. They are the multi-file equivalent of a shared mutable variable.

### Tool-chain serialization beyond planned_files

Disjoint `planned_files` is necessary but NOT sufficient for safe parallel dispatch. The commit-time tool-chain (pre-commit hooks, lint-staged, prettier, husky) operates on the entire staged index AND on the working tree at commit time, not on the dispatching agent's intended subset. If two agents stage independent files in the same repo and one commits, lint-staged sweeps both agents' staged changes into the first agent's commit. The second agent's commit then has nothing to commit, and its intended scope is misattributed under the first commit's subject line.

A representative failure: one agent staged a documentation addendum while a sibling agent's lint-staged hook swept that addendum into the sibling's unrelated commit. The first agent's `git reset --soft HEAD~1` then lost a race with follow-on commits, and remediation required a full `git reset --mixed origin/<branch>` plus several atomic re-commits.

**Rule: single-writer-per-repo at commit step.** Parallel agents may dispatch in the same repo if and only if:

1. Their `planned_files` are disjoint (necessary condition), AND
2. The orchestrator serializes their commit calls (sufficient condition): one agent's `git commit` completes fully (including hook execution) before the next agent's `git add + git commit` sequence begins, OR
3. Each agent does `git status --porcelain | grep -v "^.. <my-planned-files-pattern>" | wc -l` immediately before staging, and if the result is non-zero (another agent has unrelated staged work), the agent waits or stashes-and-pops around its commit.

In practice, option 2 is the default: same-repo agents are dispatched sequentially through the commit phase even when their feature work was done in parallel. Authoring can parallelize; committing serializes.

### Per-developer journals do not eliminate same-repo commit-race

If each developer's work-record journal lives in its own namespace (for example `docs/workrecords/<developer>/work-record-YYYY-MM-DD.md`), the `planned_files` lists of two parallel work-recorder dispatches become disjoint at the FILE level (one writes one developer's path, the other writes another's). The disjoint file-set tempts orchestrators to dispatch both in parallel WITH their own commit steps.

That is unsafe. Both journals live in the same git repo. Commits to either journal traverse the same pre-commit and pre-push hook chain on the same working tree. Per the single-writer-per-repo rule above, two work-recorder commits to different developers' journals MUST still serialize at the commit step. The authoring (Edit appends) may proceed in parallel; the `git add` + `git commit` sequence cannot.

Operationally: orchestrators dispatching two work-recorders concurrently should configure both sub-agents to return their diffs without committing. The orchestrator (or supervisor) then performs the commits one at a time. This applies symmetrically when a single session has one work-recorder per developer (cross-developer collaboration scenarios).

### ALWAYS-Serialize List (extended)

- `**/container.ts` (DI container; central registry)
- `**/index.ts` (barrel exports)
- the root schema file for your ORM or data layer
- `**/eslint.config.js` (lint rules; lint-staged collapse risk)
- `**/package.json` (lockfile races)
- `**/CLAUDE.md` and `.claude/rules/*.md` (auto-loaded context)
- `docs/workrecords/<developer>/work-record-YYYY-MM-DD.md` (append-only journal; only work-recorder may write; each developer writes to their own namespace, never another developer's)
- **Any commit-step in a repo with active pre-commit hooks (lint-staged, husky):** serialize across agents regardless of file-set disjointness

---

## Agent Autonomy Boundaries

Sub-agents NEVER:

- `git push` (the orchestrator does, after the pre-push gate is green)
- Edit the work record (only the `work-recorder` agent appends; only at the AUTHORING developer's `docs/workrecords/<developer>/`, never another developer's)
- Touch credentials, secrets, or infrastructure manifests in production environments without explicit orchestrator approval
- Run destructive operations (`git reset --hard`, `rm -rf`, destructive infrastructure commands, `DROP TABLE`) without explicit orchestrator approval
- Promote artifacts to a staging or production deployment environment
- Self-restart, self-loop, or self-extend their own task scope

When a sub-agent encounters a destructive operation or credential change need, it returns a `pause_for_human` signal to the orchestrator with: the proposed action, the rationale, the rollback. The orchestrator then surfaces to the developer. This matches Claude Code's "auto mode" classifier behavior, where destructive scope-escalation triggers a fallback to human approval ([Claude Code Best Practices](https://code.claude.com/docs/en/best-practices)).

---

## Pre-Dispatch Checklist

Before invoking any sub-agent:

- [ ] Have I run `prompt-writer` first? (fast small model, ~1 KB output)
- [ ] Does the prompt cite specific file paths verified to exist?
- [ ] Are acceptance criteria expressed as runnable commands?
- [ ] Have I declared the agent's tool set explicitly?
- [ ] Have I declared the agent's planned file list?
- [ ] Does the planned file list collide with any other in-flight parallel agent?
- [ ] **Will this agent's `git commit` execute while another in-flight agent has staged files in the same repo?** If yes, serialize the commit step (per Cross-Agent Race Avoidance, Tool-chain serialization).
- [ ] Have I told the agent: NO push, NO work-record edit, NO destructive ops?
- [ ] Will I re-run the acceptance command myself before accepting "done"?

---

## Post-Dispatch Checklist

Before declaring a work package COMPLETE:

- [ ] Sub-agent returned at least one artifact (SHA, test output, command result)
- [ ] I re-ran the acceptance command and got exit 0
- [ ] For every asserted file path: I re-ran `ls -la <path>` + `wc -l <path>` myself and they match the claim (phantom-file guard)
- [ ] `git status` is clean OR the next dispatch will clean it
- [ ] No "should work" / "looks good" language survived in the report
- [ ] No new imports of unverified workspace (`@org/*`) or external packages
- [ ] Work-recorder sibling has been notified to append the narrative
- [ ] If TDD: R-G-R appears in `git log --oneline -3`

---

## Related Rules and Skills

- `.claude/rules/deterministic-review.md`, same evidence bar applied to code reviewers
- `.claude/rules/context-budget.md`, limits on per-agent prompt size (under 2 KB) and reset cadence
- `.claude/rules/git-workflow.md`, file-by-file commit discipline that makes the artifact requirement enforceable
- `.claude/rules/production-grade-code.md`, no silent fallbacks, no `any`, no `@ts-ignore`; agents inherit these
- `.claude/rules/ai-orchestration-decision-gate.md`, when to dispatch a multi-agent wave versus a single agent
- `.claude/rules/security-untrusted-content.md`, treating tool output and external content as untrusted in agent loops
- `.claude/rules/tdd-discipline.md`, the R-G-R pattern this rule promotes to a verifiable protocol

---

## Sources

- Anthropic, "Building Effective AI Agents" (2024-12-19), https://www.anthropic.com/research/building-effective-agents
- Anthropic, "Effective context engineering for AI agents", https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, "How we built our multi-agent research system", https://www.anthropic.com/engineering/multi-agent-research-system
- Anthropic, "Best practices for Claude Code", https://code.claude.com/docs/en/best-practices
- Cognition (Walden Yan), "Don't Build Multi-Agents", https://cognition.ai/blog/dont-build-multi-agents
- Simon Willison, "Building effective agents" commentary, https://simonwillison.net/2024/Dec/20/building-effective-agents/
- Simon Willison, "2025: The year in LLMs", https://simonwillison.net/2025/Dec/31/the-year-in-llms/
- Andrej Karpathy on context engineering, https://x.com/karpathy/status/1937902205765607626
- OpenAI, "Introducing SWE-bench Verified", https://openai.com/index/introducing-swe-bench-verified/
- Spracklen et al., "We Have a Package for You! Package Hallucinations" (USENIX Security 2025), https://www.usenix.org/system/files/conference/usenixsecurity25/sec25cycle1-prepub-742-spracklen.pdf
- "Importing Phantoms: Measuring LLM Package Hallucination Vulnerabilities" (arxiv 2501.19012), https://arxiv.org/html/2501.19012v1
- Galileo, "7 AI Agent Failure Modes and How to Prevent Them", https://galileo.ai/blog/agent-failure-modes-guide
- Alibaba Cloud, "From ReAct to Ralph Loop", https://www.alibabacloud.com/blog/602799
- "Boosting LLM Reasoning via Spontaneous Self-Correction" (arxiv 2506.06923), https://arxiv.org/pdf/2506.06923
- GitHub, "Best practices for using GitHub Copilot to work on tasks", https://docs.github.com/copilot/how-tos/agents/copilot-coding-agent/best-practices-for-using-copilot-to-work-on-tasks
- Aider documentation, "Repository map", https://aider.chat/docs/repomap.html
