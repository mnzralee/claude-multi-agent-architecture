# Git Workflow Rules

## Overview

This project follows a structured Git workflow to ensure code quality, traceability, and collaboration efficiency. The conventions here are stack-agnostic and apply to any TypeScript, JavaScript, or general software project.

---

## Branch Strategy

### Main Branches

| Branch | Purpose | Protection |
|--------|---------|------------|
| `main` | Production code | Protected, requires PR |
| `develop` | Integration branch | Protected, requires PR |
| `staging` | Pre-production / QA deployment | Auto-deploys to staging environment |

### Feature Branches

```
feature/<ticket-id>-<short-description>
bugfix/<ticket-id>-<short-description>
hotfix/<ticket-id>-<short-description>
chore/<description>
```

**Examples**:
```
feature/AUTH-001-user-onboarding
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

### Scopes

Scopes map to your project's service or module boundaries. Replace the examples below with your own:

| Scope | Description |
|-------|-------------|
| `auth` | Authentication service or module |
| `api` | API gateway or REST layer |
| `frontend` | Web or desktop frontend |
| `worker` | Background job or queue worker |
| `infra` | Infrastructure / container orchestration |
| `db` | Database / migrations |
| `deps` | Dependencies |

[CUSTOMIZE: add scopes that match your project's apps and packages]

### Examples
```
feat(auth): add email verification endpoint

Implement email verification flow with a 6-digit OTP.
- Add sendVerificationEmail use case
- Add verifyEmail use case
- Create email templates

Closes #123
```

```
fix(api): prevent negative balance on transfer

Check account balance before deducting to prevent a
race condition that could result in a negative balance.

Fixes #456
```

```
chore(deps): update Express.js to v10.3.0
```

---

## Commit Rules

### DO
- Commit early and often
- Write clear, descriptive messages
- Reference issue numbers
- Keep commits focused (one logical change)
- **Stage files individually** -- commit file by file with descriptive messages
- Use imperative mood ("add" not "added")
- Keep subject line under 72 characters
- Explain "why" in the body, not "what"

### DON'T
- Commit secrets or credentials
- Commit large binary files
- Use generic messages ("fix bug", "update")
- Include AI attribution in commits (no "Co-Authored-By: Claude" or similar)
- Use emojis in commit messages
- Commit broken code to shared branches
- Use `git add .` or `git add -A` for multi-file changes

### File-by-File Commit Example

When making changes across multiple files, stage and commit each file separately:

```bash
# Bad -- batches everything together, loses traceability
git add .
git commit -m "fix: various fixes"

# Good -- file by file with descriptive messages
git add src/application/dto/request/index.ts
git commit -m "fix(auth): remove unsupported document type from DTO enum"

git add src/application/use-cases/documents/index.ts
git commit -m "fix(auth): update switch statement for document type handling"

git add src/infrastructure/repositories/document.repository.ts
git commit -m "refactor(auth): simplify document type mapping"
```

Each commit should be atomic and self-explanatory. A reviewer should be able to understand the intent of each change from the message alone, without reading the diff.

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

## Screenshots (if UI changes)
[Add screenshots]

## Checklist
- [ ] Code follows project conventions
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings introduced
```

### Review Process
1. Create PR with clear description
2. Request review from an appropriate team member
3. Address review comments
4. Get approval
5. Squash and merge

---

## Git Operations Reference

### Daily Workflow
```bash
# Start new feature
git checkout develop
git pull
git checkout -b feature/AUTH-001-user-onboarding

# Work on feature
git add <specific-file>
git commit -m "feat(auth): add onboarding page"

# Push to remote
git push -u origin feature/AUTH-001-user-onboarding

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

### Undo Last Commit (not pushed)
```bash
git reset --soft HEAD~1
# Changes preserved in staging
```

### View Changes
```bash
git status
git diff
git diff --staged
git log --oneline -10
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

## Conflict Resolution

### When Rebasing
```bash
git rebase develop
# Conflict occurs
# Edit conflicted files
git add <resolved-files>
git rebase --continue
# Or abort if needed
git rebase --abort
```

### When Merging
```bash
git merge develop
# Conflict occurs
# Edit conflicted files
git add <resolved-files>
git commit
```

---

## Tagging Releases

### Version Format
```
v<major>.<minor>.<patch>
```

### Creating Tags
```bash
git tag -a v1.2.0 -m "Release v1.2.0: user onboarding module"
git push origin v1.2.0
```

---

## Work Records and Session Commits

Where the project maintains per-session work records (see the work-records rule), each session should include a commit updating that record:

```bash
git add docs/workrecords/work-record-YYYY-MM-DD.md
git commit -m "docs(workrecords): add session - [summary]"
```

[CUSTOMIZE: adjust the path to match your project's work-record convention]

### Incremental Implementation Commits

When building out a new feature layer by layer, follow the implementation order with incremental commits. This pattern keeps each commit reviewable and bisect-friendly:

```bash
git commit -m "feat(auth): add User domain entity"
git commit -m "feat(auth): add UserRepository port"
git commit -m "feat(auth): implement UserRepositoryImpl"
git commit -m "feat(auth): add RegisterUser use case"
git commit -m "feat(auth): add UserController"
git commit -m "test(auth): add RegisterUser unit tests"
```

The discipline: one clean architectural layer per commit, matched to your project's layer naming.

---

## Pre-Commit Checklist

Before committing:
- [ ] Code compiles without errors
- [ ] Tests pass
- [ ] Linting passes
- [ ] No secrets in code
- [ ] No debug logging left in production paths
- [ ] Commit message follows the format above
