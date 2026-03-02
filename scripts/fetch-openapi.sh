#!/bin/bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
  export $(grep -v '^#' "$PROJECT_ROOT/.env" | xargs)
fi

GITHUB_TOKEN="${GITHUB_TOKEN:?Error: GITHUB_TOKEN is not set. See .env.example}"

echo "Fetching OpenAPI spec..."
curl -sf \
  -H "Authorization: token ${GITHUB_TOKEN}" \
  -H "Accept: application/vnd.github.v3.raw" \
  "https://api.github.com/repos/Specus-Org/backend/contents/api/openapi/openapi.yaml?ref=feat/aml-screening-openapi" \
  -o ./openapi.yaml

echo "OpenAPI spec saved to ./openapi.yaml"
