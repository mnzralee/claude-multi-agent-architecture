# Logging and Metrics Templates

Referenced from the core `SKILL.md`'s "Work Recorder Integration" and "Metrics Collection" sections. Read this when you need the exact work-recorder event schema, the markdown log format template, or the per-supervisor metrics JSON shape.

## Work Recorder Integration

The work-recorder agent maintains continuous documentation:

### Event Types

| Event | Trigger | Log Content |
|-------|---------|-------------|
| `track_start` | Supervisor begins track | Track name, WPs, team |
| `wp_start` | Work package begins | WP ID, assigned agent |
| `prompt_generated` | Prompt-writer completes | Target agent, token estimate, planned_files |
| `impl_complete` | Implementation done | Files modified, commit SHA, verification |
| `error_occurred` | Any failure | Error details, context |
| `error_resolved` | Debugger fix applied | Root cause, resolution |
| `wp_complete` | Work package done | Summary, metrics |
| `track_complete` | All WPs done | Aggregate metrics |

### Log Format

```markdown
## Track: [TRACK_NAME]

### WP-XX: [Title]
**Status:** COMPLETE
**Agent:** backend-impl
**Commit:** 8b1d4a2
**Duration:** [estimate]

**Files Modified:**
| File | Change |
|------|--------|
| path/to/file.ts | [description] |

**Verification:**
- [x] npx tsc --noEmit, PASS
- [x] <your codegen command>, PASS

**Issues Encountered:**
- [Issue description], RESOLVED via debugger

---
```

## Metrics Collection

Each supervisor collects:

```json
{
  "track": "Track B",
  "metrics": {
    "workPackagesTotal": 4,
    "workPackagesComplete": 4,
    "subAgentInvocations": 12,
    "promptsGenerated": 4,
    "debuggerInvocations": 1,
    "errorsEncountered": 1,
    "errorsResolved": 1,
    "filesModified": 5,
    "linesChanged": 120,
    "verificationsPassed": 8,
    "redFlagRejects": 0
  }
}
```
