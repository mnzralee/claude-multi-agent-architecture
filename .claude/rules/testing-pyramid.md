---
paths:
  - "**/*.test.ts"
  - "**/*.spec.ts"
  - "**/*.test.tsx"
  - "**/*.spec.tsx"
  - "**/__tests__/**"
  - "**/test/**"
  - "**/tests/**"
  - "**/e2e/**"
  - "**/playwright.config.*"
  - "**/vitest.config.*"
  - "**/jest.config.*"
---

# Testing Pyramid Rules

## Overview

This project follows the Testing Pyramid strategy to ensure comprehensive test coverage while maintaining fast feedback loops. The examples below use TypeScript and Vitest for concreteness; the discipline applies equally to any stack.

```
                    ┌───────────┐
                    │   E2E     │  Few, slow, high confidence
                    │  Tests    │
                ┌───┴───────────┴───┐
                │   Integration     │  Moderate, medium speed
                │      Tests        │
            ┌───┴───────────────────┴───┐
            │        Unit Tests         │  Many, fast, focused
            └───────────────────────────┘
```

---

## Test Types

### Unit Tests (Base - 70%)

**Purpose**: Test individual functions, classes, and modules in isolation.

**Characteristics**:
- Fast (milliseconds)
- Isolated (no external dependencies)
- Focused (one behavior per test)
- Many tests

**What to Mock**:
- Databases
- External APIs
- File system
- Network calls

**What NOT to Mock**:
- Simple value objects
- Pure functions
- The code under test

**Example**:
```typescript
// Testing a domain entity
describe('User', () => {
  describe('activate', () => {
    it('should change status from PENDING to ACTIVE', () => {
      const user = User.create({ email: 'test@example.com', name: 'Test' });

      user.activate();

      expect(user.status).toBe(UserStatus.ACTIVE);
    });

    it('should throw error when user is already active', () => {
      const user = User.reconstruct({
        id: '123',
        email: 'test@example.com',
        name: 'Test',
        status: UserStatus.ACTIVE,
      });

      expect(() => user.activate()).toThrow(UserAlreadyActivatedError);
    });
  });
});
```

### Integration Tests (Middle - 20%)

**Purpose**: Test interactions between components and services.

**Characteristics**:
- Moderate speed (seconds)
- Test real integrations
- Use test database
- Test API endpoints

**What to Include**:
- Database operations
- HTTP endpoints
- Message queues
- Cache interactions

**What to Mock**:
- External third-party services
- Payment providers
- Email services

**Example**:
```typescript
// Testing an API endpoint
describe('POST /api/v1/users', () => {
  let app: INestApplication;
  let db: DatabaseService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    db = module.get(DatabaseService);
    await app.init();
  });

  beforeEach(async () => {
    await db.user.deleteMany();
  });

  it('should create a user and return 201', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/users')
      .send({
        email: 'test@example.com',
        password: 'SecurePass123!',
        name: 'Test User',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.email).toBe('test@example.com');

    // Verify in database
    const user = await db.user.findUnique({
      where: { email: 'test@example.com' },
    });
    expect(user).toBeDefined();
  });
});
```

### E2E Tests (Top - 10%)

**Purpose**: Test complete user flows across the entire system.

**Characteristics**:
- Slow (tens of seconds to minutes)
- Test real system
- Few tests
- Critical paths only

**What to Test**:
- Critical business flows
- User journeys
- Cross-service interactions

**Example Flows**:
1. User registration, verification, first action
2. Admin login, user management, approval flow
3. Resource creation, state transition, final resolution

---

## Coverage Targets

| Layer | Target | Minimum |
|-------|--------|---------|
| Domain | 95% | 90% |
| Application (Use Cases) | 90% | 80% |
| Infrastructure | 70% | 60% |
| Presentation | 60% | 50% |
| **Overall** | **80%** | **70%** |

---

## Test File Organization

### Backend Service
```
apps/svc-<name>/
├── src/
│   ├── domain/
│   │   └── entities/
│   │       ├── user.entity.ts
│   │       └── user.entity.spec.ts     # Unit test
│   └── application/
│       └── use-cases/
│           └── register-user/
│               ├── handler.ts
│               └── handler.spec.ts     # Unit test
└── test/
    ├── auth.e2e-spec.ts               # Integration tests
    └── jest-e2e.json                  # E2E config
```

### Frontend Application
```
apps/<frontend>/
├── components/
│   └── forms/
│       ├── login-form.tsx
│       └── __tests__/
│           └── login-form.test.tsx    # Unit test
├── hooks/
│   ├── use-auth.ts
│   └── __tests__/
│       └── use-auth.test.tsx          # Unit test
└── e2e/
    └── auth.spec.ts                   # E2E test (Playwright)
```

---

## When to Write Tests

### Always Test
- Domain entities and value objects
- Use case handlers
- API endpoints
- Form validation
- Critical business logic

### Test When Valuable
- Utility functions (if complex)
- Custom hooks
- Components with logic

### Skip Testing
- Simple pass-through code
- Generated code
- External library wrappers
- Pure configuration

---

## Test Quality Checklist

### Good Tests
- [ ] Descriptive name (`should_doX_when_Y`)
- [ ] Tests one behavior
- [ ] Follows Arrange-Act-Assert
- [ ] Independent (no shared state)
- [ ] Deterministic (no flaky tests)
- [ ] Fast (< 100ms for unit)

### Bad Tests
- [ ] Tests implementation details
- [ ] Multiple assertions for different behaviors
- [ ] Depends on test order
- [ ] Uses real external services
- [ ] Hardcoded dates/times
- [ ] Unclear failure message

---

## Running Tests

### Backend
```bash
# All tests
npm test

# Specific service
npm test -- --projects=svc-<name>

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# E2E tests
npm run test:e2e
```

### Frontend
```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Specific file
npx vitest components/forms/__tests__/login-form.test.tsx

# E2E tests
npx playwright test
```

---

## CI/CD Integration

Tests should run on every pull request:

```yaml
# .github/workflows/test.yml (example)
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Install dependencies
      run: npm ci
    - name: Run unit tests
      run: npm test -- --coverage
    - name: Run integration tests
      run: npm run test:e2e
    - name: Upload coverage
      uses: codecov/codecov-action@v3
```

---

## Domain-Specific Test Considerations

### Financial Operations
- Test exact amounts (no floating point arithmetic)
- Test overflow and underflow conditions
- Test concurrent transaction handling
- Test insufficient-funds paths

### Authentication
- Test token validation
- Test token expiry
- Test refresh flow
- Test role-based access control

### Distributed or Async Operations
- Test timeout and retry behavior
- Test event projection and idempotency
- Test partial failure and rollback paths
- Test at-least-once delivery guarantees

[CUSTOMIZE: Add your own domain-specific test categories here, following the same pattern: surface the failure modes that matter most for your business logic and ensure each has explicit test coverage.]
