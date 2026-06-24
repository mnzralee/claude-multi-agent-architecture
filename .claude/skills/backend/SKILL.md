---
name: backend
description: Backend development skill for microservices following Clean Architecture, CQRS with a transactional outbox, the repository/use-case pattern, and a Testing-Trophy strategy.
---

# Backend Development Skill

You are an expert backend developer. This skill provides comprehensive patterns for building enterprise-grade microservices following Clean Architecture principles.

The concrete examples below assume a TypeScript / Node.js / Express stack with Zod for validation and an ORM for persistence, because concrete code is easier to learn from than abstract description. The discipline itself is stack-agnostic: the layering, the dependency direction, the outbox pattern, the validation contract, and the testing strategy translate directly to any language and framework. Where you see a TypeScript idiom, read it as the general principle expressed in one concrete dialect.

---

## Architecture Overview

A typical monorepo layout for this style of system:

```
backend/                                 # Monorepo (e.g. Turborepo, Nx, pnpm workspaces)
├── apps/                                 # Microservices
│   ├── svc-admin/                        # Admin / back-office operations
│   ├── svc-auth/                         # Authentication
│   ├── svc-account/                      # Account management
│   ├── svc-billing/                      # Billing, balances, transfers
│   ├── svc-catalog/                      # Domain entity catalog
│   ├── svc-notification/                 # Notifications, messaging
│   └── svc-<name>/                       # Additional domain services
├── workers/                              # Background workers
│   ├── projector/                        # Event projection into read models
│   └── outbox-submitter/                 # CQRS command submission
├── packages/                             # Shared libraries
│   ├── core-http/                        # HTTP middleware, validation helpers
│   ├── core-db/                          # ORM client
│   ├── core-config/                      # Env-var schema validation
│   ├── core-logger/                      # Structured logging
│   ├── core-errors/                      # Standardized error classes
│   ├── core-events/                      # Event schema registry
│   ├── core-storage/                     # Document storage, file handling
│   ├── core-openapi/                     # OpenAPI validation
│   └── test-utils/                       # Test containers, data factories
└── db/                                   # The schema and migrations
```

Replace the service names with your own domain services. The point is the separation: thin services in `apps/`, asynchronous work in `workers/`, and shared concerns extracted into versioned `packages/` so no cross-cutting logic is copy-pasted between services.

> When a service grows too broad, decompose it along a clear seam rather than letting one service own unrelated concerns. A single service that handles both authentication and identity verification, for example, is usually better split into `svc-auth` and `svc-kyc`. When you split a service, deprecate the old one explicitly so consumers know where the responsibility moved.

---

## Local Development Setup

**Run a service locally (preferred for active development and debugging):**

```bash
cd backend
npm run dev --filter=svc-auth        # [CUSTOMIZE: per-service port]
npm run dev --filter=svc-account
npm run dev --filter=svc-billing
```

**Port-forward from your cluster (for services not under active development):**

```bash
# [CUSTOMIZE: namespace and service names for your cluster]
kubectl port-forward -n <your-dev-namespace> svc/svc-auth 3041:80 &
kubectl port-forward -n <your-dev-namespace> svc/svc-account 3042:80 &
kubectl port-forward -n <your-dev-namespace> svc/svc-billing 3043:80 &
```

Run the services you are actively changing on your local machine; port-forward the stable dependencies from a shared environment so you are not running the whole system locally.

---

## Port Convention

Assign each service a fixed local port and document it so the team has a single source of truth. A contiguous block keeps things memorable:

| Service | Port | Purpose |
|---------|------|---------|
| svc-admin | 3040 | Admin operations |
| svc-auth | 3041 | Authentication |
| svc-account | 3042 | Account management |
| svc-billing | 3043 | Billing, balances |
| svc-notification | 3044 | Notifications |

> [CUSTOMIZE: pick your own port block and service mapping; keep it in one place.]

---

## Internal Service Structure (Clean Architecture)

Every service should follow this structure. The dependency rule is the whole point: inner layers know nothing about outer layers. `domain/` depends on nothing. `application/` depends only on `domain/`. `infrastructure/` and `interface/` depend inward. Frameworks, databases, and HTTP live at the edges and are swappable.

