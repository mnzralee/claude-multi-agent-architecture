# Deterministic Review Standards

## Core Principle

**Agents prove, they do not guess.** Every review finding MUST be backed by deterministic evidence, not LLM opinion. This applies to multi-agent review board waves and to ordinary code review by the reviewer and security agents.

The review board structure (the multi-wave, multi-agent orchestration defined in your root `CLAUDE.md` and the canonical prompt at `.claude/prompts/review-board.md`) is the orchestration layer; this rule governs the QUALITY BAR each agent must meet, regardless of how many agents or waves you run.

---

## Evidence Types, by Strength

The table below uses an illustrative TypeScript / Node toolchain for concreteness. The discipline is stack-agnostic: substitute your own type checker, linter, test runner, and infra tooling. What matters is that the evidence is reproducible and captured verbatim, not the specific commands.

| Evidence | How to Obtain | Strength |
|---|---|---|
| **AST / Type check** | Type-checker output (for example `npx tsc --noEmit`), captured verbatim | Strongest |
| **Linter output** | Linter results (for example `npm run lint`), specific rule + line | Strong |
| **Test execution** | Test-runner output (unit, integration, end-to-end), captured | Strong |
| **Live infra check** | Output of an environment probe (process status, an endpoint `curl`, a database query) captured verbatim | Strong (Infra Verifier agent) |
| **Grep / glob confirmation** | Pattern search in source, with file:line | Medium |
| **Import verification** | Module exists in the dependency manifest and installed packages | Medium |
| **Web search citation** | Vendor docs, library docs, with URL | Medium (Industry Research agent) |
| **Manual code inspection** | Reading the code carefully | Weakest, escalate to a higher-strength check |

---

## Required Finding Format

Every review finding must include:

```markdown
### Finding: [Title]

**Severity**: CRITICAL / HIGH / MEDIUM / LOW
**Evidence**: [Verbatim command output OR file:line citation]
**Location**: [path:line]
**Issue**: [What is wrong, one or two sentences]
**Fix**: [Specific change, in concrete terms]
```

Findings without `Evidence` are inadmissible. They get filed as "unverified concerns" or rejected by the synthesis wave.

---

## Good vs Bad Review Comments

### BAD (LLM opinion without evidence)

```
"This looks like it could be a bug."
"This might cause issues in production."
"Consider adding error handling here."
"This pattern seems wrong."
"Tests are probably needed."
```

### GOOD (deterministic evidence)

The examples below use a generic service codebase to show the shape of a grounded finding. Adapt the paths and assertions to your project.

```
"Type-check reports: Type 'string' is not assignable to type 'number' at src/service.ts:42"

"grep found 3 endpoints without auth middleware:
   - GET /api/users (src/interface/routes/user.routes.ts:18)
   - GET /api/orders (src/interface/routes/order.routes.ts:24)
   - POST /api/export (src/interface/routes/export.routes.ts:9)"

"The test suite shows AccountService.transfer fails:
   Expected: 800 (after a 0.2% fee deducted)
   Received: 1000 (no fee deducted)
   Source: apps/svc-payments/src/application/use-cases/transfer/handler.spec.ts:142"

"Module '@org/core-events' imported at apps/svc-outbox/src/handlers/index.ts:5
   does not exist as a workspace package. Verified via:
   ls -la packages/ | grep core-events"
```

---

## Discovery-Wave Agent Outputs Must Be Ground Truth

Per the review board canonical prompt at `.claude/prompts/review-board.md`, the first wave of agents gathers ground truth that every later agent consumes. Their outputs must be evidence, not opinion:

- **Codebase Explorer**: returns actual file paths, actual selectors, actual endpoints found by Grep + Read.
- **Industry Research**: returns recommendations with citation URLs, not unsourced "best practice" claims.
- **Infra Verifier**: returns the literal output of environment probes (process status, an endpoint `curl`, a database query) rather than assumptions about the running system.
- **Risk Mapper**: returns dependency graphs with file:line citations, not abstract risk vibes.

Later-wave agents (Architect, Testing, Security, DevOps, Quality) consume the discovery wave's ground truth. If the discovery wave returned opinion instead of evidence, the downstream findings inherit that weakness.

---

## Cross-Agent Validation

When two agents independently flag the same issue, severity is consensus-weighted upward. When two agents disagree:

1. Re-run the deterministic check (rebuild the grep, re-run the test, re-probe the endpoint).
2. The agent grounded in evidence wins.
3. Document the resolution in the synthesis wave.

---

## Hallucination Prevention

AI reviewers commonly hallucinate:

- **Non-existent imports**: a large fraction of package names suggested by AI tools do not exist. One study found 21.7% of packages recommended by open-source LLMs were hallucinated (Spracklen et al., "We Have a Package for You! A Comprehensive Analysis of Package Hallucinations by Code Generating LLMs", USENIX Security 2025, https://arxiv.org/abs/2406.10279).
- **Wrong API signatures**: the method exists but the parameters are different.
- **Phantom files**: referencing files that were renamed or deleted.
- **Imagined line numbers**: "at line 42" when the file has 30 lines.

**Prevention:** before citing any file, function, or import, `grep` or `glob` to confirm it exists. Before quoting line numbers, `Read` the file at that offset.

---

## When Findings Are Rejected

The synthesis wave rejects findings that:

- Lack evidence (no command output, no file:line).
- Cite files that do not exist.
- Repeat patterns the codebase has already addressed (per the other rules in `.claude/rules/`, for example `production-grade-code.md`, `clean-architecture.md`, `security-standards.md`).
- Conflict with a stronger-evidence finding from another agent.
- Reach beyond the plan's stated scope.

Rejected findings get filed as "carry-forward" or "out of scope", not silently dropped.

---

## Velocity Cap

Cap review-board fold-ins to BLOCKING + CRITICAL findings only. MEDIUM and LOW become carry-forwards in the work record (see [[work-records]]), not gate-blockers. Folding every finding back into the active plan inflates scope several times over; the cap keeps the loop bounded. This is the review-side companion to the [[ai-orchestration-decision-gate]] discipline: spend agent budget where the evidence is strongest and the severity is highest.

---

## Related

- Review board canonical prompt: `.claude/prompts/review-board.md`
- [[ai-agent-engineering]] -- How to construct the agents whose findings this rule governs
- [[ai-orchestration-decision-gate]] -- When multi-agent review is worth the cost
- [[security-standards]] -- The security agent's evidence bar
- [[production-grade-code]] -- Patterns the codebase has already addressed, which findings should not re-litigate
- [[work-records]] -- Where carry-forward findings are tracked
