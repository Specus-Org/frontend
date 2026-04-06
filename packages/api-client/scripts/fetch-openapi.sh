#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

SPECS_DIR="$PACKAGE_ROOT/specs"
mkdir -p "$SPECS_DIR"

REPO="Specus-Org/backend"
REF="main"
BASE_PATH="api/openapi"

# Specs to fetch from the backend repo
SPECS=(
  "openapi.yaml"
  "auth.yaml"
  "cms-admin.yaml"
  "cms-public.yaml"
)

# Prefer `gh api` (already authenticated via gh CLI), fall back to curl + GITHUB_TOKEN
fetch_spec() {
  local spec="$1"
  local output="$2"

  if command -v gh &>/dev/null; then
    gh api "repos/${REPO}/contents/${BASE_PATH}/${spec}?ref=${REF}" \
      -H "Accept: application/vnd.github.v3.raw" > "$output"
  else
    # Load .env for GITHUB_TOKEN if gh CLI is not available
    if [ -f "$MONOREPO_ROOT/.env" ]; then
      export $(grep -v '^#' "$MONOREPO_ROOT/.env" | xargs)
    fi
    local token="${GITHUB_TOKEN:?Error: GITHUB_TOKEN is not set and gh CLI is not available. See .env.example}"
    curl -sf \
      -H "Authorization: token ${token}" \
      -H "Accept: application/vnd.github.v3.raw" \
      "https://api.github.com/repos/${REPO}/contents/${BASE_PATH}/${spec}?ref=${REF}" \
      -o "$output"
  fi
}

for spec in "${SPECS[@]}"; do
  echo "Fetching $spec..."
  fetch_spec "$spec" "$SPECS_DIR/$spec"
  echo "  -> saved to specs/$spec"
done

echo ""
echo "All specs fetched. Local spec (not from backend):"
echo "  -> specs/admin-auth.yaml (admin auth endpoints)"
echo ""
echo "Run 'pnpm run generate' to merge specs and generate the client."
