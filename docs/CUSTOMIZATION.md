# Customization Guide

This guide explains how to adapt the multi-agent architecture template for your specific project.

---

## Quick Setup

### 1. Copy Files

```bash
# Copy the template to your project
cp -r claude-multi-agent-architecture/.claude /your/project/
cp claude-multi-agent-architecture/CLAUDE.md /your/project/

# Create work records directory
mkdir -p /your/project/docs/workrecords
```

### 2. Update Placeholders in CLAUDE.md

Search and replace these placeholders:

| Placeholder | Replace With | Example |
|-------------|--------------|---------|
| `[PROJECT_NAME]` | Your project name | "MyAwesomeApp" |
| `[YOUR_STACK]` | Your tech stack | "NestJS + Next.js + PostgreSQL" |
| `[YOUR_SERVICES]` | Your services | "api-gateway, user-service, order-service" |
| `[YOUR_DEVELOPER]` | Your name | "Jane Smith" |
| `[DATE]` | Current date | "2024-01-15" |

### 3. Configure Permissions

Edit `.claude/settings.json` to match your project's needs.

---

## Customizing Permissions

### Adding Custom Commands

```json
{
  "permissions": {
    "allow": [
      // Existing permissions...

      // Add your custom commands
      "Bash(yarn:*)",
      "Bash(pnpm:*)",
      "Bash(make:*)",
      "Bash(cargo:*)",
      "Bash(python:*)",

      // Add domain-specific tools
      "Bash(terraform:*)",
      "Bash(aws:*)",
      "Bash(gcloud:*)"
    ]
  }
}
```

### Restricting Access

```json
{
  "permissions": {
    "deny": [
      // Protect sensitive files
      "Read(.env.production)",
      "Read(**/credentials/**)",

      // Prevent destructive operations
      "Bash(rm -rf:*)",
      "Bash(git push --force:*)"
    ]
  }
}
```

---

## Customizing Agents

### Modifying Existing Agents

Edit the agent's `AGENT.md` file to customize:

1. **Role description**: Update for your project context
2. **Patterns/examples**: Replace with your tech stack patterns
3. **File structure**: Match your project structure
4. **Commands**: Update for your build system

Example: Customizing `backend-impl` for a Python project:

```markdown
# In .claude/agents/backend-impl/AGENT.md

## Implementation Patterns

### 1. Service Example (FastAPI)
```python
# services/user_service.py
from fastapi import Depends
from sqlalchemy.orm import Session

class UserService:
    def __init__(self, db: Session = Depends(get_db)):
        self.db = db

    def get_user(self, user_id: int) -> User:
        return self.db.query(User).filter(User.id == user_id).first()
```

### Commands Available
```bash
# Run server
uvicorn main:app --reload

# Run tests
pytest

# Type checking
mypy .
```
```

### Adding New Agents

1. Create directory: `.claude/agents/your-agent/`
2. Create `AGENT.md` following the template:

```markdown
# Your Agent Name

## Agent Metadata
- **Name**: your-agent
- **Model**: sonnet (or haiku/opus)
- **Description**: What this agent does
- **Tools**: Read, Edit, Write, Bash (as needed)
- **Disallowed Tools**: (if any)

---

## Role & Responsibilities

[Define the agent's purpose and tasks]

---

## Patterns

[Add relevant code patterns]

---

## Invocation Triggers

[When should this agent be used?]
```

3. Register in `settings.json`:

```json
{
  "agents": {
    "your-agent": {
      "description": "What it does",
      "model": "sonnet",
      "proactive": false
    }
  }
}
```

---

## Customizing Skills

### Modifying Existing Skills

Edit the skill's `SKILL.md` to customize for your workflow:

Example: Customizing `/commit` for your commit conventions:

```markdown
# In .claude/skills/commit/SKILL.md

### Types
| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation |
| `refactor` | Code change |
| `test` | Tests |
| `ci` | CI/CD changes |  # Added for your project
| `db` | Database migrations |  # Added for your project

### Scopes
```
backend:    api, auth, db, services
frontend:   components, pages, hooks
infra:      k8s, terraform, ci
```
```

