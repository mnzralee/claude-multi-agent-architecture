---
name: pr
description: Pull Request Skill for creating well-structured PRs
---

# Pull Request Skill

Create well-structured pull requests.

---

## PR Title Format

```
<type>(<scope>): <description>
```

Same types and scopes as commit messages:
- `feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`

---

## PR Body Template

```markdown
## Summary
Brief description of what this PR does (1-3 sentences).

## Changes
- Bullet point list of changes
- Group by category if many changes
- Reference relevant files

## Test Plan
- [ ] Manual testing steps
- [ ] Unit tests added/updated
- [ ] Integration tests pass

## Screenshots (if UI changes)
[Add screenshots for visual changes]

## Notes
Any additional context, trade-offs, or follow-up work needed.
```

---

## Workflow

### Step 1: Ensure Branch is Ready
```bash
# Check current branch
git branch --show-current

# Ensure all changes committed
git status

# Check commits to be included
git log main..HEAD --oneline
```

### Step 2: Push Branch
```bash
# Push and set upstream
git push -u origin $(git branch --show-current)
```

### Step 3: Create PR
```bash
gh pr create --title "feat(scope): description" --body "$(cat <<'EOF'
## Summary
Brief description of what this PR does.

## Changes
- Change 1
- Change 2
- Change 3

## Test Plan
- [ ] Tested locally
- [ ] Unit tests pass
- [ ] Manual verification complete

EOF
)"
```

---

## Examples

### Feature PR
```bash
gh pr create --title "feat(auth): add user registration" --body "$(cat <<'EOF'
## Summary
Adds user registration functionality with email verification.

## Changes
- Add `useRegistration` hook with form handling
- Create `RegistrationForm` component with validation
- Implement `/api/v1/auth/register` endpoint
- Add email verification flow

## Test Plan
- [ ] Complete registration flow
- [ ] Verify email sent
- [ ] Check user created in database
- [ ] Verify validation errors shown

EOF
)"
```

### Bug Fix PR
```bash
gh pr create --title "fix(api): resolve authentication timeout" --body "$(cat <<'EOF'
## Summary
Fixes a bug where authentication would timeout after 5 minutes.

## Changes
- Update token refresh logic in auth middleware
- Extend session timeout configuration
- Add token refresh endpoint

## Root Cause
The refresh token was not being updated on each request, causing sessions to expire.

## Test Plan
- [ ] Login and wait 10 minutes
- [ ] Verify session persists
- [ ] Check refresh token updated

EOF
)"
```

### Refactor PR
```bash
gh pr create --title "refactor(components): simplify form handling" --body "$(cat <<'EOF'
## Summary
Refactors form components to use shared validation hook.

## Changes
- Extract `useFormValidation` hook
- Update LoginForm to use shared hook
- Update RegisterForm to use shared hook
- Remove duplicate validation code

## Test Plan
- [ ] Forms render correctly
- [ ] Validation works as before
- [ ] No visual regressions

## Notes
No functional changes - purely structural refactor.

EOF
)"
```

---

## PR Checklist

Before creating a PR, verify:

- [ ] Branch is up to date with main
- [ ] All commits follow convention
- [ ] No merge conflicts
- [ ] Tests pass locally
- [ ] No console.log or debugging code
- [ ] No hardcoded secrets or credentials
- [ ] PR title follows format
- [ ] PR body includes summary, changes, test plan

---

## Useful Commands

```bash
# List open PRs
gh pr list

# View PR status
gh pr status

# Check out a PR locally
gh pr checkout <number>

# View PR diff
gh pr diff <number>

# Merge PR (if approved)
gh pr merge <number> --squash
```

---

## Apply to: $ARGUMENTS
