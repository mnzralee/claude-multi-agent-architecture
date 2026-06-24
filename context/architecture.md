# Architecture Context

Fill in this file once at project start and update it whenever the architecture changes. The agent reads it at session start to understand the system shape without reading every source file. Be concrete: a phrase or a short sentence per row is enough. The more precise you are, the less the agent has to guess.

## Stack

| Layer        | Technology                         | Role                                      |
| ------------ | ---------------------------------- | ----------------------------------------- |
| Framework    | [e.g. Next.js + TypeScript]        | [e.g. Full-stack app framework, SSR + API routes] |
| UI           | [e.g. Tailwind + shadcn/ui]        | [e.g. Styling and component library]     |
| Auth         | [e.g. Clerk / NextAuth]            | [e.g. Session management, identity]      |
| Database     | [e.g. Prisma + PostgreSQL]         | [e.g. Relational data, migrations]       |
| Cache        | [e.g. Redis]                       | [e.g. Session cache, rate limiting]      |
| Storage      | [e.g. S3-compatible object store]  | [e.g. File uploads, generated assets]    |
| Infra        | [e.g. Docker + Railway / Fly.io]   | [e.g. Container hosting, CI deployment]  |
| [Layer]      | [Technology]                       | [Role]                                    |

## System Boundaries

List the top-level folders or services and what each one owns. This tells the agent where to look when it needs to touch a specific concern.

- `apps/web` or `src/`, [e.g. The main user-facing application: pages, components, API routes]
- `packages/db` or `prisma/`, [e.g. Database schema, migrations, generated client]
- `packages/ui`, [e.g. Shared design-system components used by all apps]
- `services/<name>`, [e.g. A background worker or separate microservice, if present]
- `infra/` or `deploy/`, [e.g. Docker compose files, Kubernetes manifests, CI config]
- `[folder]`, [What this folder owns and is responsible for]

## Storage Model

Describe what lives where. Helps the agent avoid writing data to the wrong layer.

- **[Primary database, e.g. PostgreSQL]**: [e.g. Canonical records: users, projects, settings, relationships]
- **[Secondary store, e.g. Redis]**: [e.g. Short-lived data: sessions, job queues, rate-limit counters]
- **[File or blob storage, e.g. S3 / local disk]**: [e.g. Binary artifacts: uploaded files, exported PDFs, generated images]
- **[In-memory / ephemeral]**: [e.g. Request-scoped state only; never written to disk]

## Auth and Access Model

Describe authentication and authorization at a summary level. The agent needs this to avoid generating code that bypasses security checks.

- [How authentication works, e.g. Every request is authenticated via a signed JWT validated in middleware]
- [How identity is stored, e.g. User records live in the database; the auth provider holds credentials only]
- [How ownership works, e.g. Every resource belongs to exactly one user or organization]
- [How access control works, e.g. Mutations require the caller to be the resource owner or an admin role]
- [Any special roles or elevated permissions, e.g. An admin flag unlocks management endpoints]

## Invariants

Rules the codebase must never violate. The agent treats these as hard constraints, not suggestions. List the ones that, if broken, would cause data loss, security issues, or broken user-facing guarantees.

1. [e.g. API handlers do not perform long-running work inline; background jobs go through the queue]
2. [e.g. No raw SQL outside the db package; all queries go through the typed ORM client]
3. [e.g. User-supplied input is validated at the API boundary before reaching service logic]
4. [e.g. Migrations are never destructive without an explicit rollback plan committed alongside]
5. [e.g. Secrets and credentials are never logged or included in error responses]
6. [Add more as the team discovers them]