```
apps/svc-{name}/src/
├── domain/                    # Core business logic (NO external dependencies)
│   ├── entities/              # Domain entities with behavior
│   ├── value-objects/         # Immutable domain concepts
│   ├── services/              # Domain services (pure logic)
│   ├── events/                # Domain events
│   └── errors/                # Domain-specific errors
│
├── application/               # Application layer (use cases)
│   ├── use-cases/             # Business use cases (feature-grouped)
│   │   ├── auth/              # e.g. login, register, refresh
│   │   └── user/             # e.g. get-profile, update-profile
│   ├── ports/                 # Interfaces (contracts)
│   │   ├── repositories/      # Repository interfaces
│   │   └── services/          # External service interfaces
│   ├── dto/                   # DTOs with schema validation
│   │   ├── request/           # Request DTOs
│   │   └── response/          # Response DTOs
│   └── mappers/               # Entity <-> DTO mappers
│
├── infrastructure/            # External adapters (implementations)
│   ├── repositories/          # ORM repository implementations
│   └── services/              # External service implementations
│
├── interface/                 # HTTP layer
│   ├── controllers/           # THIN controllers
│   ├── routes/                # HTTP routes
│   ├── middlewares/           # HTTP middlewares
│   └── validators/            # Request schemas
│
├── shared/                    # Cross-cutting
│   └── di/                    # Dependency injection
│
├── app.ts                     # App factory
└── index.ts                   # Entry point
```

---

## Core Patterns

### 1. CQRS with Transactional Outbox

When a write must produce a side effect in another system (publishing an event, calling an external service, submitting to a slow downstream), do not call that system inside the request. Instead, write the local state change and an outbox record in the same database transaction, then let a background worker drain the outbox. This guarantees the side effect happens exactly when the state change commits, and survives crashes.

```
WRITE PATH:
  API -> Use Case -> Repository -> db.$transaction([data, outboxCommand]) -> 202 Accepted
  Background: outbox-submitter -> external system / event bus

READ PATH:
  Events -> projector -> read models (e.g. PostgreSQL) -> API queries
```

### 2. Multi-Tenancy

If the system is multi-tenant, ALWAYS filter by the tenant identifier. A single missing filter leaks one tenant's data to another.

```typescript
await db.user.findMany({
  where: { tenantId: req.user!.tenantId, status: 'ACTIVE' },
});
```

### 3. Repository Pattern

The use case depends on an interface (a port). The implementation (an adapter) lives in `infrastructure/`. This keeps the ORM out of the business logic and makes the use case testable without a database.

```typescript
// Port (interface) -- application/ports/repositories
export interface IUserRepository {
  findById(id: string): Promise<User | null>;
  create(user: User): Promise<User>;
}

// Adapter (implementation) -- infrastructure/repositories
export class OrmUserRepository implements IUserRepository {
  async findById(id: string): Promise<User | null> {
    const record = await db.user.findUnique({ where: { id } });
    return record ? UserMapper.toDomain(record) : null;
  }
}
```

### 4. Use Case Pattern

A use case orchestrates one piece of business intent. It validates business rules, builds domain entities, persists through a port, and returns a DTO. It contains no HTTP and no ORM.

```typescript
export class RegisterUseCase {
  constructor(
    private userRepo: IUserRepository,
    private hasher: IPasswordHasher,
  ) {}

  async execute(dto: RegisterRequestDTO): Promise<AuthResponseDTO> {
    // 1. Validate business rules
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) throw new UserAlreadyExistsError();

    // 2. Create domain entity
    const user = User.create({ ...dto, passwordHash: await this.hasher.hash(dto.password) });

    // 3. Persist
    const saved = await this.userRepo.create(user);

    // 4. Return DTO
    return UserMapper.toResponseDTO(saved);
  }
}
```

### 5. DTO Validation with a Schema

Validate and coerce input at the boundary with a schema library (Zod shown here; the principle holds for any validator). The inferred type becomes the DTO, so the validation and the type never drift.

```typescript
// application/dto/request/register.dto.ts
export const registerSchema = z.object({
  email: z.string().email().transform(v => v.toLowerCase()),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
});

export type RegisterRequestDTO = z.infer<typeof registerSchema>;
```

### 6. Thin Controllers

Controllers handle only HTTP concerns: read the request, call a use case, shape the response, forward errors. No business logic.

```typescript
export class AuthController {
  constructor(private registerUseCase: RegisterUseCase) {}

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validation done by middleware, logic in use case
      const result = await this.registerUseCase.execute(req.body);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
```

### 7. Validation Middleware

Validation runs in middleware, before the controller. The controller can assume `req.body` is already valid.

