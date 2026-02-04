---
name: commit
description: Git Commit Skill for creating well-structured commits following conventional conventions
---

# Git Commit Skill

Create well-structured git commits following conventional commit standards.

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
- Each file/group gets its own descriptive commit message
- Don't batch unrelated changes into single commits

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
| `refactor` | Code refactoring (no feature/fix) |
| `docs` | Documentation only |
| `style` | Formatting, missing semicolons (no code change) |
| `test` | Adding/updating tests |
| `chore` | Maintenance, dependencies, configs |
| `perf` | Performance improvement |

### Scopes
[CUSTOMIZE: Define your project's scopes]
```
Frontend:    ui, components, pages, auth, dashboard
Backend:     api, auth, db, services
Infra:       k8s, docker, ci, config
General:     deps, build, release
```

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
feat(auth): add user registration flow

- Add registration form component
- Implement validation schema
- Create registration API endpoint
- Add success/error handling

EOF
)"
```

### Bug Fix
```bash
git commit -m "$(cat <<'EOF'
fix(api): resolve null pointer in user lookup

Root cause: User service didn't handle missing records.
Added null check before accessing user properties.

EOF
)"
```

### Refactor
```bash
git commit -m "$(cat <<'EOF'
refactor(components): extract shared form logic

- Create useFormValidation hook
- Extract common input components
- Remove duplicate validation code

EOF
)"
```

### Chore
```bash
git commit -m "chore(deps): update React to v18.2"
```

---

## Multi-File Commits

When changes span multiple files, group logically:

```bash
# Stage related files together
git add src/hooks/use-auth.ts
git add src/types/auth.ts
git commit -m "feat(auth): add authentication hooks and types"

git add src/components/login-form.tsx
git add src/components/register-form.tsx
git commit -m "feat(auth): add login and registration forms"
```

---

## Rules

1. **No AI attribution** - Don't add "Co-Authored-By: Claude" or similar
2. **No emojis** - Keep commits formal and professional
3. **Imperative mood** - "add feature" not "added feature"
4. **Present tense** - "fix bug" not "fixed bug"
5. **72 char limit** - Wrap body text at 72 characters
6. **Atomic commits** - One logical change per commit
7. **No secrets** - Never commit .env, credentials, API keys

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
