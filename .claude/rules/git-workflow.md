# Git Workflow Rules

## Overview

This project follows a structured Git workflow to ensure code quality, traceability, and collaboration efficiency.

---

## Branch Strategy

### Main Branches

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production code | Protected, requires PR |
| `develop` | Integration branch | Protected, requires PR |

### Feature Branches

```
feature/<ticket-id>-<short-description>
bugfix/<ticket-id>-<short-description>
hotfix/<ticket-id>-<short-description>
chore/<description>
```

**Examples**:
```
feature/AUTH-001-user-registration
bugfix/API-042-upload-timeout
hotfix/SEC-001-auth-bypass
chore/update-dependencies
```

---

## Commit Message Format

### Structure
```
<type>(<scope>): <subject>

[body]

[footer]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `style` | Formatting (no code change) |
| `refactor` | Code restructuring |
| `test` | Adding tests |
| `chore` | Maintenance tasks |
| `perf` | Performance improvement |
| `security` | Security fix |

### Examples
```
feat(auth): add email verification endpoint

Implement email verification flow with 6-digit OTP.
- Add sendVerificationEmail service
- Add verifyEmail endpoint
- Create email templates
```

```
fix(api): prevent negative balance on transfer

Check sender balance before deducting to prevent
race condition that could result in negative balance.
```

---

## Commit Rules

### DO
- Commit early and often
- Write clear, descriptive messages
- Reference issue numbers
- Keep commits focused (one logical change)
- **Stage files individually** - commit file by file with descriptive messages
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Body explains "why" not "what"

### DON'T
- Commit secrets or credentials
- Commit large binary files
- Use generic messages ("fix bug", "update")
- Include AI attribution in commits (no "Co-Authored-By: Claude")
- Use emojis in commit messages
- Commit broken code to shared branches
- Use `git add .` or `git add -A` for multi-file changes

### File-by-File Commit Example

```bash
# Bad - batches everything together
git add .
git commit -m "fix: various fixes"

# Good - file by file with descriptive messages
git add src/services/auth.ts
git commit -m "fix(auth): add null check in token validation"

git add src/controllers/user.ts
git commit -m "fix(api): return proper error code for missing user"
```

---

## Pull Request Process

### Before Creating PR
1. Ensure all tests pass locally
2. Run linting and fix issues
3. Update documentation if needed
4. Rebase on target branch

### PR Template
```markdown
## Summary
[Brief description of changes]

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Changes Made
- [Change 1]
- [Change 2]

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

---

## Git Operations Reference

### Daily Workflow
```bash
# Start new feature
git checkout develop
git pull
git checkout -b feature/AUTH-001-user-registration

# Work on feature
git add <files>
git commit -m "feat(auth): add registration page"

# Push to remote
git push -u origin feature/AUTH-001-user-registration

# Create PR via GitHub/GitLab
```

### Sync with Develop
```bash
git checkout develop
git pull
git checkout feature/my-feature
git rebase develop
# Fix conflicts if any
git push --force-with-lease
```

---

## Protected Operations

### Requires Explicit Permission
- `git push --force` to shared branches
- `git reset --hard` on shared branches
- `git clean -fd`
- Deleting branches with unmerged work

### Never Run
- `git push --force origin main`
- `git push --force origin develop`
- Modifying git history of shared branches

---

## Pre-Commit Checklist

Before committing:
- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] Linting passes
- [ ] No secrets in code
- [ ] No console.log in production code
- [ ] Commit message follows format
