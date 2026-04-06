#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PACKAGE_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

REF="${1:-main}"

echo "Fetching OpenAPI spec from ref: $REF ..."
gh api "repos/Specus-Org/backend/contents/api/openapi/openapi.gen.yaml?ref=$REF" \
  -H "Accept: application/vnd.github.v3.raw" > "$PACKAGE_ROOT/openapi.yaml"

echo "OpenAPI spec saved to $PACKAGE_ROOT/openapi.yaml"
