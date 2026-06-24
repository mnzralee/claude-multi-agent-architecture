# Commit Log

Use this template to document all commits made during a session.

```markdown
### Commits

| # | Repo | Hash | Message |
|---|------|------|---------|
| 1 | backend | `abc1234` | feat(auth): add email verification endpoint |
| 2 | backend | `def5678` | test(auth): add verification unit tests |
| 3 | frontend | `ghi9012` | feat(auth): add verification page UI |
| 4 | infra | `jkl3456` | chore(k8s): update auth service manifest |

**Summary**: 4 commits across 3 repos | 2 feat, 1 test, 1 chore
```

## Guidelines

- Log EVERY commit, including documentation and chore commits
- Include the short hash for traceability
- Organize by repository when working across multiple repos
- Add a summary line with totals and type breakdown
- If using file-by-file commits, group related commits together
