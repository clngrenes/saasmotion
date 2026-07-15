#!/usr/bin/env bash
set -euo pipefail

HOST="${SAASMOTION_VPS_HOST:-saasmotion-vps}"

echo "Deploying to ${HOST}…"
ssh "${HOST}" bash -s <<'EOF'
set -euo pipefail
cd /opt/saasmotion
git pull
docker build -f render-worker/Dockerfile -t saasmotion-worker .
docker rm -f saasmotion-worker 2>/dev/null || true
docker run -d \
  --name saasmotion-worker \
  --restart unless-stopped \
  -p 3100:3100 \
  --env-file /opt/saasmotion/.env \
  saasmotion-worker
docker ps --filter name=saasmotion-worker --format '{{.Names}} — {{.Status}}'
EOF

echo "Done."
