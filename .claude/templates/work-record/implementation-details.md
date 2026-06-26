# Implementation Details

Use this template for technical deep-dives on complex implementation decisions.

```markdown
### Implementation Details: [Feature/Component Name]

#### Architecture Decision
[What approach was chosen and WHY, not just what was built]

#### Alternatives Considered
1. **[Alternative A]**: [Description], Rejected because [reason]
2. **[Alternative B]**: [Description], Rejected because [reason]

#### Key Code Patterns

**Pattern: [Name]**
```typescript
// Before (if refactoring)
const old = doThingOldWay();

// After
const new = doThingNewWay();
// Why: [explanation of improvement]
```

#### Trade-offs Made
| Trade-off | Chose | Over | Reasoning |
|-----------|-------|------|-----------|
| [e.g., Simplicity vs flexibility] | Simple | Flexible | Only one use case currently |

#### What Surprised Me
- [Unexpected finding 1, things that weren't obvious from the plan]
- [Unexpected finding 2]

#### Patterns Established
- [New pattern that future work should follow]
- [Convention that emerged from this implementation]
```

## Guidelines

- Focus on the WHY, not the WHAT, code diffs show what changed
- Document alternatives that were rejected with clear reasoning
- Include code snippets only when they illuminate a non-obvious pattern
- Note surprises, these are the most valuable for future sessions
- Establish patterns that other developers/agents should follow
