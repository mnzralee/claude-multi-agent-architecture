# Issues Log

Use this template to track issues encountered during a session.

```markdown
### Issues Encountered

| # | Issue | Severity | Category | Status | Resolution |
|---|-------|----------|----------|--------|------------|
| 1 | Auth endpoint returns 401 | HIGH | Bug | Resolved | Missing JWT middleware on new route |
| 2 | Playwright timeout on login | MEDIUM | Test | Resolved | Increased timeout to 10s, added waitForResponse |
| 3 | Docker build fails on arm64 | LOW | Infra | Deferred | Not blocking, only affects local M1 dev |

#### Blockers

| Blocker | Impact | Resolution | Time Blocked |
|---------|--------|------------|-------------|
| Database migration failed | Couldn't test new feature | Manually applied ALTER TABLE | 15 min |

#### Workarounds Applied

| Issue | Workaround | Permanent Fix Needed? |
|-------|-----------|----------------------|
| Port 3041 in use | Killed orphaned process | No, one-time issue |
| Flaky test on CI | Added retry wrapper | Yes, need to fix root cause |
```

## Guidelines

- Log ALL issues, even minor ones, patterns emerge from accumulated data
- Use severity levels: CRITICAL (blocks all work), HIGH (blocks feature), MEDIUM (inconvenient), LOW (cosmetic)
- Track blockers separately with time-blocked to measure impact
- Note workarounds that need permanent fixes, these are carry-forward items
- Categories: Bug, Test, Infra, Config, Dependency, Performance, Security
