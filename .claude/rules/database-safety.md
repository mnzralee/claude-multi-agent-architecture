# Database Safety Standards

## Why this rule exists

A production incident illustrates the failure mode this rule defends against: an integration test ran a shared `resetDatabase()` helper against a live database, issuing `SET session_replication_role='replica'` followed by `TRUNCATE ... CASCADE` across all application tables, wiping production data. The truncation succeeded because (1) the application connected as an overprivileged role that permitted it; (2) the test helper trusted `DATABASE_URL` blindly; and (3) no verified, restorable backup existed to recover from.

This rule is the standing, always-loaded defence: four layers, defence-in-depth, no single layer sufficient alone. All four are mandatory before any data re-seed or promotion to a production environment.

| # | Layer | Stops | Artifact |
|---|---|---|---|
| L1 | Engine guard (database triggers) | accidental `TRUNCATE`/`DROP` by application code; defeats `replica`-mode bypass | a migration that installs a guard trigger on every permanent table |
| L2 | Least-privilege roles | a running service ever holding `TRUNCATE`/`DROP`/DDL | a migration that creates `app_role` (DML-only) and `migrate_role` (DDL, migration-only) |
| L3 | Fail-closed test harness | a test truncating a non-ephemeral database (the proximate cause) | `packages/test-utils/src/safety/ephemeral-db-guard.ts` (or equivalent) |
| L4 | Backups and restore drills | unrecoverability when a wipe happens anyway | a scheduled backup job and a restore runbook (`docs/runbooks/db-restore.md`) |

---

## Rule 1: The engine guard is always installed (L1)

A before-truncate trigger attaches to **every** permanent base table (catalog-driven installer, never a hand-maintained list), plus an event trigger blocking `DROP TABLE`/`DROP SCHEMA`. Triggers are set to `ENABLE ALWAYS`, so they fire even under `session_replication_role='replica'` (the bypass used in the incident).

- The migration is idempotent. Re-run `SELECT guard_schema.install_truncate_guards();` (or your equivalent) after any migration that adds tables. A post-migrate deploy hook is the recommended approach. Without it, new tables are unguarded against truncation.
- Blocked operations go to the database server log. Ship those logs to your log aggregator to retain the blocked-operation trail.
- L1 alone does NOT stop a table owner or superuser issuing `ALTER TABLE ... DISABLE TRIGGER` or `DROP EVENT TRIGGER`. That residual path is closed only by L2.

## Rule 2: The escape hatch is the ONLY destructive-maintenance path (L1)

Authorized destructive maintenance runs in one privileged session, with a session-local flag:

```sql
-- Example using a Postgres session variable (adapt to your engine)
SET app.allow_destructive = 'on';
SET app.destructive_reason = '<ticket>: reason for this operation';
-- TRUNCATE / DROP here
```

**Application code MUST NEVER set `app.allow_destructive`**: this is an operator-only action, performed in an authorized maintenance window. Any destructive operation requires the escape hatch AND a fresh, verified-restorable backup taken immediately before (Rule 5). No exceptions.

## Rule 3: Services NEVER connect as a TRUNCATE/DDL-capable role (L2)

| Role | Privilege | Used by |
|---|---|---|
| `app_role` | DML only: `SELECT`/`INSERT`/`UPDATE`/`DELETE`; no `TRUNCATE`/`DROP`/DDL; not owner; not superuser | every runtime service and worker |
| `migrate_role` | Schema owner, DDL | the controlled migration job only |
| `readonly_role` | `SELECT` only | analytics, read replicas |

