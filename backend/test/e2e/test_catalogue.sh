#!/usr/bin/env bash
set -euo pipefail

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
STATE_FILE="$DIR/e2e_state.json"
BASE_URL="http://localhost"

command -v jq >/dev/null || { echo "jq is required but not installed" >&2; exit 1; }

if [[ ! -f "$STATE_FILE" ]]; then
  echo "State file not found. Run test_builder_auth_and_site.sh first." >&2
  exit 1
fi

stringId=$(jq -r .stringId "$STATE_FILE")
token=$(jq -r .token "$STATE_FILE")
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

count=$(echo "$body" | jq -r '.categories | length')
echo "Catalogue retrieved. Categories count: $count"

if (( count < 1 )); then
  echo "Expected at least 1 category after update" >&2
  exit 1
fi

prod_name=$(echo "$body" | jq -r '.categories[0].products[0].name')
if [[ "$prod_name" != "E2E Product" ]]; then
  echo "Product name mismatch: $prod_name" >&2
  exit 1
fi

echo "Catalogue E2E: workflow success"
