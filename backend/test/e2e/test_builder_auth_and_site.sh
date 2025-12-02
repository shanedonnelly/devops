#!/usr/bin/env bash
set -euo pipefail

DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
STATE_FILE="$DIR/e2e_state.json"
BASE_URL="http://localhost"

# Source shared JSON helper (uses jq when available, otherwise POSIX fallback)
. "$DIR/json_parse.sh"

username="e2e_user_$(date +%s)"
password="e2e_pass_$(date +%s)"

echo "Registering user ${username}..."
resp=$(curl -sS -X POST "${BASE_URL}/devops/api/builder-service/register" \
  -H 'Content-Type: application/json' \
  -d "{\"username\": \"${username}\", \"password\": \"${password}\"}")

token=$(echo "$resp" | json_get access_token)
if [[ -z "$token" ]]; then
  echo "Registration failed or did not return token: $resp" >&2
  exit 1
fi

echo "Creating site..."
site_name="E2E Test Site $(date +%s)"
create_resp=$(curl -sS -X POST "${BASE_URL}/devops/api/builder-service/sites" \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d "{\"site_name\": \"${site_name}\"}")

site_id=$(echo "$create_resp" | json_get id)
site_stringId=$(echo "$create_resp" | json_get stringId)

if [[ -z "$site_id" || -z "$site_stringId" ]]; then
  echo "Failed to create site: $create_resp" >&2
  exit 1
fi

echo "Site created: id=$site_id stringId=$site_stringId"

echo "Verifying site appears in user's site list..."
list_resp=$(curl -sS -X GET "${BASE_URL}/devops/api/builder-service/sites" -H "Authorization: Bearer ${token}")
if ! echo "$list_resp" | grep -q "\"id\"[[:space:]]*:[[:space:]]*${site_id}\b"; then
  echo "Created site not found in site list: $list_resp" >&2
  exit 1
fi

echo "Updating site name..."
new_name="E2E Updated Site $(date +%s)"
update_resp=$(curl -sS -X PUT "${BASE_URL}/devops/api/builder-service/sites/${site_id}" \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d "{\"site_name\": \"${new_name}\"}")

updated_stringId=$(echo "$update_resp" | json_get stringId)
if [[ -z "$updated_stringId" ]]; then
  echo "Site update failed: $update_resp" >&2
  exit 1
fi

echo "Updating site config..."
# Provide required fields so the API accepts the config update
sample_config='{"theme":"light","metadata":{"owner":"e2e"},"css_template":"body { font-family: Arial, sans-serif; }","title":"E2E Test Site","description":"This is an end-to-end test site.","contact_text":"Contact: e2e@example.com"}'
cfg_resp=$(curl -sS -X PUT "${BASE_URL}/devops/api/builder-service/sites/${site_id}/config" \
  -H "Authorization: Bearer ${token}" \
  -H 'Content-Type: application/json' \
  -d "${sample_config}")

if [[ "$(echo "$cfg_resp" | json_get message)" != "Site config updated successfully" ]]; then
  echo "Config update may have failed: $cfg_resp" >&2
  exit 1
fi

echo "Verifying public config endpoint returns the sample config..."
public_cfg=$(curl -sS "${BASE_URL}/devops/api/builder-service/sites/${updated_stringId}/config")
# The public config returns the fields we set (title, description, css_template, contact_text).
# Validate by checking title and description values rather than metadata.owner which may not be exposed.
pub_title=$(echo "$public_cfg" | json_get title)
pub_desc=$(echo "$public_cfg" | json_get description)
if [[ "$pub_title" != "E2E Test Site" || "$pub_desc" != "This is an end-to-end test site." ]]; then
  echo "Public config did not return expected data: $public_cfg" >&2
  exit 1
fi

# Save state for subsequent tests (use python to produce valid JSON)
# We save the actual site id and stringId so downstream e2e tests can use them.
python3 - "$username" "$password" "$token" "$site_id" "$updated_stringId" <<PY > "$STATE_FILE"
import json, sys
obj = {
  'username': sys.argv[1],
  'password': sys.argv[2],
  'token': sys.argv[3],
  'site_id': int(sys.argv[4]) if sys.argv[4] else 0,
  'stringId': sys.argv[5]
}
print(json.dumps(obj))
PY

echo "Builder E2E: workflow success"

# Optional cleanup: delete site and user only if CLEANUP=1 is set in the environment
if [ "${CLEANUP:-0}" = "1" ]; then
  echo "Cleaning up created resources..."
  echo "Deleting site..."
  del_site_resp=$(curl -sS -X DELETE "${BASE_URL}/devops/api/builder-service/sites/${site_id}" -H "Authorization: Bearer ${token}")
  if [[ "$(echo "$del_site_resp" | json_get message)" != "Site deleted successfully" ]]; then
    echo "Site deletion failed: $del_site_resp" >&2
    exit 1
  fi

  echo "Deleting user..."
  user_id=$(python3 - "$token" <<'PY'
import sys, json, base64
try:
    t = sys.argv[1] if len(sys.argv) > 1 else ''
    if not t:
        print('', end='')
        sys.exit(0)
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
  )

  if [[ -z "$user_id" ]]; then
    echo "Unable to extract user id from token; skipping user deletion" >&2
  else
    del_user_resp=$(curl -sS -X DELETE "${BASE_URL}/devops/api/builder-service/users/${user_id}" -H "Authorization: Bearer ${token}")
    if [[ "$(echo "$del_user_resp" | json_get message)" != "User deleted successfully" ]]; then
      echo "User deletion may have failed: $del_user_resp" >&2
      exit 1
    fi
  fi
fi