```typescript
// interface/middlewares/validation.middleware.ts
import { validateBody, validateQuery, validateParams } from '@org/core-http';

// In routes
router.post('/register', validateBody(registerSchema), controller.register);
router.get('/users', validateQuery(paginationSchema), controller.listUsers);
router.get('/users/:id', validateParams(idSchema), controller.getUser);
```

### 8. Entity Mapper

Mappers translate between the three representations of an entity: the persistence record, the domain entity, and the response DTO. Each boundary gets an explicit mapping so a schema change cannot silently reshape the API.

```typescript
export class UserMapper {
  // Persistence record -> Domain
  static toDomain(record: UserRecord): User {
    return User.reconstitute({ id: record.id, email: Email.create(record.email), /* ... */ });
  }

  // Domain -> Persistence record
  static toPersistence(entity: User): UserRecord {
    return { id: entity.id, email: entity.email.value, /* ... */ };
  }

  // Domain -> Response DTO
  static toDTO(entity: User): UserProfileDTO {
    return { id: entity.id, email: entity.email.value, /* ... */ };
  }
}
```

---

## Creating a New Feature (Step by Step)

This walks one feature from the inside out: domain first, infrastructure last. Each step lives in its proper layer.

### Step 1: Define the Domain Entity (if new)

```typescript
// domain/entities/feature.entity.ts
export class Feature {
  private constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly tenantId: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: { name: string; tenantId: string }): Feature {
    return new Feature(generateId(), props.name, props.tenantId, new Date());
  }

  static reconstitute(props: FeatureProps): Feature {
    return new Feature(props.id, props.name, props.tenantId, props.createdAt);
  }
}
```

### Step 2: Define the Repository Port

```typescript
// application/ports/repositories/feature.repository.port.ts
export interface IFeatureRepository {
  findById(id: string, tenantId: string): Promise<Feature | null>;
  findAll(tenantId: string, options: PaginationOptions): Promise<Feature[]>;
  create(feature: Feature): Promise<Feature>;
}
export const FEATURE_REPOSITORY = Symbol('FEATURE_REPOSITORY');
```

### Step 3: Define DTOs with a Schema

```typescript
// application/dto/request/create-feature.dto.ts
export const createFeatureSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
});
export type CreateFeatureDTO = z.infer<typeof createFeatureSchema>;

// application/dto/response/feature.dto.ts
export interface FeatureResponseDTO {
  id: string;
  name: string;
  createdAt: string;
}
```

### Step 4: Create the Use Case

```typescript
// application/use-cases/feature/create-feature.use-case.ts
@injectable()
export class CreateFeatureUseCase {
  constructor(@inject(FEATURE_REPOSITORY) private featureRepo: IFeatureRepository) {}

  async execute(dto: CreateFeatureDTO, tenantId: string): Promise<FeatureResponseDTO> {
    const feature = Feature.create({ name: dto.name, tenantId });
    const saved = await this.featureRepo.create(feature);
    return FeatureMapper.toDTO(saved);
  }
}
```

### Step 5: Implement the Repository

```typescript
// infrastructure/repositories/orm-feature.repository.ts
@injectable()
export class OrmFeatureRepository implements IFeatureRepository {
  async create(feature: Feature): Promise<Feature> {
    const record = await db.feature.create({
      data: FeatureMapper.toPersistence(feature),
    });
    return FeatureMapper.toDomain(record);
  }
}
```

### Step 6: Create the Controller (THIN)

```typescript
// interface/controllers/feature.controller.ts
@injectable()
export class FeatureController {
  constructor(@inject(CreateFeatureUseCase) private createUseCase: CreateFeatureUseCase) {}

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const result = await this.createUseCase.execute(req.body, req.user!.tenantId);
      res.status(201).json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  };
}
```

### Step 7: Create the Routes

```typescript
// interface/routes/feature.routes.ts
import { validateBody } from '@org/core-http';

const router = Router();
const controller = container.get(FeatureController);

router.post('/',
  createAuthMiddleware({ jwtSecret: config.jwtSecret }),
  validateBody(createFeatureSchema),
  controller.create
);

export default router;
```

---

## Authentication & Authorization

Centralize auth middleware in a shared package so every service enforces it the same way. Read identity from the verified token, never from the request body.

