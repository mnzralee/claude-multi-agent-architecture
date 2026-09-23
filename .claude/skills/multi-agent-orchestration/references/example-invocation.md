# Example Invocation

Referenced from the core `SKILL.md`'s "Example Invocation" section. A worked example showing a full `/multi-agent-orchestration` invocation end to end; read this when you want to see the shape of a complete plan-to-execution write-up rather than the individual protocol pieces.

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
