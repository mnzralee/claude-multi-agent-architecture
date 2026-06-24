# Auto-Checkpoint Hook for Claude Code (OPT-IN, PowerShell variant).
#
# Windows equivalent of checkpoint.sh for machines without a POSIX shell.
# Stop hook that git-snapshots your work so you can roll back a long run.
# Not wired by default. To enable, point a Stop hook at this script in
# settings.local.json:
#   { "type": "command", "command": "powershell -File \"$CLAUDE_PROJECT_DIR/.claude/hooks/checkpoint.ps1\"" }
#
# Find checkpoints:  git log --oneline | Select-String "checkpoint:"
# Restore one:       git checkout <hash>

$ErrorActionPreference = "Stop"

git rev-parse --is-inside-work-tree *> $null
if ($LASTEXITCODE -ne 0) {
    Write-Output "[checkpoint] Not in a git repository, skipping."
    exit 0
}

git diff --quiet; $dirty = $LASTEXITCODE
git diff --cached --quiet; $staged = $LASTEXITCODE
if ($dirty -eq 0 -and $staged -eq 0) {
    Write-Output "[checkpoint] No uncommitted changes, skipping."
    exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$branch = (git branch --show-current)
if (-not $branch) { $branch = "detached" }
$changed = (git diff --name-only | Measure-Object -Line).Lines

git add -A
git commit -m "checkpoint: auto-save $timestamp [$branch] ($changed files)" --no-verify | Out-Null

Write-Output "[checkpoint] Saved snapshot on $branch."
exit 0