```typescript
import { createAuthMiddleware, requireRoles, AuthenticatedRequest } from '@org/core-http';

const auth = createAuthMiddleware({ jwtSecret: config.jwtSecret });

// In routes
router.get('/protected', auth, controller.method);
router.post('/admin-only', auth, requireRoles(['ADMIN']), controller.adminMethod);

// In controller
async handler(req: AuthenticatedRequest, res: Response) {
  const userId = req.user!.sub;
  const tenantId = req.user!.tenantId;
  const roles = req.user!.roles;
}
```

---

## Error Handling

### Standard Response Format

Use one envelope for every response so clients can parse success and failure uniformly.

```typescript
// Success
{ success: true, data: T, meta?: { page, limit, total } }

// Error
{ success: false, error: { code: string, message: string, timestamp: string, details?: [] } }
```

### Error Classes (from a shared errors package)

```typescript
import {
  BadRequestError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  BusinessRuleError,
  InsufficientBalanceError,
  RateLimitError,
  ServiceUnavailableError,
  InternalError,
} from '@org/core-errors';

// Usage in use cases
if (!user) throw new NotFoundError('User', userId);
if (balance < amount) throw new InsufficientBalanceError(balance, amount);
if (existing) throw new ConflictError('User', 'email', email);
```

A single error-handling middleware maps these classes to status codes, so use cases throw typed errors and never touch HTTP.

### Error Codes

| Code | Status | Usage |
|------|--------|-------|
| VALIDATION_ERROR | 400 | Invalid input |
| UNAUTHORIZED | 401 | Missing/invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Duplicate resource |
| INSUFFICIENT_BALANCE | 400 | Not enough funds |

---

## Database Operations

```typescript
import { db } from '@org/core-db';

// ALWAYS filter by tenantId in a multi-tenant system
const users = await db.user.findMany({
  where: { tenantId, status: 'ACTIVE' },
  skip: (page - 1) * limit,
  take: limit,
});

// ALWAYS use transactions for multi-table operations
await db.$transaction(async (tx) => {
  const user = await tx.user.update({ /* ... */ });
  const account = await tx.account.create({ /* ... */ });
  await tx.outboxCommand.create({ type: 'CREATE_ACCOUNT', /* ... */ });
  return { user, account };
});
```

---

## CQRS Outbox Pattern

When a write triggers an asynchronous downstream effect, respond `202 Accepted` and queue an outbox command in the same transaction. The caller polls or subscribes for the result.

```typescript
const result = await db.$transaction(async (tx) => {
  // Update local state
  const account = await tx.account.update({ /* ... */ });

  // Queue downstream command
  const command = await tx.outboxCommand.create({
    data: {
      type: CommandType.TRANSFER_FUNDS,
      payload: { fromAccountId, toAccountId, amount: amount.toString() },
      status: OutboxStatus.PENDING,
      tenantId,
      createdBy: userId,
    },
  });

  return { commandId: command.id };
});

return res.status(202).json({
  success: true,
  data: { commandId: result.commandId, status: 'PENDING' },
});
```

---

## Configuration

Validate environment variables at startup with a schema. A misconfigured service should fail loudly on boot, not silently at request time.

```typescript
import { baseServiceSchema, createServiceConfig, z } from '@org/core-config';

// Extend the base schema for service-specific config
const authConfigSchema = baseServiceSchema.extend({
  EMAIL_API_KEY: z.string().min(1),
  OTP_EXPIRY_MINUTES: z.coerce.number().int().positive().default(10),
});

export const config = createServiceConfig(authConfigSchema);
export type AuthConfig = typeof config;
```

---

## Logging

```typescript
import { logger } from '@org/core-logger';

// Structured logging with context
logger.info({ userId, tenantId, action: 'login' }, 'User logged in');
logger.error({ error, userId }, 'Transfer failed');

// NEVER log sensitive data (passwords, tokens, PII)
```

Structured logs are queryable; string logs are not. Always attach the identifiers you would want to filter by later.

---

## Testing Patterns (Testing Trophy)

The Testing Trophy weights integration tests heaviest because they catch the bugs that actually ship: wiring between layers, real database behavior, real serialization. Unit tests cover pure logic; end-to-end tests cover only critical user journeys.

### Test Distribution

| Layer | % | Tool (example) | Tests |
|-------|---|----------------|-------|
| Unit | 10-15% | Vitest / Jest | Pure functions only |
| Integration | 65-75% | Vitest + Testcontainers | Real DB |
| Contract | 10-15% | Pact | API compatibility |
| E2E | 5-10% | Playwright | Critical user journeys only |

