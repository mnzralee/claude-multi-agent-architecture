# Testing Trophy Worked Examples

Extracted verbatim from the backend skill's core `SKILL.md` ("Testing Patterns (Testing Trophy)" section). Read this when writing the actual Unit, Integration, or Contract test files for a feature. The core `SKILL.md` keeps the Test Distribution table, the Test Naming Convention, and the "What NOT to Test" list, since those are needed to decide which test type to write; this file holds the worked code examples.

---

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
