# Ralph-Loop: Investigation Worked Examples

Reference for `.claude/skills/ralph-loop/SKILL.md`. Read this when you want the real-world evidence behind the brownfield-first, caveats-are-load-bearing, and investigation-reframe rules, or a worked example to model a new finding on.

## Brownfield pattern: three real occurrences

The brownfield pattern fired three times in 24h on a long-arc run:
1. Data adapters mostly already there
2. A service was intentionally external-provider-only (its in-memory fallback was not a hazard)
3. At arc onset, the deployment-environment integration, role grants, and state snapshot were ALL already authored

## Caveats-are-load-bearing: worked examples

Examples of the pattern:

| Recommendation | Caveat | Discovered constraint |
|---|---|---|
| "Add the schema annotation" | "but don't enable the multi-schema preview feature" | The annotation requires the preview feature to even PARSE; the recommendation alone is infeasible |
| "Hot-fix the cluster policy breach" | "the mesh strict-reject needs a 24h soak" | A marathon ending at partial-accept means the strict-mesh axis is post-marathon |
| "Wire the data client into the billing service" | "it is intentionally external-provider-only in this environment" | The wiring would BREAK the intended configuration |

## Investigation-reframe case study

Case study: a morning audit reported "the signer needs the admin role" for a live environment mutation. The review-board Risk Mapper found the actual gate is an ownership check (`msg.sender == contractOwner` in the access library), NOT a role grant. The morning audit's framing would have led to: grant the role, attempt the mutation, get a revert at the ownership check.
