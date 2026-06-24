---
name: pr
description: Pull Request skill for creating well-structured, consistently formatted PRs using the GitHub CLI
---

# Pull Request Skill

Create well-structured pull requests using a consistent format: conventional-commit title, body sections covering summary, changes, and test plan, and a pre-submit checklist. The discipline below is stack-agnostic; illustrative scope names use a TypeScript / Node / Express / Vitest project, but the pattern applies to any language or framework.

---

## PR Title Format

```
<type>(<scope>): <description>
```

Same types and scopes as commit messages:
- `feat`, `fix`, `refactor`, `docs`, `chore`, `perf`, `test`
- Scopes: match your project's top-level apps or modules (e.g. `api`, `web`, `auth`, `payments`, `infra`, etc.)

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

# Ensure all changes are committed
git status

# Review commits to be included
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
gh pr create --title "feat(accounts): add saved-recipient management" --body "$(cat <<'EOF'
## Summary
Adds the ability for users to manage saved recipients for faster repeat transactions.

## Changes
- Add `useSavedRecipients` hook with CRUD operations
- Create `SavedRecipientListPage` with search and filtering
- Implement `AddRecipientDialog` and `EditRecipientDialog`
- Add recipient types in `src/types/recipient.ts`
- Integrate with `/api/v1/recipients` endpoints

## Test Plan
- [ ] Add a new recipient
- [ ] Edit an existing recipient
- [ ] Delete a recipient
- [ ] Search recipients by name
- [ ] Filter by account type
- [ ] Verify form validation

## Screenshots
[Add screenshots of recipient list and dialogs]

EOF
)"
```

### Bug Fix PR
```bash
gh pr create --title "fix(auth): resolve registration not creating user profile" --body "$(cat <<'EOF'
## Summary
Fixes a bug where completing registration did not create a user profile record, causing login failures.

## Changes
- Update `POST /api/v1/registration/password` to create the user profile on completion
- Set the migration marker on the pending registration record
- Create initial account for new users
- Add structured logging for debugging

## Root Cause
The password endpoint was only advancing the registration step without actually committing the user record to the profiles table.

## Test Plan
- [ ] Complete the full registration flow end-to-end
- [ ] Verify user profile is created in the database
- [ ] Verify login works immediately after registration
- [ ] Check that the initial account is created with a zero balance

EOF
)"
```

### Refactor PR
```bash
gh pr create --title "refactor(admin): simplify user table component" --body "$(cat <<'EOF'
## Summary
Refactors the user management table to use TanStack Table for better maintainability.

## Changes
- Extract column definitions to `user-table-columns.tsx`
- Replace custom sorting with TanStack Table sorting
- Remove unused filter state and handlers
- Improve TypeScript types throughout

## Test Plan
- [ ] Table renders correctly
- [ ] Sorting works on all columns
- [ ] Pagination is still functional
- [ ] Row actions work (view, edit, delete)

## Notes
No functional changes; purely a structural refactor.

EOF
)"
```

---

## PR Checklist

Before creating a PR, verify:

- [ ] Branch is up to date with main
- [ ] All commits follow the conventional-commit convention
- [ ] No merge conflicts
- [ ] Tests pass locally
- [ ] No leftover `console.log` or debugging code
- [ ] No hardcoded secrets or credentials
- [ ] PR title follows the `<type>(<scope>): <description>` format
- [ ] PR body includes summary, changes, and test plan

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
