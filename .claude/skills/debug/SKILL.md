---
name: debug
description: Debug & Troubleshooting Skill for diagnosing and resolving issues
---

# Debug & Troubleshooting Skill

Diagnose and resolve issues systematically.

---

## Troubleshooting Decision Tree

```
Issue Type?
├─ Frontend Not Loading
│  └─ Check: Browser console → Network tab → API responses
│
├─ API Returning Errors
│  └─ Check: Server logs → Database state → Service health
│
├─ Login/Auth Failing
│  └─ Check: JWT token → User status → Session state
│
├─ Build Failing
│  └─ Check: Error message → Dependencies → Type errors
│
└─ Database Issues
   └─ Check: Connection → Query logs → Table state
```

---

## Frontend Debugging

### Browser Console Errors
```javascript
// Check for JavaScript errors
// Open DevTools → Console tab

// Common issues:
// - Uncaught TypeError: Cannot read property 'x' of undefined
//   → Missing null check or API returned unexpected data

// - CORS error
//   → Backend needs CORS headers or wrong API URL

// - 401 Unauthorized
//   → Token expired or missing, check auth state
```

### Network Tab Analysis
```
1. Open DevTools → Network tab
2. Reproduce the issue
3. Look for:
   - Red (failed) requests
   - 4xx/5xx status codes
   - Response body for error messages
   - Request headers (Authorization present?)
```

### React State Debugging
```tsx
// Add to component temporarily
console.log('State:', { data, isLoading, isError, error });

// Or use React DevTools
// Components tab → Select component → View props/state
```

---

## Backend Debugging

### View Logs
```bash
# Application logs (adjust based on your setup)
tail -f logs/app.log

# Docker logs
docker logs -f <container-name>

# Kubernetes logs
kubectl logs -f deployment/<name>
```

### Test API Endpoint
```bash
# Direct API call
curl -X POST http://localhost:3000/api/v1/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# With auth token
curl http://localhost:3000/api/v1/protected \
  -H "Authorization: Bearer <token>"
```

---

## Database Debugging

### Common Queries
```sql
-- Check record exists
SELECT * FROM users WHERE email = 'test@example.com';

-- Check recent records
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Check relationships
SELECT u.*, o.*
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.id = '123';
```

### Database State Issues
```sql
-- Find orphaned records
SELECT * FROM orders
WHERE user_id NOT IN (SELECT id FROM users);

-- Check for duplicates
SELECT email, COUNT(*)
FROM users
GROUP BY email
HAVING COUNT(*) > 1;
```

---

## Authentication Issues

### JWT Token Problems
```bash
# Decode JWT (without verification)
echo "<token>" | cut -d'.' -f2 | base64 -d 2>/dev/null | jq .

# Check token expiration
# exp field is Unix timestamp
date -d @<exp-value>
```

### Login Flow Debug
```
1. POST /api/v1/auth/login
   - Check user exists
   - Check status is active
   - Check password hash matches

2. If 401 "Invalid credentials":
   - User doesn't exist
   - Password wrong
   - Account suspended

3. If token returns but subsequent requests fail:
   - Token not being sent
   - Token expired
   - Token format wrong
```

---

## Common Error Patterns

### "Cannot read property 'x' of undefined"
```javascript
// Cause: API returned null/undefined, code assumed object exists
// Fix: Add null checks
const name = user?.name ?? 'Unknown';
```

### "Network Error" / "Failed to fetch"
```
// Causes:
// 1. Service not running
// 2. CORS blocked
// 3. Wrong API URL
// 4. Network connectivity

// Debug:
// - Check service is running
// - Check browser network tab
// - Test with curl
```

### "401 Unauthorized"
```
// Causes:
// 1. Token expired
// 2. Token not sent
// 3. Token invalid/tampered
// 4. User account suspended

// Debug:
// - Check Authorization header
// - Decode token, check exp
// - Check user status in DB
```

### "500 Internal Server Error"
```
// Always check server logs first

// Common causes:
// - Database connection failed
// - Unhandled exception
// - Missing environment variable
// - External service unavailable
```

---

## Quick Diagnostic Commands

```bash
# Check if service is running
curl http://localhost:3000/health

# Check port in use
lsof -i :3000

# Check environment variables
printenv | grep API

# Git recent changes
git log --oneline -10

# Changes in specific file
git log --oneline -5 -- path/to/file.ts
```

---

## Debug Report Format

```markdown
## Issue Diagnosis

### Summary
[One sentence description]

### Error Details
- **Error Message**: `[exact error]`
- **Location**: `[file:line or endpoint]`
- **Environment**: [local/staging/production]

### Root Cause
[Explanation of why this happened]

### Fix Applied
[What was changed to fix it]

### Verification
[How we confirmed the fix works]

### Prevention
[How to prevent this in future]
```

---

## Apply to: $ARGUMENTS
