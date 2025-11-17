import sys
import time

# changez fail = True pour faire échouer le build
fail = False  # <- mettez True pour faire planter le build

print("running tests...")
time.sleep(5)

if fail:
    print("tests failed (demo)")
    sys.exit(1)

print("tests passed (demo)")