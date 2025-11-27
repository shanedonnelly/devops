#!/usr/bin/env bash
set -euo pipefail

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
STATE_FILE="$DIR/e2e_state.json"
BASE_URL="http://localhost"

command -v jq >/dev/null || { echo "jq is required but not installed" >&2; exit 1; }

username="e2e_user_$(date +%s)"
password="e2e_pass_$(date +%s)"

echo "Registering user ${username}..."
resp=$(curl -sS -X POST "${BASE_URL}/devops/api/builder-service/register" \
  -H 'Content-Type: application/json' \
  -d "{\"username\": \"${username}\", \"password\": \"${password}\"}")

token=$(echo "$resp" | jq -r .access_token // empty)
if [[ -z "$token" || "$token" == "null" ]]; then
  echo "Registration failed or did not return token: $resp" >&2
  exit 1
fi

echo "Creating site..."
site_name="E2E Test Site $(date +%s)"
create_resp=$(curl -sS -X POST "${BASE_URL}/devops/api/builder-service/sites" \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d "{\"site_name\": \"${site_name}\"}")

site_id=$(echo "$create_resp" | jq -r .id // empty)
site_stringId=$(echo "$create_resp" | jq -r .stringId // empty)

if [[ -z "$site_id" || -z "$site_stringId" || "$site_id" == "null" ]]; then
  echo "Failed to create site: $create_resp" >&2
  exit 1
fi

echo "Site created: id=$site_id stringId=$site_stringId"

echo "Verifying site appears in user's site list..."
list_resp=$(curl -sS -X GET "${BASE_URL}/devops/api/builder-service/sites" -H "Authorization: Bearer ${token}")
found=$(echo "$list_resp" | jq --arg id "$site_id" '[.[] | select(.id == ($id|tonumber))] | length')
if [[ "$found" -eq 0 ]]; then
  echo "Created site not found in site list: $list_resp" >&2
  exit 1
fi

echo "Updating site name..."
new_name="E2E Updated Site $(date +%s)"
update_resp=$(curl -sS -X PUT "${BASE_URL}/devops/api/builder-service/sites/${site_id}" \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d "{\"site_name\": \"${new_name}\"}")

updated_stringId=$(echo "$update_resp" | jq -r .stringId // empty)
if [[ -z "$updated_stringId" || "$updated_stringId" == "null" ]]; then
  echo "Site update failed: $update_resp" >&2
  exit 1
fi

echo "Updating site config..."
sample_config='{"theme":"light","metadata":{"owner":"e2e"}}'
cfg_resp=$(curl -sS -X PUT "${BASE_URL}/devops/api/builder-service/sites/${site_id}/config" \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d "${sample_config}")

if [[ $(echo "$cfg_resp" | jq -r .message // empty) != "Site config updated successfully" ]]; then
  echo "Config update may have failed: $cfg_resp" >&2
  exit 1
fi

echo "Verifying public config endpoint returns the sample config..."
public_cfg=$(curl -sS "${BASE_URL}/devops/api/builder-service/sites/${updated_stringId}/config")
has_owner=$(echo "$public_cfg" | jq -r '.metadata.owner // empty')
if [[ "$has_owner" != "e2e" ]]; then
  echo "Public config did not return expected data: $public_cfg" >&2
  exit 1
fi

echo "Deleting site..."
del_site_resp=$(curl -sS -X DELETE "${BASE_URL}/devops/api/builder-service/sites/${site_id}" -H "Authorization: Bearer ${token}")
if [[ $(echo "$del_site_resp" | jq -r .message // empty) != "Site deleted successfully" ]]; then
  echo "Site deletion failed: $del_site_resp" >&2
  exit 1
fi

echo "Deleting user..."
# Need user id from token payload - some APIs return it, but our state uses sub in token; decode JWT locally to read sub without verification
user_id=$(python3 - <<'PY'
import sys, json, base64
t = sys.argv[1]
try:
  parts = t.split('.')
  if len(parts) > 1:
    payload = parts[1]
    padding = '=' * (-len(payload) % 4)
    decoded = base64.urlsafe_b64decode(payload + padding)
    obj = json.loads(decoded)
    print(obj.get('sub',''))
  else:
    print('', end='')
except Exception:
  print('', end='')
PY
"$token")

if [[ -z "$user_id" ]]; then
  echo "Unable to extract user id from token; skipping user deletion" >&2
else
  del_user_resp=$(curl -sS -X DELETE "${BASE_URL}/devops/api/builder-service/users/${user_id}" -H "Authorization: Bearer ${token}")
  if [[ $(echo "$del_user_resp" | jq -r .message // empty) != "User deleted successfully" ]]; then
    echo "User deletion may have failed: $del_user_resp" >&2
    exit 1
  fi
fi

# Save state for subsequent tests (empty or minimal)
jq -n --arg user "$username" --arg pass "$password" --arg token "$token" --arg site_id "0" --arg stringId "" '{username:$user, password:$pass, token:$token, site_id:$site_id|tonumber, stringId:$stringId}' > "$STATE_FILE"

echo "Builder E2E: workflow success"