### Unit Test (Pure Functions)

```typescript
// Only test pure business logic
describe('calculateFee', () => {
  it('should be free for amounts at or below the threshold', () => {
    expect(calculateFee(3)).toEqual({ amount: 0 });
  });
});
```

### Integration Test (Real DB)

Run integration tests against a real database in a disposable container (Testcontainers or equivalent). Mocked databases hide the bugs integration tests exist to catch.

```typescript
import { setupTestDatabase, teardownTestDatabase, resetDatabase, UserFactory } from '@org/test-utils';

describe('UserService (Real DB)', () => {
  let db: DbClient;

  beforeAll(async () => {
    db = await setupTestDatabase();
  }, 60000);

  afterAll(async () => {
    await teardownTestDatabase();
  });

  beforeEach(async () => {
    await resetDatabase();
  });

  it('should create a user in the real database', async () => {
    const user = await userService.create({ email: 'test@test.com', tenantId: 'tenant-1' });
    const found = await db.user.findUnique({ where: { id: user.id } });
    expect(found).not.toBeNull();
  });
});
```

### Contract Test (API Compatibility)

When one service consumes another's API, a contract test pins the shape so neither side breaks the other silently.

```typescript
// Consumer defines expectations, provider must fulfill
await provider
  .given('user exists')
  .uponReceiving('get user request')
  .withRequest({ method: 'GET', path: '/api/v1/users/123' })
  .willRespondWith({ status: 200, body: { id: like('123') } })
  .executeTest(async (mockServer) => { /* ... */ });
```

### Test Naming Convention

```
*.unit.spec.ts          # Unit tests
*.integration.spec.ts   # Integration tests
*.contract.spec.ts      # Contract tests
*.pact.spec.ts          # Pact contract tests
```

### What NOT to Test with Unit Tests

- Controllers (they just call use cases)
- Repositories (they just call the ORM)
- Anything that requires mocking the database (write an integration test instead)

---

## Validation Checklist

Before completing ANY backend task:

**Architecture:**
- [ ] Domain logic in `domain/` layer (no I/O)
- [ ] Use cases in `application/` layer
- [ ] Repositories implement interfaces from `ports/`
- [ ] Controllers are THIN (delegate to use cases)

**Code Quality:**
- [ ] DTOs validated with a schema
- [ ] Entity mappers for persistence <-> domain <-> DTO
- [ ] Structured logging at key points
- [ ] No sensitive data in logs

**Security:**
- [ ] Auth middleware from the shared HTTP package
- [ ] tenantId filtering on ALL queries (multi-tenant systems)
- [ ] Input sanitization

**Data Integrity:**
- [ ] Transactions for multi-table operations
- [ ] Outbox pattern for asynchronous downstream effects
- [ ] Proper status codes (201 create, 202 async)

**Testing:**
- [ ] Unit tests for pure business logic
- [ ] Integration tests with a real database (Testcontainers)
- [ ] Contract tests if consuming another service's API

---

## Common Mistakes to Avoid

1. **Fat controllers**: move logic to use cases.
2. **Missing tenantId**: always filter by tenant in a multi-tenant system.
3. **Direct ORM calls in controllers**: go through repositories.
4. **Validation in controllers**: use schema middleware.
5. **Duplicated auth middleware**: import from the shared HTTP package.
6. **200 for async operations**: use 202 Accepted.
7. **Logging secrets**: never log passwords, tokens, or PII.
8. **Mocking databases**: use a disposable real database (Testcontainers) instead.

---

## Quick Reference

```typescript
// Imports (replace @org/* with your workspace package scope)
import { db } from '@org/core-db';
import { logger } from '@org/core-logger';
import { createAuthMiddleware, requireRoles, AuthenticatedRequest, validateBody } from '@org/core-http';
import { NotFoundError, ConflictError, InsufficientBalanceError } from '@org/core-errors';
import { baseServiceSchema, createServiceConfig, z } from '@org/core-config';
import { setupTestDatabase, UserFactory, AccountFactory } from '@org/test-utils';
import { CommandType, OutboxStatus } from '<your-orm-client>';

// Common models (replace with your domain)
db.user, db.account, db.transaction, db.outboxCommand
```

---

## Production-Grade Best Practices

