#!/usr/bin/env bash

# Automatically stage, commit, and push changes on a timer.
# Run from the repo root: ./scripts/auto-sync.sh

set -euo pipefail

INTERVAL="${AUTO_SYNC_INTERVAL:-10}"
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
REMOTE="${AUTO_SYNC_REMOTE:-origin}"

log() {
  printf '[%s] %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"
}

log "Starting auto-sync on branch '$BRANCH' (remote '$REMOTE'), interval ${INTERVAL}s"
log "Press Ctrl+C to stop."

while true; do
  if ! git diff --quiet --ignore-submodules HEAD --; then
    git pull --rebase --autostash "$REMOTE" "$BRANCH" >/dev/null 2>&1 || log "git pull failed; resolve manually."
    git add -A

    if git diff --cached --quiet; then
      log "Changes detected but nothing staged; waiting for next cycle."
      sleep "$INTERVAL"
      continue
    fi

    COMMIT_MSG="Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
    if git commit -m "$COMMIT_MSG" >/dev/null 2>&1; then
      if git push "$REMOTE" "$BRANCH" >/dev/null 2>&1; then
        log "Committed & pushed."
      else
        log "git push failed; fix issues and restart the script."
        exit 1
      fi
    else
      log "git commit failed; fix issues and restart the script."
      exit 1
    fi
  fi

  sleep "$INTERVAL"
done
