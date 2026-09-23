# Parallel Dispatch Lessons Learned

Referenced from the core `SKILL.md`'s "Cross-Agent Race Avoidance Protocol" and "Lessons Learned (running log)" sections. Read this for the worked example (two safe parallel cases and one failure case) that motivated the Always-Serialize List and `planned_files` declaration step, and for the running log of parallel-dispatch successes and failures. The core section already states the resulting rule; this file is the narrative evidence behind it, not new guidance.

### Lesson Learned: archetype-file collisions

Two safe parallel cases and one failure case make the rule concrete.

Safe case: two agents dispatched in parallel across disjoint service trees (one service's internal endpoints versus another service's internal endpoints). Result: both succeeded, no conflicts, roughly 40% wall-clock saving over sequential. The `planned_files` union had an empty intersection.

Failure case: two agents dispatched in parallel both targeted `container.ts` in different services with similar refactor intent. Result: the lint-staged hook ran against both pending changes concurrently, the lint cache invalidation collapsed mid-commit, and the orchestrator had to manually un-stage and re-serialize. The `planned_files` union contained `container.ts` in both services, but the orchestrator did not check.

Generalization: even when the file paths differ by service, refactors that touch the same archetype file (`container.ts` in any service) tend to invoke the same downstream hooks. Treat archetype filenames as a soft serialization signal and dispatch one-at-a-time when in doubt. Cognition's principle holds: "single-agent architectures with intelligent scaffolding are more robust" for tightly coupled work (https://cognition.ai/blog/dont-build-multi-agents).

## Lessons Learned (running log)

### Parallel dispatch boundaries

- Two agents across two different service trees (one service's internal endpoints versus another's): parallel SUCCESS (roughly 40% wall-clock saving). The `planned_files` union had an empty intersection.
- Two agents across two services' `container.ts` refactors: parallel FAILURE (lint-staged collapse). The `planned_files` union contained `container.ts` in both services; the archetype-filename collision invoked shared lint hooks.
- Resolution: added the Always-Serialize List plus the `planned_files` declaration to the parallel dispatch protocol.

(Add future lessons as new agentic failure modes are discovered.)
