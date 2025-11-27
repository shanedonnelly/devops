#!/usr/bin/env bash
set -euo pipefail

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
BASE_URL="http://localhost"

command -v jq >/dev/null || { echo "jq is required but not installed" >&2; exit 1; }

if [[ -f "$DIR/e2e_state.json" ]]; then
  stringId=$(jq -r .stringId "$DIR/e2e_state.json")
else
  stringId=""
fi

echo "Sending greeting to chatbot..."
greet=$(curl -sS -X POST "${BASE_URL}/devops/api/chatbot/chat" \
  -H 'Content-Type: application/json' \
  -d '{"query":"Hello"}')

# Basic check for response field
if ! echo "$greet" | jq -e '.response' >/dev/null 2>&1; then
  echo "Chatbot greeting did not return expected JSON: $greet" >&2
  # continue to catalogue proxy test below (non-fatal)
else
  echo "Chatbot greeting OK"
fi

if [[ -n "$stringId" ]]; then
  echo "Fetching catalogue proxy from chatbot-service for site: $stringId"
  resp=$(curl -sS -w "\n%{http_code}" "${BASE_URL}/devops/api/chatbot/catalogue/${stringId}")
  body=$(echo "$resp" | sed '$d')
  code=$(echo "$resp" | tail -n1)

  if [[ "$code" != "200" ]]; then
    echo "Chatbot catalogue proxy failed with code $code" >&2
    echo "$body" >&2
    exit 1
  fi

  cnt=$(echo "$body" | jq -r '.categories | length')
  echo "Chatbot proxy returned catalogue with ${cnt} categories"
else
  echo "No stringId available; skipping chatbot catalogue proxy test"
fi

echo "Chatbot E2E: workflow completed (greeting + optional catalogue proxy)"
