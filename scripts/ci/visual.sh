#!/usr/bin/env bash
# Runs the visual regression check locally, in the same Playwright
# container as CI (identical font rendering, so the baselines match):
#
#   scripts/ci/visual.sh          compare with tests/visual/
#   scripts/ci/visual.sh update   accept the current look as the baseline
#
# Builds the site (GITHUB_ACTIVITY=off, as CI does), serves it, and runs
# scripts/ci/check-visual.mjs inside the container. Needs podman or docker.
set -euo pipefail
cd "$(dirname "$0")/../.."
PLAYWRIGHT=1.63.0 # keep in sync with deploy.yml's visual job
IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT}-noble"
ENGINE=$(command -v podman || command -v docker)
PORT=4399

GITHUB_ACTIVITY=off npx astro build >/dev/null
npx astro preview --port "$PORT" >/dev/null 2>&1 &
PREVIEW=$!
trap 'kill $PREVIEW 2>/dev/null || true; npx astro preview stop >/dev/null 2>&1 || true' EXIT
for _ in $(seq 60); do curl -sf "http://localhost:$PORT/" >/dev/null && break; sleep 1; done

"$ENGINE" run --rm --network=host --ipc=host --security-opt label=disable -v "$PWD:/work" -w /work "$IMAGE" bash -c "
  npm install --no-save --no-audit --no-fund playwright@$PLAYWRIGHT pixelmatch@7 pngjs@7 >/dev/null &&
  node scripts/ci/check-visual.mjs http://localhost:$PORT $([ "${1:-}" = update ] && echo --update)"
