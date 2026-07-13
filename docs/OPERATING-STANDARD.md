# Operating Standard: Doctrine vs. Capability

Why the kit ships a portable behavioral contract on top of its agents and rules, and how to apply it.

## The problem it solves

A multi-agent setup routes different roles to different model tiers on purpose: a frontier model for architecture and security judgment, a balanced model for implementation and review, a fast model for search and formatting (see [docs/MODEL-ROUTING.md](MODEL-ROUTING.md)). That routing is good economics, but it surfaces a real friction: the tiers do not just differ in raw capability, they differ in *conduct*. A fast or balanced tier is more likely to declare a task done without running the test, open its final message with implementation detail instead of the answer, change code from a single grep instead of tracing the blast radius, or stop mid-task to ask a question it could have resolved itself. A frontier-tier turn tends to get these right by default; a lesser tier often needs to be told.

It is tempting to treat that as an unavoidable tax of using cheaper models. It is the wrong frame.

## Doctrine is not capability

**Capability** is what a model *can* figure out: the hard reasoning, the novel synthesis, holding a large problem in mind. It lives in the weights. A prompt cannot add it. Nothing in this kit, and no system prompt from anyone, makes a fast-tier model as smart as a frontier one.

**Doctrine** is how a model *conducts itself* around whatever capability it has: the communication contract, the bar for calling something done, the discipline of tracing a change end to end before committing to it, the rule about not stopping while there is still work it can do. None of that is intelligence. All of it is specifiable in text. And when a capable model already does these things by default, it is because it was trained toward them, which means the same behaviors can be *instructed* into a less capable model, closing most of the visible quality gap even though the underlying intelligence gap remains.

So the goal is not "make the fast model smart." It is: make every tier, whatever its capability, honor one operating contract. A balanced-tier turn that leads with the outcome, backs every completion claim with evidence, traces before it decides, and does not stop early **is**, by every externally observable measure, a frontier-standard turn. You reach for the frontier tier when the task's correctness ceiling, not its conduct, demands the extra capability.

## The artifact

The contract lives at [`.claude/standards/OPERATING-STANDARD.md`](../.claude/standards/OPERATING-STANDARD.md). Its load-bearing pillars:

1. **Lead with the outcome.** The final message is the reader's first look at the work; it opens with the answer, then supports it.
2. **Prove completion with artifacts.** No "should work", no "looks good". Every done/fixed/passing claim carries a commit SHA, verbatim test output, an exit code, or a file listing. This is the same bar `.claude/rules/ai-agent-engineering.md` sets for subagent dispatch, promoted to every tier.
3. **Decide depth-first, never from a hunch.** Trace a cross-cutting change through every layer it touches before deciding, per `.claude/rules/depth-first-impact-analysis.md`. A green type-check proves nothing about runtime or contract ripples.
4. **Do not stop early.** For reversible actions that follow from the request, proceed. Before ending a turn, re-read the last paragraph; if it is a plan, a question, or an "I'll do X next" promise, do that work now.
5. **Do the simplest thing that works well.** No unrequested features, refactors, or abstractions, while still failing closed with typed errors on the paths that matter (money, auth, user-facing displays).
6. **Disclose every honest finding, uncapped.** Never trim the long tail of caveats to look tidy.

Do not invent this wording from taste. The behavioral snippets in section 12 of the standard are adapted from published vendor guidance on prompt-tunable behavioral shifts across model generations, the kind of material a provider publishes alongside a new model release to help callers migrate prompts. That grounding is why the standard works rather than merely reads well. When you adapt it for your own provider, source your snippets from that provider's own guidance, not from a blog post's opinion, including this one.

## Two delivery channels, so it cannot be skipped

A standard nobody loads is decoration. The kit applies it two ways so it is present whether or not someone remembers to opt in:

- **At launch**, `.claude/bin/claude-standard` (and the PowerShell equivalent `claude-standard.ps1`) starts the agent with the full doctrine already in the system prompt, via `claude --append-system-prompt-file`. Every subagent forked from that session inherits it.
- **In-session**, the small always-loaded rule [`.claude/rules/operating-standard.md`](../.claude/rules/operating-standard.md) carries the non-negotiable core inline and points to the full doctrine, so a session started the plain way (`claude`, no wrapper) still runs to the contract.

The in-session rule is deliberately tiny. The full doctrine lives in the launch-time file, which sits outside the always-loaded rules budget (`.claude/rules/context-budget.md`), so the permanent per-session cost stays low while the core is always present.

