---
name: api-design
description: Design RESTful APIs with consistent conventions for resource URLs, response shapes, HTTP semantics, versioning, and security across every service in the project.
---

# API Design Skill

## Skill Metadata
- **Name**: api-design
- **Description**: Design RESTful APIs with consistent conventions across all services
- **User Invocable**: Yes (via `/api-design`)

---

## Overview

This skill guides the design of RESTful APIs for any backend service, ensuring consistency, security, and usability across all endpoints. The discipline is stack-agnostic: the examples below use TypeScript and Zod for concreteness, but the conventions apply equally to Python, Go, Java, or any other language.

---

## API Design Principles

### 1. Resource-Based URLs
```
Good
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
DELETE /api/v1/users/:id

Avoid
GET    /api/v1/getUsers
POST   /api/v1/createUser
POST   /api/v1/deleteUser
```

### 2. Consistent Response Format
```json
{
  "success": true,
  "data": {
    // Resource data
  },
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is required",
    "details": [
      { "field": "email", "message": "Email is required" }
    ]
  }
}
```

### 3. HTTP Status Codes
| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET, PUT |
| 201 | Created | Successful POST (created resource) |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Lacks permission |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business rule violation |
| 500 | Internal Error | Server error |

### 4. Versioning
```
/api/v1/users
/api/v2/users
```

Embed the version in the URL path. Never negotiate it via a header unless a downstream client framework forces you to.

### 5. Filtering, Sorting, Pagination
```
GET /api/v1/users?status=active&sort=-createdAt&page=1&limit=20

# Filter operators
?status=active           # Equality
?amount_gte=100         # Greater than or equal
?amount_lte=1000        # Less than or equal
?name_like=john         # Contains

# Sorting
?sort=name              # Ascending
?sort=-createdAt        # Descending (prefix with -)
?sort=status,-createdAt # Multiple fields

# Pagination
?page=1&limit=20        # Page-based
?cursor=abc123&limit=20 # Cursor-based
```

---

## Service Conventions

### Authentication
```
Authorization: Bearer <jwt-token>
```

### Service Prefix Pattern
Each bounded context (service or module) owns a prefix. For example:

| Domain | Prefix example |
|--------|----------------|
| Identity / auth | `/api/v1/auth`, `/api/v1/users` |
| [CUSTOMIZE: domain] | `/api/v1/<resource>` |
| Admin | `/api/v1/admin/*` |

Replace the rows above with your own domains.

### Endpoint Patterns
```
# Collection
GET    /api/v1/resources          # List (with pagination)
POST   /api/v1/resources          # Create

# Single resource
GET    /api/v1/resources/:id      # Get one
PUT    /api/v1/resources/:id      # Full update
PATCH  /api/v1/resources/:id      # Partial update
DELETE /api/v1/resources/:id      # Delete

# Nested resources
GET    /api/v1/users/:id/orders
POST   /api/v1/users/:id/profile

# Actions (when CRUD does not fit)
POST   /api/v1/orders/:id/approve
POST   /api/v1/proposals/:id/vote
```

---

## API Design Template

### Endpoint Specification
```markdown
## [Method] [Path]

**Description**: [What this endpoint does]

**Authentication**: Required/Optional/None

**Authorization**: [Role requirements]

### Request

**Headers**:
| Header | Required | Description |
|--------|----------|-------------|
| Authorization | Yes | Bearer token |
| Content-Type | Yes | application/json |

**Path Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| id | string | Resource UUID |

**Query Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | number | 1 | Page number |
| limit | number | 20 | Items per page |

**Body**:
```json
{
  "field1": "string",
  "field2": 123
}
```

### Response

**Success (200)**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "field1": "value"
  }
}
```

**Errors**:
| Code | Description |
|------|-------------|
| 400 | Validation failed |
| 404 | Resource not found |

### Example

**Request**:
```bash
curl -X POST /api/v1/resources \
  -H "Authorization: Bearer token" \
  -H "Content-Type: application/json" \
  -d '{"field1": "value"}'
```

**Response**:
```json
{
  "success": true,
  "data": { "id": "123", "field1": "value" }
}
```
```

---

## Workflow

### Phase 1: Requirements
1. Identify the resource or action
2. Define operations needed
3. Identify related resources and dependencies

### Phase 2: Design
1. Define URL structure following the resource-based convention
2. Specify request and response formats
3. Document all error cases (including business-rule violations, not just HTTP errors)
4. Define authentication and authorization requirements

### Phase 3: Validation
1. Review against the conventions in this skill
2. Check security implications (input surfaces, auth gaps, sensitive field exposure)
3. Consider backward compatibility if the service is already deployed

### Phase 4: Documentation
1. Create endpoint specs using the template above
2. Add to the project's API documentation
3. Generate or update the OpenAPI schema

---

## DTO Patterns

### Request DTO
```typescript
// dto.ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1).max(100),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
```

Adapt the validation library to your stack. The principle is the same: parse inputs at the boundary, reject early, produce typed domain objects.

### Response DTO
```typescript
export interface UserResponseDTO {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  // Note: never include passwords or secrets in responses
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: PaginationMeta;
}
```

---

## Security Considerations

### Input Validation
- Validate all inputs server-side, regardless of client-side validation
- Use a schema library (Zod, Joi, Yup, Pydantic, etc.) for type safety
- Sanitize strings to prevent XSS and injection
- Enforce string length limits at the schema layer

### Rate Limiting
```typescript
@Throttle({ default: { limit: 10, ttl: 60000 } }) // 10 req/min
@Post('login')
async login() {}
```

Apply tighter limits to auth and sensitive write endpoints. Read endpoints can be more permissive.

### Sensitive Operations
- Require re-authentication (or step-up auth) for actions with irreversible effects
- Log all administrative operations with actor identity, timestamp, and parameters
- Implement idempotency keys for any operation that should not run twice (payments, emails, state transitions)

---

## Invocation

### Manual
```
/api-design [resource-name]
```

### Example
```
/api-design orders
```

---

## Output Artifacts

1. **Endpoint Specifications**: Detailed documentation using the template above
2. **DTO Definitions**: Request and response type definitions
3. **Validation Schemas**: Schema-library schemas for each input surface
4. **OpenAPI Spec**: Machine-readable API definition for tooling and documentation generation
