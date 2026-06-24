# Contributing

Thanks for your interest in improving this kit. It is a Claude Code starter kit, so "contributing" means improving the agents, rules, skills, hooks, and docs that other people will clone into their own projects. Keep everything project-agnostic.

## Principles

- **Generic, not personal.** Nothing in this repo should reference a specific company, product, codebase, or person. Use neutral examples (`User`, `Order`, `apps/<service>`). If you need a stack for an example, prefer a common one (TypeScript / Node) and note that the discipline is stack-agnostic.
- **Evidence over assertion.** Rules and skills make claims; back substantive ones with a citation, a measured number, or a worked example. The kit's credibility is its evidence base.
- **Conform to the current Claude Code spec.** Subagents are flat `.claude/agents/<name>.md` with YAML frontmatter (`name`, `description`, `tools`, `model`). Skills are `.claude/skills/<name>/SKILL.md`. Hooks are real `settings.json` event arrays. Do not reintroduce deprecated patterns (folder-per-agent, `ultrathink` trigger words, fake descriptive hook blocks).
- **No em-dashes.** House style uses commas, periods, colons, or restructured sentences instead of the `-` (em) and `-` (en) dash characters.

## Adding components

### A subagent
1. Create `.claude/agents/<name>.md` with frontmatter: `name`, `description` (write it to drive automatic delegation, for example "Use proactively for ..."), `tools` (the minimum set), `model` (`opus` / `sonnet` / `haiku`, per `docs/MODEL-ROUTING.md`).
2. Add it to `AGENTS.md`, `docs/AGENT-GUIDE.md`, and the agent list in `CLAUDE.md`.
3. Keep the body focused: role, operating rules, output format, boundaries.

### A skill
1. Create `.claude/skills/<name>/SKILL.md` with frontmatter `name` and `description`. Set `disable-model-invocation: true` for side-effecting workflows (deploy, release) that should only run when explicitly invoked.
2. Cross-link related rules and skills in a `## Related` section.

### A rule
1. Create `.claude/rules/<name>.md`. Add a `paths:` frontmatter glob list if the rule applies to specific file types.
2. State the principle, what it requires, what it forbids, and how to verify. Cite sources.

## Commits and PRs

- Conventional commits: `type(scope): subject` (feat, fix, refactor, chore, docs, test, perf, security). Imperative mood, subject under 72 characters, body explains why.
- Stage and commit file by file in logical units. No AI attribution and no emojis in commit messages.
- One focused change per PR. Describe the motivation and what you verified.

## Reporting security issues

If you find a security problem in the kit (for example a hook that fails open, or a default permission that is too broad), please report it privately rather than opening a public issue. Open a draft security advisory on the repository, or contact the maintainer directly.

## License

By contributing, you agree your contributions are licensed under the MIT License (see `LICENSE`).