## Safe enforcement: the verification gate

Doctrine in the prompt is guidance. `.claude/hooks/verification-gate.py` is a mechanism: a `Stop` hook that fires when the agent tries to finish and injects the evidence-backed-completion checklist so the model re-checks its "done" claims before the turn actually ends.

A hook that can block completion is dangerous to write carelessly. The naive version loops forever: block the stop, the model continues, tries to stop again, block again. This hook is safe by construction, and each property should be verified from the shell before you trust it, not assumed:

- **Inert by default.** It does nothing unless `VERIFY_GATE=1` is set. It ships wired into `.claude/settings.json` but off, so it never surprises an existing workflow. Turn it on (see `.claude/settings.local.json.example`) for long autonomous runs where premature-completion risk is highest.
- **Loop-safe.** Claude Code tells a `Stop` hook whether it already fired this turn via `stop_hook_active`. The gate reads that flag and refuses to block a second time.
- **Fail-open.** Any exception, missing field, or malformed input exits 0 and lets the stop proceed. A bug in the gate degrades to a no-op, never to a stuck session.

Test it yourself before relying on it:

```bash
# 1. Unset: silent, exit 0
echo '{"stop_hook_active":false}' | python .claude/hooks/verification-gate.py; echo "exit=$?"

# 2. Enabled, first fire: blocks once, exit 0
VERIFY_GATE=1 bash -c 'echo "{\"stop_hook_active\":false}" | python .claude/hooks/verification-gate.py'; echo "exit=$?"

# 3. Enabled, already fired: silent, exit 0 (loop guard)
VERIFY_GATE=1 bash -c 'echo "{\"stop_hook_active\":true}" | python .claude/hooks/verification-gate.py'; echo "exit=$?"

# 4. Enabled, garbage input: exit 0 (fail-open)
VERIFY_GATE=1 bash -c 'echo "not json {{{" | python .claude/hooks/verification-gate.py'; echo "exit=$?"
```

A safety mechanism you have not adversarially tested is a liability, not a safeguard. See [docs/HARNESS-VERIFICATION.md](HARNESS-VERIFICATION.md) for the fuller verification pattern this is part of.

## Tiered configuration: global doctrine, local specialists

Once the standard works in one project, the natural next question is scope: does it apply everywhere you work, or just here? Claude Code has (at least) two configuration tiers: a project tier that loads only inside that project, and a user tier that loads in every session, everywhere. The mistake is to put everything in one. The right move is to split by reach:

- **Doctrine is universal**, so it belongs at the user tier (`~/.claude/`). Conduct is not project-specific; the same contract applies to any codebase. Keep a single source of truth by symlinking your global copy back to the versioned one in a repo like this one, so it cannot drift. See [docs/CUSTOMIZATION.md](CUSTOMIZATION.md#global-doctrine-local-specialists) for the setup.
- **The specialist agents stay in the project tier.** Your project's agents know that project's services, stack, and namespaces. Making them global would surface them inside unrelated projects, where they are noise at best and wrong at worst.

Global conduct, local expertise. Standardize the behavior everywhere; scope the knowledge to where it is true.

## What this does not claim

This does **not** make a fast or balanced tier as capable as a frontier one. It does not transfer intelligence, and it does not, cannot, reproduce or strip a model's safety behavior, which is set at the model level and is not something a prompt should touch. What it does is raise the floor: it makes every tier conduct itself professionally, prove its work, and communicate like it respects the reader's time. The ceiling is still the model's; reach for the frontier tier when the problem genuinely needs more thinking. But a large share of day-to-day frustration with cheaper agents was never about thinking. It was about conduct, and conduct is just engineering.

## Related

- [`.claude/standards/OPERATING-STANDARD.md`](../.claude/standards/OPERATING-STANDARD.md), the full doctrine
- [`.claude/rules/operating-standard.md`](../.claude/rules/operating-standard.md), the always-loaded in-session loader
- [`.claude/hooks/verification-gate.py`](../.claude/hooks/verification-gate.py), the safe completion gate
- [docs/HARNESS-VERIFICATION.md](HARNESS-VERIFICATION.md), how to verify your harness actually loads before you trust it
- [docs/MODEL-ROUTING.md](MODEL-ROUTING.md), the tiers this standard applies across
- [docs/CUSTOMIZATION.md](CUSTOMIZATION.md), adapting the kit, including the two-tier deployment split