### Adding New Skills

1. Create directory: `.claude/skills/your-skill/`
2. Create `SKILL.md`:

```markdown
---
name: your-skill
description: What this skill does
---

# Your Skill Name

[Skill documentation]

## When to Use

[Usage guidance]

## Workflow

[Step-by-step workflow]

## Examples

[Usage examples]

## Apply to: $ARGUMENTS
```

---

## Customizing Rules

Rules are automatically enforced. Customize them to match your project standards.

### Modifying Rules

Example: Customizing testing standards for Python:

```markdown
# In .claude/rules/testing-standards.md

## Testing Frameworks

### Backend (Python)
- **Framework**: pytest
- **Location**: `tests/` directory
- **Config**: `pytest.ini` or `pyproject.toml`

### Test Pattern
```python
# tests/test_user_service.py
import pytest
from services.user_service import UserService

class TestUserService:
    def test_get_user_returns_user(self, mock_db):
        service = UserService(mock_db)
        user = service.get_user(1)
        assert user.id == 1
```

## Coverage Targets
- Unit tests: 85%+ (your target)
- Integration: 70%+
```

---

## Project-Specific Additions

### Adding Project Context

Add a section to CLAUDE.md with project-specific information:

```markdown
## Project-Specific Context

### Architecture Overview
[Describe your system architecture]

### Key Patterns
- [Pattern 1]: [Description]
- [Pattern 2]: [Description]

### External Dependencies
| Service | Purpose | Documentation |
|---------|---------|---------------|
| Stripe | Payments | [link] |
| SendGrid | Email | [link] |

### Environment Variables
| Variable | Purpose | Required |
|----------|---------|----------|
| DATABASE_URL | DB connection | Yes |
| API_KEY | External API | Yes |
```

### Adding Workflows

Add project-specific workflows to `settings.json`:

```json
{
  "workflows": {
    "database-migration": {
      "description": "Create and run database migrations",
      "steps": [
        { "agent": "architect", "action": "design-schema" },
        { "agent": "backend-impl", "action": "create-migration" },
        { "agent": "tester", "action": "test-migration" }
      ]
    },

    "api-endpoint": {
      "description": "Create new API endpoint",
      "steps": [
        { "agent": "architect", "action": "design-api" },
        { "agent": "backend-impl", "action": "implement" },
        { "agent": "tester", "action": "write-tests" },
        { "agent": "reviewer", "action": "review" }
      ]
    }
  }
}
```

---

## Removing Unused Components

### Removing Agents

If you don't need certain agents (e.g., `infra-impl` for a simple project):

1. Delete the agent directory
2. Remove from `settings.json`

### Simplifying for Small Projects

For simpler projects, you might keep only:
- `architect` - For planning
- `backend-impl` or `frontend-impl` - For implementation
- `tester` - For testing
- `debugger` - For troubleshooting

---

## Best Practices

### 1. Start Simple
Don't customize everything at once. Start with the basics and add complexity as needed.

### 2. Document Changes
When you customize, add comments explaining why:

```json
{
  "permissions": {
    "allow": [
      "Bash(docker-compose:*)",  // Required for local dev environment
      "Bash(prisma:*)"  // ORM commands for database management
    ]
  }
}
```

### 3. Keep Agents Focused
Each agent should have a clear, single responsibility. If an agent is doing too much, consider splitting it.

### 4. Version Control
Include `.claude/` in version control so the entire team benefits from customizations.

### 5. Iterate
Review and refine your configuration as the project evolves. What works initially might need adjustment.

---

## Troubleshooting

### Agent Not Being Used
- Check if agent is registered in `settings.json`
- Verify the agent's `proactive` setting
- Check that triggers match your task type

### Skill Not Working
- Verify skill name in frontmatter matches invocation
- Check for syntax errors in SKILL.md
- Ensure skill is in correct location

### Permission Denied
- Check `settings.json` permissions
- Verify the command pattern matches
- Check for conflicting deny rules
