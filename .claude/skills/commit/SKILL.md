---
name: commit
description: Git Commit Skill for creating well-structured, atomic commits following conventional-commits discipline
---

# Git Commit Skill

Create well-structured git commits following conventional-commits discipline. The examples below use a TypeScript / Node.js stack for concreteness; the discipline is stack-agnostic and applies equally to any language or framework.

---

## When to Commit

**Commit after every major step:**
- After completing a feature
- After fixing a bug
- After code improvements
- After refactoring
- After any significant change

**File-by-file approach:**
- Stage and commit files individually or in small logical groups
- Each file or group gets its own descriptive commit message
- Do not batch unrelated changes into single commits

**Keep it formal:**
- No AI attribution (no "Co-Authored-By: Claude" or similar)
- No emojis in commit messages
- Professional, descriptive messages

---

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `refactor` | Code refactoring (no feature or fix) |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons (no logic change) |
| `test` | Adding or updating tests |
| `chore` | Maintenance, dependencies, configs |
| `perf` | Performance improvement |

### Scopes (adapt to your project structure)
```
Frontend:    ui, auth, dashboard, settings, [CUSTOMIZE: your frontend apps/modules]
Backend:     api, auth, db, jobs, [CUSTOMIZE: your backend services/modules]
Infra:       docker, ci, config, k8s
General:     deps, build, release
```

Replace the placeholders above with the actual apps and services in your project.

---

## Workflow

### Step 1: Check Status
```bash
git status
git diff --staged
git diff
```

### Step 2: Stage Files
```bash
# Stage specific files (preferred)
git add path/to/file1.ts path/to/file2.ts

# Stage all changes in a directory
git add src/components/

# Interactive staging (review each change)
git add -p
```

### Step 3: Create Commit
```bash
git commit -m "$(cat <<'EOF'
type(scope): short description

Longer explanation of the change if needed.
- Bullet points for multiple changes
- Keep lines under 72 characters

EOF
)"
```

---

## Examples

### Feature Commit
```bash
git commit -m "$(cat <<'EOF'
feat(dashboard): add saved search and filter feature

- Add saved search list with name and criteria display
- Implement save/edit/delete dialogs
- Create useSavedSearches query hook
- Add saved-search types and API integration

EOF
)"
```

### Bug Fix
```bash
git commit -m "$(cat <<'EOF'
fix(auth): resolve registration flow not creating user profile

Root cause: the password-confirmation endpoint was not promoting
the pending-registration record to a full user profile after
the password was set.

- Add promotion logic in the password handler
- Set migratedToProfileId and migratedAt fields
- Create initial account record for new user

EOF
)"
```

### Refactor
```bash
git commit -m "$(cat <<'EOF'
refactor(admin): simplify user management table component

- Extract column definitions to separate file
- Replace inline sorting with TanStack Table
- Remove unused filter state

EOF
)"
```

### Chore
```bash
git commit -m "$(cat <<'EOF'
chore(deps): update TanStack Query to v5.17

EOF
)"
```

---

## Multi-File Commits

When changes span multiple files, group them logically:

```bash
# Stage related files together
git add src/hooks/use-orders.ts
git add src/types/order.ts
git commit -m "feat(orders): add order API hooks and types"

git add src/app/orders/page.tsx
git add src/app/orders/_components/
git commit -m "feat(orders): add order management UI"
```

---

## Rules

1. **No AI attribution** - Do not add "Co-Authored-By: Claude" or similar
2. **No emojis** - Keep commits formal and professional
3. **Imperative mood** - "add feature" not "added feature"
4. **Present tense** - "fix bug" not "fixed bug"
5. **72 char limit** - Wrap body text at 72 characters
6. **Atomic commits** - One logical change per commit
7. **No secrets** - Never commit .env files, credentials, or API keys

---

## Pre-Commit Checklist

- [ ] All related files staged
- [ ] No unintended files included (`git status`)
- [ ] No secrets or credentials
- [ ] Commit message follows format
- [ ] Type and scope are appropriate
- [ ] Description is clear and concise

---

## Apply to: $ARGUMENTS
