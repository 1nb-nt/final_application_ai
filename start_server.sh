#!/bin/bash
# Starts the full app locally at http://127.0.0.1:3001.
cd "$(dirname "$0")"
if [ -x ./.venv/bin/python ]; then
  PYTHON=./.venv/bin/python
elif command -v python3 >/dev/null 2>&1; then
  PYTHON=python3
else
  PYTHON=python
fi
( sleep 1; open "http://127.0.0.1:3001/" 2>/dev/null || xdg-open "http://127.0.0.1:3001/" 2>/dev/null ) &
"$PYTHON" -m uvicorn server:app --host 127.0.0.1 --port 3001
