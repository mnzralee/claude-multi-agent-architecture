---
paths:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
---

# Code Quality Standards

## Overview

Positive patterns for readable, maintainable code. Complements `production-grade-code.md` (which lists forbidden patterns). Path-scoped to TypeScript and JavaScript files. The discipline is stack-agnostic; examples use TypeScript / Node / Express / Zod for concreteness.

---

## Naming Conventions

### Variables and functions

```typescript
// GOOD: descriptive, reveals intent
const activeUsers = users.filter(u => u.isActive);
const calculateOrderTotal = (items: OrderItem[]): Money => { ... };

// BAD: vague, requires reading the body to understand
const data = users.filter(u => u.isActive);
const calc = (x: OrderItem[]) => { ... };
```

### Booleans read as questions

```typescript
// GOOD
const isActive = true;
const hasPermission = checkPermission(user);
const canApprove = user.role === UserRole.ADMIN;

// BAD: ambiguous as a property name
const active = true;
const permission = checkPermission(user);
```

### Constants in SCREAMING_SNAKE_CASE

```typescript
// GOOD
const MAX_RETRY_ATTEMPTS = 3;
const UNITS_PER_BASE = 1_000_000;
const SESSION_TTL_MS = 30 * 60 * 1000;

// BAD: looks like a regular variable
const maxRetryAttempts = 3;
```

### Files in kebab-case

```
# GOOD
user-profile.service.ts
order.use-case.ts
use-account-balance.ts

# BAD
UserProfile.service.ts
OrderUseCase.ts
useAccountBalance.ts
```

Exception: React components and classes can be PascalCase in filename (`UserProfile.tsx`) following ecosystem convention.

---

## Function Guidelines

### Size: aim for one screen

Functions under roughly 30 lines. If larger, extract helper functions. Orchestration handlers in `application/use-cases/<name>/handler.ts` sometimes exceed this; extract inner logic into private methods or domain services.

### Parameters: max 3, then use an object

```typescript
// GOOD: 3 or fewer positional
function transferFunds(from: AccountId, to: AccountId, amount: Money) { ... }

// GOOD: more than 3, use an object
function createTransfer(input: CreateTransferInput) { ... }

interface CreateTransferInput {
  from: AccountId;
  to: AccountId;
  amount: Money;
  memo?: string;
  idempotencyKey: string;
}

// BAD: too many positional, easy to swap argument order
function createTransfer(from, to, amount, memo, idempotencyKey) { ... }
```

### Return early

```typescript
// GOOD: early returns reduce nesting
async function processTransfer(input: TransferInput): Promise<Transfer> {
  if (!input.amount || input.amount <= 0) {
    throw new InvalidAmountError(input.amount);
  }
  if (input.from === input.to) {
    throw new SelfTransferError();
  }
  return await this.executeTransfer(input);
}

// BAD: deeply nested
async function processTransfer(input: TransferInput): Promise<Transfer> {
  if (input.amount && input.amount > 0) {
    if (input.from !== input.to) {
      return await this.executeTransfer(input);
    }
  }
  throw new Error('Invalid');
}
```

### Pure functions where possible

```typescript
// GOOD: pure, predictable, testable
function calculateFee(amount: Money, rate: bigint): Money {
  return (amount * rate) / 10_000n;
}

// AVOID: hidden side effects in a function that looks pure
function calculateFee(amount: Money, rate: bigint): Money {
  this.logger.info('Calculating fee');           // logging side effect
  this.metrics.increment('fee_calc');             // metric side effect
  return (amount * rate) / 10_000n;
}
```

Logging and metrics belong at the boundaries (use case entry, controller exit), not inside pure calculation functions.

---

## Comments

### When to comment

