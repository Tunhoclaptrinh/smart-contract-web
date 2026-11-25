#!/usr/bin/env bash
# Turns on branch protection for `base` and `main` (docs/QUY_TRINH_NHANH.md).
# Usage: scripts/protect-branches.sh <owner>/<repo> [required-check]
# Needs the GitHub CLI (`gh auth login`) with admin rights on the repository.
set -euo pipefail
repo="${1:?usage: $0 <owner>/<repo> [required-check]}"
check="${2:-verify}"
for branch in base main; do
  gh api --method PUT "repos/${repo}/branches/${branch}/protection" --input - <<JSON
{
  "required_status_checks": { "strict": true, "contexts": ["${check}"] },
  "enforce_admins": false,
  "required_pull_request_reviews": {
    "required_approving_review_count": 1,
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": true
  },
  "restrictions": null,
  "required_linear_history": false,
  "allow_force_pushes": false,
  "allow_deletions": false,
  "required_conversation_resolution": true
}
JSON
  echo "protected ${repo}@${branch}"
done
