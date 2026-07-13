# AGENTS.md - Cross-Tool Agent Configuration

> Tool-agnostic context for AI coding assistants (Claude Code, Cursor, Codex, Gemini, Amp, and others). For Claude Code specifics, see `CLAUDE.md` and the `.claude/` directory. Replace every `[CUSTOMIZE]` placeholder with your project's values.

## Project Overview

<!-- [CUSTOMIZE] -->
**[PROJECT_NAME]** is a [DESCRIPTION].

- **Backend**: [FRAMEWORK] with [ARCHITECTURE_PATTERN]
- **Frontend**: [FRAMEWORK]
- **Database**: [DATABASE] with [ORM]
- **Infrastructure**: [INFRA_PLATFORM]
- **Repository**: [monorepo | polyrepo]

## Conventions

### Code style (illustrative defaults; adapt to your stack)
- TypeScript strict mode; no `any` (use `unknown` plus type guards).
- Typed domain errors; never swallow exceptions or use silent fallbacks.
- No `@ts-ignore` / `@ts-expect-error`.

### Git
- Conventional commits: `type(scope): subject` (feat, fix, refactor, chore, docs, test, perf, security).
- File-by-file staging; commit each logical unit. No AI attribution, no emojis.

### Testing
- Testing pyramid: roughly 70% unit, 20% integration, 10% end-to-end. Prove results with real output.

### Architecture
- Clean architecture: domain to application to infrastructure to interface. Dependencies point inward (domain has zero external deps). Repository pattern for data access; use cases for business logic.

## Orchestration model

- **Decide before orchestrating.** Prefer a single prompt or a fixed workflow over an autonomous swarm. Pick the smallest pattern that fits.
- **Single writer, many readers.** Parallel agents may read/analyze/review; exactly one agent mutates files or commits at a time.
- **Prove with artifacts.** "Done" means a commit SHA, test output, or a passing check, not a narration.

## Operating standard (doctrine, every model tier)

Every model, whatever its capability tier, honors one behavioral contract in this repo: lead with the outcome, prove completion with artifacts, decide depth-first rather than from a hunch, do not stop early, do the simplest thing that works well, and disclose every honest finding uncapped. For Claude Code, the full doctrine and its enforcement (an always-loaded rule, a launch-time system-prompt wrapper, an inert-by-default verification hook) live at `.claude/standards/OPERATING-STANDARD.md`; see [docs/OPERATING-STANDARD.md](docs/OPERATING-STANDARD.md). Tools without an equivalent mechanism should still hold every model to this same six-point contract, via whatever system-prompt or repo-instructions surface that tool exposes.

## Agent Roles

| Role | Responsibility | Model Tier |
|------|----------------|------------|
| **architect** | System design, API contracts, architectural decisions | Frontier (Opus) |
| **researcher** | Codebase exploration, pattern discovery | Fast (Haiku) |
| **prompt-writer** | Generate bounded, context-rich prompts for sub-agents | Fast (Haiku) |
| **supervisor** | Track management, sub-agent coordination | Standard (Sonnet) |
| **backend-impl** | Backend implementation | Standard (Sonnet) |
| **frontend-impl** | Frontend implementation | Standard (Sonnet) |
| **infra-impl** | Infrastructure and deployment | Standard (Sonnet) |
| **docker-deploy** | Container builds, image management, deploy | Standard (Sonnet) |
| **db-specialist** | Schema, migrations, ORM operations | Standard (Sonnet) |
| **cqrs-specialist** | Event-driven / CQRS patterns | Standard (Sonnet) |
| **tester** | Unit and integration tests | Standard (Sonnet) |
| **e2e-tester** | End-to-end browser tests | Standard (Sonnet) |
| **reviewer** | Code review and quality | Standard (Sonnet) |
| **debugger** | Root-cause diagnosis and fix | Standard (Sonnet) |
| **security** | Security audit | Frontier (Opus) |
| **code-quality-auditor** | Deep quality analysis | Frontier (Opus) |
| **evaluator** | Rubric-based critic for the evaluator-optimizer loop | Frontier (Opus) |
| **watchdog** | Parallel safety monitor, drift detection | Standard (Sonnet) |
| **work-recorder** | Session documentation | Fast (Haiku) |

## File Ownership

<!-- Prevents multi-agent file conflicts during parallel work. [CUSTOMIZE] paths for your layout. -->
| Pattern | Owner |
|---------|-------|
| `src/domain/**`, `src/application/**`, `src/infrastructure/**`, `src/interface/**` | backend-impl |
| `components/**`, `app/**` | frontend-impl |
| `*.test.*`, `*.spec.*` | tester |
| `e2e/**` | e2e-tester |
| `infra/**`, `k8s/**`, `Dockerfile*` | infra-impl, docker-deploy |
| `db/**`, `migrations/**`, schema files | db-specialist |

## Quality Gates

### Blocking (must pass)
- Type check clean (for example `tsc --noEmit`).
- No secrets in committed files.
- All tests pass.
- No `any` in production code.

### Advisory (should pass)
- Coverage at or above target.
- No stray debug logging in production code.
- Dependency audit clean.

## Conflict Resolution

When instructions conflict: **security > correctness > performance > readability > style**.

## Custom Instructions

- **Claude Code**: see `CLAUDE.md` and `.claude/`.
- **Cursor**: see `.cursorrules` if present.
- **Other tools**: this file is the shared contract.