[CUSTOMIZE: rename these roles to match your organization's conventions.]

- Every service `DATABASE_URL` resolves to `app_role`. Migrations run only via the controlled migration job as `migrate_role`, never ad-hoc from a developer shell.
- New tables should auto-grant `app_role` DML (but not `TRUNCATE`) via `ALTER DEFAULT PRIVILEGES`. The migrations tracking table is protected from `app_role`.
- If you use a connection pooler (PgBouncer or equivalent) in transaction-pool mode, the migration job MUST connect directly to the primary, not via the pooler. Transaction-pool mode breaks session-scoped DDL and advisory locks that most migration tools require.
- When adding a new role, ensure the pooler's authentication configuration is updated and reloaded BEFORE switching any service URL, or every service will fail at the pooler.

## Rule 4: Integration tests NEVER run against a non-ephemeral database (L3)

The shared `resetDatabase()` helper and any test harness that issues destructive operations are guarded by a fail-closed chokepoint: `assertEphemeralTestDatabase()` (exported from your test-utils package). It refuses a destructive operation unless ALL THREE conditions hold:

1. **Host** is loopback or a testcontainer-mapped address (`localhost`, `127.0.0.1`, `::1`, `host.docker.internal`).
2. **Database name** matches a test pattern (e.g. `*_test`, a testcontainer-random name) and is NOT on the live denylist (your production and staging database names).
3. **Marker** environment variable (e.g. `APP_TESTCONTAINER_DB=1`) is present and was stamped only by `globalSetup` or the self-starting container, never set by hand.

Each factor alone is forgeable; together they are not. The incident URL would fail all three.

- Any test issuing raw `TRUNCATE` or `DELETE FROM` across a table MUST call `assertEphemeralTestDatabase()` first. No bypass.
- `globalSetup` should pre-flight-throw if a pre-existing `DATABASE_URL` is not a verified ephemeral target. An unset `DATABASE_URL` is fine: a throwaway container is provisioned. The marker variable is harness-internal and MUST NEVER be exported manually.

A minimal implementation:

```typescript
// packages/test-utils/src/safety/ephemeral-db-guard.ts
// Discipline is stack-agnostic; this TypeScript example illustrates the three-factor check.
export function assertEphemeralTestDatabase(databaseUrl: string): void {
  const url = new URL(databaseUrl);

  const LOOPBACK = ['localhost', '127.0.0.1', '::1', 'host.docker.internal'];
  if (!LOOPBACK.includes(url.hostname)) {
    throw new Error(
      `[DB SAFETY] REFUSED: host "${url.hostname}" is not a loopback address. ` +
      `Integration tests must run against an ephemeral testcontainer, not a live database.`
    );
  }

  const dbName = url.pathname.slice(1);
  const LIVE_DENYLIST = (process.env.DB_LIVE_DENYLIST ?? '').split(',').filter(Boolean);
  const isTestName = dbName.endsWith('_test') || dbName.startsWith('test_');
  if (!isTestName || LIVE_DENYLIST.includes(dbName)) {
    throw new Error(
      `[DB SAFETY] REFUSED: database name "${dbName}" does not match the test pattern ` +
      `or is on the live denylist.`
    );
  }

  if (process.env.APP_TESTCONTAINER_DB !== '1') {
    throw new Error(
      `[DB SAFETY] REFUSED: APP_TESTCONTAINER_DB is not set to '1'. ` +
      `This must be set only by the test harness globalSetup, never manually.`
    );
  }
}
```

## Rule 5: Backups, retention, and restore drills are mandatory (L4)

- Schedule periodic `pg_dump -Fc` (or the equivalent for your engine) to durable off-cluster storage. A common schedule: every 6 hours, retained for 7 days; weekly, retained for 4 weeks. [CUSTOMIZE: adjust to your recovery-point objective.]
- Dumps should self-verify after writing (e.g. `pg_restore --list` against the dump; reject dumps below a minimum expected size).
- A **fresh on-demand backup is required before any destructive maintenance** (Rule 2) and before any re-seed operation.
- Off-cluster storage is opt-in for development environments and **mandatory for production**. A backup stored on the same node as the database is not a disaster-recovery backup.
- A **regular restore drill** (`docs/runbooks/db-restore.md`) is the standing control. A backup that has never been test-restored is not a backup. Run the drill at least monthly in staging.

## Rule 6: No live DATABASE_URL in any dev/test/CI shell

Never export a production or staging `DATABASE_URL` into a shell that may run tests, ORM migrations, `db push`, or a reset script. Tests provision their own ephemeral container. CI pipelines should provision a fresh testcontainer as part of the job, isolated from every other environment.

---

## Pre-Flight Checklist

Before any test, migration, reset, or maintenance operation against a database:

- [ ] Is this shell's `DATABASE_URL` a verified ephemeral testcontainer (loopback host + test-pattern name + `APP_TESTCONTAINER_DB=1`), NOT a live URL? (R6)
- [ ] Destructive maintenance: is the L1 escape hatch open in THIS session, set by a human operator, never by application code? (R2)
- [ ] Destructive maintenance or re-seed: was a fresh dump taken AND verified restorable immediately before? (R5)
- [ ] Is the connecting role `app_role` (DML-only) for runtime, or `migrate_role` only for the controlled migration job? (R3)
- [ ] After a schema-adding migration: was the truncate guard re-installed to cover new tables? (R1)
- [ ] Does any new raw `TRUNCATE`/`DELETE FROM` in a test call `assertEphemeralTestDatabase()` first? (R4)
- [ ] New role or URL switch: is the connection pooler's authentication configuration updated and reloaded BEFORE the switch? (R3)

A destructive action missing any applicable box is forbidden.

---

## Related Rules

`security-standards.md` (secrets, least privilege) · `production-grade-code.md` (fail loud, no silent fallbacks) · `testing-pyramid.md` (real testcontainers) · `depth-first-impact-analysis.md` (migration apply path) · `work-records.md` (incident documentation)
