# Depth-First Impact Analysis

## Overview

A typical production codebase is a deeply integrated stack: multiple backend services, async workers, shared workspace packages, one or more frontends, and a single shared data layer underneath all of it. (The examples below assume a TypeScript / Node service for concreteness, but the discipline is stack-agnostic: it applies to any layered system with a shared data layer.) A change to a column, an enum, a public interface, or a model does not stay where it is made. It ripples through every layer that touches that data. This rule forbids deciding from the surface and requires tracing the full integration to the bottom, then surfacing to decide. It is the project form of Change Impact Analysis (Bohner and Arnold 1996) and ripple-effect analysis (Yau and Collofello 1980).

It complements `deterministic-review.md` (findings need evidence), `ai-agent-engineering.md` (verify the artifact, not the claim), and `clean-architecture.md` (the layer rules). If your project has an async event pipeline (a worker that writes data from queued events, an outbox, or a projector), treat that pipeline as a first-class data consumer under this rule.

---

## Core Principle

> Never decide from the surface. Trace the change to the bottom through every layer, understand the whole path, then come back to the surface and decide. Verify each choice against the project's recorded decisions and the standards. No hunch.

A decision made from a single signal is a guess wearing the costume of analysis. The signal that looks decisive (a field-name grep, a schema comment, a green type-check) is the surface. The layers it does not show you are where the silent break lives.

This is not optional rigor for risky changes. It is the default for any data-layer or cross-layer change, because on an integrated stack "looks local" is almost never local.

---

## The Surface (where naive decisions get made, and why each lies)

| Surface signal | Why it lies |
|---|---|
| A single field-name `grep` in one service | The real writer may be a different service or an async worker. A status field grepped in one service may actually be written by a downstream worker that emits different values into a different model entirely. |
| A schema comment (`// status: PENDING, ACTIVE`) | The comment is not the code. Comments drift; the code is authoritative. An enum conflict is often a comment lying about the real code values. |
| The type-checker passes (for example `tsc --noEmit`) | The compiler catches TYPE ripples only. It is blind to runtime and contract ripples: a now-required field a frontend never sends, an enum that rejects a value some code still writes, a wide-precision number that serializes to a different JSON shape, an `as unknown as` cast that launders an invalid value past the type system. |
| "It's only a data-layer change" | The data layer is the layer every other layer depends on. There is no smaller blast radius than the foundation; it is the largest. |
| One layer's view (the model, or the use-case, alone) | Each layer sees only its neighbors. The full path crosses many layers and at least two repo boundaries (backend, frontends). |

---

## The Depth (the full layer stack a change traverses)

Trace top to bottom. The data layer is L1; the depth is L2 through L11. The async pipeline (L7) and the frontends (L6) are the layers a backend-only grep never sees, and they are where the expensive breaks hide.

| # | Layer | Where it lives | What a change can break here |
|---|---|---|---|
| L1 | **Data definition** | The canonical schema source (for example a single schema file or migration set). If a multi-file mirror exists for organizational purposes, both sources must agree or move together. | The column/model/enum/constraint itself. |
| L2 | **Persistence** | `apps/<svc>/src/infrastructure/repositories/*` plus mappers; the generated data-access client | `toDomain`/`toPersistence` mappers, `where`/`select` shapes, the typed client surface. |
| L3 | **Domain** | `apps/<svc>/src/domain/` plus shared domain value objects (for example a `Money` or `Address` value object in a workspace package) | Invariants, value-object construction, the money-typing boundary. |
| L4 | **Application** | `apps/<svc>/src/application/use-cases`, services, ports | Use-cases that read/write the column; the values they set/compare. |
| L5 | **API contract** | `apps/<svc>/src/interface` (DTOs, request/response validation schemas, routes) plus any shared API-spec package | Serialization: enum-vs-string, wide-precision-number JSON shape, nullability, the wire contract consumers depend on. |
| L6 | **Frontends** | Every frontend app in the workspace (data-fetching hooks, validation schemas, forms, display) | The data's far surface. Frontends bind by API field name, so a renamed/retyped field silently breaks a hook, form, or display. [CUSTOMIZE: list your frontend app names here.] |
| L7 | **Async / event pipeline** | Any worker that builds commands from columns and any worker that WRITES read-model columns from queued or external events, plus the shared event package | A worker that writes data-layer columns is a first-class WRITER and the most-missed one. An enum/type change must cover every value such a worker emits, including on replay. (Drop this row if your project has no async pipeline.) |
| L8 | **External boundary** | Any system the project integrates with where payload field names or numeric encodings are fixed or hard to change (a third-party API, a message bus, an external ledger, a deployment environment your data crosses into) | The integration boundary: numeric encoding conversions and event/payload field names that may be immutable on already-emitted records. (Drop or neutralize this row to match your integrations.) |
| L9 | **Infrastructure** | The migrations that actually apply the change (the apply path), seed scripts, and deployment env/config | The migration that actually applies the change; seeds that write the column; env that configures behavior. |
| L10 | **Tests** | `*.spec.ts` / `*.test.ts` (or your test convention) across every layer above | Fixtures and assertions pinned to the old shape. |
| L11 | **Knowledge** | The project's recorded decisions (`docs/adrs`, a code map, the wiki, an as-built doc, the findings ledger) | The why and the standard to verify the decision against. The map, not the territory. |

The dependency rule (`clean-architecture.md`) governs L2 to L5 within a service; this rule governs the vertical across all layers, including the ones that live outside the backend service boundary entirely (frontends, external integrations).

