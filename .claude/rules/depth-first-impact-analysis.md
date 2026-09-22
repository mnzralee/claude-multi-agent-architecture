# Depth-First Impact Analysis

This rule carries only the non-negotiable protocol. The full doctrine (the Surface table, the L1-L11 layer table with file-location examples, runtime/contract ripple details, sources) lives at `.claude/standards/DEPTH-FIRST-IMPACT-ANALYSIS.md`, read on demand, and always before a real cross-layer change.

Never decide from the surface. Trace the change to the bottom through every layer, understand the whole path, then come back up and decide. No hunch.

For any data-layer or cross-layer change:

1. **Start at L1**, the actual schema definition, not a comment describing it.
2. **Descend L2 to L9**, tracing every writer and reader with `file:line`: persistence, domain, application, API contract, every frontend (L6), any async/event pipeline (L7, the most-missed writer), any external boundary (L8), infrastructure/migrations. Use a breadth tool (code-map, IDE find-all-references, or `grep -rn`) so nothing is missed, and confirm that tool is fresh before trusting it.
3. **Verify against L11**, the project's recorded decisions (ADRs, wiki, code map). Code wins over a stale doc; rebuild the doc.
4. **Then decide**, with the blast radius named and every consumer-to-migrate listed.
5. **Check runtime and contract ripples the type-checker misses**: nullability tightening, enum wiring against every writer's emitted values (including replays), `as unknown as` type laundering, serialization-shape changes on wide-precision numbers, money-denomination changes across boundaries.
6. **Ship atomically.** The schema change and every consumer across every layer land together. Never change the schema now and fix consumers later. A removal is safe only when the depth trace proves zero consumers across all layers.

A decision that skips L6, L7, or L11, or that only checked the type-checker, is a surface decision and is rejected.

Related: `deterministic-review.md`, `ai-agent-engineering.md`, `clean-architecture.md`, `database-safety.md`, `production-grade-code.md`, `ai-orchestration-decision-gate.md`.
