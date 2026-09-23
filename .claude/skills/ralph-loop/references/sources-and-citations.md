# Ralph-Loop: Sources and Citations

Reference for `.claude/skills/ralph-loop/SKILL.md`. Read this when you need the underlying evidence for a claim in the core skill, or want to cite a source directly (for example while writing a work record or defending a Ralph-Loop decision to the user).

## Evidence base for the bounded-iteration reframe

Sources (the evidence base for this reframe):
- Anthropic, "Effective context engineering for AI agents" (2026): context degrades past 50% utilisation
- arxiv 2603.24755 "SlopCodeBench": empirical anti-pattern accumulation in long-horizon coding tasks
- Alibaba Cloud, "From ReAct to Ralph Loop" (2025): 15-25% premature-completion rate without external verification chain
- Stark Insider, "Claude Code Autonomous Coding Time Hack" (2026): the "Dumb Zone" past 100K-150K tokens
- Anthropic Claude Code best-practices: `/clear` cadence canonical
- m.academy, "Clear the context window in Claude Code"

## Full source and citation list

All claims in this skill cite at least one source per `.claude/rules/deterministic-review.md` "deterministic evidence" rule.

**Primary sources (industry consensus)**:
- Anthropic, "Effective context engineering for AI agents" (2026): https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- Anthropic, "Building Effective AI Agents" (2024-12-19): https://www.anthropic.com/research/building-effective-agents
- Anthropic, "How we built our multi-agent research system": https://www.anthropic.com/engineering/multi-agent-research-system
- Anthropic, "Best practices for Claude Code": https://code.claude.com/docs/en/best-practices
- Cognition (Walden Yan), "Don't Build Multi-Agents": https://cognition.ai/blog/dont-build-multi-agents
- Alibaba Cloud, "From ReAct to Ralph Loop" (2025): https://www.alibabacloud.com/blog/602799
- Stark Insider, "Claude Code Autonomous Coding Time Hack" (2026): https://www.starkinsider.com/2026/05/claude-code-autonomous-coding-time-hack.html
- Thomas Wiegold, "The Ralph Loop": https://thomas-wiegold.com/blog/ralph-loop-how-recursive-ai-agents-work/
- Karpathy on context engineering: https://x.com/karpathy/status/1937902205765607626
- OpenAI, "Introducing SWE-bench Verified": https://openai.com/index/introducing-swe-bench-verified/
- m.academy, "Clear the context window in Claude Code": https://m.academy/lessons/clear-context-window-claude-code/

**Academic sources**:
- Spracklen et al., "We Have a Package for You! Package Hallucinations" (USENIX Security 2025): https://www.usenix.org/system/files/conference/usenixsecurity25/sec25cycle1-prepub-742-spracklen.pdf
- "Importing Phantoms: Measuring LLM Package Hallucination Vulnerabilities" (arxiv 2501.19012): https://arxiv.org/html/2501.19012v1
- "Boosting LLM Reasoning via Spontaneous Self-Correction" (arxiv 2506.06923): https://arxiv.org/pdf/2506.06923
- SlopCodeBench (arxiv 2603.24755): https://arxiv.org/pdf/2603.24755

**Tooling and patterns**:
- Aider documentation, "Repository map": https://aider.chat/docs/repomap.html
- Simon Willison, "2025: The year in LLMs": https://simonwillison.net/2025/Dec/31/the-year-in-llms/
- Galileo, "7 AI Agent Failure Modes": https://galileo.ai/blog/agent-failure-modes-guide
- GitHub, "Best practices for using Copilot coding agent": https://docs.github.com/copilot/how-tos/agents/copilot-coding-agent/best-practices-for-using-copilot-to-work-on-tasks
- Linkerd Server policy: https://linkerd.io/2/features/server-policy/
- Buoyant, mesh ramp documentation (cited via Linkerd docs)

## Note on overlap

The evidence-base list above and the full citation list both include the Anthropic context-engineering paper, the Alibaba Cloud "From ReAct to Ralph Loop" post, the Stark Insider piece, and the m.academy lesson. They are kept as two separate, non-identical blocks (the first is the short evidence list originally attached to the bounded-iteration reframe; the second is the complete categorized bibliography originally at the end of the skill) rather than merged, so both read exactly as they did in the original SKILL.md.
