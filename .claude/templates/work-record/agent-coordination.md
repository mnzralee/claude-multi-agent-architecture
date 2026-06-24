# Agent Coordination Record

Use this template to document multi-agent orchestration sessions.

```markdown
### Agent Coordination

**Orchestration Pattern**: [Leader | Swarm | Council | Pipeline | Watchdog]
**Total Agents Spawned**: [count]
**Total Duration**: [time]

#### Agents Deployed

| # | Agent | Model | Purpose | Duration | Status |
|---|-------|-------|---------|----------|--------|
| 1 | architect | Opus | API design review | 45s | Complete |
| 2 | backend-impl | Sonnet | Implement endpoints | 3m | Complete |
| 3 | tester | Sonnet | Write unit tests | 2m | Complete |

#### Coordination Decisions

| Decision | Reasoning | Outcome |
|----------|-----------|---------|
| [e.g., Ran impl agents in parallel] | [Independent file ownership] | [No conflicts] |

#### Context Passed Between Agents

| From | To | Context | Size |
|------|-----|---------|------|
| architect | backend-impl | API contract + file paths | ~2K tokens |

#### Resource Usage

- **Total tokens**: [estimate]
- **Parallel waves**: [count]
- **Sequential handoffs**: [count]
- **Retries/reassignments**: [count]
```

## Guidelines

- Record EVERY agent spawned, even those that failed or were reassigned
- Note which agents ran in parallel vs sequential
- Document any kill criteria triggers (stuck iterations, reassignments)
- Track context size to optimize future prompt-writer usage
