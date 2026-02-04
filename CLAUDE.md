# [PROJECT_NAME] - Claude Code Project Instructions

> **Version**: 1.0.0 | **Last Updated**: [DATE]
> **Architecture**: Multi-Agent Orchestration System
> **Developer**: [YOUR_DEVELOPER]

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Multi-Agent Orchestration System](#multi-agent-orchestration-system)
3. [Work Records & Documentation](#work-records--documentation)
4. [Development Environment](#development-environment)
5. [Mandatory Work Methodology](#mandatory-work-methodology)
6. [Credentials & Security](#credentials--security)
7. [Project Structure](#project-structure)
8. [Development Guidelines](#development-guidelines)

---

## Quick Start

### Session Initialization Checklist

```markdown
1. [ ] Read today's work record: docs/workrecords/work-record-YYYY-MM-DD.md
2. [ ] Create if doesn't exist
3. [ ] Review recent implementation status
4. [ ] Identify current task scope
5. [ ] Select appropriate agent(s) for the task
```

### Common Commands

```bash
# [CUSTOMIZE: Add your project's common commands]
# Example:
npm run dev           # Start development server
npm run build         # Build project
npm run test          # Run tests
npm run lint          # Run linter
```

---

## Multi-Agent Orchestration System

### Overview

[PROJECT_NAME] uses a **department-style agent hierarchy** where a main orchestrator coordinates specialized sub-agents for different aspects of development. This ensures:

- **Context isolation**: Heavy operations run in isolated contexts
- **Specialization**: Each agent excels at specific tasks
- **Quality**: Validation agents catch issues before deployment
- **Efficiency**: Parallel agent execution where possible

### Agent Hierarchy

```
                    ┌─────────────────────┐
                    │   ORCHESTRATOR      │
                    │   (Main Claude)     │
                    └─────────┬───────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   ARCHITECT   │    │   RESEARCHER  │    │   SECURITY    │
│   (Opus)      │    │   (Haiku)     │    │   (Opus)      │
│   Proactive   │    │   Proactive   │    │   Proactive   │
└───────────────┘    └───────────────┘    └───────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                    IMPLEMENTATION TIER                     │
│  backend-impl │ frontend-impl │ infra-impl (All Sonnet)   │
└───────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────┐
│                    VALIDATION TIER                         │
│      tester    │    reviewer    │    debugger (Sonnet)    │
└───────────────────────────────────────────────────────────┘
```

### Agent Definitions

| Agent | Model | Tools | When to Use |
|-------|-------|-------|-------------|
| **architect** | Opus | Read, Grep, Glob | Module planning, API design, architectural decisions |
| **researcher** | Haiku | Read, Grep, Glob | Fast codebase exploration, finding patterns |
| **supervisor** | Sonnet | Read, Grep, Glob, Task | Track management, sub-agent coordination |
| **prompt-writer** | Haiku | Read, Grep, Glob | Generate context-optimized prompts for sub-agents |
| **backend-impl** | Sonnet | Read, Edit, Write, Bash | Backend code implementation |
| **frontend-impl** | Sonnet | Read, Edit, Write, Bash | Frontend code implementation |
| **infra-impl** | Sonnet | Read, Edit, Write, Bash | Infrastructure and deployment work |
| **tester** | Sonnet | Read, Edit, Bash | Write and run tests |
| **reviewer** | Sonnet | Read, Grep, Glob | Code review and quality checks |
| **debugger** | Sonnet | Read, Grep, Bash | Diagnose and fix issues |
| **security** | Opus | Read, Grep, Glob | Security audit and vulnerability detection |
| **work-recorder** | Haiku | Read, Edit, Write, Glob | Continuous work documentation |
| **code-quality-auditor** | Opus | Read, Grep, Glob | Deep quality analysis |

### Agent Files Location

All agent definitions are in `.claude/agents/`:

```
.claude/agents/
├── architect/AGENT.md
├── researcher/AGENT.md
├── supervisor/AGENT.md
├── prompt-writer/AGENT.md
├── backend-impl/AGENT.md
├── frontend-impl/AGENT.md
├── infra-impl/AGENT.md
├── tester/AGENT.md
├── reviewer/AGENT.md
├── debugger/AGENT.md
├── security/AGENT.md
├── work-recorder/AGENT.md
└── code-quality-auditor/AGENT.md
```

### Workflow Patterns

#### Pattern 1: Full Feature Implementation
```
User: "Build the [feature] module"

1. ARCHITECT agent → Design module structure
2. RESEARCHER agent (parallel) → Find existing patterns
3. Create feature checklist in .claude/progress/
4. For each feature:
   a. BACKEND-IMPL or FRONTEND-IMPL → Implement
   b. TESTER → Write tests
   c. REVIEWER → Validate
5. SECURITY agent → Final audit (if sensitive)
6. Commit with /commit skill
```

#### Pattern 2: Bug Fix
```
User: "Fix the [issue]"

1. DEBUGGER agent → Diagnose root cause
2. BACKEND-IMPL or FRONTEND-IMPL → Apply fix
3. TESTER → Verify fix + add regression test
4. REVIEWER → Ensure quality
5. Commit
```

#### Pattern 3: Code Review
```
User: "/review PR #123"

1. REVIEWER agent → Quality check
2. SECURITY agent → Security audit
3. Synthesize and report
```

### CRITICAL: Prompt-Writer for Sub-Agents

**ALWAYS use the `prompt-writer` agent when spawning sub-agents for complex tasks.**

The prompt-writer agent (Haiku, fast) generates context-optimized prompts that:
- Include relevant file paths and code context
- Reference the correct conventions from CLAUDE.md
- Structure the task with clear acceptance criteria
- Avoid context bloat by focusing on what the sub-agent needs

### Skills (User-Invocable)

Skills are reusable workflows invoked with `/skill-name`:

| Skill | Description |
|-------|-------------|
| `/commit` | Git commit workflow with conventions |
| `/pr` | Pull request creation |
| `/review` | Code review standards |
| `/debug` | Debug & troubleshooting |
| `/work-recording` | Session work documentation |
| `/multi-agent-orchestration` | Hierarchical agent coordination |
| `/systematic-debugging` | Methodical error diagnosis |
| `/verification-before-completion` | Quality gates and validation |

### Extended Thinking Triggers

For complex tasks, use these phrases to trigger deeper reasoning:

- `"think"` - Standard extended thinking
- `"think hard"` or `"think carefully"` - Extended analysis
- `"think harder"` or `"ultrathink"` - Maximum reasoning depth

---

## Work Records & Documentation

### CRITICAL: Work Records Location

```
CORRECT LOCATION: docs/workrecords/
File format: work-record-YYYY-MM-DD.md
```

### Session Management

**At session start:**
1. Read today's work record from `docs/workrecords/work-record-YYYY-MM-DD.md`
2. Create today's work record if it doesn't exist
3. Update the work record throughout the session

---

## Development Environment

### [CUSTOMIZE: Your Project Structure]

```
[PROJECT_NAME]/
├── src/                    # Source code
├── tests/                  # Test files
├── docs/                   # Documentation
│   └── workrecords/        # Session work records
├── .claude/                # Agent orchestration config
└── CLAUDE.md               # This file
```

### [CUSTOMIZE: Your Services/Modules]

| Service/Module | Port | Purpose |
|----------------|------|---------|
| [YOUR_SERVICE_1] | [PORT] | [DESCRIPTION] |
| [YOUR_SERVICE_2] | [PORT] | [DESCRIPTION] |

### [CUSTOMIZE: Environment Configuration]

```bash
# Add your environment variables and configuration
```

---

## Mandatory Work Methodology

### CRITICAL: Follow this methodology for EVERY task. No exceptions.

#### Phase 1: Understand Context (BEFORE any action)
- Read today's work record from `docs/workrecords/`
- Understand the system state before making changes
- Identify scope - what systems/services could be affected

#### Phase 2: Assess Current State
- Run relevant health checks before any changes
- Document baseline - what's working, what's not
- Identify ALL related issues

#### Phase 3: Plan Comprehensively
- Identify root cause - not just the symptom
- Identify ALL instances - if a problem affects one component, check ALL similar components
- Write the plan explicitly
- Identify risks and rollback strategy
- Seek approval before execution

#### Phase 4: Execute Methodically
- One change at a time - apply changes incrementally
- Verify after each change
- Commit incrementally after each logical unit of work

#### Phase 5: Verify Comprehensively
- Test the specific fix
- Test related systems
- Run end-to-end test - full flow verification
- Document verification results

#### Phase 6: Document & Prevent
- Update work record in `docs/workrecords/`
- Update system documentation if configurations changed
- Create prevention measures if applicable

### NEVER Do These

- Fix one instance of a systemic problem without checking ALL instances
- Declare success without end-to-end verification
- Assume names, endpoints, or configurations - always verify from source
- Skip reading work records at session start
- Make changes without understanding current system state
- Modify credentials without explicit permission

---

## Credentials & Security

### CRITICAL: Credentials are sacred

**Finding Credentials:**
- Search for seeded/configured values in the codebase FIRST
- Check existing seed scripts, configuration files, environment variables
- Never guess or generate new values

### If Credential is Unknown
1. Ask the user before making any changes
2. Do not reset or regenerate without explicit approval
3. Document the credential source once found

---

## Project Structure

### [CUSTOMIZE: Your Repository Structure]

```
[PROJECT_NAME]/
├── [YOUR_STRUCTURE_HERE]
└── ...
```

---

## Development Guidelines

### Git Commits

After every major step, bug fix, code improvement, feature, refactor, fix, chore, etc:

**Commit Style:**
- Do industry standard commits, staged commits, file by file
- Each file should have a very descriptive commit message about the work done
- Keep commits formal - no AI branding or emojis
- No Claude/AI attribution in commit messages

**Commit Message Format:**
```
type(scope): descriptive subject

[Optional body with more details]
```

**Types:** `feat`, `fix`, `refactor`, `chore`, `docs`, `test`, `perf`, `security`

**[CUSTOMIZE: Your Scopes]**

**Rules:**
- Never commit secrets or credentials
- Never include AI attribution (no "Co-Authored-By: Claude")
- Use imperative mood ("add" not "added", "fix" not "fixed")
- Keep subject line under 72 characters
- Body explains "why" not "what"

### [CUSTOMIZE: Add Your Stack-Specific Standards]

---

## Best Practices Summary

### From Anthropic Research

1. **Explore → Plan → Code → Commit**: Never jump directly to coding
2. **One agent, one job**: Clear inputs/outputs, single goal
3. **Model routing**: Opus for architecture, Haiku for exploration, Sonnet for implementation
4. **Context isolation**: Use subagents to prevent context bloat
5. **State persistence**: JSON artifacts for cross-session continuity

### For [PROJECT_NAME]

1. Always read work records at session start
2. Use appropriate agent for the task
3. Follow your architecture patterns
4. Never modify credentials without permission
5. Verify comprehensively before declaring success
6. Document everything in work records
7. Spawn sub-agents for heavy work to preserve main context
8. Run parallel agents for independent validation tasks
9. On errors: Read fully → Diagnose → Fix → Verify → Document

---

## Attribution

**Developer/Lead Engineer**: [YOUR_NAME]

All code, commits, documentation, and architectural decisions in this project are authored by [YOUR_NAME]. Never attribute work to AI assistants, Claude, or Anthropic in commits, documentation, or any project artifacts.

---

*This document is the authoritative source for Claude Code development on [PROJECT_NAME].*
