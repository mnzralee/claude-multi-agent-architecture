---
name: module-planning
description: Plan a new module or feature area end-to-end using a structured Explore, Plan, and Document workflow before any code is written
---

# Module Planning Skill

## Skill Metadata
- **Name**: module-planning
- **Description**: Plan a new module or feature area end-to-end using a structured Explore, Plan, and Document workflow before any code is written
- **User Invocable**: Yes (via `/module-planning`)

---

## Overview

This skill guides the comprehensive planning of new modules for any software project. It follows the established Explore, Plan, Implement pattern to ensure thorough preparation before writing code. The discipline is stack-agnostic; the examples below use TypeScript / Node.js / Express / Vitest / Zod for concreteness, but the same phases apply to any language or framework.

The skill separates thinking from typing. A module plan written before the first file is touched is cheaper to revise than one discovered mid-implementation. The three phases below each have a distinct agent role and a concrete output artifact.

---

## Workflow

### Phase 1: Research (Researcher Agent)

**Objective**: Understand existing patterns and gather reference implementations before designing anything new.

```markdown
1. Find similar existing modules
   - Search for comparable implementations in the codebase
   - Identify reusable patterns and utilities
   - Note what worked and what created friction

2. Document conventions already in use
   - File structure patterns
   - Naming conventions
   - Code organization and layering decisions

3. List relevant existing code
   - Related services or packages
   - Shared utilities and helpers
   - Common interfaces and types
```

**Output**: A pattern-reference document with file paths, conventions, and any prior art worth reusing.

---

### Phase 2: Architecture (Architect Agent)

**Objective**: Design the module structure and interfaces based on the patterns the Researcher surfaced.

```markdown
1. Module Structure
   - Define service or package boundaries
   - Identify components needed
   - Plan data models and their relationships

2. API Design
   - Define endpoints or function signatures
   - Specify request / response formats
   - Document authentication and authorization requirements

3. Data Layer
   - Define schema models (using your ORM or migration tool of choice)
   - Plan migrations and rollback paths
   - Consider indexes and query performance

4. Integration Points
   - Inter-service or inter-package communication
   - External dependencies and their contracts
   - Events emitted or consumed
```

**Output**: A comprehensive implementation plan ready for documentation.

---

### Phase 3: Documentation

**Objective**: Create a durable module specification document that the implementation agents and human reviewer can reference throughout the build.

The spec lives in `docs/specs/` (or the equivalent in your project). Save it before any code is written. The template below covers the common cases; add or remove sections as the module warrants.

