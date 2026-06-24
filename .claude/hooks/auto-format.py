#!/usr/bin/env python3
"""
Auto-format hook for Claude Code.

PostToolUse hook that runs after Edit/Write to keep formatting consistent and
flag obvious smells (trailing whitespace, missing final newline, mixed
indentation, stray console.log in production code).

How Claude Code invokes it:
- Wired in settings.json as a PostToolUse hook with matcher "Write|Edit".
- Claude Code passes a JSON event on STDIN: {"tool_name": ..., "tool_input": {"file_path": ...}}.
- This hook never blocks: it always exits 0 and prints any notices to stderr,
  so a formatting nit never derails the session. Set CONFIG["auto_fix"] = True
  to run Prettier/gofmt automatically when available.

Manual use:
    python auto-format.py path/to/file.ts
    echo '{"tool_input":{"file_path":"x.ts"}}' | python auto-format.py

Configuration: customize CONFIG below.
"""

import sys
import os
import subprocess
import json
from pathlib import Path

CONFIG = {
    "enabled": True,
    "auto_fix": False,  # Set True to run Prettier/gofmt on touched files.
    "checks": {
        "trailing_whitespace": True,
        "final_newline": True,
        "tabs_vs_spaces": True,
        "console_log": True,
    },
}

TYPE_MAP = {
    ".ts": "typescript", ".tsx": "typescript",
    ".js": "javascript", ".jsx": "javascript",
    ".go": "go", ".py": "python", ".rs": "rust",
    ".json": "json", ".yaml": "yaml", ".yml": "yaml", ".md": "markdown",
}


def get_file_type(file_path: str) -> str:
    return TYPE_MAP.get(Path(file_path).suffix.lower(), "unknown")


def check_trailing_whitespace(content: str) -> list:
    return [
        {"type": "trailing_whitespace", "line": i, "message": f"Trailing whitespace on line {i}"}
        for i, line in enumerate(content.split("\n"), 1)
        if line.rstrip() != line
    ]


def check_final_newline(content: str) -> list:
    if content and not content.endswith("\n"):
        return [{"type": "final_newline", "line": len(content.split("\n")), "message": "File should end with a newline"}]
    return []


def check_console_log(content: str, file_path: str) -> list:
    if get_file_type(file_path) not in ("typescript", "javascript"):
        return []
    if any(p in file_path.replace("\\", "/") for p in (".spec.", ".test.", "__tests__", "scripts/")):
        return []
    issues = []
    for i, line in enumerate(content.split("\n"), 1):
        if line.strip().startswith("//"):
            continue
        if "console.log" in line:
            issues.append({"type": "console_log", "line": i, "message": f"console.log on line {i}, remove for production"})
    return issues


def check_tabs_vs_spaces(content: str, file_path: str) -> list:
    if get_file_type(file_path) == "go" or Path(file_path).name == "Makefile":
        return []  # Tabs are conventional here.
    lines = [l for l in content.split("\n") if l.strip()]
    uses_tabs = any(l.startswith("\t") for l in lines)
    uses_spaces = any(l.startswith("  ") for l in lines)
    if uses_tabs and uses_spaces:
        return [{"type": "tabs_vs_spaces", "line": 1, "message": "File mixes tabs and spaces for indentation"}]
    return []


def run_formatter(file_path: str) -> dict:
    ftype = get_file_type(file_path)
    try:
        if ftype in ("typescript", "javascript", "json"):
            r = subprocess.run(["npx", "prettier", "--write", file_path], capture_output=True, text=True, timeout=30)
            return {"formatter": "prettier", "success": r.returncode == 0}
        if ftype == "go":
            r = subprocess.run(["gofmt", "-w", file_path], capture_output=True, text=True, timeout=30)
            return {"formatter": "gofmt", "success": r.returncode == 0}
    except (subprocess.TimeoutExpired, FileNotFoundError):
        return {"formatter": ftype, "success": False}
    return {"formatter": "none", "success": True}


def resolve_file_path() -> str:
    """Get the touched file path from stdin JSON, with an argv fallback."""
    try:
        if not sys.stdin.isatty():
            raw = sys.stdin.read()
            if raw.strip():
                event = json.loads(raw)
                fp = (event.get("tool_input") or {}).get("file_path")
                if fp:
                    return fp
    except (json.JSONDecodeError, OSError):
        pass
    return sys.argv[1] if len(sys.argv) > 1 else ""


def main() -> None:
    if not CONFIG["enabled"]:
        sys.exit(0)

    file_path = resolve_file_path()
    if not file_path or not os.path.exists(file_path):
        sys.exit(0)  # Nothing to do; never block.

    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        content = f.read()

    issues = []
    if CONFIG["checks"]["trailing_whitespace"]:
        issues += check_trailing_whitespace(content)
    if CONFIG["checks"]["final_newline"]:
        issues += check_final_newline(content)
    if CONFIG["checks"]["tabs_vs_spaces"]:
        issues += check_tabs_vs_spaces(content, file_path)
    if CONFIG["checks"]["console_log"]:
        issues += check_console_log(content, file_path)

    if CONFIG["auto_fix"] and issues:
        run_formatter(file_path)

    if issues:
        summary = "; ".join(f"L{i['line']}: {i['message']}" for i in issues[:10])
        print(f"auto-format: {len(issues)} note(s) in {file_path}: {summary}", file=sys.stderr)

    sys.exit(0)  # PostToolUse: never block on style.


if __name__ == "__main__":
    main()
