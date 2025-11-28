#!/usr/bin/env bash
set -euo pipefail

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
STATE_FILE="$DIR/e2e_state.json"
BASE_URL="http://localhost"

if [[ ! -f "$STATE_FILE" ]]; then
  echo "State file not found. Run test_builder_auth_and_site.sh first." >&2
  exit 1
fi
# Source the shared POSIX JSON helper which prefers jq when available
if [ -r "$DIR/json_parse.sh" ]; then
  . "$DIR/json_parse.sh"
else
  echo "json helper not found or not readable: $DIR/json_parse.sh" >&2
  exit 1
fi
stringId=$(json_get_from_file stringId "$STATE_FILE")
token=$(json_get_from_file token "$STATE_FILE")

if [[ -z "$stringId" || "$stringId" == "null" ]]; then
  echo "No stringId in state file" >&2
  exit 1
fi

echo "Updating catalogue for site: $stringId (authorized PUT)..."
# Minimal catalogue payload
cat_payload='{"categories":[{"name":"E2E Category","products":[{"name":"E2E Product","description":"E2E Desc","price":9.99,"variants":[{"name":"Default Variant","stock":5}]}]}]}'

put_resp=$(curl -sS -w "\n%{http_code}" -X PUT "${BASE_URL}/devops/api/catalogue-service/sites/${stringId}/catalogue" \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d "${cat_payload}")
put_body=$(echo "$put_resp" | sed '$d')
put_code=$(echo "$put_resp" | tail -n1)

if [[ "$put_code" != "200" ]]; then
  echo "Catalogue PUT failed with code $put_code" >&2
  echo "$put_body" >&2
  exit 1
fi

echo "Fetching public catalogue for site: $stringId"
resp=$(curl -sS -w "\n%{http_code}" "${BASE_URL}/devops/api/catalogue-service/sites/${stringId}/catalogue")
body=$(echo "$resp" | sed '$d')
code=$(echo "$resp" | tail -n1)

if [[ "$code" != "200" ]]; then
  echo "Catalogue fetch failed with code $code" >&2
  echo "$body" >&2
  exit 1
fi
echo "Catalogue retrieved (status $code). Performing simple content checks..."

# Basic checks without jq: ensure categories key and product name are present
if ! echo "$body" | grep -q '"categories"'; then
  echo "Response does not contain categories" >&2
  echo "$body" >&2
  exit 1
fi

if ! echo "$body" | grep -q '"E2E Product"'; then
  echo "Expected product name 'E2E Product' not found in response" >&2
  echo "$body" >&2
  exit 1
fi

echo "Catalogue E2E: workflow success (simple checks passed)"
