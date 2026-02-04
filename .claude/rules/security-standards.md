# Security Standards

## Overview

Security is paramount. These standards MUST be followed for all code.

---

## Critical Security Rules

### 1. Authentication & Authorization

#### Always Required
- Authentication on all non-public endpoints
- Role-based access control (RBAC) enforcement
- Session validation on sensitive operations
- Rate limiting on authentication endpoints

#### Implementation Example
```typescript
// Controller with proper auth
@Controller('api/v1/admin')
@UseGuards(AuthGuard, RolesGuard)
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
@UseGuards(AuthGuard)
@Delete('users/:id')
async deleteUser() { }  // Any authenticated user can delete!

// CORRECT
@UseGuards(AuthGuard, RolesGuard)
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

#### Implementation Example
```typescript
// Use runtime validation (Zod, class-validator, etc.)
const CreateUserSchema = z.object({
  email: z.string().email().max(255),
  password: z.string()
    .min(8)
    .max(128)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password too weak'),
  name: z.string().min(1).max(100).trim(),
});
```

#### Never Trust
- User-provided IDs (validate ownership)
- File extensions (check MIME type)
- Content-Type headers (verify content)
- Size claims (enforce limits server-side)

### 3. Injection Prevention

#### SQL Injection - Always Use Parameterized Queries
```typescript
// CRITICAL: SQL Injection
const user = await db.$queryRaw`
  SELECT * FROM users WHERE email = '${email}'  // NEVER DO THIS
`;

// CORRECT: Parameterized
const user = await db.$queryRaw`
  SELECT * FROM users WHERE email = ${email}
`;

// BETTER: Use ORM
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

#### Response DTO Example
```typescript
// Explicitly include only safe fields
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
  throw new InternalServerError(error.message);
}

// CORRECT: Generic message, log details
catch (error) {
  logger.error('User creation failed', { error });
  throw new InternalServerError('Unable to create user');
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
- Rotate secrets regularly
- Use different secrets per environment

```typescript
// WRONG: Hardcoded secret
const JWT_SECRET = 'my-super-secret-key';

// CORRECT: Environment variable
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET not configured');
}
```

### 6. Password Security

#### Requirements
- Minimum 8 characters
- Mix of uppercase, lowercase, numbers
- Use bcrypt/argon2 with appropriate cost factor
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
- OTP verification
- API endpoints (per user)

---

## Code Patterns to Flag

### Critical
```typescript
// Hardcoded secrets
const API_KEY = "sk_live_1234567890";

// SQL injection
const query = `SELECT * FROM users WHERE id = ${userId}`;

// Missing authentication
@Get('admin/users')
async getUsers() { }

// Plain text password
await userRepo.save({ password: dto.password });
```

### High Risk
```typescript
// No input validation
@Post()
async create(@Body() body: any) { }

// Exposing sensitive data
return { ...user, password: user.password };

// Missing rate limiting on auth
@Post('auth/login')
async login() { }
```

---

## Security Checklist

### Before Every Commit
- [ ] No hardcoded secrets
- [ ] No sensitive data in logs
- [ ] Input validation present
- [ ] Auth guards on endpoints
- [ ] Error messages are generic

### Before Every PR
- [ ] Security review completed
- [ ] No new vulnerabilities introduced
- [ ] Dependencies checked for CVEs
- [ ] Auth/authz tested

### Before Every Deployment
- [ ] Secrets properly configured
- [ ] TLS enabled
- [ ] Rate limiting active
- [ ] Monitoring configured

---

## Incident Response

### If Credentials Exposed
1. Immediately rotate affected credentials
2. Check access logs for unauthorized use
3. Document the incident
4. Update security procedures

### If Vulnerability Found
1. Assess severity and impact
2. Develop and test fix
3. Deploy fix to all environments
4. Monitor for exploitation attempts
