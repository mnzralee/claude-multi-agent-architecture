# Security Standards

## Overview

This project handles user data and application state that requires careful security discipline. The patterns below apply regardless of tech stack (examples use TypeScript / Node.js / Express / Zod, but the principles are stack-agnostic). These standards MUST be followed for all code.

---

## Critical Security Rules

### 1. Authentication and Authorization

#### Always Required
- JWT authentication on all non-public endpoints
- Role-based access control (RBAC) enforcement
- Session validation on sensitive operations
- Rate limiting on authentication endpoints

#### Implementation
```typescript
// Controller with proper auth
@Controller('api/v1/admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SUPER_ADMIN')
export class AdminController {
  @Post('users/:id/approve')
  @RequirePermissions('user:approve')
  async approveUser(@Param('id') id: string) {
    // Implementation
  }
}
```

#### Common Mistakes
```typescript
// WRONG: Missing auth guard
@Get('users')
async getUsers() { }

// WRONG: Missing role check
@UseGuards(JwtAuthGuard)
@Delete('users/:id')
async deleteUser() { }  // Any authenticated user can delete!

// CORRECT
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Delete('users/:id')
async deleteUser() { }
```

### 2. Input Validation

#### Always Validate
- All request body fields
- All query parameters
- All path parameters
- File uploads (type, size, content)

#### Implementation
```typescript
// Use Zod for runtime validation
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password too weak'),
  name: z.string().min(1).max(100).trim(),
});

@Post()
@UsePipes(new ZodValidationPipe(CreateUserSchema))
async createUser(@Body() dto: CreateUserDTO) { }
```

#### Never Trust
- User-provided IDs (validate ownership)
- File extensions (check MIME type)
- Content-Type headers (verify content)
- Size claims (enforce limits server-side)

### 3. SQL/NoSQL Injection Prevention

#### Always Use
- Parameterized queries (your ORM handles this when used correctly)
- ORM methods rather than raw string interpolation

#### Never Do
```typescript
// CRITICAL: SQL Injection via string interpolation
const user = await db.$queryRaw`
  SELECT * FROM users WHERE email = '${email}'
`;

// CORRECT: Parameterized (tagged-template literal passes the value safely)
const user = await db.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// BETTER: Use the ORM client directly
const user = await db.user.findUnique({
  where: { email }
});
```

### 4. Sensitive Data Handling

#### Never Expose
- Passwords (even hashed)
- Internal IDs when not necessary
- Stack traces to users
- Database error details
- Infrastructure information

#### Implementation
```typescript
// Response DTO: explicitly include only safe fields
export class UserResponseDTO {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  // NO password, NO internal fields

  static fromEntity(user: User): UserResponseDTO {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }
}
```

#### Error Handling
```typescript
// WRONG: Leaks internal info
catch (error) {
  throw new InternalServerErrorException(error.message);
}

// CORRECT: Generic message, log details internally
catch (error) {
  this.logger.error('User creation failed', { error, dto });
  throw new InternalServerErrorException('Unable to create user');
}
```

### 5. Secrets Management

#### Never Do
- Hardcode secrets in code
- Commit secrets to git
- Log secrets
- Pass secrets in URLs

#### Always Do
- Use environment variables
- Use your orchestration platform's secret store (Kubernetes Secrets, Vault, etc.)
- Rotate secrets regularly
- Use different secrets per environment

```typescript
// WRONG: Hardcoded secret
const JWT_SECRET = 'my-super-secret-key';

// CORRECT: Environment variable with startup guard
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured');
}
```

### 6. Password Security

#### Requirements
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Bcrypt with cost factor 10+
- Never store plain text

#### Implementation
```typescript
// Hashing
const BCRYPT_ROUNDS = 12;
const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

// Verification
const isValid = await bcrypt.compare(inputPassword, storedHash);
```

### 7. Rate Limiting

#### Required On
- Login endpoints
- Password reset
- OTP / verification code endpoints
- API endpoints (per user)

#### Implementation
```typescript
@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  async login() { }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 3600000 } }) // 3 per hour
  async forgotPassword() { }
}
```

---

## Transactional Operation Security

### Idempotency

Mutating operations that touch money, state, or external side-effects must be idempotent. Clients supply an idempotency key; the server checks for a prior result before executing.

```typescript
@Post('transfer')
async transfer(
  @Body() dto: TransferDTO,
  @Headers('Idempotency-Key') idempotencyKey: string,
) {
  // Return the existing result if this key was already processed
  const existing = await this.transferRepo.findByIdempotencyKey(idempotencyKey);
  if (existing) {
    return existing;
  }

  const result = await this.processTransfer(dto, idempotencyKey);
  return result;
}
```

### Audit Logging

Log all sensitive or irreversible operations. The audit log is append-only and must capture enough context to reconstruct what happened.

```typescript
await this.auditLog.record({
  action: 'TRANSFER',
  userId: user.id,
  details: {
    from: dto.from,
    to: dto.to,
    amount: dto.amount,
  },
  ip: request.ip,
  timestamp: new Date(),
});
```

### Concurrency and Atomic State Changes

When two requests can race on the same mutable resource, use database-level locking or optimistic concurrency control. Never read-then-write without a guard.

```typescript
// WRONG: Read then write without a lock allows double-spend or TOCTOU
const balance = await getBalance(userId);
if (balance < amount) throw new Error('Insufficient funds');
await setBalance(userId, balance - amount); // another request may have already deducted

// CORRECT: Use a transaction with SELECT ... FOR UPDATE or an atomic CAS
await db.$transaction(async (tx) => {
  const { balance } = await tx.account.findUnique({
    where: { id: userId },
    // lock the row for this transaction
  });
  if (balance < amount) throw new Error('Insufficient funds');
  await tx.account.update({
    where: { id: userId },
    data: { balance: { decrement: amount } },
  });
});
```

---

## Security Checklist

### Before Every Commit
- [ ] No hardcoded secrets
- [ ] No sensitive data in logs
- [ ] Input validation present
- [ ] Auth guards on all non-public endpoints
- [ ] Error messages are generic (details go to the logger only)

### Before Every PR
- [ ] Security review completed
- [ ] No new vulnerabilities introduced
- [ ] Dependencies checked for CVEs (`npm audit` or equivalent)
- [ ] Auth/authz paths tested

### Before Every Deployment
- [ ] Secrets properly configured in the target environment
- [ ] TLS enabled
- [ ] Rate limiting active
- [ ] Monitoring and alerting configured
- [ ] Incident response runbook up to date

---

## Incident Response

### If Credentials Are Exposed
1. Immediately rotate the affected credentials
2. Check access logs for unauthorized use
3. Document the incident
4. Update security procedures to prevent recurrence

### If a Vulnerability Is Found
1. Assess severity and impact
2. Develop and test the fix in isolation
3. Deploy the fix to all environments
4. Monitor for exploitation attempts

---

## Security Tools

### Code Analysis
- `npm audit` (dependency vulnerabilities)
- `eslint-plugin-security` (static code patterns)
- Snyk (comprehensive dependency and code scanning)

### Runtime Protection
- Helmet (HTTP security headers)
- Rate limiting middleware
- Input validation (Zod or equivalent schema library)

### Monitoring
- Failed login attempts
- Unusual or high-volume operation patterns
- Error rate spikes
- API abuse patterns (repeated 4xx, scraping indicators)
