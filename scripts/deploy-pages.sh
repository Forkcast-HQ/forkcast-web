#!/usr/bin/env bash
# Rebuild the static site and publish it to the public GitHub Pages repo.
# Source + docs stay in the private repo; only the compiled app is published.
#
#   bash scripts/deploy-pages.sh
#
set -eo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PAGES_REPO="https://github.com/Seymurhh/forkcast-live.git"
BASE="/forkcast-live"

echo "Building static export..."
rm -rf "$ROOT/.next" "$ROOT/out"
STATIC_EXPORT=true PAGES_BASE_PATH="$BASE" "$ROOT/node_modules/.bin/next" build "$ROOT"
touch "$ROOT/out/.nojekyll"

echo "Publishing to $PAGES_REPO ..."
cd "$ROOT/out"
git init -q -b main 2>/dev/null || { git init -q; git branch -M main; }
git config user.name "Seymur Hasanov"
git config user.email "shasanov@seas.harvard.edu"
git add -A
git commit -q -m "Deploy Forkcast static site" || true
git remote remove origin 2>/dev/null || true
git remote add origin "$PAGES_REPO"
git push -f origin main

echo "Deployed -> https://seymurhh.github.io/forkcast-live/"
