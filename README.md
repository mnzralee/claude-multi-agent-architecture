# Claude Multi-Agent Architecture Template

A production-ready, reusable template for building sophisticated multi-agent AI systems with Claude Code. This architecture enables hierarchical agent coordination, specialized task delegation, and comprehensive documentation workflows.

---

## What Is This?

This template provides a complete framework for orchestrating multiple Claude agents to handle complex software development tasks. Based on enterprise patterns refined through real-world production use, it includes:

- **14 Specialized Agents** - From architects to security auditors
- **8 Reusable Skills** - Common workflows like commits, reviews, debugging
- **4 Enforcement Rules** - Quality standards automatically applied
- **Work Recording System** - Comprehensive session documentation
- **Progress Tracking** - Cross-session state persistence

---

## Quick Start

### 1. Copy to Your Project

```bash
# Copy the template to your project
cp -r claude-multi-agent-architecture/.claude /your/project/
cp claude-multi-agent-architecture/CLAUDE.md /your/project/

# Create work records directory
mkdir -p /your/project/docs/workrecords
```

### 2. Customize CLAUDE.md

Open `CLAUDE.md` and replace the placeholders:

| Placeholder | Replace With |
|-------------|--------------|
| `[PROJECT_NAME]` | Your project name |
| `[YOUR_STACK]` | Your tech stack (e.g., "NestJS + Next.js + PostgreSQL") |
| `[YOUR_SERVICES]` | Your service names (e.g., "svc-auth, svc-api") |
| `[YOUR_DEVELOPER]` | Your name/username |

### 3. Adjust Permissions

Edit `.claude/settings.json` to match your project:

```json
{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(your-custom-command:*)"
    ]
  }
}
```

### 4. Start Using

In your Claude Code session, the agents and skills are now available:

```bash
# Use skills
/commit              # Git commit workflow
/review              # Code review
/debug               # Debugging methodology

# Agents are invoked automatically based on task type
# Or explicitly: "Use the architect agent to design the API"
```

---

## Directory Structure

```
your-project/
├── CLAUDE.md                    # Project instructions (customize this)
├── .claude/
│   ├── settings.json            # Permissions & agent config
│   ├── settings.local.json      # Personal overrides (gitignored)
│   │
│   ├── agents/                  # Agent definitions
│   │   ├── architect/AGENT.md       # System design (Opus)
│   │   ├── researcher/AGENT.md      # Fast exploration (Haiku)
│   │   ├── supervisor/AGENT.md      # Track coordination (Sonnet)
│   │   ├── prompt-writer/AGENT.md   # Prompt optimization (Haiku)
│   │   ├── backend-impl/AGENT.md    # Backend implementation (Sonnet)
│   │   ├── frontend-impl/AGENT.md   # Frontend implementation (Sonnet)
│   │   ├── infra-impl/AGENT.md      # Infrastructure (Sonnet)
│   │   ├── tester/AGENT.md          # Testing specialist (Sonnet)
│   │   ├── reviewer/AGENT.md        # Code review (Sonnet)
│   │   ├── debugger/AGENT.md        # Troubleshooting (Sonnet)
│   │   ├── security/AGENT.md        # Security audit (Opus)
│   │   ├── work-recorder/AGENT.md   # Documentation (Haiku)
│   │   └── code-quality-auditor/AGENT.md  # Quality analysis (Opus)
│   │
│   ├── skills/                  # Reusable workflows
│   │   ├── commit/SKILL.md
│   │   ├── pr/SKILL.md
│   │   ├── review/SKILL.md
│   │   ├── debug/SKILL.md
│   │   ├── work-recording/SKILL.md
│   │   ├── multi-agent-orchestration/SKILL.md
│   │   ├── systematic-debugging/SKILL.md
│   │   └── verification-before-completion/SKILL.md
│   │
│   ├── rules/                   # Enforcement rules
│   │   ├── git-workflow.md
│   │   ├── security-standards.md
│   │   ├── testing-standards.md
│   │   └── code-quality.md
│   │
│   ├── templates/               # Documentation templates
│   │   └── work-record/
│   │
│   └── progress/                # State tracking
│       └── current-task.json
│
└── docs/
    ├── CUSTOMIZATION.md         # How to customize
    ├── AGENT-GUIDE.md           # When to use which agent
    ├── WORKFLOW-PATTERNS.md     # Common patterns
    └── workrecords/             # Session documentation
```

---

## Agent Hierarchy

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

---

## Model Routing Strategy

| Complexity | Model | Use Case |
|------------|-------|----------|
| **Strategic** | Opus | Architecture, security audits, critical decisions |
| **Exploration** | Haiku | Fast search, prompt generation, documentation |
| **Implementation** | Sonnet | Code changes, testing, debugging, review |

---

## Skills Reference

| Skill | Invocation | Purpose |
|-------|------------|---------|
| Commit | `/commit` | Git commit with conventional format |
| Pull Request | `/pr` | Create well-structured PRs |
| Code Review | `/review` | Quality and security review |
| Debug | `/debug` | Troubleshooting methodology |
| Work Recording | `/work-recording` | Session documentation |
| Multi-Agent | `/multi-agent-orchestration` | Coordinate complex tasks |
| Systematic Debug | `/systematic-debugging` | Root cause analysis |
| Verification | `/verification-before-completion` | Pre-completion checks |

---

## Documentation

- **[CUSTOMIZATION.md](docs/CUSTOMIZATION.md)** - How to adapt for your project
- **[AGENT-GUIDE.md](docs/AGENT-GUIDE.md)** - When to use which agent
- **[WORKFLOW-PATTERNS.md](docs/WORKFLOW-PATTERNS.md)** - Common orchestration patterns

---

## Best Practices

### From Anthropic Research

1. **Explore → Plan → Code → Commit** - Never jump directly to coding
2. **One agent, one job** - Clear inputs/outputs, single goal
3. **Model routing** - Opus for architecture, Haiku for exploration, Sonnet for implementation
4. **Context isolation** - Use subagents to prevent context bloat
5. **State persistence** - JSON artifacts for cross-session continuity

### For Your Project

1. Always read work records at session start
2. Use appropriate agent for the task
3. Follow your project's architecture patterns
4. Never modify credentials without permission
5. Verify comprehensively before declaring success
6. Document everything in work records

---

## License

This template is provided as-is for adaptation to your projects. Customize freely.

---

## Attribution

Architecture patterns inspired by:
- Anthropic's Claude Code best practices
- Enterprise software development methodologies
- Real-world production multi-agent systems
