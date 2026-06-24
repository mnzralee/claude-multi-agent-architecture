#!/usr/bin/env bash
#
# Auto-Checkpoint Hook for Claude Code (OPT-IN).
#
# Stop hook that creates a git snapshot when Claude Code finishes a turn, so you
# can roll back a long autonomous run. It is NOT wired by default (auto-commits
# clutter history). Enable it from settings.local.json (see settings.local.json.example).
#
# Behavior:
# - Lightweight checkpoint commit on the current branch. Non-destructive:
#   never force-pushes, never rewrites history.
# - To find checkpoints:   git log --oneline | grep "checkpoint:"
# - To restore one:        git checkout <hash>
# - To clean up:           git rebase -i HEAD~N  (squash checkpoints into real commits)

set -euo pipefail

CHECKPOINT_PREFIX="checkpoint"
TAG_CHECKPOINTS=false

if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    echo "[checkpoint] Not in a git repository, skipping."
    exit 0
fi

if git diff --quiet && git diff --cached --quiet; then
    echo "[checkpoint] No uncommitted changes, skipping."
    exit 0
fi

TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
CHANGED_FILES=$(git diff --name-only | wc -l | tr -d ' ')

git add -A
git commit -m "${CHECKPOINT_PREFIX}: auto-save ${TIMESTAMP} [${BRANCH}] (${CHANGED_FILES} files)" --no-verify

echo "[checkpoint] Saved snapshot on ${BRANCH}."

if [ "${TAG_CHECKPOINTS}" = true ]; then
    git tag "${CHECKPOINT_PREFIX}-$(date +%Y%m%d-%H%M%S)"
fi

exit 0
