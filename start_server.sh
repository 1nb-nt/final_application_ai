#!/bin/bash
# Serves this folder at http://localhost:8000 instead of opening index.html
# directly as a file:// page — this is required for mic access to work in
# Chrome/Edge (they silently block the microphone on file:// pages).
cd "$(dirname "$0")"
( sleep 1; open "http://localhost:8000/index.html" 2>/dev/null || xdg-open "http://localhost:8000/index.html" 2>/dev/null ) &
python3 -m http.server 8000
