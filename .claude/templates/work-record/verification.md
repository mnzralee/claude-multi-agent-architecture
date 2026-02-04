# Verification Template

Use this template to document how the solution was verified.

---

```markdown
### Verification & Testing

**How We Verified:**
[Description of verification approach and methodology]

**Test Results:**
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| [Test 1] | [expected] | [actual] | PASS/FAIL |
| [Test 2] | [expected] | [actual] | PASS/FAIL |

**Manual Verification:**
- [x] [Scenario 1] - Verified
- [x] [Scenario 2] - Verified
- [ ] [Scenario 3] - Not yet verified (reason)

**Regression Check:**
[What we checked to ensure we didn't break anything else]

**Edge Cases Tested:**
- [Edge case 1]: [Result]
- [Edge case 2]: [Result]

**Performance Impact:**
[If relevant - any performance measurements]
```

---

## Guidelines

### Verification Approach
- Describe the overall testing strategy
- Note what types of testing were performed
- Mention any automated vs manual testing

### Test Results Table
- Keep concise but complete
- Include both successful and failed tests
- Use clear pass/fail status

### Manual Verification
- List specific scenarios tested
- Use checkboxes to show completion
- Note anything not yet verified

### Regression Check
- Document what related functionality was tested
- Shows thoroughness
- Helps future debugging if issues arise

### Edge Cases
- Document boundary conditions tested
- Include unusual scenarios
- Shows comprehensive testing

### Performance Impact
- Only include if relevant
- Provide before/after metrics if available
- Note any trade-offs made
