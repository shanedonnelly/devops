#!/bin/bash

input="$1"

# Si format X (pas de point)
if [[ "$input" =~ ^[0-9]+$ ]]; then
    echo "${input}.0"
    exit 0
fi

# Si format X.Y
if [[ "$input" =~ ^([0-9]+)\.([0-9]+)$ ]]; then
    major="${BASH_REMATCH[1]}"
    minor="${BASH_REMATCH[2]}"

    if [[ "$minor" -eq 9 ]]; then
        # 1.9 -> 2.0
        echo "$((major + 1)).0"
    else
        # 1.1 -> 1.2
        echo "$major.$((minor + 1))"
    fi
    exit 0
fi

echo "Format invalide. Utilise X ou X.Y"
exit 1
