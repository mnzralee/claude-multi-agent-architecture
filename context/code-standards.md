# Code Standards

Fill in each section with the conventions your project enforces. Agents read this file
before writing or reviewing code, so clear, specific rules produce better output than
vague guidance. Delete sections that do not apply; add sections for any stack or domain
not covered here.

---

## General

- [Principle, e.g. Keep modules small and single-purpose]
- [Principle, e.g. Fix root causes; do not layer workarounds on top of symptoms]
- [Principle, e.g. Do not mix unrelated concerns in one component or route]

## TypeScript

These examples assume TypeScript, but the underlying discipline (strict types, boundary
validation, explicit interfaces) applies equally to any statically-typed language.

- [Rule, e.g. Strict mode is required throughout the project]
- [Rule, e.g. Avoid `any`; use explicit interfaces or narrowly scoped types]
- [Rule, e.g. Validate unknown external input at system boundaries before trusting it]

## [Framework, e.g. Next.js / Express / Fastify]

- [Convention, e.g. Default to server components where the framework supports them]
- [Convention, e.g. Add client-side interactivity only when the browser genuinely requires it]
- [Convention, e.g. Keep route handlers focused on a single responsibility]

## Styling

- [Rule, e.g. Use design-token custom properties; no hardcoded color hex values]
- [Rule, e.g. Follow the spacing and border-radius scale defined in ui-context.md]

## API Routes

- [Rule, e.g. Parse and validate request input before any business logic runs]
- [Rule, e.g. Enforce authentication and ownership checks before any mutation]
- [Rule, e.g. Return consistent, predictable response shapes across all endpoints]

## Data and Storage

- [Rule, e.g. Metadata and relational data belong in the database]
- [Rule, e.g. Large generated or binary content belongs in file or blob storage]
- [Rule, e.g. Do not store large unstructured content directly in relational tables]

## File Organization

- `[folder]/` -- [What belongs here, e.g. shared utility functions with no side effects]
- `[folder]/` -- [What belongs here, e.g. database schema and migration files]
- `[folder]/` -- [What belongs here, e.g. route handlers and middleware]
- `[folder]/` -- [What belongs here, e.g. domain models and business logic]