These conventions are non-negotiable for new code. They emerge from a recurring pattern: choices that look harmless at small scale (a `number` field, a bare timestamp, a service-layer-only tenant filter) become silent data-corruption or data-leak bugs at production scale. Each rule below trades a little upfront discipline for a class of bug you will never have to debug.

Capture the rationale for major decisions in `docs/adrs/` (architecture decision records) so the team has a durable record of why, not just what.

### Money and Decimal Amounts

**Never use a floating-point `number` for monetary fields.** IEEE 754 doubles have 53 bits of integer precision; any amount above 2^53 minor units (~9 × 10^15) silently loses precision when crossing the JSON-parse boundary. This is the single most common money bug in JavaScript backends.

The required pattern mirrors the minor-unit conventions used by Stripe, Adyen, and major ledger systems: represent money as an integer count of the smallest unit, validate it as a string, and never let a float touch it.

```typescript
// DTO: regex-string validation (no float ever enters the system)
const transferSchema = z.object({
  amount: z.string().regex(
    /^\d+(\.\d{1,6})?$/,
    'Amount must be a positive decimal with up to 6 fractional digits',
  ),
  // ...
});

// Use case (application layer): parse at the boundary into a precise type
async execute(dto: TransferDTO): Promise<Result> {
  const amount = Money.from(dto.amount);
  if (!amount.isPositive()) {
    throw new InvalidAmountError(dto.amount, 'must be greater than zero');
  }
  // arithmetic only on the precise Money / BigInt type from here onward
}
```

Use a money value object backed by scaled `BigInt` (no floating-point on the hot path). Typical operations: `from`, `toString`, `toBigInt`, `isZero`, `isPositive`, `isGreaterThan`, `isLessThanOrEqual`, `add`, `subtract`. Outbox payloads and wire format serialize via `amount.toString()`: strings are the canonical wire format for money.

Pick the precision your domain requires (for example, currencies with 2 decimal places, or higher-precision domains needing 6 or more) and make it a single documented constant. The persistence column should match that precision exactly, for example a fixed-point `Decimal(36, 6)` for a 6-decimal domain. Never store money as `Float` (IEEE 754 lossy) and never as a plain integer if the domain has fractional units it cannot represent. The value object may use a higher internal scale (for example 18 decimals) to avoid rounding during multi-step calculations, while all persisted and wire-format values use the canonical domain precision.

Banker's rounding (`HALF_EVEN`) is the financial-systems consensus. Declare it once per service at startup:

```typescript
import Decimal from 'decimal.js';
Decimal.set({ rounding: Decimal.ROUND_HALF_EVEN });
```

### DTO <-> Schema Alignment

The validation contract (the request schema) and the persistence contract (the database schema) must stay in lockstep. Drift between them is silent: tests using DTO-shaped fixtures never surface a persistence-layer mismatch, so the bug only appears in production.

Rules for new code:

1. **Phantom DTO fields are forbidden.** Every field in a DTO must map to a column on the model the use case writes to. If you collect data the model cannot store, either add the column (with a migration) or drop the field from the DTO.
2. **Required-in-DTO implies required-in-model.** If the DTO marks a field non-optional, the persistence model must also be non-optional (or a CHECK constraint must enforce conditional non-null when the entity reaches the relevant state).
3. **Length constraints align.** A `max(N)` string in the schema should match the column's `VarChar(N)`. Prefer widening the model in a migration over tightening the DTO.
4. **Field names align.** No `deviceOs` in the DTO mapped to `osVersion` in the model. Use identical names. Renames are breaking changes that must be coordinated with API consumers.
5. **Enums stay in lockstep.** Import the persistence enum directly into the schema (for example via a native-enum validator) to eliminate manual transcription drift.

### Identifiers

- **UUID v4** is acceptable for existing tables. Do not migrate just to migrate.
- **UUID v7** (RFC 9562, May 2024) is the new-table default. It is time-ordered, which preserves index locality on high-write tables. Generate it at the database or application layer depending on your ORM's support.
- **Prefixed IDs** in the style of `cus_xxx` or `ord_xxx` are encouraged for human-debuggability when an ID will appear in logs and support tickets. The convention is `<short-type-code>_<base32-payload>`.

### Time and Timestamps

PostgreSQL guidance has been consistent for over a decade: **always use `TIMESTAMPTZ`, never bare `TIMESTAMP`.** Bare `TIMESTAMP` stores no timezone, which leaves distributed-system reconciliation ambiguous.

