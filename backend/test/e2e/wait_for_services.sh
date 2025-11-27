#!/usr/bin/env bash
set -euo pipefail

BASE_URL="http://localhost"
TIMEOUT=${1:-120}

endpoints=(
  "/devops/api/builder-service/health"
  "/devops/api/catalogue-service/health"
  "/devops/api/chatbot/health"
)

echo "Waiting up to ${TIMEOUT}s for services to become healthy..."
start=$(date +%s)
for path in "${endpoints[@]}"; do
  echo -n "Checking ${path}... "
  while true; do
    if curl -sS --fail "${BASE_URL}${path}" >/dev/null 2>&1; then
      echo "OK"
      break
    fi
    now=$(date +%s)
    if (( now - start > TIMEOUT )); then
      echo
      echo "Timed out waiting for ${path}"
      exit 1
    fi
    sleep 2
  done
done

echo "All services are healthy."
