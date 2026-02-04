# Testing Standards

## Overview

This project follows the Testing Pyramid strategy to ensure comprehensive test coverage while maintaining fast feedback loops.

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

### Integration Tests (Middle - 20%)

**Purpose**: Test interactions between components/services.

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

---

## Coverage Targets

| Layer | Target | Minimum |
|-------|--------|---------|
| Domain/Core | 95% | 90% |
| Application/Services | 90% | 80% |
| Infrastructure | 70% | 60% |
| Presentation/API | 60% | 50% |
| **Overall** | **80%** | **70%** |

---

## Test File Organization

```
src/
├── services/
│   ├── user.service.ts
│   └── user.service.spec.ts     # Unit test alongside source
├── __tests__/                    # Or dedicated test directory
│   ├── unit/
│   └── integration/
└── e2e/
    └── auth.e2e-spec.ts          # E2E tests
```

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

## Test Patterns

### Unit Test Structure
```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepo: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      save: jest.fn(),
    };
    service = new UserService(mockRepo);
  });

  describe('createUser', () => {
    it('should create user when email is unique', async () => {
      // Arrange
      mockRepo.findByEmail.mockResolvedValue(null);
      mockRepo.save.mockResolvedValue(undefined);
      const dto = { email: 'test@example.com', name: 'Test' };

      // Act
      const result = await service.createUser(dto);

      // Assert
      expect(mockRepo.findByEmail).toHaveBeenCalledWith(dto.email);
      expect(mockRepo.save).toHaveBeenCalled();
      expect(result.success).toBe(true);
    });

    it('should throw error when email already exists', async () => {
      // Arrange
      mockRepo.findByEmail.mockResolvedValue({ id: '123' });
      const dto = { email: 'existing@example.com', name: 'Test' };

      // Act & Assert
      await expect(service.createUser(dto)).rejects.toThrow('Email exists');
    });
  });
});
```

### Component Test Structure
```tsx
describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders email and password inputs', () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
  });

  it('shows validation errors for empty submission', async () => {
    render(<LoginForm onSubmit={mockOnSubmit} />);

    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(screen.getByText(/required/i)).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
```

---

## When to Write Tests

### Always Test
- Domain entities and business logic
- Service/use case handlers
- API endpoints
- Form validation
- Critical user flows

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

## Running Tests

```bash
# All tests
npm test

# With coverage
npm test -- --coverage

# Watch mode
npm test -- --watch

# Specific file
npm test -- path/to/file.test.ts

# Specific pattern
npm test -- --testNamePattern="should create"
```

---

## CI/CD Integration

Tests should run on every PR:

```yaml
test:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - name: Install dependencies
      run: npm ci
    - name: Run unit tests
      run: npm test -- --coverage
    - name: Run integration tests
      run: npm run test:integration
```

---

## Enforcement

These standards are enforced by:
1. Code review (reviewer agent checks test coverage)
2. CI pipeline (tests must pass)
3. Coverage thresholds (minimum coverage required)
4. Pre-commit hooks (optional)