```
createdAt   TIMESTAMPTZ   default now()
updatedAt   TIMESTAMPTZ   on update now()
```

Store UTC at the boundary; render in the user's timezone in the UI. Never store local time anywhere.

### Tenant Isolation

Service-layer `tenantId` filtering (the pattern shown above) is industry-standard but is one forgotten `WHERE tenant_id = ?` away from a cross-tenant data leak. The defense-in-depth layer is **Postgres Row-Level Security (RLS)**, which makes accidental cross-tenant reads structurally impossible:

```sql
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation ON "Account"
  USING (tenant_id::text = current_setting('app.current_tenant_id', true));
```

Set the session variable in middleware before each request handler runs.

### Sensitive Data

- **PII fields** (email, phone, date of birth, national identifiers, biometric hashes, full names): protect with column-level encryption (for example `pgcrypto`) or application-layer envelope encryption backed by a KMS. Never store PII plaintext at rest. Treat every new table as a chance to encrypt by default.
- **Secrets** (API keys, passwords, OAuth secrets): hash with **argon2id** (OWASP 2024 recommendation). Bcrypt is acceptable for legacy compatibility but not for new code. The field name should reflect that it stores a hash: `passwordHash`, not `password`.
- **GDPR Article 17 erasure**: soft delete (set `deletedAt`) plus scheduled anonymization (zero out PII, retain row shape for referential integrity, hard-delete after the retention window). Pure soft-delete leaves PII queryable and is non-compliant.

### CQRS Outbox Discipline

Every outbox `create(...)` call must be inside either:

- A `db.$transaction(...)` callback, or
- An atomic-transaction port callback (the port pattern that wraps the transaction internally).

If you have a custom lint rule, enforce this mechanically: an outbox write outside a transaction is a latent data-consistency bug that a lint rule catches at authoring time.

The outbox row should always include `tenantId`, `service` (the producing service name, for example `'svc-billing'`), `requestId` (deterministic, typically `${entityId}-${commandType}` so crash-retries are idempotent), `commandType`, and `payload`. A missing `tenantId`, `service`, or `requestId` will fail at runtime when the projector dispatches.

### Pre-commit and Pre-push Discipline

A three-tier verification ladder keeps the feedback loop fast while still catching everything before CI:

| Tier | Latency target | Scope |
|------|----------------|-------|
| Pre-commit | under 5s | `lint-staged` runs `eslint --fix` + `prettier --write` on changed files only |
| Pre-push | under 60s | `npm run verify` runs `lint`, `type-check`, and `test` workspace-wide |
| CI | under 10min | Full repo lint + type-check + test + build + security-scan + dependency audit |

Configure via your git-hooks tooling (for example Husky `pre-commit` and `pre-push`). `--no-verify` is reserved for genuine emergencies: fix the underlying error rather than bypass the gate.

Empty-test packages must pass with no tests (for example `--passWithNoTests`). Manual scripts that are not real tests must not match the test glob; rename them (for example `*.manual-script.ts`) or move them out of the test directory.

### Test-Runner Alignment

When a codebase migrates between test runners, mixing one runner with another's test syntax causes the transform to choke on ESM imports. Any package whose `*.spec.ts` files import from a given runner must declare that runner in its `package.json` test script (for example `"test": "vitest run --passWithNoTests"`). Keep the runner and the test syntax consistent per package.

### Local-CI Parity

The CI gate (lint, type-check, test, build, security-scan) and the local `npm run verify` script must match one-for-one. If a check fires in CI but not in `verify`, that gap costs the team a CI round-trip on every pull request. Keep the two in sync deliberately.

### Documentation Standards

- Capture new work as a narrative in a dated work record, for example `docs/workrecords/work-record-YYYY-MM-DD.md`. Append-only.
- Architectural decisions go into `docs/adrs/` as decision records or design studies.
- Durable industry research and reference material go into a dedicated docs folder (for example `docs/references/`).
- Each new module or service specification follows a shared spec template kept under `.claude/templates/`.

### Commit Discipline

- File-by-file commits. Each commit is one logical change.
- Conventional Commits format: `type(scope): subject`, with `type` in {feat, fix, refactor, chore, docs, test, perf, security, ci}.
- Imperative mood (`add`, not `added`).
- Subject line at most 72 characters; the body explains why, not what.
- Never commit secrets.
- Follow your team's policy on AI attribution in commit messages.
- Never use emojis in commit messages.

---

## Apply to: $ARGUMENTS
