# Code Quality Standards

## Overview

These standards ensure maintainable, readable, and robust code across the project.

---

## General Principles

### 1. Readability First
Code is read more often than written. Optimize for readability.

### 2. Single Responsibility
Each function, class, and module should have one clear responsibility.

### 3. Keep It Simple
Avoid over-engineering. Simple solutions are easier to maintain.

### 4. Avoid Premature Optimization
Write clear code first, optimize only when necessary.

### 5. Don't Repeat Yourself (DRY)
Extract common logic, but don't over-abstract.

---

## Naming Conventions

### Variables & Functions
```typescript
// Good: Descriptive, reveals intent
const activeUsers = users.filter(u => u.isActive);
const calculateTotalPrice = (items) => { ... };

// Bad: Vague, requires context to understand
const data = users.filter(u => u.isActive);
const calc = (x) => { ... };
```

### Booleans
```typescript
// Good: Reads as a question
const isActive = true;
const hasPermission = checkPermission(user);
const canDelete = user.role === 'admin';

// Bad: Ambiguous
const active = true;
const permission = checkPermission(user);
```

### Constants
```typescript
// Good: SCREAMING_SNAKE_CASE for constants
const MAX_RETRY_ATTEMPTS = 3;
const API_BASE_URL = 'https://api.example.com';

// Bad: Looks like a variable
const maxRetryAttempts = 3;
```

### Files & Directories
```
// Good: kebab-case for files
user-service.ts
auth-controller.ts
use-auth.ts

// Bad: Various conventions
UserService.ts
authController.ts
useAuth.ts
```

---

## Function Guidelines

### Size
- Functions should fit on one screen (~20-30 lines)
- If larger, consider extracting helper functions

### Parameters
```typescript
// Good: Max 3 parameters, use objects for more
function createUser({ email, name, role }: CreateUserInput) { ... }

// Bad: Too many parameters
function createUser(email, name, role, department, manager, startDate) { ... }
```

### Return Early
```typescript
// Good: Early returns reduce nesting
function processUser(user) {
  if (!user) return null;
  if (!user.isActive) return null;

  return doProcessing(user);
}

// Bad: Deeply nested
function processUser(user) {
  if (user) {
    if (user.isActive) {
      return doProcessing(user);
    }
  }
  return null;
}
```

### Pure Functions
Prefer pure functions when possible:
```typescript
// Good: Pure - same input always gives same output
function calculateTotal(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// Avoid: Side effects hidden in function
function calculateTotal(items: Item[]): number {
  logger.log('Calculating total');  // Side effect
  return items.reduce((sum, item) => sum + item.price, 0);
}
```

---

## Error Handling

### Use Specific Error Types
```typescript
// Good: Specific, actionable errors
class UserNotFoundError extends Error {
  constructor(id: string) {
    super(`User not found: ${id}`);
    this.name = 'UserNotFoundError';
  }
}

// Bad: Generic errors
throw new Error('Something went wrong');
```

### Handle All Error Cases
```typescript
// Good: Explicit error handling
try {
  const user = await userService.findById(id);
  return user;
} catch (error) {
  if (error instanceof UserNotFoundError) {
    return null;
  }
  logger.error('Unexpected error finding user', { error, id });
  throw error;
}

// Bad: Swallowing errors
try {
  return await userService.findById(id);
} catch (e) {
  // Silent failure
}
```

---

## TypeScript Standards

### Strict Mode
Always enable strict mode in tsconfig.json.

### No `any` Type
```typescript
// Bad
const data: any = response.data;
function process(input: any) { ... }

// Good
interface ApiResponse {
  id: string;
  name: string;
}
const data: ApiResponse = response.data;
function process(input: UserInput) { ... }
```

### Explicit Return Types
```typescript
// Good: Explicit return type
function findUser(id: string): Promise<User | null> {
  return userRepo.findById(id);
}

// Acceptable for simple functions
const isActive = (user: User) => user.status === 'active';
```

### Use Type Guards
```typescript
// Good: Type guard for runtime checking
function isUser(obj: unknown): obj is User {
  return typeof obj === 'object' && obj !== null && 'email' in obj;
}

if (isUser(data)) {
  console.log(data.email);  // TypeScript knows data is User
}
```

---

## Comments

### When to Comment
```typescript
// Good: Explain WHY, not WHAT
// We use setTimeout to avoid race condition with DOM update
setTimeout(() => updateUI(), 0);

// Good: Document complex algorithms
// Uses binary search - O(log n) - because list is pre-sorted
function findItem(sortedList, target) { ... }
```

### When NOT to Comment
```typescript
// Bad: States the obvious
// Increment counter
counter++;

// Bad: Comments instead of good naming
// Get active users
const u = users.filter(x => x.a);

// Good: Self-documenting code
const activeUsers = users.filter(user => user.isActive);
```

---

## Code Organization

### File Size
- Keep files under 300 lines
- Extract related functionality into separate modules

### Import Order
```typescript
// 1. External packages
import { useState } from 'react';
import { z } from 'zod';

// 2. Internal aliases
import { UserService } from '@/services/user';
import { Button } from '@/components/ui';

// 3. Relative imports
import { formatDate } from './utils';
import { UserCard } from './components';

// 4. Types
import type { User, CreateUserInput } from './types';
```

### Export Guidelines
```typescript
// Prefer named exports
export function createUser() { ... }
export class UserService { ... }

// Use default export sparingly (e.g., React components)
export default function UserPage() { ... }
```

---

## Performance Guidelines

### Avoid Unnecessary Work
```typescript
// Bad: Creates new function on every render
<Button onClick={() => handleClick(id)} />

// Good: Memoize or move outside
const handleItemClick = useCallback(() => handleClick(id), [id]);
<Button onClick={handleItemClick} />
```

### Efficient Data Structures
```typescript
// Bad: O(n) lookup every time
const user = users.find(u => u.id === targetId);

// Good: O(1) lookup with Map
const usersById = new Map(users.map(u => [u.id, u]));
const user = usersById.get(targetId);
```

---

## Anti-Patterns to Avoid

### Magic Numbers/Strings
```typescript
// Bad
if (user.role === 'admin') { ... }
setTimeout(fn, 86400000);

// Good
const ADMIN_ROLE = 'admin';
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

if (user.role === ADMIN_ROLE) { ... }
setTimeout(fn, ONE_DAY_MS);
```

### Deep Nesting
```typescript
// Bad: Deeply nested
if (a) {
  if (b) {
    if (c) {
      doSomething();
    }
  }
}

// Good: Early returns
if (!a) return;
if (!b) return;
if (!c) return;
doSomething();
```

### God Objects
Split large classes/objects into focused, single-responsibility units.

---

## Enforcement

These standards are enforced by:
1. ESLint/TSLint rules
2. Prettier for formatting
3. Code review (reviewer agent)
4. Pre-commit hooks (optional)
