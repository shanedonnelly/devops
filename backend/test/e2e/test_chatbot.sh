#!/usr/bin/env bash
set -euo pipefail

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
BASE_URL="http://localhost"

# Source shared JSON helper (uses jq when available, otherwise POSIX fallback)
. "$DIR/json_parse.sh"

if [[ -f "$DIR/e2e_state.json" ]]; then
  stringId=$(json_get_from_file stringId "$DIR/e2e_state.json")
else
  stringId=""
fi

echo "Sending greeting to chatbot..."
greet=$(curl -sS -X POST "${BASE_URL}/devops/api/chatbot/chat" \
  -H 'Content-Type: application/json' \
  -d '{"query":"Hello"}')

# Basic check for response field (use helper which falls back to grep/sed)
resp_val=$(echo "$greet" | json_get response)
if [ -z "$resp_val" ]; then
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

  # Simple check: ensure categories key exists and report presence
  if echo "$body" | grep -q '"categories"'; then
    echo "Chatbot proxy returned catalogue (categories present)"
  else
    echo "Chatbot proxy response missing categories" >&2
    echo "$body" >&2
    exit 1
  fi
else
  echo "No stringId available; skipping chatbot catalogue proxy test"
fi

echo "Chatbot E2E: workflow completed (greeting + optional catalogue proxy)"
