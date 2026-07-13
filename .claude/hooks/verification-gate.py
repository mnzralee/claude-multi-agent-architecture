#!/usr/bin/env python3
"""Operating Standard - Stop-hook verification gate.

Purpose
-------
Operationalizes the evidence-backed-completion bar (Operating Standard §5,
and `.claude/rules/ai-agent-engineering.md`): when the main agent tries to finish,
this gate injects the verification checklist ONCE so the model re-checks its
"done" claims against real artifacts before the turn actually ends.

Safety design (this hook can never wedge a session)
---------------------------------------------------
1. INERT BY DEFAULT. Does nothing unless `VERIFY_GATE=1` is set. Ship it wired
   but off; turn it on per session (see settings.local.json.example).
2. LOOP-SAFE. Honors `stop_hook_active`: if the Stop hook already fired and the
   model is continuing, it exits 0 without blocking again. It blocks at most once.
3. FAIL-OPEN. Any exception, missing field, or bad input -> exit 0 (let the stop
   proceed). A bug in this hook degrades to no-op, never to a stuck session.
4. NON-DESTRUCTIVE. It only reads stdin and returns JSON; it touches no files and
   runs no commands.

Wiring (already in .claude/settings.json and .claude/hooks/hooks.json, hooks.Stop):
    { "matcher": "", "hooks": [ { "type": "command",
        "command": "python \"$CLAUDE_PROJECT_DIR/.claude/hooks/verification-gate.py\"" } ] }
Enable for a session:  export VERIFY_GATE=1        (bash)
                        $env:VERIFY_GATE = "1"       (PowerShell)
"""
import json
import os
import sys


CHECKLIST = (
    "Verification gate (Operating Standard section 5). Before ending this turn, "
    "confirm each completion claim you made is backed by an artifact you can point "
    "to from THIS session:\n"
    "  1. Every 'done'/'fixed'/'passing' claim -> a commit SHA, verbatim test "
    "output, an exit code, or `ls -la`+`wc -l` for an asserted file. No "
    "'should work' / 'looks good'.\n"
    "  2. Re-run the declared acceptance command yourself; a non-zero exit is a "
    "failure regardless of the narrative.\n"
    "  3. For any file you claim to have created or edited, re-run `ls -la <path>` "
    "and `wc -l <path>` from your own scope - do not trust a pasted block.\n"
    "  4. Your final message leads with the outcome, in complete sentences, with "
    "everything the user needs in it.\n"
    "  5. You have disclosed every honest finding, uncapped - not a tidy few.\n"
    "If all of that already holds, say so in one line and stop. If any claim is "
    "unverified, verify it now with tool calls before finishing."
)


def main() -> int:
    # Inert unless explicitly enabled.
    if os.environ.get("VERIFY_GATE") != "1":
        return 0

    raw = sys.stdin.read()
    if not raw.strip():
        return 0
    data = json.loads(raw)

    # Loop guard: if the Stop hook already fired and the model is continuing,
    # never block again (prevents an infinite stop/continue loop).
    if data.get("stop_hook_active") is True:
        return 0

    print(json.dumps({
        "decision": "block",
        "reason": CHECKLIST,
        "hookSpecificOutput": {
            "hookEventName": "Stop",
            "additionalContext": CHECKLIST,
        },
    }))
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception:
        # Fail open: any error must let the stop proceed, never wedge the session.
        sys.exit(0)
