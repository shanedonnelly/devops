#!/usr/bin/env bash
# Fake test script
fail=false
echo "running test..."
sleep 3
if [ "$fail" = true ]; then
  echo "Test failed"
  exit 1
else
  echo "Test passed"
  exit 0
fi