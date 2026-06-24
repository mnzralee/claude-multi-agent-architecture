# Files Modified

Use this template to track the impact of changes across the codebase.

```markdown
### Files Modified

#### [Component/Service Name]
| Action | File | Lines +/- | Notes |
|--------|------|-----------|-------|
| Created | src/auth/verify-email.ts | +85 | New use case |
| Modified | src/auth/routes.ts | +12 -2 | Added verification route |
| Modified | src/auth/container.ts | +5 -0 | Wired new use case |
| Deleted | src/auth/legacy-verify.ts | -120 | Replaced by new implementation |

#### [Another Component]
| Action | File | Lines +/- | Notes |
|--------|------|-----------|-------|
| Modified | components/auth/verify-form.tsx | +95 -10 | New verification UI |

**Impact Summary**:
- Files created: 1
- Files modified: 3
- Files deleted: 1
- Net lines: +72
- Components affected: 2
```

## Guidelines

- Group files by component, service, or logical area
- Note the action (Created/Modified/Deleted) for each file
- Include approximate line counts for change impact assessment
- Add notes explaining WHY each file was changed
- Include an impact summary at the bottom