```typescript
// GOOD: explain WHY, not WHAT
// We use setTimeout(0) to defer this until after the current render cycle,
// because the parent component remounts on each transition and would otherwise
// race against our state update.
setTimeout(() => updateContext(), 0);

// GOOD: document non-obvious algorithm choice
// Binary search assumes pre-sorted ledger; O(log n) vs O(n) linear scan.
// Verified the ledger is sorted by ledger-domain-service.ts:42.
function findEntryByTxId(ledger: Entry[], txId: string): Entry | null { ... }
```

### When NOT to comment

```typescript
// BAD: states the obvious
// Increment counter
counter++;

// BAD: comment compensating for bad naming
// Get active users
const u = users.filter(x => x.a);

// GOOD: self-documenting alternative
const activeUsers = users.filter(u => u.isActive);
```

Default rule: write NO comments. Only add one when the WHY is non-obvious.

---

## Organization

### File size

Keep TypeScript files under 300 lines. Use cases that grow past 300 lines are usually doing too much; extract into multiple use cases or a domain service.

### Import order

```typescript
// 1. External packages
import { Router } from 'express';
import { z } from 'zod';

// 2. Internal workspace packages (sorted)
import { db } from '@org/core-db';
import { type DomainError } from '@org/core-errors';
import { Logger } from '@org/core-logger';

// 3. Relative imports (sorted by depth, then alphabetically)
import { OrderDTO } from '../../application/dto/order.dto';
import { OrderHandler } from '../../application/use-cases/order/handler';
import { orderRoutes } from './routes/order.routes';

// 4. Type-only imports last
import type { OrderInput } from '../../application/dto/order.input';
```

Replace `@org/*` with your actual workspace package prefix (e.g. `@myapp/*`).

### Exports

Prefer named exports for testability and refactoring. Default exports only for framework conventions (Next.js page components, Express middleware).

---

## Anti-Patterns to Avoid

### Magic numbers and strings

```typescript
// BAD
if (user.role === 'ADMIN') { ... }
setTimeout(refresh, 1_800_000);

// GOOD
import { UserRole } from '../domain/value-objects/user-role.vo';
const SESSION_TTL_MS = 30 * 60 * 1_000;

if (user.role === UserRole.ADMIN) { ... }
setTimeout(refresh, SESSION_TTL_MS);
```

### Deep nesting

```typescript
// BAD: 4 levels deep
if (user) {
  if (user.isActive) {
    if (user.verificationStatus === 'APPROVED') {
      if (user.accountId) {
        return user.accountId;
      }
    }
  }
}

// GOOD: early returns
if (!user) return null;
if (!user.isActive) return null;
if (user.verificationStatus !== 'APPROVED') return null;
if (!user.accountId) return null;
return user.accountId;

// EVEN BETTER: use a guard helper or Result type
const eligible = isEligibleForAccount(user);
return eligible ? user.accountId : null;
```

### God objects

If a class or use case has more than roughly 5 public methods doing semantically different things, split it. Large aggregates should be broken down; treat them as recognized technical debt and track them in your project's roadmap or ADR log.

---

## Performance

### Avoid unnecessary work in hot paths

```typescript
// BAD: creates a new function on every render
<Button onClick={() => handleOrder(accountId)} />

// GOOD: memoize or hoist
const onOrderClick = useCallback(() => handleOrder(accountId), [accountId]);
<Button onClick={onOrderClick} />
```

### Efficient lookups

```typescript
// BAD: O(n) lookup repeated
const account = accounts.find(a => a.id === targetId);

// GOOD: O(1) lookup with Map (for repeated lookups)
const accountsById = new Map(accounts.map(a => [a.id, a]));
const account = accountsById.get(targetId);
```

For a single lookup, `find` is fine; switch to `Map` when looking up many times in a loop.

---

## Related rules

- `.claude/rules/production-grade-code.md` (forbidden patterns: no `any`, no silent fallbacks, typed errors)
- `.claude/rules/clean-architecture.md` (layer rules for the backend core)
- `.claude/rules/work-records.md` (storytelling format, append-only)
- The project's `CLAUDE.md` (project-specific naming and dependency-injection conventions)