```markdown
## Module Specification: [MODULE-NAME]

### Overview
[Module purpose and business context. One paragraph. What problem does this module solve and for whom?]

### Technical Specification

#### Backend Components
| Component | File Path | Description |
|-----------|-----------|-------------|
| Entity | `apps/<service>/src/domain/entities/*.entity.ts` | Domain entity |
| Use Case | `apps/<service>/src/application/use-cases/*` | Business logic |
| Repository | `apps/<service>/src/infrastructure/repositories/*` | Data access |
| Controller | `apps/<service>/src/presentation/controllers/*` | API endpoints |

#### Frontend Components
| Component | File Path | Description |
|-----------|-----------|-------------|
| Page | `apps/<web>/src/pages/**/index.tsx` | Route page |
| Components | `apps/<web>/src/components/features/*` | Feature components |
| Hooks | `apps/<web>/src/hooks/use-*.ts` | Data hooks |
| API Client | `apps/<web>/src/lib/api/*.ts` | API functions |

#### Data Schema (illustrative; adapt to your ORM or migration tool)
```
model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // add fields here
}
```

#### API Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| POST | /api/v1/[resource] | Create | JWT |
| GET | /api/v1/[resource] | List | JWT |
| GET | /api/v1/[resource]/:id | Get by id | JWT |
| PATCH | /api/v1/[resource]/:id | Update | JWT |
| DELETE | /api/v1/[resource]/:id | Delete | JWT |

### Implementation Order
1. Data schema and migrations
2. Domain entities and value objects
3. Repository interfaces and their implementations
4. Use cases (one per business operation)
5. Controllers and route registration
6. Frontend API client functions
7. Frontend data hooks
8. Frontend components
9. Frontend pages and routing
10. Tests (unit, integration, end-to-end)

### Testing Strategy
- Unit tests for use cases (pure business logic, no I/O)
- Integration tests for controllers (real HTTP, mocked or test database)
- End-to-end tests for critical user flows

### Risk Assessment
| Risk | Impact | Mitigation |
|------|--------|------------|
| [Identify integration risks, schema conflicts, or unclear requirements before coding starts] | | |
```

---

### Phase 4: Checklist Creation (Progress Tracking)

**Objective**: Create a trackable checklist so that implementation can be picked up, handed off, or resumed without losing context.

Store the progress file at `.claude/progress/current-module.json` (or rename it per your project conventions). Update the `status` field on each feature as work proceeds.

```json
{
  "module": "[MODULE-NAME]",
  "status": "planning",
  "startDate": "YYYY-MM-DD",
  "features": [
    {
      "id": "01",
      "name": "Data schema",
      "status": "pending",
      "files": ["path/to/schema/file"]
    },
    {
      "id": "02",
      "name": "Backend entities",
      "status": "pending",
      "files": ["apps/<service>/src/domain/entities/*.entity.ts"]
    },
    {
      "id": "03",
      "name": "Repository layer",
      "status": "pending",
      "files": ["apps/<service>/src/infrastructure/repositories/*"]
    },
    {
      "id": "04",
      "name": "Use cases",
      "status": "pending",
      "files": ["apps/<service>/src/application/use-cases/*"]
    },
    {
      "id": "05",
      "name": "Controllers",
      "status": "pending",
      "files": ["apps/<service>/src/presentation/controllers/*"]
    },
    {
      "id": "06",
      "name": "Frontend API client",
      "status": "pending",
      "files": ["apps/<web>/src/lib/api/*"]
    },
    {
      "id": "07",
      "name": "Frontend hooks",
      "status": "pending",
      "files": ["apps/<web>/src/hooks/use-*.ts"]
    },
    {
      "id": "08",
      "name": "Frontend components",
      "status": "pending",
      "files": ["apps/<web>/src/components/features/*"]
    },
    {
      "id": "09",
      "name": "Frontend pages",
      "status": "pending",
      "files": ["apps/<web>/src/pages/*"]
    },
    {
      "id": "10",
      "name": "Tests",
      "status": "pending",
      "files": []
    }
  ],
  "completedAt": null
}
```

---

## Invocation

### Automatic
Triggered when the user requests:
- "Create a new module for..."
- "Plan the implementation of..."
- "Design the architecture for..."

### Manual
```
/module-planning [module-name]
```

---

## Agents Involved

| Phase | Agent | Role |
|-------|-------|------|
| 1 | researcher | Find existing patterns and prior art |
| 2 | architect | Design module structure and interfaces |
| 3 | orchestrator | Write specification document |
| 4 | orchestrator | Create progress checklist |

---

## Output Artifacts

1. **Module Spec Document**: `docs/specs/[MODULE-NAME].md`
2. **Implementation Status**: `docs/specs/[MODULE-NAME]-IMPLEMENTATION-STATUS.md`
3. **Progress Checklist**: `.claude/progress/current-module.json`

[CUSTOMIZE: adjust the output paths to match your project's documentation layout.]

---

## Example Usage

**User Input**:
```
Plan the user onboarding module
```

**Skill Execution**:
1. Researcher finds existing authentication and user-management patterns in the codebase.
2. Architect designs the module structure: schema model, use cases, API endpoints, and frontend flows.
3. Orchestrator writes `docs/specs/USER-ONBOARDING.md` using the template above.
4. Orchestrator creates `.claude/progress/current-module.json` with all features set to `pending`.
5. Orchestrator returns a summary to the user for review and approval.

**User Approval**: The user reviews the plan and approves it (or requests adjustments) before any implementation begins.

**Next Step**: Implementation begins, driven by the backend and frontend implementation agents, with the progress checklist as the shared source of truth.
