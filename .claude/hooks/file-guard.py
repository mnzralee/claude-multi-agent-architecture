#!/usr/bin/env python3
"""
File Guard Hook for Claude Code.

PreToolUse hook that blocks writes to sensitive files and warns on reads of
them. Prevents accidental exposure or corruption of secrets, credentials,
keys, lockfiles, and build artifacts.

How Claude Code invokes it:
- Wired in settings.json as a PreToolUse hook with matcher "Write|Edit|NotebookEdit".
- Claude Code passes a JSON event on STDIN: {"tool_name": ..., "tool_input": {...}}.
- Exit code 0: allow the operation.
- Exit code 2: block the operation and feed stderr back to Claude (Claude Code convention).

Manual testing:
    echo '{"tool_name":"Write","tool_input":{"file_path":".env"}}' | python file-guard.py

Configuration:
- Customize BLOCKED_WRITE_PATTERNS and WARN_READ_PATTERNS below.
"""

import sys
import json
import re

# --- Configuration ---

# Patterns that BLOCK write operations (exit code 2).
BLOCKED_WRITE_PATTERNS = [
    # Environment and secrets
    r"\.env$", r"\.env\.", r"credentials\.json$",
    r"secrets?\.ya?ml$", r"\.secret$", r"secret\.",

    # Cryptographic keys
    r"\.pem$", r"\.key$", r"\.crt$", r"\.cert$",
    r"id_rsa$", r"id_ed25519$", r"id_ecdsa$",
    r"\.p12$", r"\.pfx$", r"\.jks$",

    # Auth tokens and tool configs that may carry tokens
    r"\.npmrc$", r"\.pypirc$",
    r"\.docker/config\.json$", r"\.kube/config$",

    # Git internals
    r"(^|/)\.git/",

    # Build artifacts and dependencies
    r"(^|/)node_modules/", r"(^|/)dist/", r"(^|/)build/",
    r"(^|/)\.next/", r"(^|/)__pycache__/", r"(^|/)\.venv/",

    # Lockfiles (prevent accidental modification; regenerate via the tool)
    r"package-lock\.json$", r"yarn\.lock$", r"pnpm-lock\.yaml$",

    # Local Claude Code settings
    r"settings\.local\.json$",
]

# Patterns that WARN on read (exit 0, but print a notice to stderr).
WARN_READ_PATTERNS = [
    r"\.env$", r"\.env\.",
    r"credentials\.json$", r"secrets?\.ya?ml$",
    r"\.pem$", r"\.key$", r"id_rsa$", r"id_ed25519$",
]

WRITE_TOOLS = {"Write", "Edit", "NotebookEdit"}
READ_TOOLS = {"Read", "Glob", "Grep"}


def matches(file_path: str, patterns: list):
    """Return the first matching pattern, or None."""
    normalized = file_path.replace("\\", "/")
    for pattern in patterns:
        if re.search(pattern, normalized):
            return pattern
    return None


def read_event() -> dict:
    """Read the hook event from stdin JSON, with an argv fallback for manual use."""
    data = {}
    try:
        if not sys.stdin.isatty():
            raw = sys.stdin.read()
            if raw.strip():
                data = json.loads(raw)
    except (json.JSONDecodeError, OSError):
        data = {}

    # Manual-test fallback: file-guard.py <Tool> <path>
    if not data and len(sys.argv) >= 3:
        data = {"tool_name": sys.argv[1], "tool_input": {"file_path": sys.argv[2]}}
    return data


def main() -> None:
    event = read_event()
    tool_name = event.get("tool_name", "")
    tool_input = event.get("tool_input", {}) or {}
    file_path = tool_input.get("file_path") or tool_input.get("path") or ""

    if not file_path:
        sys.exit(0)  # Nothing path-shaped to guard; allow.

    if tool_name in WRITE_TOOLS:
        hit = matches(file_path, BLOCKED_WRITE_PATTERNS)
        if hit:
            print(
                f"file-guard: BLOCKED write to '{file_path}' (matched /{hit}/). "
                f"This path is protected. If this is intentional, edit "
                f".claude/hooks/file-guard.py or do it outside Claude Code.",
                file=sys.stderr,
            )
            sys.exit(2)  # Block.

    if tool_name in READ_TOOLS:
        hit = matches(file_path, WARN_READ_PATTERNS)
        if hit:
            print(
                f"file-guard: NOTICE reading sensitive file '{file_path}' "
                f"(matched /{hit}/). Do not echo its contents into output or commits.",
                file=sys.stderr,
            )

    sys.exit(0)  # Allow by default.


if __name__ == "__main__":
    main()