---

## The Depth-First Protocol

For any data-layer or cross-layer change, before deciding:

1. **Start at L1**, the exact definition (read the schema, not the comment).
2. **Descend to the bottom.** Trace every WRITER and every READER down through L2 to L9. Use a code-map or symbol-usage query for breadth so no consumer is missed (for example a project code-map script, an IDE "find all references", or `grep -rn`), and read the actual writer/reader code for the values. Treat any async pipeline (L7) and the frontends (L6) as mandatory stops, not optional.
3. **Reach bottom and understand the whole.** Hold the full path: who writes it, who reads it, what values flow, how it serializes, where it crosses any external boundary.
4. **Verify against L11.** Cross-check the choice against the project's recorded decisions / ADRs / wiki and the project standards. When the recorded knowledge (map) disagrees with the code (territory), the code wins, and the recorded knowledge is rebuilt.
5. **Then surface and decide.** Only now is the L1 decision made, with the blast radius known and the consumers-to-migrate named with `file:line` evidence.

**Verify the tool before trusting it.** Any code-map or index drifts as code advances. If you rely on a generated index for breadth, confirm it is fresh (or rebuild it) before trusting its locations. A stale map gives stale locations, which is the no-hunch rule violated at the tooling level.

---

## Runtime and contract ripples (what the type-checker will not catch)

These compile clean and break at runtime or across the wire. They are found only by the depth trace, never by the compiler:

- **Nullability tightening**: a column made NOT NULL breaks a writer that sometimes omits it, or a frontend form that does not send it.
- **Enum wiring**: a free-form `String` made an enum rejects any value some writer (often an async worker) still emits.
- **Type laundering**: an `as unknown as` cast writes a value the type says is impossible. Grep for it; it hides real bugs (a cast that forced an out-of-range status value past the type system is a classic example).
- **Serialization shape**: wide-precision numeric types (arbitrary-precision integers, fixed-point decimals) serialize to different JSON than a plain `number`/`string`; a frontend or an external payload parsing the old shape breaks.
- **Money denomination**: money fields often carry a fixed precision and a specific encoding, and the same amount may be encoded differently at different boundaries (for example a fixed-point decimal in the database versus an integer count of minor units at an external boundary). Changing precision without tracing every boundary corrupts amounts. [CUSTOMIZE: state your project's money-typing policy and the precision at each boundary.]

---

## Coordinated, atomic execution

Depth-first analysis feeds atomic execution. Once the blast radius is known, the schema change and EVERY consumer across all layers ship together, in one coordinated change set, so no layer is ever left reading the old shape. Never change the schema now and fix consumers later; the window between is exactly the silent-bug surface. A removal is SAFE only when the depth trace proves zero consumers across all layers; a live consumer means migrate-first.

---

## Decision Gate (before any data-layer or cross-layer decision)

- [ ] Read the actual definition at L1 (schema, not comment).
- [ ] Code-map / symbol index confirmed fresh or rebuilt (if you rely on one).
- [ ] Every writer and reader traced down through L2 to L9, with `file:line`.
- [ ] Any async pipeline (L7) checked explicitly as a writer/reader.
- [ ] Every frontend (L6) checked for the field by name.
- [ ] Any external boundary (L8) checked if the column is money or is derived from an external event.
- [ ] Runtime/contract ripples considered, not just the type-checker (nullability, enum, serialization, casts).
- [ ] The choice verified against the project's recorded decisions/ADRs and the standards (L11).
- [ ] Blast radius named; consumers-to-migrate listed; execution planned as one atomic change set.

A decision missing any box is a surface decision and is rejected.

---

## Tooling

```bash
# Breadth: every file that uses a symbol.
# Use whatever gives a complete reference list on your stack:
#   - a project code-map / symbol-index script (rebuild first if stale)
#   - an IDE "find all references"
#   - ripgrep across the workspace:
grep -rn "<SymbolName>" .

# Depth across repos: the actual writers/readers and their values
grep -rn "<column-or-enum-value>" apps/ workers/
grep -rn "<api-field-name>" <each-frontend-app-dir>
grep -rn "as unknown as" apps/ workers/   # type-laundering hunt
```

The breadth tool ensures you do not miss a consumer; the grep and read give depth (the real values and shapes); the recorded decisions give the why. All three, every cross-layer decision.

---

## Sources

- Bohner, S. and Arnold, R. (1996). *Software Change Impact Analysis*. IEEE Computer Society.
- Yau, S. and Collofello, J. (1980). "Some Stability Measures for Software Maintenance," IEEE TSE.
- Lehnert, S. (2011). "A Taxonomy for Software Change Impact Analysis," IWPSE-EVOL.
- Martin, R. C. (2017). *Clean Architecture* (the dependency rule across layers).
- Consumer-Driven Contracts (Pact), the API contract as a consumer boundary. https://docs.pact.io
- Anthropic, "Effective context engineering for AI agents" (verify against canonical source). https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents

---

## Related rules and memory

- `.claude/rules/deterministic-review.md` (evidence over opinion; the same bar)
- `.claude/rules/ai-agent-engineering.md` (verify the artifact, not the claim)
- `.claude/rules/clean-architecture.md` (the intra-service layer dependency rule)
- `.claude/rules/database-safety.md` (schema-as-truth, migrations, money typing)
- `.claude/rules/production-grade-code.md` (no `as unknown as`, no silent fallbacks)
- `.claude/rules/ai-orchestration-decision-gate.md` (when to escalate a cross-layer decision to deeper analysis)
