#!/usr/bin/env sh
# Minimal POSIX-safe JSON extractor for simple test needs.
# Usage:
#   json_get_from_file <key> <file>
#   echo "$json" | json_get <key>
# Supports simple string and numeric values and nested keys by matching the final key name.

json_get_from_file() {
  key=$1
  file=$2
  if command -v jq >/dev/null 2>&1; then
    jq -r ".. | objects | .\"${key}\"? // empty" "$file" 2>/dev/null | sed -n '1p'
    return
  fi
  # Try to find a quoted string value for the key
  sed -n 's/.*"'"${key}"'"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' "$file" | sed -n '1p' && return
  # Try to find a numeric value for the key
  sed -n 's/.*"'"${key}"'"[[:space:]]*:[[:space:]]*\([0-9][0-9]*\).*/\1/p' "$file" | sed -n '1p'
}

json_get() {
  key=$1
  if command -v jq >/dev/null 2>&1; then
    jq -r ".. | objects | .\"${key}\"? // empty" 2>/dev/null | sed -n '1p'
    return
  fi
  # read stdin to a temp file because sed will be used twice
  tmp=$(mktemp)
  cat > "$tmp"
  json_get_from_file "$key" "$tmp"
  rm -f "$tmp"
}

json_contains_string() {
  # usage: json_contains_string <needle> <file_or_stdin>
  needle=$1
  if [ -t 0 ]; then
    # no stdin, expect a file path as $2
    file=$2
    grep -q -- "${needle}" "$file" 2>/dev/null
    return $?
  else
    grep -q -- "${needle}" - 2>/dev/null
    return $?
  fi
}

