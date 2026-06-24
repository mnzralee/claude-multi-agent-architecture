---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Clean Architecture Rules

## Overview

This project follows Clean Architecture principles to ensure maintainability, testability, and separation of concerns. The examples below use TypeScript and Express, but the discipline is stack-agnostic: the same layer boundaries apply to any language or framework. These rules MUST be followed for all backend code.

---

## Layer Structure

```
┌─────────────────────────────────────────────────────────┐
│                    INTERFACE (PRESENTATION)               │
│  Controllers, Routes, Middleware, DTOs (Express.js)      │
├─────────────────────────────────────────────────────────┤
│                    APPLICATION                           │
│  Use Cases, Application Services, Ports (Interfaces)     │
├─────────────────────────────────────────────────────────┤
│                      DOMAIN                              │
│  Entities, Value Objects, Domain Services, Events        │
├─────────────────────────────────────────────────────────┤
│                   INFRASTRUCTURE                         │
│  Repositories, External Services, Database, Clients      │
└─────────────────────────────────────────────────────────┘
```

---

## Dependency Rule

**Dependencies MUST point inward.** Outer layers can depend on inner layers, but inner layers MUST NOT depend on outer layers.

```
Correct
Controller -> Use Case -> Entity
Repository Impl -> Repository Interface (in Application)

Wrong
Entity -> Repository (concrete)
Use Case -> Controller
Domain -> ORM client
```

---

## Layer Rules

### Domain Layer

**Location**: `src/domain/`

**Contains**:
- Entities
- Value Objects
- Domain Services
- Domain Events
- Domain Exceptions

**Rules**:
1. NO external dependencies (no Express, no ORM client, no HTTP)
2. NO infrastructure imports
3. Pure language-level code only (TypeScript in this example)
4. Business logic lives here
5. Entities validate their own invariants

**Example**:
```typescript
// domain/entities/user.entity.ts
export class User {
  private constructor(
    public readonly id: string,
    public readonly email: Email, // Value Object
    private _status: UserStatus,
    private _name: string,
  ) {}

  get status(): UserStatus {
    return this._status;
  }

  get name(): string {
    return this._name;
  }

  activate(): void {
    if (this._status !== UserStatus.PENDING) {
      throw new UserAlreadyActivatedError(this.id);
    }
    this._status = UserStatus.ACTIVE;
  }

  static create(props: CreateUserProps): User {
    // Validation happens here
    const email = Email.create(props.email);
    return new User(generateId(), email, UserStatus.PENDING, props.name);
  }
}
```

### Application Layer

**Location**: `src/application/`

**Contains**:
- Use Cases (Handlers)
- Application Services
- DTOs
- Ports (Interfaces for infrastructure)

**Rules**:
1. Orchestrates domain logic
2. Defines repository interfaces (ports)
3. NO direct database access
4. NO HTTP-specific code
5. Transaction management happens here

**Example**:
```typescript
// application/use-cases/register-user/handler.ts
export class RegisterUserHandler {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly hashService: HashService,
  ) {}

  async execute(dto: RegisterUserDTO): Promise<RegisterUserResult> {
    // Check business rule
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new EmailAlreadyExistsError(dto.email);
    }

    // Create domain entity
    const user = User.create({
      email: dto.email,
      name: dto.name,
    });

    // Infrastructure operations via ports
    const hashedPassword = await this.hashService.hash(dto.password);
    await this.userRepo.save(user, hashedPassword);

    return RegisterUserResult.success(user);
  }
}

// DI wiring in shared/di/container.ts
const registerUserHandler = new RegisterUserHandler(userRepository, hashService);
```

```typescript
// application/ports/user.repository.ts
export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User, password: string): Promise<void>;
  delete(id: string): Promise<void>;
}
```

### Infrastructure Layer

**Location**: `src/infrastructure/`

**Contains**:
- Repository Implementations
- External Service Clients
- Database Configuration
- Third-party Integrations

**Rules**:
1. Implements ports defined in Application layer
2. Contains all external dependencies (your ORM, HTTP clients, queue adapters)
3. Maps between domain entities and persistence models
4. NO business logic

