# claude-standard.ps1 - Windows equivalent of claude-standard for machines
# without a POSIX shell. Launches Claude Code with the Operating Standard
# appended to the system prompt, so any model tier runs to the same contract.
#
# Usage:
#   .claude/bin/claude-standard.ps1                       # interactive, default model
#   .claude/bin/claude-standard.ps1 --model opus          # interactive on a specific tier
#   .claude/bin/claude-standard.ps1 -p "audit svc-x"      # headless / print mode
#   $env:VERIFY_GATE = "1"; .claude/bin/claude-standard.ps1  # also enable the Stop verification gate
#
# All extra args are passed straight through to `claude`.

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $ScriptDir "..\..")
$Standard = Join-Path $RepoRoot ".claude\standards\OPERATING-STANDARD.md"

if (-not (Test-Path $Standard)) {
    Write-Error "claude-standard: operating standard not found at $Standard"
    exit 1
}

if (-not (Get-Command claude -ErrorAction SilentlyContinue)) {
    Write-Error "claude-standard: 'claude' CLI not on PATH"
    exit 1
}

claude --append-system-prompt-file $Standard @args
