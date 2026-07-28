@echo off
REM Serves this folder at http://localhost:8000 instead of opening index.html
REM directly as a file:// page — this is required for mic access to work in
REM Chrome/Edge (they silently block the microphone on file:// pages).
cd /d "%~dp0"
start "" http://localhost:8000/index.html
python -m http.server 8000
if errorlevel 1 (
  echo.
  echo Could not find "python". Install Python from https://python.org and try again,
  echo or use VS Code's "Live Server" extension instead.
  pause
)
