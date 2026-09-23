# Ralph-Loop: Gate Worked Examples

Reference for `.claude/skills/ralph-loop/SKILL.md`. Read this when you need a concrete template for surfacing a blast-radius operation, a worked 10/10 acceptance-gate example, or the pre-push-gate case study that motivates the HARD-FAIL discipline.

## Blast-radius surfacing pattern

Example surfacing pattern (a live environment mutation):

```
About to execute a LIVE environment mutation.
Command: EXECUTE=1 <your deploy/apply command> --network <env>
Scope: adds 3 resources to [CUSTOMIZE: target identifier] on [CUSTOMIZE: environment name]
Rollback path: reverse-apply within a 2-min window OR snapshot rollback script
Recovery time objective: 5 min if executed within 2 min of the original change; 45-60 min if downstream contamination has begun
Type 'yes proceed with this mutation against the live <env>' to authorize.
```

## 10/10 acceptance-gate example

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

## Pre-push gate case study

A real insight from a long-arc run:

> Pre-push gate 2 (the type-checker) caught `Property 'DATABASE_URL' does not exist on type '...'`. The billing service's env config genuinely does NOT expose DATABASE_URL because the service is intentionally external-provider-only per the investigation. My framing as a "completeness gap" was structurally wrong; the in-memory fallback in the container is the intentional design.

The pre-push gate's type-check found this within seconds; the alternative was 30+ minutes debugging at deploy time.
