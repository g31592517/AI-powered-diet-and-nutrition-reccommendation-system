#!/usr/bin/env bash
set -euo pipefail

MODEL="${OLLAMA_MODEL:-phi3:mini}"
HOST="${OLLAMA_HOST:-http://127.0.0.1:11434}"
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PORT="${PORT:-5000}"

echo "[start] Using model: $MODEL"

# 0) One-time install note
if ! command -v ollama >/dev/null 2>&1; then
  echo "[start][error] Ollama not found. Install it first: curl -fsSL https://ollama.com/install.sh | sh"
  exit 1
fi

# 1) Start Ollama if not running
if ! pgrep -f "ollama serve" >/dev/null 2>&1; then
  echo "[start] Starting ollama server..."
  nohup ollama serve >/dev/null 2>&1 &
fi

# Wait for server readiness
for i in {1..60}; do
  if curl -s "$HOST/api/version" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

# 2) Ensure model exists locally; skip if already present
if ollama list 2>/dev/null | awk '{print $1}' | grep -qx "$MODEL"; then
  echo "[start] Model already local: $MODEL"
else
  echo "[start] Pulling model $MODEL (one-time)."
  ollama pull "$MODEL"
fi

# 3) Ensure dataset exists; skip if already present
DATA_CSV="$ROOT_DIR/data/usda-foods.csv"
if [ ! -f "$DATA_CSV" ]; then
  echo "[start] Downloading USDA dataset (one-time)."
  node "$ROOT_DIR/download-dataset.js"
else
  echo "[start] Dataset present: $DATA_CSV"
fi

# 4) Launch the app
export OLLAMA_MODEL="$MODEL"

# Free port if a stale process is holding it
echo "[start] Ensuring port $PORT is free..."
if pgrep -f "node app.js" >/dev/null 2>&1; then
  pkill -f "node app.js" || true
fi
if command -v lsof >/dev/null 2>&1; then
  PIDS=$(lsof -ti :"$PORT" || true)
  if [ -n "$PIDS" ]; then
    echo "[start] Killing PIDs via lsof on :$PORT -> $PIDS"
    kill -9 $PIDS || true
  fi
fi
if command -v ss >/dev/null 2>&1; then
  PIDS=$(ss -ltnp 2>/dev/null | awk '/:'"$PORT"'\b/ {print $7}' | sed -E 's/.*pid=([0-9]+).*/\1/' | tr -d ',' | tr '\n' ' ')
  if [ -n "${PIDS// /}" ]; then
    echo "[start] Killing PIDs on :$PORT -> $PIDS"
    kill -9 $PIDS || true
  fi
fi

if command -v fuser >/dev/null 2>&1; then
  fuser -k "$PORT"/tcp >/dev/null 2>&1 || true
fi

echo "[start] Launching app on port $PORT..."
export PORT
exec node "$ROOT_DIR/app.js"