**Example** (using a hypothetical ORM service; substitute your ORM of choice):
```typescript
// infrastructure/repositories/user.repository.impl.ts
@Injectable()
export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly db: DatabaseService) {}

  async findById(id: string): Promise<User | null> {
    const data = await this.db.user.findUnique({
      where: { id },
    });
    return data ? this.toDomain(data) : null;
  }

  async save(user: User, password: string): Promise<void> {
    await this.db.user.upsert({
      where: { id: user.id },
      create: {
        id: user.id,
        email: user.email.value,
        name: user.name,
        status: user.status,
        password,
      },
      update: {
        name: user.name,
        status: user.status,
      },
    });
  }

  private toDomain(data: DbUser): User {
    return User.reconstruct({
      id: data.id,
      email: data.email,
      name: data.name,
      status: data.status as UserStatus,
    });
  }
}
```

### Presentation Layer

**Location**: `src/interface/` (or `src/presentation/`)

**Contains**:
- Controllers (plain classes with handle methods)
- Routes (Express Router factories)
- Middleware (auth guards, validation, error handling)
- Request/Response DTOs

**Rules**:
1. Handles HTTP-specific concerns (Express req/res)
2. Validates request input (Zod schemas, or your validation library of choice)
3. Transforms responses
4. NO business logic
5. Delegates to Use Cases

**Example**:
```typescript
// interface/controllers/user.controller.ts
export class UserController {
  constructor(
    private readonly registerUser: RegisterUserHandler,
    private readonly getUser: GetUserHandler,
  ) {}

  async register(req: Request, res: Response): Promise<void> {
    const dto = RegisterUserSchema.parse(req.body);
    const result = await this.registerUser.execute(dto);
    res.status(201).json({
      success: true,
      data: UserDTO.fromDomain(result.user),
    });
  }
}

// interface/routes/user.routes.ts
export function createUserRoutes(controller: UserController): Router {
  const router = Router();
  router.post('/', jwtAuthMiddleware, (req, res, next) =>
    controller.register(req, res).catch(next)
  );
  return router;
}
```

---

## File Structure

The canonical layout for a single service. Adjust the service name to match your project:

```
apps/svc-<name>/src/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts
│   ├── value-objects/
│   │   └── email.vo.ts
│   ├── services/
│   │   └── user-domain.service.ts
│   └── exceptions/
│       └── user.exceptions.ts
├── application/
│   ├── use-cases/
│   │   └── register-user/
│   │       ├── index.ts
│   │       ├── handler.ts
│   │       └── dto.ts
│   ├── ports/
│   │   └── user.repository.ts
│   └── services/
│       └── hash.service.ts
├── infrastructure/
│   ├── repositories/
│   │   └── user.repository.impl.ts
│   ├── services/
│   │   └── bcrypt-hash.service.ts
│   └── db/
│       └── database.service.ts
├── interface/
│   ├── controllers/
│   │   └── user.controller.ts
│   ├── routes/
│   │   └── user.routes.ts
│   └── middleware/
│       └── jwt-auth.middleware.ts
└── shared/
    └── di/
        └── container.ts
```

---

## Common Violations

### Domain depending on Infrastructure
```typescript
// WRONG: Entity using an ORM client directly
import { SomeOrmClient } from 'some-orm';

export class User {
  async save() {
    await orm.user.create(...); // NO: domain must never touch infrastructure
  }
}
```

### Use Case containing HTTP logic
```typescript
// WRONG: Use case throwing HTTP-specific error
export class RegisterUserHandler {
  async execute(dto) {
    if (!dto.email) {
      res.status(400).json({ error: 'Email required' }); // NO: use domain error
    }
  }
}

// CORRECT: Throw domain error, let controller translate to HTTP
throw new ValidationError('Email is required');
```

### Controller containing business logic
```typescript
// WRONG: Controller with business logic
async register(req: Request, res: Response) {
  // Business logic should live in the Use Case, not here
  if (await this.userRepo.findByEmail(req.body.email)) { // NO
    res.status(409).json({ error: 'Email exists' });
    return;
  }
  const user = new User();
  user.email = req.body.email;
  await this.userRepo.save(user);
}
```

---

## Testing Strategy

| Layer | Test Type | Mocks |
|-------|-----------|-------|
| Domain | Unit | None |
| Application | Unit | Repository ports, Services |
| Infrastructure | Integration | Database |
| Presentation | E2E | Full stack |

---

## Enforcement

These rules are enforced by:
1. Code review (reviewer agent)
2. Architecture tests (if configured, e.g. dependency-cruiser or similar)
3. Import restrictions in tsconfig path aliases
4. [CUSTOMIZE: add any project-specific lint rules or CI gates here]
