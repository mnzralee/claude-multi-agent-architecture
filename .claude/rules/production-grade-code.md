# Production-Grade Code Standards

## Overview

Every line of code in a production system must be traceable, explicit, and failure-safe. These standards are derived from real incidents and apply regardless of stack. The TypeScript examples below are illustrative; the underlying discipline is stack-agnostic.

---

## TypeScript Strictness

### NEVER Use `any`

```typescript
// WRONG
const payload: any = event.payload;
const result = await api.get<any>('/users');

// CORRECT
const payload: TransferPayload = validatePayload(event.payload);
const result = await api.get<ApiResponse<User[]>>('/users');
```

**`any` is forbidden** in all service code, use cases, repositories, and handlers. Allowed ONLY in `.spec.ts` test files when mocking complex third-party types.

### NEVER Use `@ts-ignore` or `@ts-expect-error`

If TypeScript is complaining, the type system is right. Fix the types, not the diagnostic.

### NEVER Use Type Assertions to Bypass Validation

```typescript
// WRONG, asserts without verification
const account = await repo.findById(id) as Account;

// CORRECT, explicit null check
const account = await repo.findById(id);
if (!account) throw new AccountNotFoundError(id);
```

---

## Silent Fallbacks Are Forbidden

A silent fallback is any code path where a failure results in degraded behavior the caller cannot detect.

```typescript
// WRONG, silent degradation
async exportReport(format: string): Promise<Buffer> {
  try {
    return await this.pdfService.generate(data);
  } catch {
    return Buffer.from(JSON.stringify(data)); // silent fallback to JSON
  }
}

// CORRECT, fail loudly
async exportReport(format: string): Promise<Buffer> {
  try {
    return await this.pdfService.generate(data);
  } catch (err) {
    this.logger.error('PDF export failed', { error: (err as Error).message });
    throw new Error('PDF export failed: report generation unavailable');
  }
}
```

**Rule**: Every infrastructure dependency MUST fail loudly when unavailable. No swallowed catch blocks.

---

## Error Handling Standards

### Use Domain-Typed Errors

```typescript
// WRONG
throw new Error('Account not found');

// CORRECT
throw new AccountNotFoundError(accountId);
```

Use cases and domain services MUST throw typed `DomainError` subclasses, not generic `Error`.

### Error Parameter Typing

```typescript
// WRONG
} catch (error: any) {
  console.error(error);
}

// CORRECT
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : 'Unknown error';
  this.logger.error('Operation failed', { message });
}
```

---

## No Secrets or Credentials in Logs

```typescript
// WRONG, logs the full error object, which may include Authorization headers or tokens
} catch (error) {
  console.error('[operation]', error);
}

// CORRECT, extract only safe fields
} catch (error) {
  const err = error as AxiosError;
  this.logger.error('[operation]', {
    message: err?.message,
    status: err?.response?.status,
    data: err?.response?.data,
  });
}
```

---

## Configuration: Fail-Fast on Missing Dependencies

```typescript
// WRONG, silent default allows wrong environment configuration
storageType: z.enum(['s3', 'local']).default('local')

// CORRECT, require explicit configuration
storageType: z.enum(['s3', 'local'])
antivirusBypass: z.coerce.boolean().default(false) // safe strict default
```

Security and safety features MUST default to the strict or safe option. Never let an omitted environment variable silently weaken a safety control.

---

## Deprecated Domain Primitives

When your codebase retires a domain primitive (a value object, identifier type, or branded string), use `no-restricted-imports` in your ESLint config to warn on any remaining imports.

Example entry in `eslint.config.js`:

```js
{
  rules: {
    'no-restricted-imports': ['warn', {
      paths: [
        {
          name: '@org/core-domain',
          importNames: ['LegacyIdentifier', 'RawMoney', 'AddressString'],
          message: 'Use the replacement value objects from @org/core-domain v2.'
        }
      ]
    }]
  }
}
```

Severity is `warn` (not `error`) to allow gradual migration without blocking CI. Never remove existing entries from the restricted list until every import site has been migrated.

---

## Checklist

Before committing any code:

- [ ] No `any` types (use `unknown` plus type guards)
- [ ] No `@ts-ignore` or `@ts-expect-error`
- [ ] No silent catch blocks that return synthetic success
- [ ] All errors use typed DomainError subclasses
- [ ] Error parameters typed as `unknown`, narrowed with `instanceof`
- [ ] No raw error objects in logs (destructure to safe fields only)
- [ ] Config values for safety features default to the strict option
- [ ] No imports of deprecated domain primitives (check ESLint warnings)
