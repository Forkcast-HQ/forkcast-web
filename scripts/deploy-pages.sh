#!/usr/bin/env bash
# Rebuild the static site and publish ONLY the compiled app to the public
# GitHub Pages repo. Source + docs stay in the private repo.
#
#   bash scripts/deploy-pages.sh
#
set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/out"
PAGES_REPO="https://github.com/Seymurhh/forkcast-live.git"
BASE="/forkcast-live"

echo "Building static export..."
rm -rf "$ROOT/.next" "$OUT"
STATIC_EXPORT=true PAGES_BASE_PATH="$BASE" "$ROOT/node_modules/.bin/next" build "$ROOT"
touch "$OUT/.nojekyll"

echo "Publishing compiled app to $PAGES_REPO ..."
cd "$OUT"
git init -q

# SAFETY GUARD: never let git operate on the parent source repo.
# out/ must be its OWN repo, or we abort (prevents leaking source/docs).
TOP="$(git rev-parse --show-toplevel)"
if [ "$TOP" != "$OUT" ]; then
  echo "ABORT: git toplevel is '$TOP', expected '$OUT'. Refusing to push." >&2
  exit 1
fi

git config user.name "Seymur Hasanov"
git config user.email "shasanov@seas.harvard.edu"
git add -A
git commit -q -m "Forkcast static site (compiled app only)"
git remote add origin "$PAGES_REPO" 2>/dev/null || git remote set-url origin "$PAGES_REPO"
git push -f origin main

echo "Deployed -> https://seymurhh.github.io/forkcast-live/"
